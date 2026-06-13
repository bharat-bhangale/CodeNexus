'use client';

import { useCallback } from 'react';
import { useEditorStore } from '@/stores/editorStore';
import {
  X,
  FileCode2,
  FileJson,
  FileText,
  FileType,
  File,
} from 'lucide-react';

const languageIconMap: Record<string, React.ReactNode> = {
  javascript: <FileCode2 size={14} className="tab-icon tab-icon-js" />,
  typescript: <FileCode2 size={14} className="tab-icon tab-icon-ts" />,
  typescriptreact: <FileCode2 size={14} className="tab-icon tab-icon-tsx" />,
  javascriptreact: <FileCode2 size={14} className="tab-icon tab-icon-jsx" />,
  json: <FileJson size={14} className="tab-icon tab-icon-json" />,
  css: <FileType size={14} className="tab-icon tab-icon-css" />,
  html: <FileCode2 size={14} className="tab-icon tab-icon-html" />,
  markdown: <FileText size={14} className="tab-icon tab-icon-md" />,
};

function getFileIcon(language: string): React.ReactNode {
  return languageIconMap[language] || <File size={14} className="tab-icon" />;
}

export default function EditorTabs() {
  const openFiles = useEditorStore((s) => s.openFiles);
  const activeFileId = useEditorStore((s) => s.activeFileId);
  const setActiveFile = useEditorStore((s) => s.setActiveFile);
  const closeFile = useEditorStore((s) => s.closeFile);

  const handleTabClick = useCallback(
    (fileId: string) => {
      setActiveFile(fileId);
    },
    [setActiveFile]
  );

  const handleCloseClick = useCallback(
    (e: React.MouseEvent, fileId: string) => {
      e.stopPropagation();
      closeFile(fileId);
    },
    [closeFile]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, fileId: string) => {
      // Middle-click to close
      if (e.button === 1) {
        e.preventDefault();
        closeFile(fileId);
      }
    },
    [closeFile]
  );

  if (openFiles.length === 0) {
    return null;
  }

  return (
    <div className="editor-tabs" role="tablist" aria-label="Open files">
      <div className="editor-tabs-scroll">
        {openFiles.map((file) => {
          const isActive = file.id === activeFileId;
          return (
            <button
              key={file.id}
              id={`tab-${file.id}`}
              className={`editor-tab ${isActive ? 'editor-tab-active' : ''}`}
              role="tab"
              aria-selected={isActive}
              onClick={() => handleTabClick(file.id)}
              onMouseDown={(e) => handleMouseDown(e, file.id)}
              title={file.path}
            >
              {getFileIcon(file.language)}
              <span className="tab-name">{file.name}</span>
              {file.isDirty && <span className="tab-dirty" aria-label="Unsaved changes">●</span>}
              <span
                className="tab-close"
                role="button"
                aria-label={`Close ${file.name}`}
                onClick={(e) => handleCloseClick(e, file.id)}
                tabIndex={-1}
              >
                <X size={14} />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
