import { logger } from '../utils/logger.js';

/**
 * Centralized error handler middleware.
 * Catches all errors passed via next(error) and returns a consistent response.
 */
export const errorHandler = (err, req, res, _next) => {
  let statusCode = err.statusCode || 500;
  let code = err.code || 'INTERNAL_ERROR';
  let message = err.message || 'An unexpected error occurred';
  let details = null;

  // ─── Mongoose Validation Error ───
  if (err.name === 'ValidationError') {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Invalid input data';
    details = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }

  // ─── Mongoose Cast Error (invalid ObjectId) ───
  if (err.name === 'CastError') {
    statusCode = 400;
    code = 'INVALID_ID';
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // ─── Mongoose Duplicate Key ───
  if (err.code === 11000) {
    statusCode = 409;
    code = 'DUPLICATE_KEY';
    const field = Object.keys(err.keyValue || {})[0];
    message = `Duplicate value for field: ${field}`;
  }

  // ─── JWT Errors ───
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    code = 'INVALID_TOKEN';
    message = 'Invalid authentication token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    code = 'TOKEN_EXPIRED';
    message = 'Authentication token has expired';
  }

  // ─── Joi Validation Error ───
  if (err.isJoi) {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Invalid input data';
    details = err.details.map((d) => ({
      field: d.path.join('.'),
      message: d.message,
    }));
  }

  // ─── Log the error ───
  if (statusCode >= 500) {
    logger.error(`[${code}] ${message}`, { stack: err.stack, url: req.originalUrl });
  } else {
    logger.warn(`[${code}] ${message}`, { url: req.originalUrl });
  }

  // ─── Send response ───
  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
      ...(process.env.NODE_ENV === 'development' && statusCode >= 500 && { stack: err.stack }),
    },
  });
};
