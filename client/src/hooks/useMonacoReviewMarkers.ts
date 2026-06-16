'use client';

import { useEffect, useRef } from 'react';
import { useReviewStore } from '@/stores/reviewStore';
import { getMonacoEditor, getMonacoInstance } from '@/utils/monacoRef';

const MARKER_OWNER = 'codenexus-review';

/**
 * Custom hook that syncs reviewStore.issues → Monaco markers + decorations.
 * Call this inside CodeEditor so it re-runs when issues change.
 */
export function useMonacoReviewMarkers() {
  const issues = useReviewStore((s) => s.issues);
  const selectedIssueId = useReviewStore((s) => s.selectedIssueId);
  const decorationIdsRef = useRef<string[]>([]);
  const hoverDisposableRef = useRef<{ dispose: () => void } | null>(null);

  // Sync markers whenever issues change
  useEffect(() => {
    const editor = getMonacoEditor();
    const monaco = getMonacoInstance();
    if (!editor || !monaco) return;

    const model = editor.getModel();
    if (!model) return;

    // Only show open issues
    const openIssues = issues.filter((i) => i.status === 'open');

    // ─── Set model markers (squiggly underlines) ───
    const markers = openIssues.map((issue) => {
      let severity: number;
      switch (issue.severity) {
        case 'critical':
          severity = monaco.MarkerSeverity.Error;
          break;
        case 'warning':
          severity = monaco.MarkerSeverity.Warning;
          break;
        default:
          severity = monaco.MarkerSeverity.Info;
      }

      return {
        severity,
        message: `[${issue.category}] ${issue.title}\n${issue.description}`,
        startLineNumber: issue.lineStart,
        startColumn: issue.columnStart || 1,
        endLineNumber: issue.lineEnd,
        endColumn: issue.columnEnd || model.getLineMaxColumn(Math.min(issue.lineEnd, model.getLineCount())),
        source: 'CodeNexus Review',
        code: issue.category,
      };
    });

    monaco.editor.setModelMarkers(model, MARKER_OWNER, markers);

    // ─── Set line decorations (colored background highlights) ───
    const decorations = openIssues.map((issue) => {
      let className: string;
      switch (issue.severity) {
        case 'critical':
          className = 'review-line-critical';
          break;
        case 'warning':
          className = 'review-line-warning';
          break;
        default:
          className = 'review-line-info';
          break;
      }

      return {
        range: new monaco.Range(issue.lineStart, 1, issue.lineEnd, 1),
        options: {
          isWholeLine: true,
          className,
          glyphMarginClassName: `review-glyph-${issue.severity}`,
          overviewRuler: {
            color: issue.severity === 'critical' ? '#ef4444' : issue.severity === 'warning' ? '#f59e0b' : '#3b82f6',
            position: monaco.editor.OverviewRulerLane.Right,
          },
        },
      };
    });

    const newIds = editor.deltaDecorations(decorationIdsRef.current, decorations);
    decorationIdsRef.current = newIds;

    // Cleanup markers on unmount
    return () => {
      const m = getMonacoInstance();
      const md = editor.getModel();
      if (m && md) {
        m.editor.setModelMarkers(md, MARKER_OWNER, []);
      }
      editor.deltaDecorations(decorationIdsRef.current, []);
      decorationIdsRef.current = [];
    };
  }, [issues]);

  // ─── Register hover provider ───
  useEffect(() => {
    const monaco = getMonacoInstance();
    if (!monaco) return;

    // Dispose previous hover provider
    hoverDisposableRef.current?.dispose();

    const openIssues = issues.filter((i) => i.status === 'open');
    if (openIssues.length === 0) return;

    const disposable = monaco.languages.registerHoverProvider('*', {
      provideHover(model, position) {
        const line = position.lineNumber;
        const matchingIssues = openIssues.filter(
          (i) => line >= i.lineStart && line <= i.lineEnd
        );

        if (matchingIssues.length === 0) return null;

        const contents = matchingIssues.map((issue) => {
          const sevIcon = issue.severity === 'critical' ? '🔴' : issue.severity === 'warning' ? '🟡' : '🔵';
          const lines = [
            `**${sevIcon} ${issue.title}** _(${issue.category})_`,
            '',
            issue.description,
          ];
          if (issue.suggestedFix) {
            lines.push('', '**Suggested fix:**', '```', issue.suggestedFix, '```');
          }
          return { value: lines.join('\n') };
        });

        return {
          range: new monaco.Range(line, 1, line, model.getLineMaxColumn(line)),
          contents,
        };
      },
    });

    hoverDisposableRef.current = disposable;

    return () => {
      disposable.dispose();
      hoverDisposableRef.current = null;
    };
  }, [issues]);

  // ─── Scroll to selected issue ───
  useEffect(() => {
    if (!selectedIssueId) return;
    const editor = getMonacoEditor();
    if (!editor) return;

    const issue = issues.find((i) => i.id === selectedIssueId);
    if (!issue) return;

    editor.revealLineInCenter(issue.lineStart);
    editor.setPosition({ lineNumber: issue.lineStart, column: 1 });
    editor.focus();
  }, [selectedIssueId, issues]);
}
