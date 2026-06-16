'use client';

import { useCallback } from 'react';
import type { ReviewIssue } from '@/stores/reviewStore';
import { useReviewStore } from '@/stores/reviewStore';
import { useEditorStore } from '@/stores/editorStore';
import { generateFix, dismissIssueApi } from '@/services/reviewApi';
import { createDecision } from '@/services/memoryApi';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  Eye,
  Wrench,
  X,
  Bug,
  Shield,
  Zap,
  Palette,
  Accessibility,
  CheckCircle,
  Loader2,
} from 'lucide-react';

const SEVERITY_ICONS: Record<string, React.ReactNode> = {
  critical: <AlertCircle size={14} />,
  warning: <AlertTriangle size={14} />,
  info: <Info size={14} />,
};

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  bug: <Bug size={10} />,
  security: <Shield size={10} />,
  performance: <Zap size={10} />,
  style: <Palette size={10} />,
  accessibility: <Accessibility size={10} />,
  'best-practice': <CheckCircle size={10} />,
};

interface ReviewIssueCardProps {
  issue: ReviewIssue;
}

export default function ReviewIssueCard({ issue }: ReviewIssueCardProps) {
  const reviewId = useReviewStore((s) => s.reviewId);
  const selectedIssueId = useReviewStore((s) => s.selectedIssueId);
  const fixingIssueId = useReviewStore((s) => s.fixingIssueId);
  const setSelectedIssue = useReviewStore((s) => s.setSelectedIssue);
  const setFixingIssue = useReviewStore((s) => s.setFixingIssue);
  const setFixPreview = useReviewStore((s) => s.setFixPreview);
  const dismissIssue = useReviewStore((s) => s.dismissIssue);
  const markIssueFixed = useReviewStore((s) => s.markIssueFixed);
  const activeFile = useEditorStore((s) => s.getActiveFile());
  const updateFileContent = useEditorStore((s) => s.updateFileContent);

  const isSelected = selectedIssueId === issue.id;
  const isFixing = fixingIssueId === issue.id;
  const isDismissed = issue.status === 'dismissed';
  const isFixed = issue.status === 'fixed';

  const handleView = useCallback(() => {
    setSelectedIssue(isSelected ? null : issue.id);
  }, [issue.id, isSelected, setSelectedIssue]);

  const handleFix = useCallback(async () => {
    if (!activeFile || isFixing) return;
    setFixingIssue(issue.id);
    try {
      const result = await generateFix(activeFile.content, activeFile.language, {
        title: issue.title,
        description: issue.description,
        lineStart: issue.lineStart,
        lineEnd: issue.lineEnd,
        codeSnippet: issue.codeSnippet,
        category: issue.category,
      });

      // Apply fix directly
      updateFileContent(activeFile.id, result.fixedCode);
      markIssueFixed(issue.id);

      // Record decision
      try {
        await createDecision({
          title: `Fixed: ${issue.title}`,
          description: `Applied AI fix for ${issue.category} issue: ${issue.description}`,
          type: 'review_fix',
          tags: ['review', issue.category, issue.severity],
          codeContext: {
            filePath: activeFile.path,
            fileName: activeFile.name,
            language: activeFile.language,
            lineRange: { start: issue.lineStart, end: issue.lineEnd },
            afterCode: result.fixedCode.split('\n').slice(issue.lineStart - 1, issue.lineEnd).join('\n'),
          },
          affectedFiles: [{ path: activeFile.path, name: activeFile.name }],
        });
      } catch {
        // Decision logging failure is non-critical
      }
    } catch (err) {
      console.error('Fix generation failed:', err);
    }
    setFixingIssue(null);
  }, [activeFile, issue, isFixing, setFixingIssue, markIssueFixed, updateFileContent, setFixPreview]);

  const handleDismiss = useCallback(async () => {
    dismissIssue(issue.id);
    if (reviewId) {
      try {
        await dismissIssueApi(reviewId, issue.id);
      } catch {
        // Dismiss API failure is non-critical
      }
    }
  }, [issue.id, reviewId, dismissIssue]);

  if (isDismissed || isFixed) return null;

  return (
    <div
      className={`review-issue-card review-issue-${issue.severity} ${isSelected ? 'review-issue-selected' : ''}`}
      id={`review-issue-${issue.id}`}
    >
      <div className="review-issue-header">
        <span className={`review-severity-icon review-sev-${issue.severity}`}>
          {SEVERITY_ICONS[issue.severity]}
        </span>
        <span className="review-issue-title">{issue.title}</span>
        <span className={`review-category-badge review-cat-${issue.category}`}>
          {CATEGORY_ICONS[issue.category]}
          <span>{issue.category}</span>
        </span>
      </div>

      <p className="review-issue-desc">{issue.description}</p>

      <div className="review-issue-meta">
        <span className="review-issue-line">
          Ln {issue.lineStart}{issue.lineEnd !== issue.lineStart ? `–${issue.lineEnd}` : ''}
        </span>
        {issue.dismissCount > 0 && (
          <span className="review-dismiss-count" title={`Dismissed ${issue.dismissCount}/3 times`}>
            {issue.dismissCount}/3
          </span>
        )}
      </div>

      <div className="review-issue-actions">
        <button
          className={`review-action-btn review-action-view ${isSelected ? 'review-action-active' : ''}`}
          onClick={handleView}
          title="View in editor"
        >
          <Eye size={12} />
          <span>View</span>
        </button>
        <button
          className="review-action-btn review-action-fix"
          onClick={handleFix}
          disabled={isFixing}
          title="Generate and apply fix"
        >
          {isFixing ? <Loader2 size={12} className="review-spinner" /> : <Wrench size={12} />}
          <span>{isFixing ? 'Fixing...' : 'Fix'}</span>
        </button>
        <button
          className="review-action-btn review-action-dismiss"
          onClick={handleDismiss}
          title="Dismiss this issue"
        >
          <X size={12} />
          <span>Dismiss</span>
        </button>
      </div>
    </div>
  );
}
