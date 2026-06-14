import { Router } from 'express';
import * as fileController from '../controllers/file.controller.js';

const router = Router();

// GET    /files        — Get file tree
// GET    /files/:id    — Get file by ID (with content)
// POST   /files        — Create a file or folder
// PUT    /files/:id    — Update file content or rename
// DELETE /files/:id    — Delete file or folder
// POST   /files/seed   — Seed sample project

router.get('/', fileController.getFileTree);
router.get('/:id', fileController.getFileById);
router.post('/seed', fileController.seedProject);
router.post('/', fileController.createFile);
router.put('/:id', fileController.updateFile);
router.delete('/:id', fileController.deleteFile);

export default router;
