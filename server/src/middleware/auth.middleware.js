import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger.js';

/**
 * Authentication middleware.
 * Verifies JWT from httpOnly cookie OR Authorization Bearer header.
 * Attaches req.user = { id, email, role } on success.
 */
export const authenticate = (req, res, next) => {
  try {
    // Try cookie first, then Authorization header
    let token = req.cookies?.token;

    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'NO_TOKEN',
          message: 'Authentication required. Please log in.',
        },
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role || 'user',
    };

    next();
  } catch (error) {
    logger.warn(`Auth failed: ${error.message}`);

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'TOKEN_EXPIRED',
          message: 'Session expired. Please log in again.',
        },
      });
    }

    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid authentication token.',
      },
    });
  }
};

/**
 * Optional authentication — attaches user if token exists, but doesn't block.
 */
export const optionalAuth = (req, res, next) => {
  try {
    let token = req.cookies?.token;
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role || 'user',
      };
    }
  } catch {
    // Silently continue without auth
  }

  next();
};
