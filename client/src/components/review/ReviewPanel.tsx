'use client';

import { useCallback } from 'react';
import { useReviewStore } from '@/stores/reviewStore';
import { useEditorStore } from '@/stores/editorStore';
import { runReview as runReviewApi } from '@/services/reviewApi';
import ReviewIssueCard from './ReviewIssueCard';
import {
  ShieldCheck,
  Play,
  Loader2,
  AlertCircle,
  AlertTriangle,
  Info,
  ToggleLeft,
  ToggleRight,
  Trash2,
} from 'lucide-react';

export default function ReviewPanel() {
  const issues = useReviewStore((s) => s.issues);
  const summary = useReviewStore((s) => s.summary);
  const isReviewing = useReviewStore((s) => s.isReviewing);
  const autoReview = useReviewStore((s) => s.autoReview);
  const error = useReviewStore((s) => s.error);
  const setIssues = useReviewStore((s) => s.setIssues);
  const setReviewing = useReviewStore((s) => s.setReviewing);
  const clearReview = useReviewStore((s) => s.clearReview);
  const toggleAutoReview = useReviewStore((s) => s.toggleAutoReview);
  const setError = useReviewStore((s) => s.setError);

  const activeFile = useEditorStore((s) => s.getActiveFile());

  const handleRunReview = useCallback(async () => {
    if (!activeFile || isReviewing) return;
    setReviewing(true);
    try {
      const result = await runReviewApi(activeFile.content, activeFile.language, activeFile.path);
      setIssues(result.issues, result.summary, result.id);
    } catch (err: any) {
      setError(err.message || 'Review failed');
    }
  }, [activeFile, isReviewing, setReviewing, setIssues, setError]);

  const openIssues = issues.filter((i) => i.status === 'open');
  const criticalIssues = openIssues.filter((i) => i.severity === 'critical');
  const warningIssues = openIssues.filter((i) => i.severity === 'warning');
  const infoIssues = openIssues.filter((i) => i.severity === 'info');

  return (
    <div className="review-panel" id="review-panel">
      {/* Header */}
      <div className="review-header">
        <div className="review-header-title">
          <ShieldCheck size={14} />
          <span>Code Review</span>
        </div>
        <div className="review-header-actions">
          <button
            className="review-auto-toggle"
            onClick={toggleAutoReview}
            title={autoReview ? 'Disable auto-review on save' : 'Enable auto-review on save'}
          >
            {autoReview ? <ToggleRight size={16} className="review-toggle-on" /> : <ToggleLeft size={16} />}
            <span className="review-toggle-label">Auto</span>
          </button>
          {issues.length > 0 && (
            <button
              className="review-clear-btn"
              onClick={clearReview}
              title="Clear review results"
              aria-label="Clear review"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Run Review Button */}
      <div className="review-run-area">
        <button
          className="review-run-btn"
          onClick={handleRunReview}
          disabled={!activeFile || isReviewing}
          id="review-run-btn"
        >
          {isReviewing ? (
            <>
              <Loader2 size={14} className="review-spinner" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <Play size={14} />
              <span>Run Review{activeFile ? ` — ${activeFile.name}` : ''}</span>
            </>
          )}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="review-error">
          <AlertCircle size={12} />
          <span>{error}</span>
        </div>
      )}

      {/* Summary */}
      {summary && openIssues.length > 0 && (
        <div className="review-summary">
          <span className="review-summary-total">
            Found {openIssues.length} issue{openIssues.length !== 1 ? 's' : ''}
          </span>
          <div className="review-summary-badges">
            {summary.criticalCount > 0 && (
              <span className="review-badge review-badge-critical">
                <AlertCircle size={10} />
                {criticalIssues.length}
              </span>
            )}
            {summary.warningCount > 0 && (
              <span className="review-badge review-badge-warning">
                <AlertTriangle size={10} />
                {warningIssues.length}
              </span>
            )}
            {summary.infoCount > 0 && (
              <span className="review-badge review-badge-info">
                <Info size={10} />
                {infoIssues.length}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Issue List */}
      <div className="review-issues-list">
        {/* No issues found after review */}
        {summary && openIssues.length === 0 && (
          <div className="review-empty review-clean">
            <div className="review-empty-icon review-clean-icon">
              <ShieldCheck size={28} />
            </div>
            <h3 className="review-empty-title">All Clear!</h3>
            <p className="review-empty-text">No open issues. Great code quality!</p>
          </div>
        )}

        {/* No review run yet */}
        {!summary && issues.length === 0 && !isReviewing && (
          <div className="review-empty">
            <div className="review-empty-icon">
              <ShieldCheck size={28} />
            </div>
            <h3 className="review-empty-title">Code Review</h3>
            <p className="review-empty-text">
              Click &quot;Run Review&quot; to analyze the current file for bugs, security issues, and best practices.
            </p>
            <p className="review-empty-shortcut">
              <kbd>Ctrl+Shift+R</kbd>
            </p>
          </div>
        )}

        {/* Critical issues */}
        {criticalIssues.length > 0 && (
          <div className="review-group">
            <h4 className="review-group-title review-group-critical">
              <AlertCircle size={12} /> Critical ({criticalIssues.length})
            </h4>
            {criticalIssues.map((issue) => (
              <ReviewIssueCard key={issue.id} issue={issue} />
            ))}
          </div>
        )}

        {/* Warning issues */}
        {warningIssues.length > 0 && (
          <div className="review-group">
            <h4 className="review-group-title review-group-warning">
              <AlertTriangle size={12} /> Warnings ({warningIssues.length})
            </h4>
            {warningIssues.map((issue) => (
              <ReviewIssueCard key={issue.id} issue={issue} />
            ))}
          </div>
        )}

        {/* Info issues */}
        {infoIssues.length > 0 && (
          <div className="review-group">
            <h4 className="review-group-title review-group-info">
              <Info size={12} /> Info ({infoIssues.length})
            </h4>
            {infoIssues.map((issue) => (
              <ReviewIssueCard key={issue.id} issue={issue} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
