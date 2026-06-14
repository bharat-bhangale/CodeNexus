'use client';

import { useEffect, useCallback } from 'react';
import { useMemoryStore } from '@/stores/memoryStore';
import { fetchDecisions, fetchStats } from '@/services/memoryApi';
import DecisionTimeline from './DecisionTimeline';
import PatternPanel from './PatternPanel';
import RecordDecisionForm from './RecordDecisionForm';
import {
  Brain,
  Clock,
  TrendingUp,
  PenTool,
  Hash,
  Activity,
} from 'lucide-react';

const subTabs: { id: 'timeline' | 'patterns' | 'record'; label: string; icon: React.ReactNode }[] = [
  { id: 'timeline', label: 'Timeline', icon: <Clock size={13} /> },
  { id: 'patterns', label: 'Patterns', icon: <TrendingUp size={13} /> },
  { id: 'record', label: 'Record', icon: <PenTool size={13} /> },
];

export default function DecisionMemoryPanel() {
  const activeSubTab = useMemoryStore((s) => s.activeSubTab);
  const setActiveSubTab = useMemoryStore((s) => s.setActiveSubTab);
  const stats = useMemoryStore((s) => s.stats);
  const setStats = useMemoryStore((s) => s.setStats);
  const setDecisions = useMemoryStore((s) => s.setDecisions);
  const setLoading = useMemoryStore((s) => s.setLoading);

  // Load initial data
  const loadInitialData = useCallback(async () => {
    setLoading(true);
    try {
      const [result, statsData] = await Promise.all([
        fetchDecisions({ page: 1, limit: 20 }),
        fetchStats(),
      ]);
      setDecisions(result.decisions, result.total, result.hasMore);
      setStats(statsData);
    } catch {
      // Silently fail — user can retry
    } finally {
      setLoading(false);
    }
  }, [setDecisions, setStats, setLoading]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  return (
    <div className="mem-panel" id="mem-panel">
      {/* Header */}
      <div className="mem-panel-header">
        <div className="mem-panel-title">
          <Brain size={16} />
          <span>Decision Memory</span>
        </div>
        {stats && (
          <div className="mem-panel-stats">
            <span className="mem-stat" title="Total decisions">
              <Hash size={11} />
              {stats.total}
            </span>
            <span className="mem-stat" title="This week">
              <Activity size={11} />
              {stats.recentCount}
            </span>
          </div>
        )}
      </div>

      {/* Sub-tabs */}
      <div className="mem-subtabs">
        {subTabs.map((tab) => (
          <button
            key={tab.id}
            className={`mem-subtab ${activeSubTab === tab.id ? 'mem-subtab-active' : ''}`}
            onClick={() => setActiveSubTab(tab.id)}
            id={`mem-subtab-${tab.id}`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="mem-panel-content">
        {activeSubTab === 'timeline' && <DecisionTimeline />}
        {activeSubTab === 'patterns' && <PatternPanel />}
        {activeSubTab === 'record' && <RecordDecisionForm />}
      </div>
    </div>
  );
}
