import { Request, Response, NextFunction } from 'express';
import * as fileService from '../services/fileService.js';
import { logger } from '../utils/logger.js';

// GET /files — Return nested file tree
export async function getFileTree(req: Request, res: Response, next: NextFunction) {
  try {
    const projectId = (req.query.projectId as string) || 'default';
    const tree = await fileService.getFileTree(projectId);
    res.json({ success: true, data: tree });
  } catch (err) {
    next(err);
  }
}

// GET /files/:id — Return file with content
export async function getFileById(req: Request, res: Response, next: NextFunction) {
  try {
    const file = await fileService.getFileById(req.params.id);
    if (!file) {
      return res.status(404).json({
        success: false,
        error: { code: 'FILE_NOT_FOUND', message: 'File not found' },
      });
    }
    res.json({
      success: true,
      data: {
        id: file._id,
        name: file.name,
        path: file.path,
        type: file.type,
        content: file.content,
        language: file.language,
        size: file.size,
        lineCount: file.lineCount,
        parentPath: file.parentPath,
        version: file.version,
        updatedAt: file.updatedAt,
      },
    });
  } catch (err) {
    next(err);
  }
}

// POST /files — Create file or folder
export async function createFile(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, path, type, content, projectId } = req.body;

    if (!name || !path || !type) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'name, path, and type are required' },
      });
    }

    if (type !== 'file' && type !== 'folder') {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'type must be "file" or "folder"' },
      });
    }

    const file = await fileService.createFile({
      projectId: projectId || 'default',
      name,
      path,
      type,
      content: content || '',
    });

    logger.info(`Created ${type}: ${path}`);
    res.status(201).json({
      success: true,
      data: {
        id: file._id,
        name: file.name,
        path: file.path,
        type: file.type,
        content: file.content,
        language: file.language,
        parentPath: file.parentPath,
        size: file.size,
        lineCount: file.lineCount,
        version: file.version,
      },
    });
  } catch (err) {
    next(err);
  }
}

// PUT /files/:id — Update file content or rename
export async function updateFile(req: Request, res: Response, next: NextFunction) {
  try {
    const { content, name } = req.body;
    let file = null;

    if (name !== undefined) {
      file = await fileService.renameFile(req.params.id, name);
    } else if (content !== undefined) {
      file = await fileService.updateFileContent(req.params.id, content);
    } else {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'content or name is required' },
      });
    }

    if (!file) {
      return res.status(404).json({
        success: false,
        error: { code: 'FILE_NOT_FOUND', message: 'File not found' },
      });
    }

    res.json({
      success: true,
      data: {
        id: file._id,
        name: file.name,
        path: file.path,
        type: file.type,
        content: file.content,
        language: file.language,
        size: file.size,
        lineCount: file.lineCount,
        version: file.version,
      },
    });
  } catch (err) {
    next(err);
  }
}

// DELETE /files/:id — Delete file or folder (and children)
export async function deleteFile(req: Request, res: Response, next: NextFunction) {
  try {
    const deleted = await fileService.deleteFile(req.params.id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: { code: 'FILE_NOT_FOUND', message: 'File not found' },
      });
    }

    logger.info(`Deleted file: ${req.params.id}`);
    res.json({ success: true, data: { deleted: true } });
  } catch (err) {
    next(err);
  }
}

// POST /files/seed — Seed sample project
export async function seedProject(req: Request, res: Response, next: NextFunction) {
  try {
    const projectId = req.body.projectId || 'default';
    await fileService.seedSampleProject(projectId);
    res.json({ success: true, data: { message: 'Project seeded successfully' } });
  } catch (err) {
    next(err);
  }
}
