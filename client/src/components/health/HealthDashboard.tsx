'use client';

import { useCallback, useEffect } from 'react';
import { useHealthStore } from '@/stores/healthStore';
import { analyzeHealth as analyzeHealthApi, getHealthHistory } from '@/services/healthApi';
import HealthScoreCard from './HealthScoreCard';
import MetricChart from './MetricChart';
import HotspotList from './HotspotList';
import {
  Activity,
  Play,
  Loader2,
  AlertCircle,
  TrendingUp,
  Flame,
  Lightbulb,
  GitBranch,
  Copy,
  FileSearch,
  BookOpen,
  Package,
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from 'lucide-react';

const METRIC_CONFIG = [
  { name: 'complexity', label: 'Complexity', weight: 0.25, icon: <GitBranch size={14} /> },
  { name: 'duplication', label: 'Duplication', weight: 0.15, icon: <Copy size={14} /> },
  { name: 'coverage', label: 'Test Coverage', weight: 0.20, icon: <FileSearch size={14} /> },
  { name: 'documentation', label: 'Documentation', weight: 0.15, icon: <BookOpen size={14} /> },
  { name: 'dependencies', label: 'Dependencies', weight: 0.10, icon: <Package size={14} /> },
  { name: 'deadCode', label: 'Dead Code', weight: 0.15, icon: <Trash2 size={14} /> },
] as const;

export default function HealthDashboard() {
  const overallScore = useHealthStore((s) => s.overallScore);
  const metrics = useHealthStore((s) => s.metrics);
  const hotspots = useHealthStore((s) => s.hotspots);
  const recommendations = useHealthStore((s) => s.recommendations);
  const trend = useHealthStore((s) => s.trend);
  const isAnalyzing = useHealthStore((s) => s.isAnalyzing);
  const error = useHealthStore((s) => s.error);
  const analyzedFiles = useHealthStore((s) => s.analyzedFiles);
  const analyzedLines = useHealthStore((s) => s.analyzedLines);
  const analysisTime = useHealthStore((s) => s.analysisTime);
  const setHealth = useHealthStore((s) => s.setHealth);
  const setTrend = useHealthStore((s) => s.setTrend);
  const setAnalyzing = useHealthStore((s) => s.setAnalyzing);
  const setError = useHealthStore((s) => s.setError);

  const handleAnalyze = useCallback(async () => {
    if (isAnalyzing) return;
    setAnalyzing(true);
    try {
      const result = await analyzeHealthApi();
      setHealth(result);

      // Fetch trend history
      const history = await getHealthHistory();
      setTrend(history);
    } catch (err: any) {
      setError(err.message || 'Health analysis failed');
    }
  }, [isAnalyzing, setAnalyzing, setHealth, setTrend, setError]);

  // Load latest health on mount
  useEffect(() => {
    if (overallScore === null) {
      getHealthHistory()
        .then((history) => {
          if (history.length > 0) setTrend(history);
        })
        .catch(() => { /* silently fail */ });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Compute trend delta
  const trendDelta =
    trend.length >= 2
      ? trend[trend.length - 1].overallScore - trend[trend.length - 2].overallScore
      : null;

  return (
    <div className="health-dashboard" id="health-dashboard">
      {/* Header */}
      <div className="health-header">
        <div className="health-header-title">
          <Activity size={14} />
          <span>Code Health</span>
        </div>
      </div>

      {/* Analyze Button */}
      <div className="health-analyze-area">
        <button
          className="health-analyze-btn"
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          id="health-analyze-btn"
        >
          {isAnalyzing ? (
            <>
              <Loader2 size={14} className="health-spinner" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <Play size={14} />
              <span>Analyze Project</span>
            </>
          )}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="health-error">
          <AlertCircle size={12} />
          <span>{error}</span>
        </div>
      )}

      {/* Empty state */}
      {overallScore === null && !isAnalyzing && (
        <div className="health-empty">
          <div className="health-empty-icon">
            <Activity size={28} />
          </div>
          <h3 className="health-empty-title">Code Health Dashboard</h3>
          <p className="health-empty-text">
            Click &quot;Analyze Project&quot; to scan your codebase and get a comprehensive health report.
          </p>
          <p className="health-empty-shortcut">
            <kbd>Ctrl+Shift+H</kbd>
          </p>
        </div>
      )}

      {/* Dashboard Content */}
      {overallScore !== null && metrics && (
        <div className="health-content">
          {/* Overall Score Section */}
          <div className="health-score-section">
            <HealthScoreCard score={overallScore} />
            {trendDelta !== null && (
              <div
                className={`health-trend-badge ${trendDelta > 0 ? 'health-trend-up' : trendDelta < 0 ? 'health-trend-down' : 'health-trend-flat'}`}
              >
                {trendDelta > 0 ? <ArrowUpRight size={12} /> : trendDelta < 0 ? <ArrowDownRight size={12} /> : <Minus size={12} />}
                <span>{trendDelta > 0 ? '+' : ''}{trendDelta}</span>
              </div>
            )}
            <div className="health-stats-row">
              <span>{analyzedFiles} files</span>
              <span>•</span>
              <span>{analyzedLines.toLocaleString()} lines</span>
              <span>•</span>
              <span>{analysisTime}ms</span>
            </div>
          </div>

          {/* Trend Sparkline */}
          {trend.length >= 2 && (
            <div className="health-section">
              <h4 className="health-section-title">
                <TrendingUp size={12} />
                <span>Trend</span>
              </h4>
              <div className="health-sparkline-container">
                <svg
                  viewBox={`0 0 ${trend.length * 30} 40`}
                  className="health-sparkline"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="sparkGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="var(--accent-primary, #6366f1)" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="var(--accent-primary, #6366f1)" stopOpacity="0.02" />
                    </linearGradient>
                  </defs>
                  {/* Fill area */}
                  <path
                    d={buildSparklinePath(trend.map((t) => t.overallScore), true)}
                    fill="url(#sparkGrad)"
                  />
                  {/* Line */}
                  <path
                    d={buildSparklinePath(trend.map((t) => t.overallScore), false)}
                    fill="none"
                    stroke="var(--accent-primary, #6366f1)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Dots */}
                  {trend.map((t, i) => {
                    const x = i * 30 + 15;
                    const y = 38 - (t.overallScore / 100) * 34;
                    return (
                      <circle
                        key={i}
                        cx={x}
                        cy={y}
                        r="3"
                        fill="var(--accent-primary, #6366f1)"
                        stroke="var(--bg-surface, #12121a)"
                        strokeWidth="1.5"
                      />
                    );
                  })}
                </svg>
                <div className="health-sparkline-labels">
                  {trend.map((t, i) => (
                    <span key={i} className="sparkline-label">
                      {t.overallScore}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Metric Breakdown */}
          <div className="health-section">
            <h4 className="health-section-title">
              <Activity size={12} />
              <span>Metric Breakdown</span>
            </h4>
            <div className="health-metrics-list">
              {METRIC_CONFIG.map((mc) => {
                const m = metrics[mc.name as keyof typeof metrics];
                return (
                  <MetricChart
                    key={mc.name}
                    name={mc.name}
                    label={mc.label}
                    score={m?.score ?? 0}
                    icon={mc.icon}
                    weight={mc.weight}
                    details={m?.details}
                  />
                );
              })}
            </div>
          </div>

          {/* Hotspots */}
          {hotspots.length > 0 && (
            <div className="health-section">
              <h4 className="health-section-title">
                <Flame size={12} />
                <span>Hotspots</span>
              </h4>
              <HotspotList hotspots={hotspots} />
            </div>
          )}

          {/* AI Recommendations */}
          {recommendations.length > 0 && (
            <div className="health-section">
              <h4 className="health-section-title">
                <Lightbulb size={12} />
                <span>Recommendations</span>
              </h4>
              <div className="health-recommendations">
                {recommendations.map((rec, i) => (
                  <div key={i} className={`health-rec health-rec-${rec.priority}`}>
                    <div className="health-rec-header">
                      <span className={`health-rec-priority health-rec-pri-${rec.priority}`}>
                        {rec.priority}
                      </span>
                      <span className="health-rec-title">{rec.title}</span>
                      {rec.estimatedImpact > 0 && (
                        <span className="health-rec-impact" title="Estimated score improvement">
                          +{rec.estimatedImpact}
                        </span>
                      )}
                    </div>
                    <p className="health-rec-desc">{rec.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Sparkline path builder ───
function buildSparklinePath(values: number[], area: boolean): string {
  if (values.length === 0) return '';
  const w = values.length * 30;
  const points = values.map((v, i) => {
    const x = i * 30 + 15;
    const y = 38 - (v / 100) * 34;
    return `${x},${y}`;
  });

  const linePath = `M${points.join(' L')}`;
  if (!area) return linePath;

  return `${linePath} L${w - 15},38 L15,38 Z`;
}
