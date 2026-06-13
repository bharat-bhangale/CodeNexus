'use client';

import { useEditorStore } from '@/stores/editorStore';
import {
  Wifi,
  WifiOff,
  Braces,
  FileCode2,
  Activity,
} from 'lucide-react';

export default function BottomBar() {
  const cursorPosition = useEditorStore((s) => s.cursorPosition);
  const activeFile = useEditorStore((s) => {
    const id = s.activeFileId;
    return s.openFiles.find((f) => f.id === id);
  });
  const selection = useEditorStore((s) => s.selection);

  const selectionText = selection
    ? `(${selection.endLineNumber - selection.startLineNumber + 1} lines selected)`
    : '';

  return (
    <footer className="bottombar" id="bottombar">
      <div className="bottombar-section bottombar-left">
        <div className="bottombar-item bottombar-status" title="Connection status">
          <Wifi size={12} className="bottombar-status-icon bottombar-status-connected" />
          <span>Ready</span>
        </div>
        <div className="bottombar-item" title="Git branch">
          <span className="bottombar-branch">main</span>
        </div>
      </div>

      <div className="bottombar-section bottombar-right">
        <div className="bottombar-item" title="Cursor position">
          <span>
            Ln {cursorPosition.lineNumber}, Col {cursorPosition.column}
          </span>
          {selectionText && (
            <span className="bottombar-selection">{selectionText}</span>
          )}
        </div>
        <div className="bottombar-item" title="Indentation">
          <Braces size={12} />
          <span>Spaces: 2</span>
        </div>
        <div className="bottombar-item" title="Encoding">
          <span>UTF-8</span>
        </div>
        <div className="bottombar-item" title="Language">
          <FileCode2 size={12} />
          <span>{activeFile?.language || 'Plain Text'}</span>
        </div>
        <div className="bottombar-item bottombar-health" title="Code Health">
          <Activity size={12} />
          <span>Health: —</span>
        </div>
      </div>
    </footer>
  );
}
