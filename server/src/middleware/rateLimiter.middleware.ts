import rateLimit from 'express-rate-limit';
import { Request } from 'express';

/**
 * Rate limiter for AI endpoints.
 * More restrictive than the general limiter because AI calls are expensive.
 */
export const aiRateLimiter = rateLimit({
  windowMs: parseInt(process.env.AI_RATE_LIMIT_WINDOW_MS || '60000', 10),
  max: parseInt(process.env.AI_RATE_LIMIT_MAX || '20', 10),
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => req.user?.id || req.ip || 'unknown_ip',
  message: {
    success: false,
    error: {
      code: 'AI_RATE_LIMIT_EXCEEDED',
      message: 'Too many AI requests. Please wait before trying again.',
    },
  },
});

/**
 * Rate limiter for auth endpoints (login, register, password reset).
 * Prevents brute-force attacks.
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
      message: 'Too many authentication attempts. Please try again later.',
    },
  },
});
