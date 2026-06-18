'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useFileStore, type FileTreeNode as FileTreeNodeType } from '@/stores/fileStore';
import { useEditorStore } from '@/stores/editorStore';
import FileTreeNode from './FileTreeNode';
import FileContextMenu from './FileContextMenu';
import InlineFileInput from './InlineFileInput';
import {
  fetchFileTree,
  createFile as createFileApi,
  deleteFileApi,
  renameFileApi,
} from '@/services/fileApi';
import { FileCode2, FilePlus, FolderPlus, Loader2, RefreshCw } from 'lucide-react';

interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  node: FileTreeNodeType | null;
}

interface InlineInputState {
  visible: boolean;
  parentPath: string;
  type: 'file' | 'folder';
  mode: 'create' | 'rename';
  initialValue: string;
  nodeId?: string;
  targetPath?: string;
  error?: string;
}

const hiddenInlineInput: InlineInputState = {
  visible: false,
  parentPath: '/',
  type: 'file',
  mode: 'create',
  initialValue: '',
};

function getParentPath(path: string): string {
  const parts = path.split('/').filter(Boolean);
  parts.pop();
  return parts.length === 0 ? '/' : `/${parts.join('/')}`;
}

function buildChildPath(parentPath: string, name: string): string {
  return parentPath === '/' ? `/${name}` : `${parentPath}/${name}`;
}

function validateFileName(name: string): string | null {
  if (!name) return 'Name is required';
  if (name.includes('/') || name.includes('\\')) return 'Name cannot include slashes';
  if (name === '.' || name === '..') return 'Name is reserved';
  return null;
}

function getApiErrorMessage(error: unknown): string {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof error.response === 'object' &&
    error.response !== null &&
    'data' in error.response
  ) {
    const data = error.response.data as { error?: { message?: string } };
    if (data.error?.message) return data.error.message;
  }

  return error instanceof Error ? error.message : 'File operation failed';
}

function showWorkspaceToast(title: string, description: string, variant: 'success' | 'info' | 'warning' = 'success') {
  window.dispatchEvent(
    new CustomEvent('codenexus:toast', {
      detail: { title, description, variant },
    })
  );
}

export default function FileExplorer() {
  const fileTree = useFileStore((s) => s.fileTree);
  const setFileTree = useFileStore((s) => s.setFileTree);
  const isLoading = useFileStore((s) => s.isLoading);
  const setLoading = useFileStore((s) => s.setLoading);
  const deleteFile = useFileStore((s) => s.deleteFile);
  const setSelectedFilePath = useFileStore((s) => s.setSelectedFilePath);

  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    node: null,
  });

  const [inlineInput, setInlineInput] = useState<InlineInputState>(hiddenInlineInput);
  const inputRef = useRef<HTMLInputElement>(null);
  const inlineSubmittingRef = useRef(false);
  const inlineCancelingRef = useRef(false);

  const loadTree = useCallback(async () => {
    setLoading(true);
    try {
      const tree = await fetchFileTree('default');
      setFileTree(tree);
    } catch (err) {
      console.error('Failed to load file tree:', err);
    } finally {
      setLoading(false);
    }
  }, [setFileTree, setLoading]);

  useEffect(() => {
    loadTree();
  }, [loadTree]);

  const focusInlineInput = useCallback(() => {
    window.setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 0);
  }, []);

  const closeInlineInput = useCallback(() => {
    inlineCancelingRef.current = true;
    setInlineInput(hiddenInlineInput);
  }, []);

  const showInlineInput = useCallback(
    (
      parentPath: string,
      type: 'file' | 'folder',
      mode: 'create' | 'rename' = 'create',
      initialValue = '',
      nodeId?: string,
      targetPath?: string
    ) => {
      inlineSubmittingRef.current = false;
      inlineCancelingRef.current = false;
      setContextMenu((prev) => ({ ...prev, visible: false }));
      setInlineInput({
        visible: true,
        parentPath,
        type,
        mode,
        initialValue,
        nodeId,
        targetPath,
      });
      focusInlineInput();
    },
    [focusInlineInput]
  );

  const handleInlineSubmit = useCallback(
    async (value: string) => {
      if (!inlineInput.visible || inlineSubmittingRef.current) return;

      if (inlineCancelingRef.current) {
        inlineCancelingRef.current = false;
        return;
      }

      const trimmed = value.trim();
      const validationError = validateFileName(trimmed);
      if (validationError) {
        setInlineInput((prev) => ({ ...prev, error: validationError }));
        focusInlineInput();
        return;
      }

      if (inlineInput.mode === 'rename' && trimmed === inlineInput.initialValue) {
        setInlineInput(hiddenInlineInput);
        return;
      }

      inlineSubmittingRef.current = true;

      try {
        if (inlineInput.mode === 'create') {
          const path = buildChildPath(inlineInput.parentPath, trimmed);
          await createFileApi({
            name: trimmed,
            path,
            type: inlineInput.type,
            content: inlineInput.type === 'file' ? '' : undefined,
          });
          setSelectedFilePath(path);
          showWorkspaceToast(
            inlineInput.type === 'file' ? 'File created' : 'Folder created',
            path
          );
        } else if (inlineInput.mode === 'rename' && inlineInput.nodeId) {
          const oldPath =
            inlineInput.targetPath ||
            buildChildPath(inlineInput.parentPath, inlineInput.initialValue);
          const updatedFile = await renameFileApi(inlineInput.nodeId, trimmed);
          const editorState = useEditorStore.getState();

          if (inlineInput.type === 'folder') {
            editorState.rewriteOpenFilePathPrefix(oldPath, updatedFile.path);
          } else {
            editorState.updateOpenFileMetadata(inlineInput.nodeId, {
              name: updatedFile.name,
              path: updatedFile.path,
              language: updatedFile.language,
            });
          }

          setSelectedFilePath(updatedFile.path);
          showWorkspaceToast('Renamed successfully', updatedFile.path);
        }

        await loadTree();
        setInlineInput(hiddenInlineInput);
      } catch (err) {
        setInlineInput((prev) => ({ ...prev, error: getApiErrorMessage(err) }));
        focusInlineInput();
      } finally {
        inlineSubmittingRef.current = false;
      }
    },
    [focusInlineInput, inlineInput, loadTree, setSelectedFilePath]
  );

  const handleInlineKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      e.stopPropagation();

      if (e.key === 'Enter') {
        e.preventDefault();
        handleInlineSubmit(e.currentTarget.value);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        closeInlineInput();
      }
    },
    [closeInlineInput, handleInlineSubmit]
  );

  const handleInlineBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      handleInlineSubmit(e.currentTarget.value);
    },
    [handleInlineSubmit]
  );

  const handleContextMenu = useCallback((e: React.MouseEvent, node: FileTreeNodeType) => {
    setContextMenu({ visible: true, x: e.clientX, y: e.clientY, node });
  }, []);

  const closeContextMenu = useCallback(() => {
    setContextMenu((prev) => ({ ...prev, visible: false }));
  }, []);

  const handleNewFile = useCallback(
    (parentPath: string) => {
      showInlineInput(parentPath, 'file');
    },
    [showInlineInput]
  );

  const handleNewFolder = useCallback(
    (parentPath: string) => {
      showInlineInput(parentPath, 'folder');
    },
    [showInlineInput]
  );

  const handleRename = useCallback(
    (node: FileTreeNodeType) => {
      showInlineInput(
        getParentPath(node.path),
        node.isDirectory ? 'folder' : 'file',
        'rename',
        node.name,
        node.id,
        node.path
      );
    },
    [showInlineInput]
  );

  const handleDelete = useCallback(
    async (node: FileTreeNodeType) => {
      const confirmed = window.confirm(`Delete "${node.name}"? This cannot be undone.`);
      if (!confirmed) return;

      try {
        await deleteFileApi(node.id);
        deleteFile(node.path);

        const editorState = useEditorStore.getState();
        const filesToClose = editorState.openFiles.filter((file) =>
          node.isDirectory ? file.path.startsWith(`${node.path}/`) : file.id === node.id
        );
        filesToClose.forEach((file) => editorState.closeFile(file.id));

        const selectedPath = useFileStore.getState().selectedFilePath;
        if (
          selectedPath === node.path ||
          (node.isDirectory && selectedPath?.startsWith(`${node.path}/`))
        ) {
          setSelectedFilePath(null);
        }

        await loadTree();
        showWorkspaceToast('Deleted successfully', node.path);
      } catch (err) {
        console.error('Failed to delete file:', err);
        showWorkspaceToast('Delete failed', getApiErrorMessage(err), 'warning');
      }
    },
    [deleteFile, loadTree, setSelectedFilePath]
  );

  const handleCopyPath = useCallback((path: string) => {
    navigator.clipboard
      .writeText(path)
      .then(() => showWorkspaceToast('Path copied', path, 'info'))
      .catch(() => {
        console.warn('Failed to copy path to clipboard');
        showWorkspaceToast('Copy failed', 'The path could not be copied to the clipboard.', 'warning');
      });
  }, []);

  const handleBackgroundContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      showInlineInput('/', 'file');
    },
    [showInlineInput]
  );

  return (
    <div className="file-explorer" id="file-explorer">
      <div className="file-explorer-header">
        <span className="file-explorer-title">EXPLORER</span>
        <div className="file-explorer-actions">
          <button
            className="file-explorer-action"
            onClick={() => showInlineInput('/', 'file')}
            title="New File"
            aria-label="New File"
          >
            <FilePlus size={14} />
          </button>
          <button
            className="file-explorer-action"
            onClick={() => showInlineInput('/', 'folder')}
            title="New Folder"
            aria-label="New Folder"
          >
            <FolderPlus size={14} />
          </button>
          <button
            className="file-explorer-action"
            onClick={loadTree}
            title="Refresh"
            aria-label="Refresh file tree"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      <div
        className="file-explorer-tree"
        role="tree"
        aria-label="File Explorer"
        onContextMenu={handleBackgroundContextMenu}
      >
        {isLoading ? (
          <div className="file-explorer-loading">
            <Loader2 size={18} className="file-explorer-spinner" />
            <span>Loading files...</span>
          </div>
        ) : fileTree.length === 0 ? (
          <div className="file-explorer-empty">
            <div className="illustrated-empty-mark">
              <FileCode2 size={24} />
            </div>
            <h3>No files yet</h3>
            <p>Create your first file and CodeNexus will keep the workspace context ready.</p>
            <button
              className="file-explorer-create-btn"
              onClick={() => showInlineInput('/', 'file')}
            >
              <FilePlus size={14} />
              <span>Create a file</span>
            </button>
          </div>
        ) : (
          fileTree.map((node) => (
            <FileTreeNode
              key={node.id}
              node={node}
              depth={0}
              onContextMenu={handleContextMenu}
              inlineInput={inlineInput}
              inputRef={inputRef}
              onInlineKeyDown={handleInlineKeyDown}
              onInlineBlur={handleInlineBlur}
            />
          ))
        )}

        {inlineInput.visible &&
          inlineInput.mode === 'create' &&
          inlineInput.parentPath === '/' && (
            <InlineFileInput
              depth={0}
              type={inlineInput.type}
              initialValue={inlineInput.initialValue}
              error={inlineInput.error}
              inputRef={inputRef}
              onKeyDown={handleInlineKeyDown}
              onBlur={handleInlineBlur}
            />
          )}
      </div>

      <div className="file-explorer-footer">
        <button
          className="file-explorer-new-file-btn"
          onClick={() => showInlineInput('/', 'file')}
        >
          <FilePlus size={14} />
          <span>New File</span>
        </button>
      </div>

      {contextMenu.visible && contextMenu.node && (
        <FileContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          node={contextMenu.node}
          onClose={closeContextMenu}
          onNewFile={handleNewFile}
          onNewFolder={handleNewFolder}
          onRename={handleRename}
          onDelete={handleDelete}
          onCopyPath={handleCopyPath}
        />
      )}
    </div>
  );
}
