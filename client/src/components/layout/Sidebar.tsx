'use client';

import { useUIStore } from '@/stores/uiStore';
import {
  Files,
  Search,
  GitBranch,
  Puzzle,
  ChevronDown,
} from 'lucide-react';
import { useState } from 'react';

type SidebarView = 'files' | 'search' | 'git' | 'extensions';

const sidebarViews: { id: SidebarView; icon: React.ReactNode; label: string }[] = [
  { id: 'files', icon: <Files size={20} />, label: 'Explorer' },
  { id: 'search', icon: <Search size={20} />, label: 'Search' },
  { id: 'git', icon: <GitBranch size={20} />, label: 'Source Control' },
  { id: 'extensions', icon: <Puzzle size={20} />, label: 'Extensions' },
];

export default function Sidebar() {
  const [activeView, setActiveView] = useState<SidebarView>('files');
  const sidebarVisible = useUIStore((s) => s.sidebarVisible);

  if (!sidebarVisible) return null;

  return (
    <aside className="sidebar" id="sidebar">
      <div className="sidebar-icon-rail">
        {sidebarViews.map((view) => (
          <button
            key={view.id}
            className={`sidebar-icon-btn ${activeView === view.id ? 'sidebar-icon-btn-active' : ''}`}
            onClick={() => setActiveView(view.id)}
            aria-label={view.label}
            id={`sidebar-btn-${view.id}`}
            title={view.label}
          >
            {view.icon}
          </button>
        ))}
      </div>
      <div className="sidebar-content">
        <div className="sidebar-header">
          <span className="sidebar-title">
            {sidebarViews.find((v) => v.id === activeView)?.label?.toUpperCase()}
          </span>
          <ChevronDown size={14} className="sidebar-header-icon" />
        </div>
        <div className="sidebar-body">
          {activeView === 'files' && (
            <div className="sidebar-placeholder">
              <div className="sidebar-file-tree">
                <div className="file-tree-item file-tree-folder">
                  <ChevronDown size={12} />
                  <Files size={14} />
                  <span>src</span>
                </div>
                <div className="file-tree-item file-tree-file" style={{ paddingLeft: 28 }}>
                  <span className="file-dot file-dot-ts" />
                  <span>hello.ts</span>
                </div>
                <div className="file-tree-item file-tree-file" style={{ paddingLeft: 28 }}>
                  <span className="file-dot file-dot-css" />
                  <span>styles.css</span>
                </div>
                <div className="file-tree-item file-tree-file" style={{ paddingLeft: 28 }}>
                  <span className="file-dot file-dot-json" />
                  <span>package.json</span>
                </div>
              </div>
            </div>
          )}
          {activeView === 'search' && (
            <div className="sidebar-placeholder">
              <input
                type="text"
                className="sidebar-search-input"
                placeholder="Search across files..."
                aria-label="Search files"
                id="sidebar-search-input"
              />
              <p className="sidebar-muted-text">Type to search across all files</p>
            </div>
          )}
          {activeView === 'git' && (
            <div className="sidebar-placeholder">
              <p className="sidebar-muted-text">Source control integration</p>
            </div>
          )}
          {activeView === 'extensions' && (
            <div className="sidebar-placeholder">
              <p className="sidebar-muted-text">Extensions marketplace</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
