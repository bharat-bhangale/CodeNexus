import { Request, Response, NextFunction } from 'express';
import * as decisionService from '../services/DecisionService.js';
import * as patternDetector from '../services/PatternDetector.js';
import { logger } from '../utils/logger.js';

// GET /decisions — List with filters & pagination
export async function listDecisions(req: Request, res: Response, next: NextFunction) {
  try {
    const projectId = (req.query.projectId as string) || 'default';
    const filters: decisionService.DecisionFilters = {
      type: req.query.type as any,
      tags: req.query.tags ? (req.query.tags as string).split(',') : undefined,
      filePath: req.query.filePath as string,
      status: (req.query.status as string) || 'active',
      dateFrom: req.query.dateFrom as string,
      dateTo: req.query.dateTo as string,
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20,
    };

    const result = await decisionService.findByProject(projectId, filters);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

// GET /decisions/search — Full-text search
export async function searchDecisions(req: Request, res: Response, next: NextFunction) {
  try {
    const projectId = (req.query.projectId as string) || 'default';
    const query = (req.query.q as string) || '';
    const limit = parseInt(req.query.limit as string) || 20;

    const decisions = await decisionService.searchDecisions(projectId, query, limit);
    res.json({ success: true, data: decisions });
  } catch (err) {
    next(err);
  }
}

// GET /decisions/stats — Aggregated stats
export async function getStats(req: Request, res: Response, next: NextFunction) {
  try {
    const projectId = (req.query.projectId as string) || 'default';
    const stats = await decisionService.getStats(projectId);
    res.json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
}

// GET /decisions/recent — Recent for AI context
export async function getRecent(req: Request, res: Response, next: NextFunction) {
  try {
    const projectId = (req.query.projectId as string) || 'default';
    const limit = parseInt(req.query.limit as string) || 20;
    const decisions = await decisionService.getRecentForContext(projectId, limit);
    res.json({ success: true, data: decisions });
  } catch (err) {
    next(err);
  }
}

// GET /decisions/:id — Single decision
export async function getDecision(req: Request, res: Response, next: NextFunction) {
  try {
    const decision = await decisionService.findById(req.params.id);
    if (!decision) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Decision not found' },
      });
    }
    res.json({ success: true, data: decision });
  } catch (err) {
    next(err);
  }
}

// POST /decisions — Create
export async function createDecision(req: Request, res: Response, next: NextFunction) {
  try {
    const { title, description, type, source, codeContext, aiAnalysis, annotations, tags, affectedFiles, projectId } = req.body;

    if (!title || !type) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'title and type are required' },
      });
    }

    const decision = await decisionService.createDecision({
      projectId: projectId || 'default',
      title,
      description,
      type,
      source,
      codeContext,
      aiAnalysis,
      annotations,
      tags,
      affectedFiles,
    });

    logger.info(`Created decision: "${title}" (${type})`);
    res.status(201).json({ success: true, data: decision });
  } catch (err) {
    next(err);
  }
}

// PUT /decisions/:id — Update
export async function updateDecision(req: Request, res: Response, next: NextFunction) {
  try {
    const { annotations, tags, status, description } = req.body;
    const decision = await decisionService.updateDecision(req.params.id, {
      annotations,
      tags,
      status,
      description,
    });

    if (!decision) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Decision not found' },
      });
    }

    res.json({ success: true, data: decision });
  } catch (err) {
    next(err);
  }
}

// DELETE /decisions/:id — Soft delete
export async function deleteDecision(req: Request, res: Response, next: NextFunction) {
  try {
    const deleted = await decisionService.softDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Decision not found' },
      });
    }
    res.json({ success: true, data: { deleted: true } });
  } catch (err) {
    next(err);
  }
}

// GET /patterns — Detect & return patterns
export async function getPatterns(req: Request, res: Response, next: NextFunction) {
  try {
    const projectId = (req.query.projectId as string) || 'default';
    const patterns = await patternDetector.detectPatterns(projectId);
    res.json({ success: true, data: patterns });
  } catch (err) {
    next(err);
  }
}

// POST /rules — Create rule from pattern
export async function createRule(req: Request, res: Response, next: NextFunction) {
  try {
    const { rule, category, sourcePatternId, sourceDecisionIds, projectId } = req.body;

    if (!rule) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'rule text is required' },
      });
    }

    const newRule = patternDetector.createRule(
      projectId || 'default',
      rule,
      category || 'general',
      sourcePatternId || '',
      sourceDecisionIds || []
    );

    res.status(201).json({ success: true, data: newRule });
  } catch (err) {
    next(err);
  }
}

// GET /rules — List project rules
export async function listRules(req: Request, res: Response, next: NextFunction) {
  try {
    const projectId = (req.query.projectId as string) || 'default';
    const rules = patternDetector.getProjectRules(projectId);
    res.json({ success: true, data: rules });
  } catch (err) {
    next(err);
  }
}

// DELETE /rules/:id — Delete a rule
export async function deleteRule(req: Request, res: Response, next: NextFunction) {
  try {
    const projectId = (req.query.projectId as string) || 'default';
    const deleted = patternDetector.deleteRule(projectId, req.params.id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Rule not found' },
      });
    }
    res.json({ success: true, data: { deleted: true } });
  } catch (err) {
    next(err);
  }
}
