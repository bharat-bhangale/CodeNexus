/**
 * HealthCalculator.ts — Orchestrator that combines all metric calculators
 * to produce a composite health score with weighted metrics.
 */

import { logger } from '../utils/logger.js';
import {
  calculateComplexity,
  calculateDuplication,
  calculateCoverage,
  calculateDocumentation,
  calculateDependencies,
  calculateDeadCode,
  type SourceFile,
} from '../utils/codeMetrics.js';
import type {
  IHealthMetrics,
  IHotspot,
  IRecommendation,
} from '../models/HealthSnapshot.js';

// ─── Metric weights ───
const WEIGHTS = {
  complexity: 0.25,
  duplication: 0.15,
  coverage: 0.20,
  documentation: 0.15,
  dependencies: 0.10,
  deadCode: 0.15,
};

export interface HealthResult {
  overallScore: number;
  metrics: IHealthMetrics;
  hotspots: IHotspot[];
  recommendations: IRecommendation[];
  analyzedFiles: number;
  analyzedLines: number;
  analysisTime: number;
}

export function analyzeHealth(files: SourceFile[]): HealthResult {
  const startTime = Date.now();

  // Run all metric calculators
  const complexity = calculateComplexity(files);
  const duplication = calculateDuplication(files);
  const coverage = calculateCoverage(files);
  const documentation = calculateDocumentation(files);
  const dependencies = calculateDependencies(files);
  const deadCode = calculateDeadCode(files);

  // Weighted overall score
  const overallScore = Math.round(
    complexity.score * WEIGHTS.complexity +
    duplication.score * WEIGHTS.duplication +
    coverage.score * WEIGHTS.coverage +
    documentation.score * WEIGHTS.documentation +
    dependencies.score * WEIGHTS.dependencies +
    deadCode.score * WEIGHTS.deadCode
  );

  const metrics: IHealthMetrics = {
    complexity,
    duplication,
    coverage,
    documentation,
    dependencies,
    deadCode,
  };

  // Build hotspots — files with the most issues
  const hotspots = buildHotspots(files, metrics);

  // Generate AI recommendations
  const recommendations = generateRecommendations(metrics, hotspots);

  const analyzedLines = files.reduce((s, f) => s + f.content.split('\n').length, 0);
  const analysisTime = Date.now() - startTime;

  logger.info(
    `Health analysis: score=${overallScore}, files=${files.length}, lines=${analyzedLines}, time=${analysisTime}ms`
  );

  return {
    overallScore,
    metrics,
    hotspots,
    recommendations,
    analyzedFiles: files.length,
    analyzedLines,
    analysisTime,
  };
}

// ─── Build Hotspots ───
function buildHotspots(files: SourceFile[], metrics: IHealthMetrics): IHotspot[] {
  const fileScores = new Map<string, { issues: number; topIssue: string; worstScore: number }>();

  // Gather issues per file from each metric
  for (const cf of metrics.complexity.details.complexFunctions) {
    const entry = fileScores.get(cf.file) || { issues: 0, topIssue: '', worstScore: 100 };
    entry.issues++;
    if (!entry.topIssue) entry.topIssue = `High complexity (${cf.complexity})`;
    const penalty = Math.min(30, cf.complexity * 2);
    entry.worstScore = Math.min(entry.worstScore, 100 - penalty);
    fileScores.set(cf.file, entry);
  }

  for (const inst of metrics.duplication.details.instances) {
    for (const f of inst.files) {
      const entry = fileScores.get(f) || { issues: 0, topIssue: '', worstScore: 100 };
      entry.issues++;
      if (!entry.topIssue) entry.topIssue = 'Code duplication detected';
      entry.worstScore = Math.min(entry.worstScore, 70);
      fileScores.set(f, entry);
    }
  }

  for (const item of metrics.documentation.details.undocumentedList) {
    const entry = fileScores.get(item.file) || { issues: 0, topIssue: '', worstScore: 100 };
    entry.issues++;
    if (!entry.topIssue) entry.topIssue = 'Missing documentation';
    entry.worstScore = Math.min(entry.worstScore, 80);
    fileScores.set(item.file, entry);
  }

  for (const inst of metrics.deadCode.details.instances) {
    const entry = fileScores.get(inst.file) || { issues: 0, topIssue: '', worstScore: 100 };
    entry.issues++;
    if (!entry.topIssue) entry.topIssue = `Dead code: unused ${inst.type}`;
    entry.worstScore = Math.min(entry.worstScore, 75);
    fileScores.set(inst.file, entry);
  }

  return Array.from(fileScores.entries())
    .map(([file, data]) => ({
      file,
      issues: data.issues,
      topIssue: data.topIssue,
      score: data.worstScore,
    }))
    .sort((a, b) => a.score - b.score)
    .slice(0, 8);
}

// ─── Generate Recommendations ───
function generateRecommendations(
  metrics: IHealthMetrics,
  hotspots: IHotspot[]
): IRecommendation[] {
  const recs: IRecommendation[] = [];

  if (metrics.complexity.score < 60) {
    recs.push({
      priority: metrics.complexity.score < 30 ? 'high' : 'medium',
      title: 'Reduce function complexity',
      description: `Average cyclomatic complexity is ${metrics.complexity.details.averageCyclomaticComplexity}. Extract helper functions and simplify conditionals to improve readability and testability.`,
      affectedFiles: metrics.complexity.details.complexFunctions.slice(0, 3).map((f) => f.file),
      estimatedImpact: Math.round((100 - metrics.complexity.score) * 0.25),
    });
  }

  if (metrics.duplication.score < 70) {
    recs.push({
      priority: 'medium',
      title: 'Eliminate code duplication',
      description: `${metrics.duplication.details.percentage}% of code is duplicated across ${metrics.duplication.details.duplicateBlocks} blocks. Extract shared logic into reusable utilities.`,
      affectedFiles: metrics.duplication.details.instances.flatMap((i) => i.files).slice(0, 3),
      estimatedImpact: Math.round((100 - metrics.duplication.score) * 0.15),
    });
  }

  if (metrics.coverage.score < 50) {
    recs.push({
      priority: 'high',
      title: 'Add missing test files',
      description: `Only ${metrics.coverage.details.estimatedCoverage}% of source files have corresponding test files. Add tests for ${metrics.coverage.details.filesWithoutTests} untested files.`,
      affectedFiles: [],
      estimatedImpact: Math.round((100 - metrics.coverage.score) * 0.2),
    });
  }

  if (metrics.documentation.score < 60) {
    recs.push({
      priority: metrics.documentation.score < 30 ? 'high' : 'low',
      title: 'Improve documentation coverage',
      description: `${metrics.documentation.details.undocumentedFunctions} of ${metrics.documentation.details.totalFunctions} functions lack JSDoc documentation. Add descriptions for exported APIs.`,
      affectedFiles: metrics.documentation.details.undocumentedList.slice(0, 3).map((f) => f.file),
      estimatedImpact: Math.round((100 - metrics.documentation.score) * 0.15),
    });
  }

  if (metrics.dependencies.score < 70) {
    recs.push({
      priority: metrics.dependencies.details.vulnerableCount > 0 ? 'high' : 'medium',
      title: 'Update project dependencies',
      description: `Found ${metrics.dependencies.details.outdatedCount} outdated and ${metrics.dependencies.details.vulnerableCount} potentially vulnerable packages. Run npm audit and update.`,
      affectedFiles: ['package.json'],
      estimatedImpact: Math.round((100 - metrics.dependencies.score) * 0.10),
    });
  }

  if (metrics.deadCode.score < 70) {
    recs.push({
      priority: 'low',
      title: 'Remove dead code',
      description: `Found ${metrics.deadCode.details.unusedExports} unused exports and ${metrics.deadCode.details.unreachableCode} unreachable code blocks. Clean up to reduce bundle size.`,
      affectedFiles: metrics.deadCode.details.instances.slice(0, 3).map((i) => i.file),
      estimatedImpact: Math.round((100 - metrics.deadCode.score) * 0.15),
    });
  }

  return recs.sort((a, b) => {
    const pri = { high: 0, medium: 1, low: 2 };
    return pri[a.priority] - pri[b.priority];
  });
}
