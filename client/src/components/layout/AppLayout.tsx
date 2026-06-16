'use client';

import { useEffect, useCallback } from 'react';
import {
  Panel,
  Group as PanelGroup,
  Separator as PanelResizeHandle,
} from 'react-resizable-panels';
import TopBar from './TopBar';
import Sidebar from './Sidebar';
import BottomBar from './BottomBar';
import PanelManager from './PanelManager';
import CodeEditor from '@/components/editor/CodeEditor';
import EditorTabs from '@/components/editor/EditorTabs';
import { useUIStore } from '@/stores/uiStore';
import { useEditorStore } from '@/stores/editorStore';
import { useReviewStore } from '@/stores/reviewStore';
import { runReview } from '@/services/reviewApi';
import { Terminal } from 'lucide-react';

export default function AppLayout() {
  const sidebarVisible = useUIStore((s) => s.sidebarVisible);
  const rightPanelVisible = useUIStore((s) => s.rightPanelVisible);
  const bottomPanelVisible = useUIStore((s) => s.bottomPanelVisible);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const toggleBottomPanel = useUIStore((s) => s.toggleBottomPanel);
  const toggleRightPanel = useUIStore((s) => s.toggleRightPanel);
  const setActiveRightPanel = useUIStore((s) => s.setActiveRightPanel);

  // Global keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Ctrl+B: Toggle sidebar
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        toggleSidebar();
      }
      // Ctrl+`: Toggle bottom panel
      if ((e.ctrlKey || e.metaKey) && e.key === '`') {
        e.preventDefault();
        toggleBottomPanel();
      }
      // Ctrl+J: Also toggle bottom panel (alternative)
      if ((e.ctrlKey || e.metaKey) && e.key === 'j') {
        e.preventDefault();
        toggleBottomPanel();
      }
      // Ctrl+Shift+B: Toggle right panel
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'B') {
        e.preventDefault();
        toggleRightPanel();
      }
      // Ctrl+Shift+E: Open Explain My Code / Visualize panel
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'E') {
        e.preventDefault();
        setActiveRightPanel('visualize');
      }
      // Ctrl+Shift+M: Open Decision Memory panel
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'M') {
        e.preventDefault();
        setActiveRightPanel('memory');
      }
      // Ctrl+Shift+R: Open Review panel and trigger review
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'R') {
        e.preventDefault();
        setActiveRightPanel('review');
        // Auto-trigger review on active file
        const edState = useEditorStore.getState();
        const file = edState.openFiles.find((f) => f.id === edState.activeFileId);
        if (file) {
          useReviewStore.getState().setReviewing(true);
          runReview(file.content, file.language, file.path)
            .then((result) => {
              useReviewStore.getState().setIssues(result.issues, result.summary, result.id);
            })
            .catch(() => {
              useReviewStore.getState().setError('Review failed');
            });
        }
      }
    },
    [toggleSidebar, toggleBottomPanel, toggleRightPanel, setActiveRightPanel]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Files are now loaded from the backend API via the File Explorer.
  // Double-click a file in the sidebar to open it in the editor.

  return (
    <div className="app-layout" id="app-layout">
      <TopBar />
      <div className="app-body">
        <PanelGroup direction="horizontal" className="app-panel-group">
          {/* Sidebar Panel */}
          {sidebarVisible && (
            <>
              <Panel
                id="sidebar-panel"
                order={1}
                defaultSize={18}
                minSize={12}
                maxSize={30}
                className="app-panel-sidebar"
              >
                <Sidebar />
              </Panel>
              <PanelResizeHandle className="resize-handle resize-handle-horizontal" />
            </>
          )}

          {/* Editor Area */}
          <Panel id="editor-panel" order={2} minSize={30} className="app-panel-editor">
            <PanelGroup direction="vertical" className="editor-panel-group">
              {/* Code Editor */}
              <Panel
                id="code-panel"
                order={1}
                defaultSize={bottomPanelVisible ? 70 : 100}
                minSize={30}
              >
                <div className="editor-area">
                  <EditorTabs />
                  <div className="editor-content">
                    <CodeEditor />
                  </div>
                </div>
              </Panel>

              {/* Bottom Panel (Terminal) */}
              {bottomPanelVisible && (
                <>
                  <PanelResizeHandle className="resize-handle resize-handle-vertical" />
                  <Panel
                    id="bottom-panel"
                    order={2}
                    defaultSize={30}
                    minSize={15}
                    maxSize={60}
                    className="app-panel-bottom"
                  >
                    <div className="bottom-panel">
                      <div className="bottom-panel-header">
                        <div className="bottom-panel-tabs">
                          <button className="bottom-panel-tab bottom-panel-tab-active" id="btn-terminal-tab">
                            <Terminal size={14} />
                            <span>Terminal</span>
                          </button>
                          <button className="bottom-panel-tab" id="btn-output-tab">
                            <span>Output</span>
                          </button>
                          <button className="bottom-panel-tab" id="btn-problems-tab">
                            <span>Problems</span>
                          </button>
                        </div>
                      </div>
                      <div className="bottom-panel-body">
                        <div className="terminal-placeholder">
                          <span className="terminal-prompt">$</span>
                          <span className="terminal-cursor">_</span>
                        </div>
                      </div>
                    </div>
                  </Panel>
                </>
              )}
            </PanelGroup>
          </Panel>

          {/* Right Panel */}
          {rightPanelVisible && (
            <>
              <PanelResizeHandle className="resize-handle resize-handle-horizontal" />
              <Panel
                id="right-panel"
                order={3}
                defaultSize={22}
                minSize={15}
                maxSize={40}
                className="app-panel-right"
              >
                <PanelManager />
              </Panel>
            </>
          )}
        </PanelGroup>
      </div>
      <BottomBar />
    </div>
  );
}
