import type { ReviewIssue, ReviewSummary } from '@/stores/reviewStore';

const BASE_URL = '/api/v1/review';

export interface ReviewApiResponse {
  id: string;
  issues: ReviewIssue[];
  summary: ReviewSummary;
  model: string;
  latency: number;
}

export async function runReview(
  code: string,
  language: string,
  filePath: string,
  categories?: string[]
): Promise<ReviewApiResponse> {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, language, filePath, categories, projectId: 'default' }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || 'Review failed');
  return json.data;
}

export async function generateFix(
  code: string,
  language: string,
  issue: {
    title: string;
    description: string;
    lineStart: number;
    lineEnd: number;
    codeSnippet?: string;
    category: string;
  }
): Promise<{ fixedCode: string; explanation: string }> {
  const res = await fetch(`${BASE_URL}/fix`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, language, issue }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || 'Fix generation failed');
  return json.data;
}

export async function dismissIssueApi(
  reviewId: string,
  issueId: string
): Promise<{ dismissCount: number; autoExcluded: boolean }> {
  const res = await fetch(`${BASE_URL}/dismiss`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reviewId, issueId }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message || 'Dismiss failed');
  return json.data;
}

export async function getReviewResults(filePath: string): Promise<ReviewApiResponse | null> {
  const res = await fetch(`${BASE_URL}/results?projectId=default&filePath=${encodeURIComponent(filePath)}`);
  const json = await res.json();
  if (!json.success || !json.data) return null;
  return json.data;
}
