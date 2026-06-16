import { Router } from 'express';
import * as chatController from '../controllers/chat.controller.js';

const router = Router();

// Chat streaming
router.post('/', chatController.chat);

// History
router.get('/history', chatController.getHistory);
router.delete('/history', chatController.clearHistory);

// Commands
router.get('/commands', chatController.listCommands);

export default router;
