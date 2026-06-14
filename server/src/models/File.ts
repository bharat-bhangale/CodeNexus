import mongoose, { Schema, Document } from 'mongoose';

export interface IFile extends Document {
  projectId: string;
  name: string;
  path: string;
  type: 'file' | 'folder';
  content: string;
  language: string;
  size: number;
  lineCount: number;
  parentPath: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

const FileSchema = new Schema<IFile>(
  {
    projectId: {
      type: String,
      required: true,
      default: 'default',
      index: true,
    },
    name: {
      type: String,
      required: [true, 'File name is required'],
      trim: true,
      maxlength: [255, 'File name cannot exceed 255 characters'],
    },
    path: {
      type: String,
      required: [true, 'File path is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['file', 'folder'],
      required: true,
      default: 'file',
    },
    content: {
      type: String,
      default: '',
    },
    language: {
      type: String,
      default: 'plaintext',
    },
    size: {
      type: Number,
      default: 0,
    },
    lineCount: {
      type: Number,
      default: 0,
    },
    parentPath: {
      type: String,
      required: true,
      default: '/',
      index: true,
    },
    version: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes
FileSchema.index({ projectId: 1, path: 1 }, { unique: true });
FileSchema.index({ projectId: 1, parentPath: 1 });

// Pre-save: compute size and lineCount for files
FileSchema.pre('save', function (next) {
  if (this.type === 'file' && this.isModified('content')) {
    this.size = Buffer.byteLength(this.content || '', 'utf8');
    this.lineCount = (this.content || '').split('\n').length;
  }
  next();
});

export const FileModel = mongoose.model<IFile>('File', FileSchema);
