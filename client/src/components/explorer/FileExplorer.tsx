'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useFileStore, type FileTreeNode as FileTreeNodeType } from '@/stores/fileStore';
import { useEditorStore } from '@/stores/editorStore';
import FileTreeNode from './FileTreeNode';
import FileContextMenu from './FileContextMenu';
import {
  fetchFileTree,
  createFile as createFileApi,
  deleteFileApi,
  renameFileApi,
} from '@/services/fileApi';
import { detectLanguage } from '@/utils/languageDetector';
import {
  FilePlus,
  FolderPlus,
  RefreshCw,
  Loader2,
} from 'lucide-react';

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
}

export default function FileExplorer() {
  const fileTree = useFileStore((s) => s.fileTree);
  const setFileTree = useFileStore((s) => s.setFileTree);
  const isLoading = useFileStore((s) => s.isLoading);
  const setLoading = useFileStore((s) => s.setLoading);
  const deleteFile = useFileStore((s) => s.deleteFile);

  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    node: null,
  });

  const [inlineInput, setInlineInput] = useState<InlineInputState>({
    visible: false,
    parentPath: '/',
    type: 'file',
    mode: 'create',
    initialValue: '',
  });

  const inputRef = useRef<HTMLInputElement>(null);

  // ─── Load file tree from API ───
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

  // ─── Context Menu Handlers ───
  const handleContextMenu = useCallback((e: React.MouseEvent, node: FileTreeNodeType) => {
    setContextMenu({ visible: true, x: e.clientX, y: e.clientY, node });
  }, []);

  const closeContextMenu = useCallback(() => {
    setContextMenu((prev) => ({ ...prev, visible: false }));
  }, []);

  // ─── Inline Input ───
  const showInlineInput = useCallback(
    (parentPath: string, type: 'file' | 'folder', mode: 'create' | 'rename' = 'create', initialValue = '', nodeId?: string) => {
      setInlineInput({ visible: true, parentPath, type, mode, initialValue, nodeId });
      // Focus the input after render
      setTimeout(() => inputRef.current?.focus(), 50);
    },
    []
  );

  const handleInlineSubmit = useCallback(
    async (value: string) => {
      const trimmed = value.trim();
      if (!trimmed) {
        setInlineInput((prev) => ({ ...prev, visible: false }));
        return;
      }

      try {
        if (inlineInput.mode === 'create') {
          const path = inlineInput.parentPath === '/'
            ? `/${trimmed}`
            : `${inlineInput.parentPath}/${trimmed}`;

          await createFileApi({
            name: trimmed,
            path,
            type: inlineInput.type,
            content: inlineInput.type === 'file' ? '' : undefined,
          });
        } else if (inlineInput.mode === 'rename' && inlineInput.nodeId) {
          await renameFileApi(inlineInput.nodeId, trimmed);
        }
        await loadTree();
      } catch (err) {
        console.error('File operation failed:', err);
      } finally {
        setInlineInput((prev) => ({ ...prev, visible: false }));
      }
    },
    [inlineInput, loadTree]
  );

  const handleInlineKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        handleInlineSubmit(e.currentTarget.value);
      } else if (e.key === 'Escape') {
        setInlineInput((prev) => ({ ...prev, visible: false }));
      }
    },
    [handleInlineSubmit]
  );

  // ─── Context Menu Action Handlers ───
  const handleNewFile = useCallback(
    (parentPath: string) => {
      showInlineInput(parentPath, 'file', 'create');
    },
    [showInlineInput]
  );

  const handleNewFolder = useCallback(
    (parentPath: string) => {
      showInlineInput(parentPath, 'folder', 'create');
    },
    [showInlineInput]
  );

  const handleRename = useCallback(
    (node: FileTreeNodeType) => {
      const parentPath = node.path.split('/').slice(0, -1).join('/') || '/';
      showInlineInput(parentPath, node.isDirectory ? 'folder' : 'file', 'rename', node.name, node.id);
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

        // Close editor tab if the file was open
        const { openFiles, closeFile } = useEditorStore.getState();
        const openFile = openFiles.find((f) => f.id === node.id);
        if (openFile) closeFile(node.id);

        await loadTree();
      } catch (err) {
        console.error('Failed to delete file:', err);
      }
    },
    [deleteFile, loadTree]
  );

  const handleCopyPath = useCallback((path: string) => {
    navigator.clipboard.writeText(path).catch(() => {
      console.warn('Failed to copy path to clipboard');
    });
  }, []);

  const handleCreateFile = useCallback(
    (parentPath: string, type: 'file' | 'folder') => {
      showInlineInput(parentPath, type, 'create');
    },
    [showInlineInput]
  );

  // ─── Background right-click ───
  const handleBackgroundContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    showInlineInput('/', 'file', 'create');
  }, [showInlineInput]);

  return (
    <div className="file-explorer" id="file-explorer">
      {/* Header */}
      <div className="file-explorer-header">
        <span className="file-explorer-title">EXPLORER</span>
        <div className="file-explorer-actions">
          <button
            className="file-explorer-action"
            onClick={() => showInlineInput('/', 'file', 'create')}
            title="New File"
            aria-label="New File"
          >
            <FilePlus size={14} />
          </button>
          <button
            className="file-explorer-action"
            onClick={() => showInlineInput('/', 'folder', 'create')}
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

      {/* Tree */}
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
            <p>No files yet.</p>
            <button
              className="file-explorer-create-btn"
              onClick={() => showInlineInput('/', 'file', 'create')}
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
              onCreateFile={handleCreateFile}
            />
          ))
        )}

        {/* Inline input for create / rename */}
        {inlineInput.visible && (
          <div className="file-inline-input-container" style={{ paddingLeft: 24 }}>
            <input
              ref={inputRef}
              className="file-inline-input"
              type="text"
              defaultValue={inlineInput.initialValue}
              placeholder={inlineInput.type === 'folder' ? 'Folder name...' : 'File name...'}
              onKeyDown={handleInlineKeyDown}
              onBlur={(e) => handleInlineSubmit(e.currentTarget.value)}
              autoFocus
            />
          </div>
        )}
      </div>

      {/* Context Menu */}
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
