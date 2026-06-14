import { Router } from 'express';
import healthRoutes from './health.routes.js';
import fileRoutes from './file.routes.js';

export const router = Router();

// ─── Health Check ───
router.use('/health', healthRoutes);

// ─── File System ───
router.use('/files', fileRoutes);

// ─── Future Routes ───
// router.use('/auth', authRoutes);
// router.use('/projects', projectRoutes);
// router.use('/ai', aiRoutes);
// router.use('/decisions', decisionRoutes);
// router.use('/chat', chatRoutes);

