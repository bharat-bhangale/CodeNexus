import mongoose, { Schema, Document } from 'mongoose';

export type IssueSeverity = 'critical' | 'warning' | 'info';
export type IssueCategory = 'bug' | 'security' | 'performance' | 'style' | 'accessibility' | 'best-practice';
export type IssueStatus = 'open' | 'fixed' | 'dismissed' | 'false-positive';

export interface IReviewIssue {
  id: string;
  severity: IssueSeverity;
  category: IssueCategory;
  lineStart: number;
  lineEnd: number;
  columnStart?: number;
  columnEnd?: number;
  title: string;
  description: string;
  codeSnippet?: string;
  suggestedFix?: string;
  fixExplanation?: string;
  references?: { title: string; url: string }[];
  status: IssueStatus;
  fixedAt?: Date;
  dismissedAt?: Date;
  dismissCount: number;
}

export interface IReviewSummary {
  totalIssues: number;
  criticalCount: number;
  warningCount: number;
  infoCount: number;
  fixedCount: number;
  dismissedCount: number;
}

export interface IReviewResult extends Document {
  projectId: string;
  filePath: string;
  fileName: string;
  language: string;
  issues: IReviewIssue[];
  summary: IReviewSummary;
  aiMetadata: {
    model?: string;
    tokensUsed?: number;
    latency?: number;
  };
  createdAt: Date;
}

const ReviewResultSchema = new Schema<IReviewResult>(
  {
    projectId: {
      type: String,
      required: true,
      default: 'default',
      index: true,
    },
    filePath: { type: String, required: true },
    fileName: { type: String, required: true },
    language: { type: String, default: 'javascript' },
    issues: [
      {
        id: {
          type: String,
          default: () => new mongoose.Types.ObjectId().toString(),
        },
        severity: {
          type: String,
          enum: ['critical', 'warning', 'info'],
          required: true,
        },
        category: {
          type: String,
          enum: ['bug', 'security', 'performance', 'style', 'accessibility', 'best-practice'],
          required: true,
        },
        lineStart: { type: Number, required: true },
        lineEnd: { type: Number, required: true },
        columnStart: { type: Number, default: undefined },
        columnEnd: { type: Number, default: undefined },
        title: { type: String, required: true },
        description: { type: String, required: true },
        codeSnippet: { type: String, default: undefined },
        suggestedFix: { type: String, default: undefined },
        fixExplanation: { type: String, default: undefined },
        references: [
          {
            title: { type: String },
            url: { type: String },
          },
        ],
        status: {
          type: String,
          enum: ['open', 'fixed', 'dismissed', 'false-positive'],
          default: 'open',
        },
        fixedAt: { type: Date, default: undefined },
        dismissedAt: { type: Date, default: undefined },
        dismissCount: { type: Number, default: 0 },
      },
    ],
    summary: {
      totalIssues: { type: Number, default: 0 },
      criticalCount: { type: Number, default: 0 },
      warningCount: { type: Number, default: 0 },
      infoCount: { type: Number, default: 0 },
      fixedCount: { type: Number, default: 0 },
      dismissedCount: { type: Number, default: 0 },
    },
    aiMetadata: {
      model: { type: String, default: undefined },
      tokensUsed: { type: Number, default: undefined },
      latency: { type: Number, default: undefined },
    },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

// Indexes
ReviewResultSchema.index({ projectId: 1, createdAt: -1 });
ReviewResultSchema.index({ projectId: 1, filePath: 1, createdAt: -1 });
ReviewResultSchema.index({ projectId: 1, 'issues.severity': 1 });

export const ReviewResultModel = mongoose.model<IReviewResult>('ReviewResult', ReviewResultSchema);
