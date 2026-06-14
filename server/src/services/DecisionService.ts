import { DecisionModel, type IDecision, type DecisionType } from '../models/Decision.js';
import { logger } from '../utils/logger.js';

export interface DecisionFilters {
  type?: DecisionType;
  tags?: string[];
  filePath?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export async function createDecision(data: {
  projectId?: string;
  title: string;
  description?: string;
  type: DecisionType;
  source?: Record<string, any>;
  codeContext?: Record<string, any>;
  aiAnalysis?: Record<string, any>;
  annotations?: Record<string, any>;
  tags?: string[];
  affectedFiles?: { path: string; name: string }[];
}): Promise<IDecision> {
  const decision = new DecisionModel({
    projectId: data.projectId || 'default',
    title: data.title,
    description: data.description || '',
    type: data.type,
    source: data.source || {},
    codeContext: data.codeContext || {},
    aiAnalysis: data.aiAnalysis || {},
    annotations: data.annotations || {},
    tags: data.tags || [],
    affectedFiles: data.affectedFiles || [],
    timestamp: new Date(),
  });

  await decision.save();
  logger.info(`Decision created: "${decision.title}" (${decision.type})`);
  return decision;
}

export async function findByProject(
  projectId: string,
  filters: DecisionFilters = {}
): Promise<{ decisions: IDecision[]; total: number; hasMore: boolean }> {
  const query: Record<string, any> = {
    projectId,
    status: filters.status || 'active',
  };

  if (filters.type) query.type = filters.type;
  if (filters.filePath) query['codeContext.filePath'] = filters.filePath;
  if (filters.tags && filters.tags.length > 0) {
    query.tags = { $in: filters.tags };
  }
  if (filters.dateFrom || filters.dateTo) {
    query.timestamp = {};
    if (filters.dateFrom) query.timestamp.$gte = new Date(filters.dateFrom);
    if (filters.dateTo) query.timestamp.$lte = new Date(filters.dateTo);
  }

  const page = Math.max(1, filters.page || 1);
  const limit = Math.min(50, Math.max(1, filters.limit || 20));
  const skip = (page - 1) * limit;

  const [decisions, total] = await Promise.all([
    DecisionModel.find(query).sort({ timestamp: -1 }).skip(skip).limit(limit).lean(),
    DecisionModel.countDocuments(query),
  ]);

  return {
    decisions: decisions as IDecision[],
    total,
    hasMore: skip + decisions.length < total,
  };
}

export async function findById(id: string): Promise<IDecision | null> {
  return DecisionModel.findById(id).lean();
}

export async function updateDecision(
  id: string,
  updates: {
    annotations?: Record<string, any>;
    tags?: string[];
    status?: string;
    description?: string;
  }
): Promise<IDecision | null> {
  const allowed: Record<string, any> = {};

  if (updates.annotations) {
    if (updates.annotations.userNote !== undefined) {
      allowed['annotations.userNote'] = updates.annotations.userNote;
    }
    if (updates.annotations.rating !== undefined) {
      allowed['annotations.rating'] = updates.annotations.rating;
    }
  }
  if (updates.tags) allowed.tags = updates.tags;
  if (updates.status) allowed.status = updates.status;
  if (updates.description !== undefined) allowed.description = updates.description;

  const decision = await DecisionModel.findByIdAndUpdate(id, { $set: allowed }, { new: true }).lean();
  if (decision) {
    logger.info(`Decision updated: ${id}`);
  }
  return decision as IDecision | null;
}

export async function softDelete(id: string): Promise<boolean> {
  const result = await DecisionModel.findByIdAndUpdate(id, {
    $set: { status: 'superseded' },
  });
  if (result) {
    logger.info(`Decision soft-deleted: ${id}`);
    return true;
  }
  return false;
}

export async function searchDecisions(
  projectId: string,
  query: string,
  limit = 20
): Promise<IDecision[]> {
  if (!query.trim()) return [];

  const results = await DecisionModel.find(
    {
      projectId,
      status: 'active',
      $text: { $search: query },
    },
    { score: { $meta: 'textScore' } }
  )
    .sort({ score: { $meta: 'textScore' } })
    .limit(limit)
    .lean();

  return results as IDecision[];
}

export async function getRecentForContext(
  projectId: string,
  limit = 20
): Promise<IDecision[]> {
  const decisions = await DecisionModel.find({
    projectId,
    status: 'active',
  })
    .sort({ timestamp: -1 })
    .limit(limit)
    .select('title type tags codeContext.filePath codeContext.language annotations.userNote timestamp')
    .lean();

  return decisions as IDecision[];
}

export async function getStats(projectId: string): Promise<{
  total: number;
  byType: Record<string, number>;
  recentCount: number;
  topTags: { tag: string; count: number }[];
}> {
  const [total, byTypeResult, recentCount, topTagsResult] = await Promise.all([
    DecisionModel.countDocuments({ projectId, status: 'active' }),

    DecisionModel.aggregate([
      { $match: { projectId, status: 'active' } },
      { $group: { _id: '$type', count: { $sum: 1 } } },
    ]),

    DecisionModel.countDocuments({
      projectId,
      status: 'active',
      timestamp: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    }),

    DecisionModel.aggregate([
      { $match: { projectId, status: 'active' } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]),
  ]);

  const byType: Record<string, number> = {};
  for (const item of byTypeResult) {
    byType[item._id] = item.count;
  }

  const topTags = topTagsResult.map((t: any) => ({ tag: t._id, count: t.count }));

  return { total, byType, recentCount, topTags };
}
