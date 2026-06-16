import { create } from 'zustand';

export interface HealthMetricScore {
  score: number;
  details: Record<string, any>;
}

export interface HealthMetrics {
  complexity: HealthMetricScore;
  duplication: HealthMetricScore;
  coverage: HealthMetricScore;
  documentation: HealthMetricScore;
  dependencies: HealthMetricScore;
  deadCode: HealthMetricScore;
}

export interface Hotspot {
  file: string;
  issues: number;
  topIssue: string;
  score: number;
}

export interface Recommendation {
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  affectedFiles: string[];
  estimatedImpact: number;
}

export interface HealthTrendPoint {
  overallScore: number;
  createdAt: string;
  metrics?: {
    complexity?: { score: number };
    duplication?: { score: number };
    coverage?: { score: number };
    documentation?: { score: number };
    dependencies?: { score: number };
    deadCode?: { score: number };
  };
}

interface HealthState {
  overallScore: number | null;
  metrics: HealthMetrics | null;
  hotspots: Hotspot[];
  recommendations: Recommendation[];
  trend: HealthTrendPoint[];
  isAnalyzing: boolean;
  analyzedFiles: number;
  analyzedLines: number;
  analysisTime: number;
  error: string | null;
  lastAnalyzedAt: string | null;

  setHealth: (data: {
    overallScore: number;
    metrics: HealthMetrics;
    hotspots: Hotspot[];
    recommendations: Recommendation[];
    analyzedFiles: number;
    analyzedLines: number;
    analysisTime: number;
  }) => void;
  setTrend: (trend: HealthTrendPoint[]) => void;
  setAnalyzing: (analyzing: boolean) => void;
  setError: (error: string | null) => void;
  clearHealth: () => void;
}

export const useHealthStore = create<HealthState>((set) => ({
  overallScore: null,
  metrics: null,
  hotspots: [],
  recommendations: [],
  trend: [],
  isAnalyzing: false,
  analyzedFiles: 0,
  analyzedLines: 0,
  analysisTime: 0,
  error: null,
  lastAnalyzedAt: null,

  setHealth: (data) =>
    set({
      overallScore: data.overallScore,
      metrics: data.metrics,
      hotspots: data.hotspots,
      recommendations: data.recommendations,
      analyzedFiles: data.analyzedFiles,
      analyzedLines: data.analyzedLines,
      analysisTime: data.analysisTime,
      isAnalyzing: false,
      error: null,
      lastAnalyzedAt: new Date().toISOString(),
    }),

  setTrend: (trend) => set({ trend }),

  setAnalyzing: (analyzing) => set({ isAnalyzing: analyzing, error: null }),

  setError: (error) => set({ error, isAnalyzing: false }),

  clearHealth: () =>
    set({
      overallScore: null,
      metrics: null,
      hotspots: [],
      recommendations: [],
      trend: [],
      isAnalyzing: false,
      error: null,
      lastAnalyzedAt: null,
    }),
}));
