import mongoose, { Schema, Document } from 'mongoose';

export interface IDecisionSource {
  intent?: string;
  reviewCategory?: string;
  chatMessageId?: string;
  command?: string;
}

export interface ICodeContext {
  filePath?: string;
  fileName?: string;
  language?: string;
  lineRange?: { start: number; end: number };
  beforeCode?: string;
  afterCode?: string;
  diff?: string;
}

export interface IAiAnalysis {
  explanation?: string;
  confidence?: number;
  references?: string[];
  model?: string;
  tokensUsed?: number;
}

export interface IAnnotations {
  userNote?: string;
  rating?: number | null;
}

export interface IAffectedFile {
  path: string;
  name: string;
}

export type DecisionType =
  | 'intent_accept'
  | 'review_fix'
  | 'chat_apply'
  | 'scaffold'
  | 'manual'
  | 'refactor'
  | 'pattern_rule';

export type DecisionStatus = 'active' | 'reverted' | 'superseded';

export interface IDecision extends Document {
  projectId: string;
  title: string;
  description: string;
  type: DecisionType;
  source: IDecisionSource;
  codeContext: ICodeContext;
  aiAnalysis: IAiAnalysis;
  annotations: IAnnotations;
  tags: string[];
  affectedFiles: IAffectedFile[];
  patternId: string | null;
  status: DecisionStatus;
  supersededBy: string | null;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

const DecisionSchema = new Schema<IDecision>(
  {
    projectId: {
      type: String,
      required: true,
      default: 'default',
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Decision title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      default: '',
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    type: {
      type: String,
      required: true,
      enum: [
        'intent_accept',
        'review_fix',
        'chat_apply',
        'scaffold',
        'manual',
        'refactor',
        'pattern_rule',
      ],
    },
    source: {
      intent: { type: String, default: undefined },
      reviewCategory: { type: String, default: undefined },
      chatMessageId: { type: String, default: undefined },
      command: { type: String, default: undefined },
    },
    codeContext: {
      filePath: { type: String, default: undefined },
      fileName: { type: String, default: undefined },
      language: { type: String, default: undefined },
      lineRange: {
        start: { type: Number, default: undefined },
        end: { type: Number, default: undefined },
      },
      beforeCode: { type: String, maxlength: 5000, default: undefined },
      afterCode: { type: String, maxlength: 5000, default: undefined },
      diff: { type: String, default: undefined },
    },
    aiAnalysis: {
      explanation: { type: String, default: undefined },
      confidence: { type: Number, min: 0, max: 100, default: undefined },
      references: [{ type: String }],
      model: { type: String, default: undefined },
      tokensUsed: { type: Number, default: undefined },
    },
    annotations: {
      userNote: { type: String, default: undefined },
      rating: { type: Number, min: 1, max: 5, default: null },
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    affectedFiles: [
      {
        path: { type: String, required: true },
        name: { type: String, required: true },
      },
    ],
    patternId: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['active', 'reverted', 'superseded'],
      default: 'active',
    },
    supersededBy: {
      type: String,
      default: null,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Indexes
DecisionSchema.index({ projectId: 1, timestamp: -1 });
DecisionSchema.index({ projectId: 1, type: 1 });
DecisionSchema.index({ projectId: 1, tags: 1 });
DecisionSchema.index({ projectId: 1, 'codeContext.filePath': 1 });
DecisionSchema.index({ projectId: 1, patternId: 1 });

// Text index for full-text search
DecisionSchema.index(
  {
    title: 'text',
    description: 'text',
    'annotations.userNote': 'text',
  },
  { name: 'decision_text_search' }
);

export const DecisionModel = mongoose.model<IDecision>('Decision', DecisionSchema);
