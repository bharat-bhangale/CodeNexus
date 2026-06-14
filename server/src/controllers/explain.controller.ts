import { Request, Response, NextFunction } from 'express';
import { FileModel } from '../models/File.js';
import {
  generateDependencyGraph,
  generateCallGraph,
  generateComponentTree,
  generateDataFlow,
} from '../services/GraphGenerator.js';
import { logger } from '../utils/logger.js';

type VizType = 'dependency_graph' | 'call_graph' | 'component_tree' | 'data_flow';

export async function explain(req: Request, res: Response, next: NextFunction) {
  try {
    const {
      type,
      scope = 'project',
      projectId = 'default',
      targetFunction,
      targetVariable,
      filePath,
    } = req.body as {
      type: VizType;
      scope?: 'project' | 'file';
      projectId?: string;
      targetFunction?: string;
      targetVariable?: string;
      filePath?: string;
    };

    if (!type) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'type is required' },
      });
    }

    const validTypes: VizType[] = ['dependency_graph', 'call_graph', 'component_tree', 'data_flow'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: `type must be one of: ${validTypes.join(', ')}`,
        },
      });
    }

    // Fetch files from the database
    let files;
    if (scope === 'file' && filePath) {
      const file = await FileModel.findOne({ projectId, path: filePath, type: 'file' });
      if (!file) {
        return res.status(404).json({
          success: false,
          error: { code: 'FILE_NOT_FOUND', message: `File not found: ${filePath}` },
        });
      }
      files = [{ path: file.path, content: file.content, language: file.language }];
    } else {
      const dbFiles = await FileModel.find({ projectId, type: 'file' })
        .select('path content language')
        .lean();
      files = dbFiles.map((f) => ({
        path: f.path,
        content: f.content,
        language: f.language,
      }));
    }

    if (files.length === 0) {
      return res.json({
        success: true,
        data: {
          nodes: [],
          edges: [],
          summary: 'No files found in the project.',
          metadata: { type, fileCount: 0, edgeCount: 0, generatedAt: new Date().toISOString() },
        },
      });
    }

    let result;
    switch (type) {
      case 'dependency_graph':
        result = generateDependencyGraph(files);
        break;
      case 'call_graph':
        result = generateCallGraph(files[0], targetFunction);
        break;
      case 'component_tree':
        result = generateComponentTree(files);
        break;
      case 'data_flow':
        result = generateDataFlow(files[0], targetVariable);
        break;
    }

    logger.info(`Generated ${type} with ${result.nodes.length} nodes and ${result.edges.length} edges`);

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}
