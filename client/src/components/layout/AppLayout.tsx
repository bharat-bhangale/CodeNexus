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
import { Terminal } from 'lucide-react';

export default function AppLayout() {
  const sidebarVisible = useUIStore((s) => s.sidebarVisible);
  const rightPanelVisible = useUIStore((s) => s.rightPanelVisible);
  const bottomPanelVisible = useUIStore((s) => s.bottomPanelVisible);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const toggleBottomPanel = useUIStore((s) => s.toggleBottomPanel);
  const toggleRightPanel = useUIStore((s) => s.toggleRightPanel);

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
    },
    [toggleSidebar, toggleBottomPanel, toggleRightPanel]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Load a sample file on first mount
  useEffect(() => {
    const { openFiles, openFile } = useEditorStore.getState();
    if (openFiles.length === 0) {
      openFile({
        id: 'sample-hello',
        name: 'hello.ts',
        path: '/src/hello.ts',
        language: 'typescript',
        content: `// Welcome to CodeNexus — The AI Code Editor That Thinks With You
// Start editing to see the magic happen! ✨

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  preferences: UserPreferences;
}

interface UserPreferences {
  theme: 'dark' | 'light' | 'system';
  fontSize: number;
  tabSize: number;
  wordWrap: boolean;
  minimap: boolean;
}

class CodeNexusEditor {
  private users: Map<string, User> = new Map();
  private activeConnections: Set<string> = new Set();

  constructor(private readonly projectId: string) {
    console.log(\`🚀 CodeNexus Editor initialized for project: \${projectId}\`);
  }

  async addUser(user: User): Promise<void> {
    this.users.set(user.id, user);
    this.activeConnections.add(user.id);

    // AI-powered onboarding
    const suggestions = await this.analyzeUserPreferences(user);
    console.log(\`📋 Generated \${suggestions.length} personalized suggestions\`);
  }

  private async analyzeUserPreferences(user: User): Promise<string[]> {
    const { preferences } = user;
    const suggestions: string[] = [];

    if (preferences.fontSize < 14) {
      suggestions.push('Consider increasing font size for better readability');
    }

    if (!preferences.minimap) {
      suggestions.push('Enable minimap for easier code navigation');
    }

    if (preferences.tabSize !== 2) {
      suggestions.push('Project uses 2-space indentation');
    }

    return suggestions;
  }

  getActiveUsers(): User[] {
    return Array.from(this.users.values())
      .filter(user => this.activeConnections.has(user.id));
  }
}

// Initialize the editor
const editor = new CodeNexusEditor('codenexus-main');

const sampleUser: User = {
  id: 'user-001',
  name: 'Developer',
  email: 'dev@codenexus.io',
  role: 'admin',
  preferences: {
    theme: 'dark',
    fontSize: 14,
    tabSize: 2,
    wordWrap: true,
    minimap: true,
  },
};

editor.addUser(sampleUser).then(() => {
  console.log('✅ User onboarded successfully');
  console.log(\`👥 Active users: \${editor.getActiveUsers().length}\`);
});

export { CodeNexusEditor, type User, type UserPreferences };
`,
      });

      // Also open a CSS sample
      openFile({
        id: 'sample-styles',
        name: 'styles.css',
        path: '/src/styles.css',
        language: 'css',
        content: `/* CodeNexus Component Styles */

.editor-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg-primary);
}

.editor-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border-subtle);
}

.editor-title {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
`,
      });
    }
  }, []);

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
