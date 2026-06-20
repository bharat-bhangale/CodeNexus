import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  fullName: string;
  email: string;
  passwordHash: string;
  avatar: string | null;
  preferences: {
    theme: 'dark' | 'light' | 'high-contrast';
    fontSize: number;
    fontFamily: string;
    tabSize: number;
    wordWrap: boolean;
    minimap: boolean;
    autoSave: boolean;
    autoSaveDelay: number;
    autoReview: boolean;
    autoComplete: boolean;
  };
  aiConfig: {
    provider: 'openai' | 'anthropic' | 'google';
    model: string;
    apiKey: string | null;
    temperature: number;
  };
  usage: {
    aiRequestsToday: number;
    aiRequestsResetAt: Date;
    totalProjects: number;
    totalDecisions: number;
  };
  refreshTokens: { token: string; expiresAt: Date; createdAt: Date }[];
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;

  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^\S+@\S+\.\S+$/,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false, // Never returned in queries by default
    },

    avatar: { type: String, default: null },

    preferences: {
      theme: { type: String, enum: ['dark', 'light', 'high-contrast'], default: 'dark' },
      fontSize: { type: Number, min: 10, max: 24, default: 14 },
      fontFamily: { type: String, default: 'JetBrains Mono' },
      tabSize: { type: Number, enum: [2, 4], default: 2 },
      wordWrap: { type: Boolean, default: true },
      minimap: { type: Boolean, default: true },
      autoSave: { type: Boolean, default: true },
      autoSaveDelay: { type: Number, default: 500 },
      autoReview: { type: Boolean, default: false },
      autoComplete: { type: Boolean, default: true },
    },

    aiConfig: {
      provider: { type: String, enum: ['openai', 'anthropic', 'google'], default: 'google' },
      model: { type: String, default: 'gpt-4o' },
      apiKey: { type: String, default: null, select: false },
      temperature: { type: Number, min: 0, max: 1, default: 0.3 },
    },

    usage: {
      aiRequestsToday: { type: Number, default: 0 },
      aiRequestsResetAt: { type: Date, default: Date.now },
      totalProjects: { type: Number, default: 0 },
      totalDecisions: { type: Number, default: 0 },
    },

    refreshTokens: [
      {
        token: String,
        expiresAt: Date,
        createdAt: { type: Date, default: Date.now },
      },
    ],

    lastLoginAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete ret.passwordHash;
        delete ret.refreshTokens;
        if (ret.aiConfig) delete ret.aiConfig.apiKey;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes
UserSchema.index({ email: 1 }, { unique: true });

// Instance method: compare password
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

export const UserModel = mongoose.model<IUser>('User', UserSchema);
