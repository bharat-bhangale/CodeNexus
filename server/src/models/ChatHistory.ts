import mongoose, { Schema, Document } from 'mongoose';

export interface IChatMessageContext {
  activeFile?: { path: string; name: string; language: string };
  selectedText?: string;
  cursorPosition?: { line: number; column: number };
  openFiles?: string[];
}

export interface IChatMessageMetadata {
  model?: string;
  tokensUsed?: { prompt: number; completion: number; total: number };
  latency?: number;
  command?: string;
  codeBlocks?: {
    language: string;
    code: string;
    applied: boolean;
    appliedAt?: Date;
  }[];
}

export interface IChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  context?: IChatMessageContext;
  metadata?: IChatMessageMetadata;
  timestamp: Date;
}

export interface IChatHistory extends Document {
  projectId: string;
  messages: IChatMessage[];
  sessionStartedAt: Date;
  lastMessageAt: Date;
  messageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const ChatHistorySchema = new Schema<IChatHistory>(
  {
    projectId: {
      type: String,
      required: true,
      default: 'default',
      index: true,
    },
    messages: [
      {
        id: {
          type: String,
          default: () => new mongoose.Types.ObjectId().toString(),
        },
        role: {
          type: String,
          enum: ['user', 'assistant', 'system'],
          required: true,
        },
        content: {
          type: String,
          required: true,
          maxlength: 50000,
        },
        context: {
          activeFile: {
            path: { type: String, default: undefined },
            name: { type: String, default: undefined },
            language: { type: String, default: undefined },
          },
          selectedText: { type: String, maxlength: 5000, default: undefined },
          cursorPosition: {
            line: { type: Number, default: undefined },
            column: { type: Number, default: undefined },
          },
          openFiles: [{ type: String }],
        },
        metadata: {
          model: { type: String, default: undefined },
          tokensUsed: {
            prompt: { type: Number, default: undefined },
            completion: { type: Number, default: undefined },
            total: { type: Number, default: undefined },
          },
          latency: { type: Number, default: undefined },
          command: { type: String, default: undefined },
          codeBlocks: [
            {
              language: { type: String },
              code: { type: String },
              applied: { type: Boolean, default: false },
              appliedAt: { type: Date, default: undefined },
            },
          ],
        },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    sessionStartedAt: { type: Date, default: Date.now },
    lastMessageAt: { type: Date, default: undefined },
    messageCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Indexes
ChatHistorySchema.index({ projectId: 1, createdAt: -1 });

export const ChatHistoryModel = mongoose.model<IChatHistory>('ChatHistory', ChatHistorySchema);
