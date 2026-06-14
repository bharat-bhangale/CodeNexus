import { create } from 'zustand';

export type VizType = 'dependency_graph' | 'call_graph' | 'component_tree' | 'data_flow';
export type VizScope = 'project' | 'file';

export interface GraphNode {
  id: string;
  label: string;
  type: 'file' | 'function' | 'component' | 'variable';
  language?: string;
  path?: string;
  startLine?: number;
  endLine?: number;
  metadata?: Record<string, any>;
  position: { x: number; y: number };
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  type?: 'import' | 'call' | 'render' | 'data';
  animated?: boolean;
}

interface VisualizeState {
  vizType: VizType;
  scope: VizScope;
  nodes: GraphNode[];
  edges: GraphEdge[];
  summary: string;
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  selectedNodeId: string | null;
  hasGenerated: boolean;

  setVizType: (type: VizType) => void;
  setScope: (scope: VizScope) => void;
  setSearchQuery: (query: string) => void;
  selectNode: (nodeId: string | null) => void;
  setResult: (nodes: GraphNode[], edges: GraphEdge[], summary: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useVisualizeStore = create<VisualizeState>((set) => ({
  vizType: 'dependency_graph',
  scope: 'project',
  nodes: [],
  edges: [],
  summary: '',
  isLoading: false,
  error: null,
  searchQuery: '',
  selectedNodeId: null,
  hasGenerated: false,

  setVizType: (vizType) => set({ vizType }),
  setScope: (scope) => set({ scope }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  selectNode: (selectedNodeId) => set({ selectedNodeId }),
  setResult: (nodes, edges, summary) =>
    set({ nodes, edges, summary, hasGenerated: true, error: null }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
  reset: () =>
    set({
      nodes: [],
      edges: [],
      summary: '',
      error: null,
      searchQuery: '',
      selectedNodeId: null,
      hasGenerated: false,
    }),
}));
