import { FileModel, IFile } from '../models/File.js';
import { logger } from '../utils/logger.js';

// ─── Extension → Language Map ───
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

function detectLanguage(filename: string): string {
  const ext = filename.slice(filename.lastIndexOf('.'));
  return extensionToLanguage[ext] || 'plaintext';
}

function computeParentPath(filePath: string): string {
  const parts = filePath.split('/');
  parts.pop();
  return parts.length <= 1 ? '/' : parts.join('/');
}

// ─── Service Methods ───

export async function getFileTree(projectId: string): Promise<any[]> {
  const files = await FileModel.find({ projectId })
    .select('name path type language parentPath')
    .sort({ type: -1, name: 1 }) // folders first, then alphabetical
    .lean();

  // Build nested tree
  const nodeMap = new Map<string, any>();
  const roots: any[] = [];

  // Create node entries
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

  // Link children to parents
  for (const file of files) {
    const node = nodeMap.get(file.path)!;
    const parent = nodeMap.get(file.parentPath);
    if (parent && parent.children) {
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  }

  // Sort children: folders first, then alphabetical
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
  return FileModel.findOne({ projectId, path: filePath });
}

export async function createFile(data: {
  projectId: string;
  name: string;
  path: string;
  type: 'file' | 'folder';
  content?: string;
}): Promise<IFile> {
  const language = data.type === 'file' ? detectLanguage(data.name) : 'plaintext';
  const parentPath = computeParentPath(data.path);

  const file = new FileModel({
    projectId: data.projectId,
    name: data.name,
    path: data.path,
    type: data.type,
    content: data.content || '',
    language,
    parentPath,
  });

  return file.save();
}

export async function updateFileContent(
  fileId: string,
  content: string
): Promise<IFile | null> {
  const file = await FileModel.findById(fileId);
  if (!file) return null;

  file.content = content;
  file.version += 1;
  return file.save();
}

export async function renameFile(
  fileId: string,
  newName: string
): Promise<IFile | null> {
  const file = await FileModel.findById(fileId);
  if (!file) return null;

  const oldPath = file.path;
  const parentPath = computeParentPath(oldPath);
  const newPath = parentPath === '/' ? `/${newName}` : `${parentPath}/${newName}`;

  file.name = newName;
  file.path = newPath;
  if (file.type === 'file') {
    file.language = detectLanguage(newName);
  }

  // If folder, update children paths
  if (file.type === 'folder') {
    const children = await FileModel.find({
      projectId: file.projectId,
      path: { $regex: `^${oldPath}/` },
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
    // Delete all children
    await FileModel.deleteMany({
      projectId: file.projectId,
      path: { $regex: `^${file.path}/` },
    });
  }

  await FileModel.findByIdAndDelete(fileId);
  return true;
}

// ─── Seed Sample Project ───

export async function seedSampleProject(projectId: string = 'default'): Promise<void> {
  const existing = await FileModel.countDocuments({ projectId });
  if (existing > 0) {
    logger.info(`Project "${projectId}" already has ${existing} files, skipping seed.`);
    return;
  }

  logger.info(`Seeding sample project "${projectId}"...`);

  const sampleFiles = [
    // Root folder: src
    {
      projectId,
      name: 'src',
      path: '/src',
      type: 'folder' as const,
      content: '',
      parentPath: '/',
    },
    // src/App.tsx
    {
      projectId,
      name: 'App.tsx',
      path: '/src/App.tsx',
      type: 'file' as const,
      parentPath: '/src',
      content: `import React from 'react';
import Header from './components/Header';
import { formatDate, capitalize } from './utils/helpers';
import './styles.css';

interface AppProps {
  title?: string;
}

const App: React.FC<AppProps> = ({ title = 'CodeNexus' }) => {
  const today = formatDate(new Date());

  return (
    <div className="app">
      <Header title={capitalize(title)} />
      <main className="app-main">
        <h2>Welcome to {title}</h2>
        <p>Today is {today}</p>
        <p>Start editing to see changes in real-time!</p>
      </main>
    </div>
  );
};

export default App;
`,
    },
    // src/index.ts
    {
      projectId,
      name: 'index.ts',
      path: '/src/index.ts',
      type: 'file' as const,
      parentPath: '/src',
      content: `// CodeNexus — Entry Point
import App from './App';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

console.log('🚀 CodeNexus is starting...');

// Initialize the application
const app = new App({ title: 'CodeNexus Editor' });
app.render(rootElement);

export default app;
`,
    },
    // src/styles.css
    {
      projectId,
      name: 'styles.css',
      path: '/src/styles.css',
      type: 'file' as const,
      parentPath: '/src',
      content: `/* CodeNexus — Application Styles */

:root {
  --primary: #6366f1;
  --bg: #0a0a0f;
  --text: #e4e4e7;
  --surface: #1a1a2e;
}

.app {
  min-height: 100vh;
  background: var(--bg);
  color: var(--text);
  font-family: 'Inter', sans-serif;
}

.app-main {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.app-main h2 {
  color: var(--primary);
  margin-bottom: 1rem;
}

.app-main p {
  line-height: 1.6;
  color: #a1a1b5;
}
`,
    },
    // src/utils folder
    {
      projectId,
      name: 'utils',
      path: '/src/utils',
      type: 'folder' as const,
      content: '',
      parentPath: '/src',
    },
    // src/utils/helpers.ts
    {
      projectId,
      name: 'helpers.ts',
      path: '/src/utils/helpers.ts',
      type: 'file' as const,
      parentPath: '/src/utils',
      content: `/**
 * Utility functions for CodeNexus
 */

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function debounce<T extends (...args: any[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
`,
    },
    // src/components folder
    {
      projectId,
      name: 'components',
      path: '/src/components',
      type: 'folder' as const,
      content: '',
      parentPath: '/src',
    },
    // src/components/Header.tsx
    {
      projectId,
      name: 'Header.tsx',
      path: '/src/components/Header.tsx',
      type: 'file' as const,
      parentPath: '/src/components',
      content: `import React from 'react';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  return (
    <header className="header">
      <div className="header-brand">
        <span className="header-logo">⚡</span>
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
};

export default Header;
`,
    },
    // package.json at root
    {
      projectId,
      name: 'package.json',
      path: '/package.json',
      type: 'file' as const,
      parentPath: '/',
      content: `{
  "name": "my-project",
  "version": "1.0.0",
  "description": "A sample project in CodeNexus",
  "main": "src/index.ts",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "vite": "^5.0.0"
  }
}
`,
    },
    // README.md at root
    {
      projectId,
      name: 'README.md',
      path: '/README.md',
      type: 'file' as const,
      parentPath: '/',
      content: `# My Project

Welcome to your CodeNexus project! 🚀

## Getting Started

1. Open files from the **Explorer** sidebar
2. Edit code in the **Monaco Editor**
3. Use **AI Chat** to get help with your code

## Features

- Real-time syntax highlighting
- AI-powered code suggestions
- Code health monitoring
- Decision memory tracking
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

  logger.info(`✅ Seeded ${sampleFiles.length} files for project "${projectId}".`);
}
