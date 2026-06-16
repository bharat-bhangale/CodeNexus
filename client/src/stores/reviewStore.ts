import { create } from 'zustand';

export interface ReviewIssue {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  category: 'bug' | 'security' | 'performance' | 'style' | 'accessibility' | 'best-practice';
  lineStart: number;
  lineEnd: number;
  columnStart?: number;
  columnEnd?: number;
  title: string;
  description: string;
  codeSnippet?: string;
  suggestedFix?: string;
  fixExplanation?: string;
  status: 'open' | 'fixed' | 'dismissed' | 'false-positive';
  dismissCount: number;
}

export interface ReviewSummary {
  totalIssues: number;
  criticalCount: number;
  warningCount: number;
  infoCount: number;
  fixedCount: number;
  dismissedCount: number;
}

interface ReviewState {
  issues: ReviewIssue[];
  summary: ReviewSummary | null;
  isReviewing: boolean;
  autoReview: boolean;
  selectedIssueId: string | null;
  reviewId: string | null;
  fixingIssueId: string | null;
  fixPreview: { issueId: string; fixedCode: string; explanation: string } | null;
  error: string | null;

  setIssues: (issues: ReviewIssue[], summary: ReviewSummary, reviewId: string) => void;
  setReviewing: (reviewing: boolean) => void;
  setSelectedIssue: (issueId: string | null) => void;
  setFixingIssue: (issueId: string | null) => void;
  setFixPreview: (preview: { issueId: string; fixedCode: string; explanation: string } | null) => void;
  dismissIssue: (issueId: string) => void;
  markIssueFixed: (issueId: string) => void;
  clearReview: () => void;
  toggleAutoReview: () => void;
  setError: (error: string | null) => void;
}

export const useReviewStore = create<ReviewState>((set) => ({
  issues: [],
  summary: null,
  isReviewing: false,
  autoReview: false,
  selectedIssueId: null,
  reviewId: null,
  fixingIssueId: null,
  fixPreview: null,
  error: null,

  setIssues: (issues, summary, reviewId) =>
    set({ issues, summary, reviewId, error: null, isReviewing: false }),

  setReviewing: (reviewing) => set({ isReviewing: reviewing, error: null }),

  setSelectedIssue: (issueId) => set({ selectedIssueId: issueId }),

  setFixingIssue: (issueId) => set({ fixingIssueId: issueId }),

  setFixPreview: (preview) => set({ fixPreview: preview }),

  dismissIssue: (issueId) =>
    set((s) => {
      const issues = s.issues.map((i) =>
        i.id === issueId ? { ...i, status: 'dismissed' as const, dismissCount: i.dismissCount + 1 } : i
      );
      const open = issues.filter((i) => i.status === 'open');
      return {
        issues,
        summary: s.summary
          ? {
              ...s.summary,
              dismissedCount: issues.filter((i) => i.status === 'dismissed').length,
              totalIssues: open.length,
            }
          : null,
      };
    }),

  markIssueFixed: (issueId) =>
    set((s) => {
      const issues = s.issues.map((i) =>
        i.id === issueId ? { ...i, status: 'fixed' as const } : i
      );
      const open = issues.filter((i) => i.status === 'open');
      return {
        issues,
        fixPreview: null,
        fixingIssueId: null,
        summary: s.summary
          ? {
              ...s.summary,
              fixedCount: issues.filter((i) => i.status === 'fixed').length,
              totalIssues: open.length,
            }
          : null,
      };
    }),

  clearReview: () =>
    set({ issues: [], summary: null, reviewId: null, selectedIssueId: null, fixPreview: null, fixingIssueId: null, error: null }),

  toggleAutoReview: () => set((s) => ({ autoReview: !s.autoReview })),

  setError: (error) => set({ error, isReviewing: false }),
}));
