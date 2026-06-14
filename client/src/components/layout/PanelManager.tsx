'use client';

import { useUIStore, type RightPanelView } from '@/stores/uiStore';
import VisualizationPanel from '@/components/visualize/VisualizationPanel';
import {
  MessageSquare,
  Zap,
  Brain,
  Activity,
  ShieldCheck,
  Network,
} from 'lucide-react';

const panelTabs: { id: RightPanelView; icon: React.ReactNode; label: string }[] = [
  { id: 'chat', icon: <MessageSquare size={16} />, label: 'Chat' },
  { id: 'intent', icon: <Zap size={16} />, label: 'Intent' },
  { id: 'visualize', icon: <Network size={16} />, label: 'Visualize' },
  { id: 'memory', icon: <Brain size={16} />, label: 'Memory' },
  { id: 'health', icon: <Activity size={16} />, label: 'Health' },
  { id: 'review', icon: <ShieldCheck size={16} />, label: 'Review' },
];

export default function PanelManager() {
  const activePanel = useUIStore((s) => s.activeRightPanel);
  const setActiveRightPanel = useUIStore((s) => s.setActiveRightPanel);

  return (
    <div className="panel-manager" id="panel-manager">
      <div className="panel-tabs" role="tablist" aria-label="AI Panels">
        {panelTabs.map((tab) => (
          <button
            key={tab.id}
            className={`panel-tab ${activePanel === tab.id ? 'panel-tab-active' : ''}`}
            onClick={() => setActiveRightPanel(tab.id)}
            role="tab"
            aria-selected={activePanel === tab.id}
            id={`panel-tab-${tab.id}`}
            title={tab.label}
          >
            {tab.icon}
            <span className="panel-tab-label">{tab.label}</span>
          </button>
        ))}
      </div>
      <div className="panel-body">
        {activePanel === 'chat' && (
          <PanelPlaceholder
            icon={<MessageSquare size={32} />}
            title="AI Chat"
            description="Ask anything about your code. I know your project."
          />
        )}
        {activePanel === 'intent' && (
          <PanelPlaceholder
            icon={<Zap size={32} />}
            title="Intent Mode"
            description="Select code and choose an intent — performance, security, readability."
          />
        )}
        {activePanel === 'visualize' && <VisualizationPanel />}
        {activePanel === 'memory' && (
          <PanelPlaceholder
            icon={<Brain size={32} />}
            title="Decision Memory"
            description="Your architectural decisions and coding preferences."
          />
        )}
        {activePanel === 'health' && (
          <PanelPlaceholder
            icon={<Activity size={32} />}
            title="Code Health"
            description="Overall code quality score and improvement suggestions."
          />
        )}
        {activePanel === 'review' && (
          <PanelPlaceholder
            icon={<ShieldCheck size={32} />}
            title="Code Review"
            description="AI-powered code review and security analysis."
          />
        )}
      </div>
    </div>
  );
}

function PanelPlaceholder({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="panel-placeholder">
      <div className="panel-placeholder-icon">{icon}</div>
      <h3 className="panel-placeholder-title">{title}</h3>
      <p className="panel-placeholder-desc">{description}</p>
    </div>
  );
}
