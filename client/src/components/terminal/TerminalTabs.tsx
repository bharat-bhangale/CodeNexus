'use client';

import { Plus } from 'lucide-react';

export interface TerminalTab {
  id: string;
  title: string;
}

interface TerminalTabsProps {
  tabs: TerminalTab[];
  activeTabId: string;
  onSelect: (tabId: string) => void;
  onCreate: () => void;
}

export default function TerminalTabs({
  tabs,
  activeTabId,
  onSelect,
  onCreate,
}: TerminalTabsProps) {
  return (
    <div className="terminal-session-tabs" role="tablist" aria-label="Terminal sessions">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`terminal-session-tab ${
            tab.id === activeTabId ? 'terminal-session-tab-active' : ''
          }`}
          onClick={() => onSelect(tab.id)}
          role="tab"
          aria-selected={tab.id === activeTabId}
          title={tab.title}
        >
          {tab.title}
        </button>
      ))}
      <button
        className="terminal-session-add"
        onClick={onCreate}
        title="New terminal"
        aria-label="New terminal session"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}
