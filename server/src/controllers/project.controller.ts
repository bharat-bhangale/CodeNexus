import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ProjectModel } from '../models/Project.js';
import { FileModel } from '../models/File.js';
import { logger } from '../utils/logger.js';

// ─── Validation ───
const createProjectSchema = Joi.object({
  name: Joi.string().trim().min(1).max(100).required(),
  description: Joi.string().max(500).allow('').default(''),
  template: Joi.string().valid('blank', 'react', 'express', 'fullstack').default('blank'),
});

// ─── GET /projects ───
export async function listProjects(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;

    const projects = await ProjectModel.find({ userId })
      .sort({ updatedAt: -1 })
      .lean();

    res.json({ success: true, data: projects });
  } catch (err) {
    next(err);
  }
}

// ─── GET /projects/:id ───
export async function getProject(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;
    const project = await ProjectModel.findOne({ _id: req.params.id, userId }).lean();

    if (!project) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Project not found' },
      });
    }

    // Update lastOpenedAt
    await ProjectModel.updateOne({ _id: project._id }, { $set: { lastOpenedAt: new Date() } });

    res.json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
}

// ─── POST /projects ───
export async function createProject(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;

    const { error, value } = createProjectSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid project data',
          details: error.details.map((d) => ({
            field: d.path.join('.'),
            message: d.message,
          })),
        },
      });
    }

    const { name, description, template } = value;

    const project = new ProjectModel({
      userId,
      name,
      description,
      template,
      lastOpenedAt: new Date(),
    });

    // Seed template files
    const seedFiles = getTemplateFiles(template, project._id.toString());
    if (seedFiles.length > 0) {
      await FileModel.insertMany(seedFiles);
      project.stats.totalFiles = seedFiles.filter((f) => f.type === 'file').length;
    }

    await project.save();

    logger.info(`Project created: ${name} (${template}) by user ${userId}`);

    res.status(201).json({ success: true, data: project.toJSON() });
  } catch (err) {
    next(err);
  }
}

// ─── DELETE /projects/:id ───
export async function deleteProject(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;

    const project = await ProjectModel.findOneAndDelete({ _id: req.params.id, userId });
    if (!project) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Project not found' },
      });
    }

    // Delete all project files
    await FileModel.deleteMany({ projectId: project._id });

    logger.info(`Project deleted: ${project.name} by user ${userId}`);

    res.json({ success: true, message: 'Project deleted' });
  } catch (err) {
    next(err);
  }
}

// ─── PUT /projects/:id ───
export async function updateProject(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;
    const allowedFields = ['name', 'description'];
    const updates: Record<string, any> = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    const project = await ProjectModel.findOneAndUpdate(
      { _id: req.params.id, userId },
      { $set: updates },
      { new: true }
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Project not found' },
      });
    }

    res.json({ success: true, data: project.toJSON() });
  } catch (err) {
    next(err);
  }
}

// ─── Template Files ───
function getTemplateFiles(template: string, projectId: string) {
  const now = new Date();
  const base = {
    projectId,
    version: 1,
    lastModifiedBy: 'user',
    createdAt: now,
    updatedAt: now,
  };

  switch (template) {
    case 'react':
      return [
        { ...base, name: 'src', path: '/src', type: 'folder', parentPath: '/', content: '', language: 'plaintext', size: 0, lineCount: 0 },
        { ...base, name: 'App.jsx', path: '/src/App.jsx', type: 'file', parentPath: '/src', language: 'javascript',
          content: `import React from 'react';\n\nexport default function App() {\n  return (\n    <div className="app">\n      <h1>Hello, React!</h1>\n    </div>\n  );\n}\n`,
          size: 0, lineCount: 9 },
        { ...base, name: 'index.css', path: '/src/index.css', type: 'file', parentPath: '/src', language: 'css',
          content: `body {\n  margin: 0;\n  font-family: -apple-system, sans-serif;\n}\n\n.app {\n  text-align: center;\n  padding: 2rem;\n}\n`,
          size: 0, lineCount: 9 },
        { ...base, name: 'package.json', path: '/package.json', type: 'file', parentPath: '/', language: 'json',
          content: `{\n  "name": "my-react-app",\n  "version": "1.0.0",\n  "dependencies": {\n    "react": "^19.0.0",\n    "react-dom": "^19.0.0"\n  }\n}\n`,
          size: 0, lineCount: 8 },
      ];

    case 'express':
      return [
        { ...base, name: 'src', path: '/src', type: 'folder', parentPath: '/', content: '', language: 'plaintext', size: 0, lineCount: 0 },
        { ...base, name: 'index.js', path: '/src/index.js', type: 'file', parentPath: '/src', language: 'javascript',
          content: `const express = require('express');\nconst app = express();\n\napp.use(express.json());\n\napp.get('/', (req, res) => {\n  res.json({ message: 'Hello, Express!' });\n});\n\nconst PORT = process.env.PORT || 3000;\napp.listen(PORT, () => console.log(\`Server running on port \${PORT}\`));\n`,
          size: 0, lineCount: 11 },
        { ...base, name: 'package.json', path: '/package.json', type: 'file', parentPath: '/', language: 'json',
          content: `{\n  "name": "my-express-api",\n  "version": "1.0.0",\n  "dependencies": {\n    "express": "^4.21.0"\n  },\n  "scripts": {\n    "start": "node src/index.js"\n  }\n}\n`,
          size: 0, lineCount: 10 },
      ];

    case 'fullstack':
      return [
        { ...base, name: 'client', path: '/client', type: 'folder', parentPath: '/', content: '', language: 'plaintext', size: 0, lineCount: 0 },
        { ...base, name: 'server', path: '/server', type: 'folder', parentPath: '/', content: '', language: 'plaintext', size: 0, lineCount: 0 },
        { ...base, name: 'App.jsx', path: '/client/App.jsx', type: 'file', parentPath: '/client', language: 'javascript',
          content: `export default function App() {\n  return <h1>Full Stack App</h1>;\n}\n`,
          size: 0, lineCount: 3 },
        { ...base, name: 'index.js', path: '/server/index.js', type: 'file', parentPath: '/server', language: 'javascript',
          content: `const express = require('express');\nconst app = express();\napp.use(express.json());\napp.get('/api', (req, res) => res.json({ ok: true }));\napp.listen(3001);\n`,
          size: 0, lineCount: 5 },
        { ...base, name: 'package.json', path: '/package.json', type: 'file', parentPath: '/', language: 'json',
          content: `{\n  "name": "fullstack-app",\n  "version": "1.0.0",\n  "dependencies": {}\n}\n`,
          size: 0, lineCount: 5 },
      ];

    default: // blank
      return [
        { ...base, name: 'index.js', path: '/index.js', type: 'file', parentPath: '/', language: 'javascript',
          content: `// Welcome to your new project!\nconsole.log('Hello, CodeNexus!');\n`,
          size: 0, lineCount: 2 },
      ];
  }
}
