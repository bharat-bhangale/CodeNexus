import { create } from 'zustand';
import type { DecisionData, PatternData, RuleData, DecisionFilters } from '@/services/memoryApi';

interface MemoryState {
  decisions: DecisionData[];
  patterns: PatternData[];
  projectRules: RuleData[];
  stats: { total: number; byType: Record<string, number>; recentCount: number; topTags: { tag: string; count: number }[] } | null;
  filters: DecisionFilters;
  searchQuery: string;
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  total: number;
  activeSubTab: 'timeline' | 'patterns' | 'record';

  setDecisions: (decisions: DecisionData[], total: number, hasMore: boolean) => void;
  appendDecisions: (decisions: DecisionData[], total: number, hasMore: boolean) => void;
  addDecision: (decision: DecisionData) => void;
  removeDecision: (id: string) => void;
  setPatterns: (patterns: PatternData[]) => void;
  setRules: (rules: RuleData[]) => void;
  addRule: (rule: RuleData) => void;
  removeRule: (id: string) => void;
  setStats: (stats: MemoryState['stats']) => void;
  setFilters: (filters: Partial<DecisionFilters>) => void;
  setSearchQuery: (query: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setActiveSubTab: (tab: MemoryState['activeSubTab']) => void;
  reset: () => void;
}

export const useMemoryStore = create<MemoryState>((set) => ({
  decisions: [],
  patterns: [],
  projectRules: [],
  stats: null,
  filters: {},
  searchQuery: '',
  isLoading: false,
  error: null,
  hasMore: false,
  total: 0,
  activeSubTab: 'timeline',

  setDecisions: (decisions, total, hasMore) => set({ decisions, total, hasMore }),
  appendDecisions: (newDecisions, total, hasMore) =>
    set((s) => ({ decisions: [...s.decisions, ...newDecisions], total, hasMore })),
  addDecision: (decision) =>
    set((s) => ({ decisions: [decision, ...s.decisions], total: s.total + 1 })),
  removeDecision: (id) =>
    set((s) => ({
      decisions: s.decisions.filter((d) => d._id !== id),
      total: Math.max(0, s.total - 1),
    })),
  setPatterns: (patterns) => set({ patterns }),
  setRules: (rules) => set({ projectRules: rules }),
  addRule: (rule) => set((s) => ({ projectRules: [...s.projectRules, rule] })),
  removeRule: (id) =>
    set((s) => ({ projectRules: s.projectRules.filter((r) => r.id !== id) })),
  setStats: (stats) => set({ stats }),
  setFilters: (filters) => set((s) => ({ filters: { ...s.filters, ...filters } })),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setActiveSubTab: (activeSubTab) => set({ activeSubTab }),
  reset: () =>
    set({
      decisions: [],
      patterns: [],
      projectRules: [],
      stats: null,
      filters: {},
      searchQuery: '',
      error: null,
      hasMore: false,
      total: 0,
    }),
}));
