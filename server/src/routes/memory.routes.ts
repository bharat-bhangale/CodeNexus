import { Router } from 'express';
import * as memoryController from '../controllers/memory.controller.js';

const router = Router();

// Decision CRUD
router.get('/decisions', memoryController.listDecisions);
router.get('/decisions/search', memoryController.searchDecisions);
router.get('/decisions/stats', memoryController.getStats);
router.get('/decisions/recent', memoryController.getRecent);
router.get('/decisions/:id', memoryController.getDecision);
router.post('/decisions', memoryController.createDecision);
router.put('/decisions/:id', memoryController.updateDecision);
router.delete('/decisions/:id', memoryController.deleteDecision);

// Patterns & Rules
router.get('/patterns', memoryController.getPatterns);
router.post('/rules', memoryController.createRule);
router.get('/rules', memoryController.listRules);
router.delete('/rules/:id', memoryController.deleteRule);

export default router;
