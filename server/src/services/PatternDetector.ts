import { DecisionModel } from '../models/Decision.js';
import { logger } from '../utils/logger.js';

export interface DetectedPattern {
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

export interface ProjectRule {
  id: string;
  rule: string;
  category: string;
  sourcePatternId: string;
  sourceDecisionIds: string[];
  createdAt: string;
}

// In-memory rule store (per project) — will move to a Project model later
const projectRulesStore = new Map<string, ProjectRule[]>();

let ruleIdCounter = 1;

function generateRuleId(): string {
  return `rule_${Date.now()}_${ruleIdCounter++}`;
}

function generatePatternId(type: string, tag: string): string {
  return `pat_${type}_${tag}`.replace(/[^a-zA-Z0-9_]/g, '_');
}

export async function detectPatterns(projectId: string): Promise<DetectedPattern[]> {
  const patterns: DetectedPattern[] = [];

  // Group by type
  const byType = await DecisionModel.aggregate([
    { $match: { projectId, status: 'active' } },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        ids: { $push: { $toString: '$_id' } },
        firstSeen: { $min: '$timestamp' },
        lastSeen: { $max: '$timestamp' },
      },
    },
    { $match: { count: { $gte: 3 } } },
    { $sort: { count: -1 } },
  ]);

  const typeLabels: Record<string, string> = {
    manual: 'Manual coding decisions',
    intent_accept: 'Accepted Intent Mode suggestions',
    chat_apply: 'Applied chat code suggestions',
    review_fix: 'Applied code review fixes',
    refactor: 'AI-assisted refactoring',
    scaffold: 'Generated scaffolding',
    pattern_rule: 'Created pattern rules',
  };

  for (const group of byType) {
    patterns.push({
      id: generatePatternId(group._id, 'type'),
      description: `Recurring pattern: ${typeLabels[group._id] || group._id} (${group.count} occurrences)`,
      type: group._id,
      tags: [],
      occurrences: group.count,
      confidence: Math.min(95, 50 + group.count * 10),
      exampleDecisionIds: group.ids.slice(0, 3),
      firstSeen: group.firstSeen?.toISOString() || '',
      lastSeen: group.lastSeen?.toISOString() || '',
    });
  }

  // Group by tags
  const byTag = await DecisionModel.aggregate([
    { $match: { projectId, status: 'active', tags: { $exists: true, $ne: [] } } },
    { $unwind: '$tags' },
    {
      $group: {
        _id: '$tags',
        count: { $sum: 1 },
        ids: { $push: { $toString: '$_id' } },
        types: { $addToSet: '$type' },
        firstSeen: { $min: '$timestamp' },
        lastSeen: { $max: '$timestamp' },
      },
    },
    { $match: { count: { $gte: 2 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);

  for (const group of byTag) {
    patterns.push({
      id: generatePatternId('tag', group._id),
      description: `Decisions tagged "${group._id}" appear frequently (${group.count} times across ${group.types.length} decision types)`,
      type: 'tag_cluster',
      tags: [group._id],
      occurrences: group.count,
      confidence: Math.min(90, 40 + group.count * 15),
      exampleDecisionIds: group.ids.slice(0, 3),
      firstSeen: group.firstSeen?.toISOString() || '',
      lastSeen: group.lastSeen?.toISOString() || '',
    });
  }

  // Group by file
  const byFile = await DecisionModel.aggregate([
    {
      $match: {
        projectId,
        status: 'active',
        'codeContext.filePath': { $exists: true, $ne: null },
      },
    },
    {
      $group: {
        _id: '$codeContext.filePath',
        count: { $sum: 1 },
        ids: { $push: { $toString: '$_id' } },
        firstSeen: { $min: '$timestamp' },
        lastSeen: { $max: '$timestamp' },
      },
    },
    { $match: { count: { $gte: 3 } } },
    { $sort: { count: -1 } },
    { $limit: 5 },
  ]);

  for (const group of byFile) {
    const fileName = group._id.split('/').pop() || group._id;
    patterns.push({
      id: generatePatternId('file', fileName),
      description: `File "${fileName}" has ${group.count} decisions — consider documenting its conventions`,
      type: 'file_hotspot',
      tags: [],
      occurrences: group.count,
      confidence: Math.min(85, 35 + group.count * 12),
      exampleDecisionIds: group.ids.slice(0, 3),
      firstSeen: group.firstSeen?.toISOString() || '',
      lastSeen: group.lastSeen?.toISOString() || '',
    });
  }

  // Sort all patterns by confidence descending
  patterns.sort((a, b) => b.confidence - a.confidence);

  logger.info(`Detected ${patterns.length} patterns for project "${projectId}"`);
  return patterns;
}

export function getProjectRules(projectId: string): ProjectRule[] {
  return projectRulesStore.get(projectId) || [];
}

export function createRule(
  projectId: string,
  ruleText: string,
  category: string,
  sourcePatternId: string,
  sourceDecisionIds: string[]
): ProjectRule {
  const rules = projectRulesStore.get(projectId) || [];
  const rule: ProjectRule = {
    id: generateRuleId(),
    rule: ruleText,
    category,
    sourcePatternId,
    sourceDecisionIds,
    createdAt: new Date().toISOString(),
  };

  rules.push(rule);
  projectRulesStore.set(projectId, rules);
  logger.info(`Rule created for project "${projectId}": "${ruleText}"`);
  return rule;
}

export function deleteRule(projectId: string, ruleId: string): boolean {
  const rules = projectRulesStore.get(projectId) || [];
  const filtered = rules.filter((r) => r.id !== ruleId);
  if (filtered.length === rules.length) return false;
  projectRulesStore.set(projectId, filtered);
  logger.info(`Rule deleted: ${ruleId}`);
  return true;
}
