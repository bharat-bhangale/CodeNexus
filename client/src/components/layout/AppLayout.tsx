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
import { Monitor, Terminal } from 'lucide-react';

export default function AppLayout() {
  const sidebarVisible = useUIStore((s) => s.sidebarVisible);
  const rightPanelVisible = useUIStore((s) => s.rightPanelVisible);
  const bottomPanelVisible = useUIStore((s) => s.bottomPanelVisible);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const toggleBottomPanel = useUIStore((s) => s.toggleBottomPanel);
  const toggleRightPanel = useUIStore((s) => s.toggleRightPanel);
  const setActiveRightPanel = useUIStore((s) => s.setActiveRightPanel);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        toggleSidebar();
      }

      if ((e.ctrlKey || e.metaKey) && e.key === '`') {
        e.preventDefault();
        toggleBottomPanel();
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'j') {
        e.preventDefault();
        toggleBottomPanel();
      }

      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'B') {
        e.preventDefault();
        toggleRightPanel();
      }

      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'E') {
        e.preventDefault();
        setActiveRightPanel('visualize');
      }

      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'M') {
        e.preventDefault();
        setActiveRightPanel('memory');
      }

      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'R') {
        e.preventDefault();
        setActiveRightPanel('review');

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

      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'H') {
        e.preventDefault();
        setActiveRightPanel('health');
      }
    },
    [toggleSidebar, toggleBottomPanel, toggleRightPanel, setActiveRightPanel]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="app-layout" id="app-layout">
      <div className="desktop-required" role="status" aria-live="polite">
        <div className="desktop-required-card">
          <div className="desktop-required-mark">
            <Monitor size={26} />
          </div>
          <h1>Desktop required</h1>
          <p>
            CodeNexus uses a multi-panel editor workspace that needs at least 1024px of screen width.
            Open this project on a desktop or widen the browser window.
          </p>
        </div>
      </div>

      <div className="app-layout-workspace">
        <TopBar />
        <div className="app-body">
          <PanelGroup orientation="horizontal" className="app-panel-group">
            {sidebarVisible && (
              <>
                <Panel
                  id="sidebar-panel"
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

            <Panel id="editor-panel" minSize={30} className="app-panel-editor">
              <PanelGroup orientation="vertical" className="editor-panel-group">
                <Panel
                  id="code-panel"
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

                {bottomPanelVisible && (
                  <>
                    <PanelResizeHandle className="resize-handle resize-handle-vertical" />
                    <Panel
                      id="bottom-panel"
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

            {rightPanelVisible && (
              <>
                <PanelResizeHandle className="resize-handle resize-handle-horizontal" />
                <Panel
                  id="right-panel"
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
    </div>
  );
}
