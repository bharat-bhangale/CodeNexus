import { Router } from 'express';

const router = Router();

/**
 * GET /api/v1/health
 * Returns server health status, uptime, timestamp, and version.
 */
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      version: '0.1.0',
      environment: process.env.NODE_ENV || 'development',
    },
  });
});

export default router;
