import { FileModel, IFile } from '../models/File.js';
import { logger } from '../utils/logger.js';

const extensionToLanguage: Record<string, string> = {
  '.js': 'javascript',
  '.jsx': 'javascript',
  '.ts': 'typescript',
  '.tsx': 'typescript',
  '.css': 'css',
  '.scss': 'scss',
  '.html': 'html',
  '.json': 'json',
  '.md': 'markdown',
  '.py': 'python',
  '.rb': 'ruby',
  '.go': 'go',
  '.rs': 'rust',
  '.java': 'java',
  '.yaml': 'yaml',
  '.yml': 'yaml',
  '.xml': 'xml',
  '.sh': 'shell',
  '.sql': 'sql',
  '.graphql': 'graphql',
  '.env': 'plaintext',
  '.gitignore': 'plaintext',
};

function createServiceError(message: string, statusCode: number, code: string): Error {
  return Object.assign(new Error(message), { statusCode, code });
}

function detectLanguage(filename: string): string {
  const lower = filename.toLowerCase();
  if (lower === 'dockerfile') return 'dockerfile';
  if (lower === 'makefile') return 'makefile';

  const dotIndex = filename.lastIndexOf('.');
  if (dotIndex === -1) return 'plaintext';

  const ext = filename.slice(dotIndex).toLowerCase();
  return extensionToLanguage[ext] || 'plaintext';
}

function normalizeFilePath(filePath: string): string {
  const normalized = `/${filePath}`
    .replace(/\\/g, '/')
    .replace(/\/+/g, '/')
    .replace(/\/$/, '');

  return normalized === '' ? '/' : normalized;
}

function computeParentPath(filePath: string): string {
  const normalizedPath = normalizeFilePath(filePath);
  const parts = normalizedPath.split('/');
  parts.pop();
  return parts.length <= 1 ? '/' : parts.join('/');
}

function validateFileName(name: string): string {
  const trimmed = name.trim();

  if (!trimmed) {
    throw createServiceError('File name is required', 400, 'VALIDATION_ERROR');
  }

  if (trimmed.includes('/') || trimmed.includes('\\')) {
    throw createServiceError(
      'File name cannot include path separators',
      400,
      'VALIDATION_ERROR'
    );
  }

  if (trimmed === '.' || trimmed === '..') {
    throw createServiceError('File name cannot be "." or ".."', 400, 'VALIDATION_ERROR');
  }

  return trimmed;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildChildPath(parentPath: string, name: string): string {
  const normalizedParentPath = normalizeFilePath(parentPath);
  return normalizedParentPath === '/' ? `/${name}` : `${normalizedParentPath}/${name}`;
}

export async function getFileTree(projectId: string): Promise<any[]> {
  const files = await FileModel.find({ projectId })
    .select('name path type language parentPath')
    .sort({ type: -1, name: 1 })
    .lean();

  const nodeMap = new Map<string, any>();
  const roots: any[] = [];

  for (const file of files) {
    nodeMap.set(file.path, {
      id: (file as any)._id.toString(),
      name: file.name,
      path: file.path,
      isDirectory: file.type === 'folder',
      language: file.language,
      children: file.type === 'folder' ? [] : undefined,
    });
  }

  for (const file of files) {
    const node = nodeMap.get(file.path)!;
    const parent = nodeMap.get(file.parentPath);

    if (parent?.children) {
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  }

  function sortChildren(nodes: any[]) {
    nodes.sort((a: any, b: any) => {
      if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1;
      return a.name.localeCompare(b.name);
    });

    for (const node of nodes) {
      if (node.children) sortChildren(node.children);
    }
  }

  sortChildren(roots);
  return roots;
}

export async function getFileById(fileId: string): Promise<IFile | null> {
  return FileModel.findById(fileId);
}

export async function getFileByPath(projectId: string, filePath: string): Promise<IFile | null> {
  return FileModel.findOne({ projectId, path: normalizeFilePath(filePath) });
}

export async function createFile(data: {
  projectId: string;
  name: string;
  path: string;
  type: 'file' | 'folder';
  content?: string;
}): Promise<IFile> {
  const name = validateFileName(data.name);
  const path = normalizeFilePath(data.path || buildChildPath('/', name));
  const parentPath = computeParentPath(path);
  const expectedPath = buildChildPath(parentPath, name);

  if (path !== expectedPath) {
    throw createServiceError(
      'File path must match parent path and name',
      400,
      'VALIDATION_ERROR'
    );
  }

  if (parentPath !== '/') {
    const parent = await FileModel.findOne({
      projectId: data.projectId,
      path: parentPath,
      type: 'folder',
    });

    if (!parent) {
      throw createServiceError(
        `Parent folder not found: ${parentPath}`,
        404,
        'PARENT_FOLDER_NOT_FOUND'
      );
    }
  }

  const existing = await FileModel.exists({ projectId: data.projectId, path });
  if (existing) {
    throw createServiceError(`A file already exists at ${path}`, 409, 'DUPLICATE_FILE_PATH');
  }

  const file = new FileModel({
    projectId: data.projectId,
    name,
    path,
    type: data.type,
    content: data.type === 'file' ? data.content || '' : '',
    language: data.type === 'file' ? detectLanguage(name) : 'plaintext',
    parentPath,
  });

  return file.save();
}

export async function updateFileContent(fileId: string, content: string): Promise<IFile | null> {
  const file = await FileModel.findById(fileId);
  if (!file) return null;

  if (file.type === 'folder') {
    throw createServiceError('Folder content cannot be updated', 400, 'INVALID_FILE_OPERATION');
  }

  file.content = content;
  file.version += 1;
  return file.save();
}

export async function renameFile(fileId: string, newName: string): Promise<IFile | null> {
  const file = await FileModel.findById(fileId);
  if (!file) return null;

  const name = validateFileName(newName);
  const oldPath = file.path;
  const parentPath = computeParentPath(oldPath);
  const newPath = buildChildPath(parentPath, name);

  if (newPath === oldPath) return file;

  const duplicate = await FileModel.exists({
    projectId: file.projectId,
    path: newPath,
    _id: { $ne: file._id },
  });

  if (duplicate) {
    throw createServiceError(`A file already exists at ${newPath}`, 409, 'DUPLICATE_FILE_PATH');
  }

  file.name = name;
  file.path = newPath;

  if (file.type === 'file') {
    file.language = detectLanguage(name);
  }

  if (file.type === 'folder') {
    const children = await FileModel.find({
      projectId: file.projectId,
      path: { $regex: new RegExp(`^${escapeRegExp(oldPath)}/`) },
    });

    for (const child of children) {
      child.path = child.path.replace(oldPath, newPath);
      child.parentPath = child.parentPath.replace(oldPath, newPath);
      await child.save();
    }
  }

  return file.save();
}

export async function deleteFile(fileId: string): Promise<boolean> {
  const file = await FileModel.findById(fileId);
  if (!file) return false;

  if (file.type === 'folder') {
    await FileModel.deleteMany({
      projectId: file.projectId,
      path: { $regex: new RegExp(`^${escapeRegExp(file.path)}/`) },
    });
  }

  await FileModel.findByIdAndDelete(fileId);
  return true;
}

export async function seedSampleProject(projectId: string = 'default'): Promise<void> {
  const existing = await FileModel.countDocuments({ projectId });
  if (existing > 0) {
    logger.info(`Project "${projectId}" already has ${existing} files, skipping seed.`);
    return;
  }

  logger.info(`Seeding sample project "${projectId}"...`);

  const sampleFiles = [
    {
      projectId,
      name: 'components',
      path: '/components',
      type: 'folder' as const,
      content: '',
      parentPath: '/',
    },
    {
      projectId,
      name: 'utils',
      path: '/utils',
      type: 'folder' as const,
      content: '',
      parentPath: '/',
    },
    {
      projectId,
      name: 'App.jsx',
      path: '/App.jsx',
      type: 'file' as const,
      parentPath: '/',
      content: `import React from 'react';
import Header from './components/Header.jsx';
import { formatDate, capitalize } from './utils/helpers.js';
import './styles.css';

export default function App({ title = 'CodeNexus' }) {
  const today = formatDate(new Date());

  return (
    <div className="app">
      <Header title={capitalize(title)} />
      <main className="app-main">
        <h2>Welcome to {title}</h2>
        <p>Today is {today}</p>
        <p>Open a file from the explorer and start editing.</p>
      </main>
    </div>
  );
}
`,
    },
    {
      projectId,
      name: 'index.js',
      path: '/index.js',
      type: 'file' as const,
      parentPath: '/',
      content: `import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <React.StrictMode>
    <App title="CodeNexus Editor" />
  </React.StrictMode>
);
`,
    },
    {
      projectId,
      name: 'styles.css',
      path: '/styles.css',
      type: 'file' as const,
      parentPath: '/',
      content: `:root {
  color-scheme: dark;
  font-family: Inter, system-ui, sans-serif;
  background: #0a0a0f;
  color: #e4e4e7;
}

.app {
  min-height: 100vh;
  background: #0a0a0f;
}

.app-main {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.app-main h2 {
  color: #6366f1;
  margin-bottom: 1rem;
}

.app-main p {
  line-height: 1.6;
  color: #a1a1b5;
}
`,
    },
    {
      projectId,
      name: 'helpers.js',
      path: '/utils/helpers.js',
      type: 'file' as const,
      parentPath: '/utils',
      content: `export function formatDate(date) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function debounce(fn, delay) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
`,
    },
    {
      projectId,
      name: 'Header.jsx',
      path: '/components/Header.jsx',
      type: 'file' as const,
      parentPath: '/components',
      content: `import React from 'react';

export default function Header({ title, subtitle }) {
  return (
    <header className="header">
      <div className="header-brand">
        <span className="header-logo">CN</span>
        <h1 className="header-title">{title}</h1>
      </div>
      {subtitle && <p className="header-subtitle">{subtitle}</p>}
      <nav className="header-nav">
        <a href="#editor">Editor</a>
        <a href="#settings">Settings</a>
        <a href="#help">Help</a>
      </nav>
    </header>
  );
}
`,
    },
    {
      projectId,
      name: 'package.json',
      path: '/package.json',
      type: 'file' as const,
      parentPath: '/',
      content: `{
  "name": "codenexus-sample-project",
  "version": "1.0.0",
  "description": "A sample project in CodeNexus",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@vitejs/plugin-react": "^5.0.0",
    "vite": "^7.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  }
}
`,
    },
  ];

  for (const fileData of sampleFiles) {
    const file = new FileModel({
      ...fileData,
      language: fileData.type === 'file' ? detectLanguage(fileData.name) : 'plaintext',
    });
    await file.save();
  }

  logger.info(`Seeded ${sampleFiles.length} files for project "${projectId}".`);
}
