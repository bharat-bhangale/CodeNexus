'use client';

import { useFileStore } from '@/stores/fileStore';
import { useUIStore } from '@/stores/uiStore';
import {
  Menu,
  Search,
  Settings,
  User,
  Command,
} from 'lucide-react';

export default function TopBar() {
  const projectName = useFileStore((s) => s.projectName);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);

  return (
    <header className="topbar" id="topbar">
      <div className="topbar-section topbar-left">
        <button
          className="topbar-btn"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
          id="btn-toggle-sidebar"
          title="Toggle Sidebar (Ctrl+B)"
        >
          <Menu size={18} />
        </button>
        <div className="topbar-brand">
          <div className="topbar-logo">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2L2 7L12 12L22 7L12 2Z"
                fill="var(--accent-primary)"
                opacity="0.7"
              />
              <path
                d="M2 17L12 22L22 17"
                stroke="var(--accent-primary)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 12L12 17L22 12"
                stroke="var(--accent-primary)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.5"
              />
            </svg>
          </div>
          <span className="topbar-project-name">{projectName}</span>
        </div>
      </div>

      <div className="topbar-section topbar-center">
        <button
          className="topbar-search"
          id="btn-quick-open"
          aria-label="Quick open"
          title="Quick Open (Ctrl+P)"
        >
          <Search size={14} />
          <span>Search files...</span>
          <kbd className="topbar-kbd">
            <Command size={10} />P
          </kbd>
        </button>
      </div>

      <div className="topbar-section topbar-right">
        <button
          className="topbar-btn"
          aria-label="Settings"
          id="btn-settings"
          title="Settings"
        >
          <Settings size={18} />
        </button>
        <button
          className="topbar-avatar"
          aria-label="User profile"
          id="btn-user-profile"
          title="Profile"
        >
          <User size={16} />
        </button>
      </div>
    </header>
  );
}
