'use client';

import { useUIStore } from '@/stores/uiStore';
import FileExplorer from '@/components/explorer/FileExplorer';
import {
  Files,
  Search,
  GitBranch,
  Puzzle,
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
        {activeView === 'files' && <FileExplorer />}
        {activeView === 'search' && (
          <div className="sidebar-view-placeholder">
            <div className="sidebar-view-header">
              <span className="sidebar-title">SEARCH</span>
            </div>
            <div className="sidebar-view-body">
              <input
                type="text"
                className="sidebar-search-input"
                placeholder="Search across files..."
                aria-label="Search files"
                id="sidebar-search-input"
              />
              <p className="sidebar-muted-text">Type to search across all files</p>
            </div>
          </div>
        )}
        {activeView === 'git' && (
          <div className="sidebar-view-placeholder">
            <div className="sidebar-view-header">
              <span className="sidebar-title">SOURCE CONTROL</span>
            </div>
            <div className="sidebar-view-body">
              <p className="sidebar-muted-text">Source control integration coming soon</p>
            </div>
          </div>
        )}
        {activeView === 'extensions' && (
          <div className="sidebar-view-placeholder">
            <div className="sidebar-view-header">
              <span className="sidebar-title">EXTENSIONS</span>
            </div>
            <div className="sidebar-view-body">
              <p className="sidebar-muted-text">Extensions marketplace coming soon</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
