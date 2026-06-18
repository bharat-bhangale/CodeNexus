import { Router } from 'express';
import healthRoutes from './health.routes.js';
import fileRoutes from './file.routes.js';
import explainRoutes from './explain.routes.js';
import memoryRoutes from './memory.routes.js';
import chatRoutes from './chat.routes.js';
import reviewRoutes from './review.routes.js';
import codeHealthRoutes from './codeHealth.routes.js';
import authRoutes from './auth.routes.js';
import projectRoutes from './project.routes.js';

export const router = Router();

// ─── Health Check ───
router.use('/health', healthRoutes);

// ─── Authentication ───
router.use('/auth', authRoutes);

// ─── Projects ───
router.use('/projects', projectRoutes);

// ─── File System ───
router.use('/files', fileRoutes);

// ─── Code Visualization ───
router.use('/explain', explainRoutes);

// ─── Decision Memory ───
router.use('/memory', memoryRoutes);

// ─── AI Chat ───
router.use('/chat', chatRoutes);

// ─── Code Review ───
router.use('/review', reviewRoutes);

// ─── Code Health Dashboard ───
router.use('/code-health', codeHealthRoutes);
