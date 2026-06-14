import axios from 'axios';
import type { VizType, VizScope, GraphNode, GraphEdge } from '@/stores/visualizeStore';

const api = axios.create({
  baseURL: '/api/v1/explain',
  timeout: 30000,
});

export interface ExplainResponse {
  nodes: GraphNode[];
  edges: GraphEdge[];
  summary: string;
  metadata: {
    type: string;
    fileCount?: number;
    edgeCount?: number;
    generatedAt: string;
  };
}

export async function generateExplanation(params: {
  type: VizType;
  scope: VizScope;
  projectId?: string;
  filePath?: string;
  targetFunction?: string;
  targetVariable?: string;
}): Promise<ExplainResponse> {
  const res = await api.post('/', {
    type: params.type,
    scope: params.scope,
    projectId: params.projectId || 'default',
    filePath: params.filePath,
    targetFunction: params.targetFunction,
    targetVariable: params.targetVariable,
  });
  return res.data.data;
}
