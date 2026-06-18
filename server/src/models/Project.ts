import mongoose, { Schema, Document } from 'mongoose';

export interface IProject extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  description: string;
  template: 'blank' | 'react' | 'express' | 'fullstack' | 'custom';
  primaryLanguage: string;
  frameworks: string[];
  stats: {
    totalFiles: number;
    totalLines: number;
    totalDecisions: number;
    healthScore: number | null;
    lastHealthCheck: Date | null;
  };
  rules: {
    id: string;
    rule: string;
    category: string;
    createdAt: Date;
    sourceDecisionIds: string[];
  }[];
  isPublic: boolean;
  shareToken: string | null;
  lastOpenedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 100,
    },
    description: {
      type: String,
      default: '',
      maxlength: 500,
    },
    template: {
      type: String,
      enum: ['blank', 'react', 'express', 'fullstack', 'custom'],
      default: 'blank',
    },
    primaryLanguage: { type: String, default: 'javascript' },
    frameworks: [{ type: String }],

    stats: {
      totalFiles: { type: Number, default: 0 },
      totalLines: { type: Number, default: 0 },
      totalDecisions: { type: Number, default: 0 },
      healthScore: { type: Number, default: null },
      lastHealthCheck: { type: Date, default: null },
    },

    rules: [
      {
        id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
        rule: String,
        category: String,
        createdAt: { type: Date, default: Date.now },
        sourceDecisionIds: [String],
      },
    ],

    isPublic: { type: Boolean, default: false },
    shareToken: { type: String, default: null },
    lastOpenedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Indexes
ProjectSchema.index({ userId: 1, updatedAt: -1 });
ProjectSchema.index({ shareToken: 1 }, { sparse: true });

export const ProjectModel = mongoose.model<IProject>('Project', ProjectSchema);
