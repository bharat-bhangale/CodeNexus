'use client';

import { useEffect, useRef, useCallback } from 'react';
import type { FileTreeNode } from '@/stores/fileStore';
import {
  FilePlus,
  FolderPlus,
  Pencil,
  Trash2,
  Copy,
} from 'lucide-react';

interface FileContextMenuProps {
  x: number;
  y: number;
  node: FileTreeNode;
  onClose: () => void;
  onNewFile: (parentPath: string) => void;
  onNewFolder: (parentPath: string) => void;
  onRename: (node: FileTreeNode) => void;
  onDelete: (node: FileTreeNode) => void;
  onCopyPath: (path: string) => void;
}

const menuItems = [
  { id: 'newFile', label: 'New File', icon: FilePlus, dividerAfter: false },
  { id: 'newFolder', label: 'New Folder', icon: FolderPlus, dividerAfter: true },
  { id: 'rename', label: 'Rename', icon: Pencil, dividerAfter: false },
  { id: 'delete', label: 'Delete', icon: Trash2, dividerAfter: true, danger: true },
  { id: 'copyPath', label: 'Copy Path', icon: Copy, dividerAfter: false },
];

export default function FileContextMenu({
  x,
  y,
  node,
  onClose,
  onNewFile,
  onNewFolder,
  onRename,
  onDelete,
  onCopyPath,
}: FileContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on click outside or Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  // Adjust position to stay within viewport
  useEffect(() => {
    if (!menuRef.current) return;
    const rect = menuRef.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    if (rect.right > vw) {
      menuRef.current.style.left = `${x - rect.width}px`;
    }
    if (rect.bottom > vh) {
      menuRef.current.style.top = `${y - rect.height}px`;
    }
  }, [x, y]);

  const handleAction = useCallback(
    (actionId: string) => {
      const parentPath = node.isDirectory ? node.path : node.path.split('/').slice(0, -1).join('/') || '/';
      switch (actionId) {
        case 'newFile':
          onNewFile(parentPath);
          break;
        case 'newFolder':
          onNewFolder(parentPath);
          break;
        case 'rename':
          onRename(node);
          break;
        case 'delete':
          onDelete(node);
          break;
        case 'copyPath':
          onCopyPath(node.path);
          break;
      }
      onClose();
    },
    [node, onClose, onNewFile, onNewFolder, onRename, onDelete, onCopyPath]
  );

  return (
    <div
      className="context-menu"
      ref={menuRef}
      style={{ left: x, top: y }}
      role="menu"
      aria-label="File actions"
    >
      {menuItems.map((item) => (
        <div key={item.id}>
          <button
            className={`context-menu-item ${item.danger ? 'context-menu-item-danger' : ''}`}
            onClick={() => handleAction(item.id)}
            role="menuitem"
          >
            <item.icon size={14} />
            <span>{item.label}</span>
          </button>
          {item.dividerAfter && <div className="context-menu-divider" />}
        </div>
      ))}
    </div>
  );
}
