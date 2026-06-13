import { Router } from 'express';
import healthRoutes from './health.routes.js';

export const router = Router();

// ─── Health Check ───
router.use('/health', healthRoutes);

// ─── Future Routes ───
// router.use('/auth', authRoutes);
// router.use('/projects', projectRoutes);
// router.use('/ai', aiRoutes);
// router.use('/decisions', decisionRoutes);
// router.use('/chat', chatRoutes);
