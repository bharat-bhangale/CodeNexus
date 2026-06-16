import { Request, Response, NextFunction } from 'express';
import { HealthSnapshotModel } from '../models/HealthSnapshot.js';
import { analyzeHealth } from '../services/HealthCalculator.js';
import { FileModel } from '../models/File.js';
import { logger } from '../utils/logger.js';

// ─── POST /code-health/analyze — Run health analysis ───
export async function analyzeProjectHealth(req: Request, res: Response, next: NextFunction) {
  try {
    const projectId = (req.body.projectId as string) || 'default';

    // Load all project files from MongoDB
    const dbFiles = await FileModel.find({ projectId, type: 'file' }).lean();

    if (dbFiles.length === 0) {
      return res.json({
        success: true,
        data: {
          overallScore: 100,
          metrics: {},
          hotspots: [],
          recommendations: [
            {
              priority: 'low',
              title: 'No files found',
              description: 'Create some files in your project to start tracking code health.',
              affectedFiles: [],
              estimatedImpact: 0,
            },
          ],
          analyzedFiles: 0,
          analyzedLines: 0,
          analysisTime: 0,
        },
      });
    }

    const sourceFiles = dbFiles.map((f) => ({
      path: f.path,
      content: f.content || '',
      language: f.language || 'plaintext',
    }));

    const result = analyzeHealth(sourceFiles);

    // Save snapshot to MongoDB
    const snapshot = new HealthSnapshotModel({
      projectId,
      overallScore: result.overallScore,
      metrics: result.metrics,
      hotspots: result.hotspots,
      recommendations: result.recommendations,
      analyzedFiles: result.analyzedFiles,
      analyzedLines: result.analyzedLines,
      analysisTime: result.analysisTime,
    });
    await snapshot.save();

    res.json({
      success: true,
      data: {
        id: snapshot._id,
        ...result,
      },
    });
  } catch (err) {
    next(err);
  }
}

// ─── GET /code-health — Get latest health snapshot ───
export async function getLatestHealth(req: Request, res: Response, next: NextFunction) {
  try {
    const projectId = (req.query.projectId as string) || 'default';

    const snapshot = await HealthSnapshotModel.findOne({ projectId })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: snapshot || null,
    });
  } catch (err) {
    next(err);
  }
}

// ─── GET /code-health/history — Get health trend (last N snapshots) ───
export async function getHealthHistory(req: Request, res: Response, next: NextFunction) {
  try {
    const projectId = (req.query.projectId as string) || 'default';
    const limit = Math.min(parseInt(req.query.limit as string) || 7, 30);

    const snapshots = await HealthSnapshotModel.find({ projectId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('overallScore metrics.complexity.score metrics.duplication.score metrics.coverage.score metrics.documentation.score metrics.dependencies.score metrics.deadCode.score analyzedFiles createdAt')
      .lean();

    res.json({
      success: true,
      data: snapshots.reverse(), // chronological order
    });
  } catch (err) {
    next(err);
  }
}
