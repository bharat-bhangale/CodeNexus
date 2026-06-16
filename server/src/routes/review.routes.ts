import { Router } from 'express';
import * as reviewController from '../controllers/review.controller.js';

const router = Router();

// Run code review
router.post('/', reviewController.runReview);

// Generate fix for a single issue
router.post('/fix', reviewController.runFix);

// Get latest review results for a file
router.get('/results', reviewController.getResults);

// Dismiss an issue
router.patch('/dismiss', reviewController.dismissIssue);

export default router;
