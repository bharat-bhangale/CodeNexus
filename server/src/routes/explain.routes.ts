import { Router } from 'express';
import * as explainController from '../controllers/explain.controller.js';

const router = Router();

// POST /explain — Generate code visualization
router.post('/', explainController.explain);

export default router;
