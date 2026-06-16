'use client';

import { useEditorStore } from '@/stores/editorStore';
import { useHealthStore } from '@/stores/healthStore';
import { useUIStore } from '@/stores/uiStore';
import {
  Wifi,
  Braces,
  FileCode2,
  Activity,
} from 'lucide-react';

function getScoreClass(score: number): string {
  if (score >= 86) return 'health-score-excellent';
  if (score >= 71) return 'health-score-good';
  if (score >= 51) return 'health-score-fair';
  if (score >= 31) return 'health-score-poor';
  return 'health-score-critical';
}

export default function BottomBar() {
  const cursorPosition = useEditorStore((s) => s.cursorPosition);
  const activeFile = useEditorStore((s) => {
    const id = s.activeFileId;
    return s.openFiles.find((f) => f.id === id);
  });
  const selection = useEditorStore((s) => s.selection);
  const overallScore = useHealthStore((s) => s.overallScore);
  const setActiveRightPanel = useUIStore((s) => s.setActiveRightPanel);

  const selectionText = selection
    ? `(${selection.endLineNumber - selection.startLineNumber + 1} lines selected)`
    : '';

  const handleHealthClick = () => {
    setActiveRightPanel('health');
  };

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
        <div
          className="bottombar-item bottombar-health"
          title={overallScore !== null ? `Code Health: ${overallScore}/100 — Click to open dashboard` : 'Code Health — Click to analyze'}
          onClick={handleHealthClick}
          role="button"
          tabIndex={0}
        >
          <Activity size={12} />
          <span>
            Health:{' '}
            {overallScore !== null ? (
              <span className={`bottombar-health-score ${getScoreClass(overallScore)}`}>
                {overallScore}
              </span>
            ) : (
              '—'
            )}
          </span>
        </div>
      </div>
    </footer>
  );
}
