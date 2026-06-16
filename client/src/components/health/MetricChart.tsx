'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface MetricChartProps {
  name: string;
  label: string;
  score: number;
  icon: React.ReactNode;
  weight: number;
  details?: Record<string, any>;
}

function getBarColor(score: number): string {
  if (score >= 86) return 'var(--health-cyan, #22d3ee)';
  if (score >= 71) return 'var(--health-green, #22c55e)';
  if (score >= 51) return 'var(--health-amber, #f59e0b)';
  if (score >= 31) return 'var(--health-orange, #f97316)';
  return 'var(--health-red, #ef4444)';
}

export default function MetricChart({ name, label, score, icon, weight, details }: MetricChartProps) {
  const [expanded, setExpanded] = useState(false);
  const color = getBarColor(score);

  const detailItems = details ? getDetailItems(name, details) : [];

  return (
    <div className={`metric-chart ${expanded ? 'metric-chart-expanded' : ''}`} id={`metric-${name}`}>
      <button
        className="metric-chart-header"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
      >
        <div className="metric-chart-left">
          <span className="metric-chart-icon" style={{ color }}>{icon}</span>
          <span className="metric-chart-label">{label}</span>
          <span className="metric-chart-weight">({Math.round(weight * 100)}%)</span>
        </div>
        <div className="metric-chart-right">
          <span className="metric-chart-score" style={{ color }}>
            {score}
          </span>
          {detailItems.length > 0 && (
            <span className="metric-chart-chevron">
              {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            </span>
          )}
        </div>
      </button>
      <div className="metric-chart-bar-wrap">
        <div
          className="metric-chart-bar"
          style={{
            width: `${score}%`,
            background: `linear-gradient(90deg, ${color}cc, ${color})`,
            boxShadow: `0 0 8px ${color}44`,
          }}
        />
      </div>
      {expanded && detailItems.length > 0 && (
        <div className="metric-chart-details">
          {detailItems.map((item, i) => (
            <div key={i} className="metric-detail-row">
              <span className="metric-detail-label">{item.label}</span>
              <span className="metric-detail-value">{item.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function getDetailItems(name: string, details: Record<string, any>): { label: string; value: string }[] {
  switch (name) {
    case 'complexity':
      return [
        { label: 'Avg. complexity', value: String(details.averageCyclomaticComplexity ?? '—') },
        { label: 'Max complexity', value: String(details.maxCyclomaticComplexity ?? '—') },
        { label: 'Complex functions', value: String(details.complexFunctions?.length ?? 0) },
      ];
    case 'duplication':
      return [
        { label: 'Duplicate blocks', value: String(details.duplicateBlocks ?? 0) },
        { label: 'Duplicate lines', value: String(details.duplicateLines ?? 0) },
        { label: 'Duplication %', value: `${details.percentage ?? 0}%` },
      ];
    case 'coverage':
      return [
        { label: 'Estimated coverage', value: `${details.estimatedCoverage ?? 0}%` },
        { label: 'Files with tests', value: String(details.filesWithTests ?? 0) },
        { label: 'Files without tests', value: String(details.filesWithoutTests ?? 0) },
      ];
    case 'documentation':
      return [
        { label: 'Documented functions', value: String(details.documentedFunctions ?? 0) },
        { label: 'Undocumented', value: String(details.undocumentedFunctions ?? 0) },
        { label: 'Coverage', value: `${details.percentage ?? 0}%` },
      ];
    case 'dependencies':
      return [
        { label: 'Total dependencies', value: String(details.totalDependencies ?? 0) },
        { label: 'Outdated', value: String(details.outdatedCount ?? 0) },
        { label: 'Vulnerable', value: String(details.vulnerableCount ?? 0) },
        { label: 'Unused', value: String(details.unusedCount ?? 0) },
      ];
    case 'deadCode':
      return [
        { label: 'Unused exports', value: String(details.unusedExports ?? 0) },
        { label: 'Unreachable code', value: String(details.unreachableCode ?? 0) },
      ];
    default:
      return [];
  }
}
