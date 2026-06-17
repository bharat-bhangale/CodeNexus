import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import crypto from 'crypto';
import { UserModel } from '../models/User.js';
import { logger } from '../utils/logger.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const ACCESS_TOKEN_EXPIRY = '1h';
const REFRESH_TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// ─── Validation Schemas ───
const registerSchema = Joi.object({
  fullName: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().email().lowercase().trim().required(),
  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(/[A-Z]/, 'uppercase letter')
    .pattern(/[0-9]/, 'number')
    .pattern(/[^a-zA-Z0-9]/, 'special character')
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters',
      'string.pattern.name': 'Password must contain at least 1 {#name}',
    }),
});

const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required(),
  password: Joi.string().required(),
});

// ─── Helper: generate tokens ───
function generateAccessToken(user: { _id: string; email: string }) {
  return jwt.sign(
    { id: user._id.toString(), email: user.email, role: 'user' },
    JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
}

function generateRefreshToken(): string {
  return crypto.randomBytes(40).toString('hex');
}

// ─── POST /auth/register ───
export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { error, value } = registerSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid registration data',
          details: error.details.map((d) => ({
            field: d.path.join('.'),
            message: d.message,
          })),
        },
      });
    }

    const { fullName, email, password } = value;

    // Check for existing user
    const existing = await UserModel.findOne({ email });
    if (existing) {
      return res.status(409).json({
        success: false,
        error: { code: 'DUPLICATE_EMAIL', message: 'An account with this email already exists' },
      });
    }

    // Hash password (12 rounds)
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = new UserModel({ fullName, email, passwordHash });

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken();

    user.refreshTokens.push({
      token: refreshToken,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS),
      createdAt: new Date(),
    });
    user.lastLoginAt = new Date();
    await user.save();

    logger.info(`New user registered: ${email}`);

    res.cookie('token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 1000, // 1 hour
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: REFRESH_TOKEN_EXPIRY_MS,
    });

    res.status(201).json({
      success: true,
      data: {
        user: user.toJSON(),
        accessToken,
        refreshToken,
      },
    });
  } catch (err) {
    next(err);
  }
}

// ─── POST /auth/login ───
export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { error, value } = loginSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid login data',
          details: error.details.map((d) => ({
            field: d.path.join('.'),
            message: d.message,
          })),
        },
      });
    }

    const { email, password } = value;

    // Find user with password included
    const user = await UserModel.findOne({ email }).select('+passwordHash');
    if (!user) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
      });
    }

    // Compare password
    const isValid = await user.comparePassword(password);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken();

    // Cleanup expired refresh tokens, then add new one
    user.refreshTokens = user.refreshTokens.filter((rt) => rt.expiresAt > new Date());
    user.refreshTokens.push({
      token: refreshToken,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS),
      createdAt: new Date(),
    });
    user.lastLoginAt = new Date();
    await user.save();

    logger.info(`User logged in: ${email}`);

    res.cookie('token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 1000,
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: REFRESH_TOKEN_EXPIRY_MS,
    });

    res.json({
      success: true,
      data: {
        user: user.toJSON(),
        accessToken,
        refreshToken,
      },
    });
  } catch (err) {
    next(err);
  }
}

// ─── POST /auth/refresh ───
export async function refreshAccessToken(req: Request, res: Response, next: NextFunction) {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_TOKEN', message: 'Refresh token is required' },
      });
    }

    const user = await UserModel.findOne({
      'refreshTokens.token': refreshToken,
      'refreshTokens.expiresAt': { $gt: new Date() },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_REFRESH_TOKEN', message: 'Invalid or expired refresh token' },
      });
    }

    // Generate new access token
    const accessToken = generateAccessToken(user);

    // Rotate refresh token
    const newRefreshToken = generateRefreshToken();
    user.refreshTokens = user.refreshTokens.filter((rt) => rt.token !== refreshToken);
    user.refreshTokens.push({
      token: newRefreshToken,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS),
      createdAt: new Date(),
    });
    await user.save();

    res.cookie('token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 1000,
    });
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: REFRESH_TOKEN_EXPIRY_MS,
    });

    res.json({
      success: true,
      data: { accessToken, refreshToken: newRefreshToken },
    });
  } catch (err) {
    next(err);
  }
}

// ─── POST /auth/logout ───
export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;

    if (refreshToken) {
      await UserModel.updateOne(
        { 'refreshTokens.token': refreshToken },
        { $pull: { refreshTokens: { token: refreshToken } } }
      );
    }

    res.clearCookie('token');
    res.clearCookie('refreshToken');

    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
}

// ─── GET /auth/me ───
export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: { code: 'NOT_AUTHENTICATED', message: 'Not authenticated' },
      });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'User not found' },
      });
    }

    res.json({ success: true, data: user.toJSON() });
  } catch (err) {
    next(err);
  }
}

// ─── PUT /auth/me ───
export async function updateMe(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: { code: 'NOT_AUTHENTICATED', message: 'Not authenticated' },
      });
    }

    const allowedFields = ['fullName', 'preferences', 'aiConfig'];
    const updates: Record<string, any> = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        if (field === 'preferences' || field === 'aiConfig') {
          // Merge nested objects
          for (const [key, val] of Object.entries(req.body[field])) {
            updates[`${field}.${key}`] = val;
          }
        } else {
          updates[field] = req.body[field];
        }
      }
    }

    const user = await UserModel.findByIdAndUpdate(userId, { $set: updates }, { new: true });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'User not found' },
      });
    }

    res.json({ success: true, data: user.toJSON() });
  } catch (err) {
    next(err);
  }
}

// ─── PUT /auth/password ───
export async function changePassword(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Current and new passwords are required' },
      });
    }

    // Validate new password
    const { error } = Joi.string()
      .min(8)
      .pattern(/[A-Z]/, 'uppercase')
      .pattern(/[0-9]/, 'number')
      .pattern(/[^a-zA-Z0-9]/, 'special')
      .validate(newPassword);

    if (error) {
      return res.status(400).json({
        success: false,
        error: { code: 'WEAK_PASSWORD', message: error.message },
      });
    }

    const user = await UserModel.findById(userId).select('+passwordHash');
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'User not found' },
      });
    }

    const isValid = await user.comparePassword(currentPassword);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_PASSWORD', message: 'Current password is incorrect' },
      });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    user.refreshTokens = []; // Invalidate all sessions
    await user.save();

    // Issue fresh tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken();
    user.refreshTokens.push({
      token: refreshToken,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS),
      createdAt: new Date(),
    });
    await user.save();

    res.cookie('token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 1000,
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: REFRESH_TOKEN_EXPIRY_MS,
    });

    res.json({
      success: true,
      data: { accessToken, refreshToken },
      message: 'Password updated successfully',
    });
  } catch (err) {
    next(err);
  }
}
