import { Request, Response, NextFunction } from 'express';
import { ReviewResultModel } from '../models/ReviewResult.js';
import { reviewCode, generateFix } from '../services/ReviewEngine.js';
import { logger } from '../utils/logger.js';

// ─── POST /review — Run code review ───
export async function runReview(req: Request, res: Response, next: NextFunction) {
  try {
    const { code, language, filePath, categories } = req.body as {
      code: string;
      language?: string;
      filePath?: string;
      categories?: string[];
    };

    if (!code?.trim()) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'code is required' },
      });
    }

    const projectId = (req.body.projectId as string) || 'default';
    const file = filePath || 'untitled';
    const fileName = file.split('/').pop() || file;
    const lang = language || 'javascript';

    // Load dismissed patterns for this project
    const dismissedPatterns = await getDismissedPatterns(projectId);

    const result = await reviewCode({
      code,
      language: lang,
      filePath: file,
      categories: categories as any,
      dismissedPatterns,
    });

    // Save to MongoDB
    const reviewResult = new ReviewResultModel({
      projectId,
      filePath: file,
      fileName,
      language: lang,
      issues: result.issues,
      summary: result.summary,
      aiMetadata: {
        model: result.model,
        latency: result.latency,
      },
    });
    await reviewResult.save();

    res.json({
      success: true,
      data: {
        id: reviewResult._id,
        issues: result.issues,
        summary: result.summary,
        model: result.model,
        latency: result.latency,
      },
    });
  } catch (err) {
    next(err);
  }
}

// ─── POST /review/fix — Generate fix for a single issue ───
export async function runFix(req: Request, res: Response, next: NextFunction) {
  try {
    const { code, language, issue } = req.body as {
      code: string;
      language?: string;
      issue: {
        title: string;
        description: string;
        lineStart: number;
        lineEnd: number;
        codeSnippet?: string;
        category: string;
      };
    };

    if (!code?.trim() || !issue) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'code and issue are required' },
      });
    }

    const result = await generateFix({
      code,
      language: language || 'javascript',
      issue,
    });

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

// ─── GET /review/results — Get latest review for a file ───
export async function getResults(req: Request, res: Response, next: NextFunction) {
  try {
    const projectId = (req.query.projectId as string) || 'default';
    const filePath = req.query.filePath as string;

    if (!filePath) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'filePath query parameter is required' },
      });
    }

    const result = await ReviewResultModel.findOne({ projectId, filePath })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: result || null,
    });
  } catch (err) {
    next(err);
  }
}

// ─── PATCH /review/dismiss — Dismiss an issue ───
export async function dismissIssue(req: Request, res: Response, next: NextFunction) {
  try {
    const { reviewId, issueId } = req.body as { reviewId: string; issueId: string };

    if (!reviewId || !issueId) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'reviewId and issueId are required' },
      });
    }

    const review = await ReviewResultModel.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Review result not found' },
      });
    }

    const issue = review.issues.find((i) => i.id === issueId);
    if (!issue) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Issue not found' },
      });
    }

    issue.status = 'dismissed';
    issue.dismissedAt = new Date();
    issue.dismissCount = (issue.dismissCount || 0) + 1;

    // Update summary counts
    review.summary.dismissedCount = review.issues.filter((i) => i.status === 'dismissed').length;

    await review.save();

    const autoExcluded = issue.dismissCount >= 3;
    if (autoExcluded) {
      logger.info(`Pattern auto-excluded after 3 dismissals: "${issue.title}"`);
    }

    res.json({
      success: true,
      data: {
        issueId,
        status: issue.status,
        dismissCount: issue.dismissCount,
        autoExcluded,
      },
    });
  } catch (err) {
    next(err);
  }
}

// ─── Helper: Get patterns dismissed 3+ times ───
async function getDismissedPatterns(projectId: string): Promise<string[]> {
  try {
    const results = await ReviewResultModel.aggregate([
      { $match: { projectId } },
      { $unwind: '$issues' },
      { $match: { 'issues.dismissCount': { $gte: 3 } } },
      { $group: { _id: '$issues.title' } },
    ]);
    return results.map((r: any) => r._id);
  } catch {
    return [];
  }
}
