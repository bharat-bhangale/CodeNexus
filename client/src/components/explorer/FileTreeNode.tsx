'use client';

import { useCallback, useEffect, useState } from 'react';
import type { RefObject } from 'react';
import type { FileTreeNode as FileTreeNodeType } from '@/stores/fileStore';
import { useFileStore } from '@/stores/fileStore';
import { useEditorStore } from '@/stores/editorStore';
import { detectLanguage, getLanguageColor } from '@/utils/languageDetector';
import { fetchFileContent } from '@/services/fileApi';
import InlineFileInput from './InlineFileInput';
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  FileCode2,
  FileText,
  FileJson,
  FileType,
  File,
  Image as ImageIcon,
} from 'lucide-react';

function getFileIcon(name: string, isDirectory: boolean, isOpen: boolean) {
  if (isDirectory) {
    return isOpen ? (
      <FolderOpen size={16} style={{ color: '#dcb67a' }} />
    ) : (
      <Folder size={16} style={{ color: '#dcb67a' }} />
    );
  }

  const color = getLanguageColor(name);
  const ext = name.slice(name.lastIndexOf('.') + 1).toLowerCase();

  switch (ext) {
    case 'ts':
    case 'tsx':
    case 'js':
    case 'jsx':
    case 'mjs':
      return <FileCode2 size={16} style={{ color }} />;
    case 'json':
    case 'jsonc':
      return <FileJson size={16} style={{ color }} />;
    case 'css':
    case 'scss':
    case 'less':
      return <FileType size={16} style={{ color }} />;
    case 'md':
    case 'mdx':
    case 'txt':
      return <FileText size={16} style={{ color }} />;
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'svg':
      return <ImageIcon size={16} style={{ color: '#a1a1b5' }} />;
    default:
      return <File size={16} style={{ color }} />;
  }
}

interface InlineInputState {
  visible: boolean;
  parentPath: string;
  type: 'file' | 'folder';
  mode: 'create' | 'rename';
  initialValue: string;
  nodeId?: string;
  error?: string;
}

interface FileTreeNodeProps {
  node: FileTreeNodeType;
  depth: number;
  onContextMenu: (e: React.MouseEvent, node: FileTreeNodeType) => void;
  inlineInput: InlineInputState;
  inputRef: RefObject<HTMLInputElement | null>;
  onInlineKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onInlineBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
}

export default function FileTreeNode({
  node,
  depth,
  onContextMenu,
  inlineInput,
  inputRef,
  onInlineKeyDown,
  onInlineBlur,
}: FileTreeNodeProps) {
  const [isOpen, setIsOpen] = useState(depth < 1); // auto-expand first level
  const selectedFilePath = useFileStore((s) => s.selectedFilePath);
  const setSelectedFilePath = useFileStore((s) => s.setSelectedFilePath);
  const openFile = useEditorStore((s) => s.openFile);
  const isSelected = selectedFilePath === node.path;
  const isRenaming =
    inlineInput.visible &&
    inlineInput.mode === 'rename' &&
    inlineInput.nodeId === node.id;

  useEffect(() => {
    if (
      node.isDirectory &&
      inlineInput.visible &&
      inlineInput.mode === 'create' &&
      inlineInput.parentPath === node.path
    ) {
      setIsOpen(true);
    }
  }, [
    inlineInput.mode,
    inlineInput.parentPath,
    inlineInput.visible,
    node.isDirectory,
    node.path,
  ]);

  const handleClick = useCallback(() => {
    if (node.isDirectory) {
      setIsOpen((prev) => !prev);
    }
    setSelectedFilePath(node.path);
  }, [node, setSelectedFilePath]);

  const handleDoubleClick = useCallback(async () => {
    if (node.isDirectory) return;

    // Check if already open
    const { openFiles } = useEditorStore.getState();
    const existing = openFiles.find((f) => f.id === node.id);
    if (existing) {
      useEditorStore.getState().setActiveFile(node.id);
      return;
    }

    // Fetch content from API
    try {
      const data = await fetchFileContent(node.id);
      openFile({
        id: node.id,
        name: data.name,
        path: data.path,
        content: data.content,
        language: data.language || detectLanguage(data.name),
      });
    } catch (err) {
      console.error('Failed to fetch file:', err);
    }
  }, [node, openFile]);

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setSelectedFilePath(node.path);
      onContextMenu(e, node);
    },
    [node, setSelectedFilePath, onContextMenu]
  );

  return (
    <>
      <div
        className={`file-node ${isSelected ? 'file-node-selected' : ''}`}
        style={{ paddingLeft: depth * 16 + 8 }}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onContextMenu={handleContextMenu}
        role="treeitem"
        aria-expanded={node.isDirectory ? isOpen : undefined}
        aria-selected={isSelected}
        title={node.path}
      >
        {node.isDirectory && (
          <span className="file-node-arrow">
            {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </span>
        )}
        {!node.isDirectory && <span className="file-node-spacer" />}
        <span className="file-node-icon">
          {getFileIcon(node.name, node.isDirectory, isOpen)}
        </span>
        {isRenaming ? (
          <span className="file-node-input-wrapper">
            <input
              key={`rename-${node.id}-${inlineInput.initialValue}`}
              ref={inputRef}
              className={`file-inline-input ${inlineInput.error ? 'file-inline-input-error' : ''}`}
              type="text"
              defaultValue={inlineInput.initialValue}
              placeholder={node.isDirectory ? 'Folder name...' : 'File name...'}
              onKeyDown={onInlineKeyDown}
              onBlur={onInlineBlur}
              onClick={(event) => event.stopPropagation()}
              autoFocus
            />
            {inlineInput.error && (
              <span className="file-inline-error">{inlineInput.error}</span>
            )}
          </span>
        ) : (
          <span className="file-node-name">{node.name}</span>
        )}
      </div>
      {node.isDirectory && isOpen && node.children && (
        <div className="file-node-children" role="group">
          {node.children.map((child) => (
            <FileTreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              onContextMenu={onContextMenu}
              inlineInput={inlineInput}
              inputRef={inputRef}
              onInlineKeyDown={onInlineKeyDown}
              onInlineBlur={onInlineBlur}
            />
          ))}
          {inlineInput.visible &&
            inlineInput.mode === 'create' &&
            inlineInput.parentPath === node.path && (
              <InlineFileInput
                depth={depth + 1}
                type={inlineInput.type}
                initialValue={inlineInput.initialValue}
                error={inlineInput.error}
                inputRef={inputRef}
                onKeyDown={onInlineKeyDown}
                onBlur={onInlineBlur}
              />
            )}
        </div>
      )}
    </>
  );
}
