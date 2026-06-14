'use client';

import { useState, useCallback } from 'react';
import type { DecisionData } from '@/services/memoryApi';
import {
  Zap,
  MessageSquare,
  ShieldCheck,
  Wrench,
  PenTool,
  Blocks,
  Bookmark,
  ChevronDown,
  ChevronRight,
  Clock,
  FileCode2,
  Star,
  Trash2,
} from 'lucide-react';

const typeIcons: Record<string, React.ReactNode> = {
  intent_accept: <Zap size={14} />,
  chat_apply: <MessageSquare size={14} />,
  review_fix: <ShieldCheck size={14} />,
  refactor: <Wrench size={14} />,
  manual: <PenTool size={14} />,
  scaffold: <Blocks size={14} />,
  pattern_rule: <Bookmark size={14} />,
};

const typeColors: Record<string, string> = {
  intent_accept: '#f59e0b',
  chat_apply: '#3b82f6',
  review_fix: '#22c55e',
  refactor: '#8b5cf6',
  manual: '#6366f1',
  scaffold: '#06b6d4',
  pattern_rule: '#ec4899',
};

const typeLabels: Record<string, string> = {
  intent_accept: 'Intent',
  chat_apply: 'Chat',
  review_fix: 'Review',
  refactor: 'Refactor',
  manual: 'Manual',
  scaffold: 'Scaffold',
  pattern_rule: 'Rule',
};

interface DecisionCardProps {
  decision: DecisionData;
  onDelete: (id: string) => void;
}

export default function DecisionCard({ decision, onDelete }: DecisionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const color = typeColors[decision.type] || '#6366f1';
  const timeAgo = formatRelativeTime(decision.timestamp);

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onDelete(decision._id);
    },
    [decision._id, onDelete]
  );

  return (
    <div className={`mem-card ${expanded ? 'mem-card-expanded' : ''}`}>
      <div className="mem-card-header" onClick={() => setExpanded(!expanded)}>
        <span className="mem-card-expand">
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </span>
        <span className="mem-card-type-icon" style={{ color }}>
          {typeIcons[decision.type] || <PenTool size={14} />}
        </span>
        <div className="mem-card-info">
          <span className="mem-card-title">{decision.title}</span>
          <div className="mem-card-meta">
            {decision.codeContext?.fileName && (
              <span className="mem-card-file">
                <FileCode2 size={10} />
                {decision.codeContext.fileName}
              </span>
            )}
            <span className="mem-card-time">
              <Clock size={10} />
              {timeAgo}
            </span>
          </div>
        </div>
        <div className="mem-card-badges">
          <span className="mem-card-type-badge" style={{ background: `${color}22`, color }}>
            {typeLabels[decision.type] || decision.type}
          </span>
        </div>
      </div>

      {decision.tags.length > 0 && (
        <div className="mem-card-tags">
          {decision.tags.map((tag) => (
            <span key={tag} className="mem-tag">
              {tag}
            </span>
          ))}
        </div>
      )}

      {expanded && (
        <div className="mem-card-body">
          {decision.description && (
            <p className="mem-card-desc">{decision.description}</p>
          )}

          {decision.codeContext?.beforeCode && (
            <div className="mem-card-code-section">
              <span className="mem-card-code-label">Before</span>
              <pre className="mem-card-code">{decision.codeContext.beforeCode}</pre>
            </div>
          )}

          {decision.codeContext?.afterCode && (
            <div className="mem-card-code-section">
              <span className="mem-card-code-label">After</span>
              <pre className="mem-card-code">{decision.codeContext.afterCode}</pre>
            </div>
          )}

          {decision.aiAnalysis?.explanation && (
            <div className="mem-card-ai">
              <span className="mem-card-ai-label">AI Explanation</span>
              <p className="mem-card-ai-text">{decision.aiAnalysis.explanation}</p>
              {decision.aiAnalysis.confidence != null && (
                <div className="mem-card-confidence">
                  <div
                    className="mem-card-confidence-bar"
                    style={{ width: `${decision.aiAnalysis.confidence}%` }}
                  />
                  <span className="mem-card-confidence-label">
                    {decision.aiAnalysis.confidence}% confidence
                  </span>
                </div>
              )}
            </div>
          )}

          {decision.annotations?.userNote && (
            <div className="mem-card-note">
              <span className="mem-card-note-label">Note</span>
              <p>{decision.annotations.userNote}</p>
            </div>
          )}

          {decision.annotations?.rating != null && (
            <div className="mem-card-rating">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star
                  key={n}
                  size={12}
                  className={n <= (decision.annotations.rating || 0) ? 'mem-star-filled' : 'mem-star-empty'}
                />
              ))}
            </div>
          )}

          <div className="mem-card-actions">
            <button className="mem-card-action-btn mem-card-action-danger" onClick={handleDelete}>
              <Trash2 size={12} />
              <span>Delete</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function formatRelativeTime(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
