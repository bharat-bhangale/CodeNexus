import { Router } from 'express';
import healthRoutes from './health.routes.js';
import fileRoutes from './file.routes.js';
import explainRoutes from './explain.routes.js';
import memoryRoutes from './memory.routes.js';

export const router = Router();

// ─── Health Check ───
router.use('/health', healthRoutes);

// ─── File System ───
router.use('/files', fileRoutes);

// ─── Code Visualization ───
router.use('/explain', explainRoutes);

// ─── Decision Memory ───
router.use('/memory', memoryRoutes);

// ─── Future Routes ───
// router.use('/auth', authRoutes);
// router.use('/projects', projectRoutes);
// router.use('/ai', aiRoutes);
// router.use('/chat', chatRoutes);

