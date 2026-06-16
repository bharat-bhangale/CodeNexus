import mongoose, { Schema, Document } from 'mongoose';

// ─── Sub-document interfaces ───
export interface IComplexFunction {
  name: string;
  file: string;
  line: number;
  complexity: number;
}

export interface IDuplicateInstance {
  files: string[];
  lines: string;
  codeSnippet: string;
}

export interface IUndocumentedItem {
  name: string;
  file: string;
  line: number;
}

export interface IDeadCodeInstance {
  type: string;
  name: string;
  file: string;
  line: number;
}

export interface IHotspot {
  file: string;
  issues: number;
  topIssue: string;
  score: number;
}

export interface IRecommendation {
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  affectedFiles: string[];
  estimatedImpact: number;
}

// ─── Main interfaces ───
export interface IMetricDetail<D> {
  score: number;
  details: D;
}

export interface IHealthMetrics {
  complexity: IMetricDetail<{
    averageCyclomaticComplexity: number;
    maxCyclomaticComplexity: number;
    complexFunctions: IComplexFunction[];
  }>;
  duplication: IMetricDetail<{
    duplicateBlocks: number;
    duplicateLines: number;
    totalLines: number;
    percentage: number;
    instances: IDuplicateInstance[];
  }>;
  coverage: IMetricDetail<{
    estimatedCoverage: number;
    filesWithTests: number;
    filesWithoutTests: number;
    testFiles: string[];
  }>;
  documentation: IMetricDetail<{
    documentedFunctions: number;
    undocumentedFunctions: number;
    totalFunctions: number;
    percentage: number;
    undocumentedList: IUndocumentedItem[];
  }>;
  dependencies: IMetricDetail<{
    totalDependencies: number;
    outdatedCount: number;
    vulnerableCount: number;
    unusedCount: number;
  }>;
  deadCode: IMetricDetail<{
    unusedExports: number;
    unusedVariables: number;
    unreachableCode: number;
    instances: IDeadCodeInstance[];
  }>;
}

export interface IHealthSnapshot extends Document {
  projectId: string;
  overallScore: number;
  metrics: IHealthMetrics;
  hotspots: IHotspot[];
  recommendations: IRecommendation[];
  analyzedFiles: number;
  analyzedLines: number;
  analysisTime: number;
  createdAt: Date;
}

// ─── Schema ───
const HealthSnapshotSchema = new Schema<IHealthSnapshot>(
  {
    projectId: { type: String, required: true, default: 'default', index: true },
    overallScore: { type: Number, min: 0, max: 100, required: true },

    metrics: {
      complexity: {
        score: { type: Number, min: 0, max: 100 },
        details: {
          averageCyclomaticComplexity: Number,
          maxCyclomaticComplexity: Number,
          complexFunctions: [{ name: String, file: String, line: Number, complexity: Number }],
        },
      },
      duplication: {
        score: { type: Number, min: 0, max: 100 },
        details: {
          duplicateBlocks: Number,
          duplicateLines: Number,
          totalLines: Number,
          percentage: Number,
          instances: [{ files: [String], lines: String, codeSnippet: String }],
        },
      },
      coverage: {
        score: { type: Number, min: 0, max: 100 },
        details: {
          estimatedCoverage: Number,
          filesWithTests: Number,
          filesWithoutTests: Number,
          testFiles: [String],
        },
      },
      documentation: {
        score: { type: Number, min: 0, max: 100 },
        details: {
          documentedFunctions: Number,
          undocumentedFunctions: Number,
          totalFunctions: Number,
          percentage: Number,
          undocumentedList: [{ name: String, file: String, line: Number }],
        },
      },
      dependencies: {
        score: { type: Number, min: 0, max: 100 },
        details: {
          totalDependencies: Number,
          outdatedCount: Number,
          vulnerableCount: Number,
          unusedCount: Number,
        },
      },
      deadCode: {
        score: { type: Number, min: 0, max: 100 },
        details: {
          unusedExports: Number,
          unusedVariables: Number,
          unreachableCode: Number,
          instances: [{ type: { type: String }, name: String, file: String, line: Number }],
        },
      },
    },

    hotspots: [
      {
        file: String,
        issues: Number,
        topIssue: String,
        score: { type: Number, min: 0, max: 100 },
      },
    ],

    recommendations: [
      {
        priority: { type: String, enum: ['high', 'medium', 'low'] },
        title: String,
        description: String,
        affectedFiles: [String],
        estimatedImpact: Number,
      },
    ],

    analyzedFiles: Number,
    analyzedLines: Number,
    analysisTime: Number,
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

// Indexes
HealthSnapshotSchema.index({ projectId: 1, createdAt: -1 });
// TTL: auto-delete snapshots older than 90 days
HealthSnapshotSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

export const HealthSnapshotModel = mongoose.model<IHealthSnapshot>(
  'HealthSnapshot',
  HealthSnapshotSchema
);
