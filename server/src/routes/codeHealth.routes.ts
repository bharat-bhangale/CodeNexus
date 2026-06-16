import { Router } from 'express';
import * as healthController from '../controllers/health.controller.js';

const router = Router();

// Run health analysis
router.post('/analyze', healthController.analyzeProjectHealth);

// Get latest health snapshot
router.get('/', healthController.getLatestHealth);

// Get health history for trend charts
router.get('/history', healthController.getHealthHistory);

export default router;
