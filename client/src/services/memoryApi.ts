import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1/memory',
  timeout: 15000,
});

export interface DecisionData {
  _id: string;
  projectId: string;
  title: string;
  description: string;
  type: string;
  source: Record<string, any>;
  codeContext: {
    filePath?: string;
    fileName?: string;
    language?: string;
    lineRange?: { start: number; end: number };
    beforeCode?: string;
    afterCode?: string;
    diff?: string;
  };
  aiAnalysis: {
    explanation?: string;
    confidence?: number;
    references?: string[];
    model?: string;
  };
  annotations: {
    userNote?: string;
    rating?: number | null;
  };
  tags: string[];
  affectedFiles: { path: string; name: string }[];
  patternId: string | null;
  status: string;
  timestamp: string;
  createdAt: string;
}

export interface PatternData {
  id: string;
  description: string;
  type: string;
  tags: string[];
  occurrences: number;
  confidence: number;
  exampleDecisionIds: string[];
  firstSeen: string;
  lastSeen: string;
}

export interface RuleData {
  id: string;
  rule: string;
  category: string;
  sourcePatternId: string;
  sourceDecisionIds: string[];
  createdAt: string;
}

export interface DecisionFilters {
  type?: string;
  tags?: string;
  filePath?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export async function fetchDecisions(
  filters: DecisionFilters = {}
): Promise<{ decisions: DecisionData[]; total: number; hasMore: boolean }> {
  const params: Record<string, any> = { projectId: 'default', ...filters };
  if (filters.tags) params.tags = filters.tags;
  const res = await api.get('/decisions', { params });
  return res.data.data;
}

export async function fetchDecision(id: string): Promise<DecisionData> {
  const res = await api.get(`/decisions/${id}`);
  return res.data.data;
}

export async function searchDecisions(query: string): Promise<DecisionData[]> {
  const res = await api.get('/decisions/search', { params: { q: query, projectId: 'default' } });
  return res.data.data;
}

export async function fetchStats(): Promise<{
  total: number;
  byType: Record<string, number>;
  recentCount: number;
  topTags: { tag: string; count: number }[];
}> {
  const res = await api.get('/decisions/stats', { params: { projectId: 'default' } });
  return res.data.data;
}

export async function createDecision(data: {
  title: string;
  description?: string;
  type: string;
  tags?: string[];
  codeContext?: Record<string, any>;
  affectedFiles?: { path: string; name: string }[];
  annotations?: Record<string, any>;
}): Promise<DecisionData> {
  const res = await api.post('/decisions', { ...data, projectId: 'default' });
  return res.data.data;
}

export async function updateDecision(
  id: string,
  updates: Record<string, any>
): Promise<DecisionData> {
  const res = await api.put(`/decisions/${id}`, updates);
  return res.data.data;
}

export async function deleteDecision(id: string): Promise<void> {
  await api.delete(`/decisions/${id}`);
}

export async function fetchPatterns(): Promise<PatternData[]> {
  const res = await api.get('/patterns', { params: { projectId: 'default' } });
  return res.data.data;
}

export async function createRule(data: {
  rule: string;
  category?: string;
  sourcePatternId?: string;
  sourceDecisionIds?: string[];
}): Promise<RuleData> {
  const res = await api.post('/rules', { ...data, projectId: 'default' });
  return res.data.data;
}

export async function fetchRules(): Promise<RuleData[]> {
  const res = await api.get('/rules', { params: { projectId: 'default' } });
  return res.data.data;
}

export async function deleteRule(id: string): Promise<void> {
  await api.delete(`/rules/${id}`, { params: { projectId: 'default' } });
}
