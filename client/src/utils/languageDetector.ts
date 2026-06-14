/**
 * Maps file extensions to Monaco Editor language IDs
 */

const extensionToLanguage: Record<string, string> = {
  // JavaScript / TypeScript
  '.js': 'javascript',
  '.jsx': 'javascript',
  '.mjs': 'javascript',
  '.cjs': 'javascript',
  '.ts': 'typescript',
  '.tsx': 'typescript',
  '.mts': 'typescript',

  // Web
  '.html': 'html',
  '.htm': 'html',
  '.css': 'css',
  '.scss': 'scss',
  '.less': 'less',
  '.svg': 'xml',

  // Data
  '.json': 'json',
  '.jsonc': 'json',
  '.xml': 'xml',
  '.yaml': 'yaml',
  '.yml': 'yaml',
  '.toml': 'ini',

  // Documentation
  '.md': 'markdown',
  '.mdx': 'markdown',
  '.txt': 'plaintext',

  // Backend
  '.py': 'python',
  '.rb': 'ruby',
  '.go': 'go',
  '.rs': 'rust',
  '.java': 'java',
  '.kt': 'kotlin',
  '.c': 'c',
  '.cpp': 'cpp',
  '.h': 'c',
  '.cs': 'csharp',
  '.php': 'php',
  '.swift': 'swift',

  // Shell / Config
  '.sh': 'shell',
  '.bash': 'shell',
  '.zsh': 'shell',
  '.ps1': 'powershell',
  '.sql': 'sql',
  '.graphql': 'graphql',
  '.gql': 'graphql',
  '.dockerfile': 'dockerfile',

  // Other
  '.env': 'plaintext',
  '.gitignore': 'plaintext',
  '.editorconfig': 'ini',
};

/**
 * Detect the Monaco language ID from a filename.
 */
export function detectLanguage(filename: string): string {
  const dotIndex = filename.lastIndexOf('.');
  if (dotIndex === -1) {
    // Special filenames
    const lower = filename.toLowerCase();
    if (lower === 'dockerfile') return 'dockerfile';
    if (lower === 'makefile') return 'makefile';
    if (lower === 'gemfile') return 'ruby';
    return 'plaintext';
  }
  const ext = filename.slice(dotIndex).toLowerCase();
  return extensionToLanguage[ext] || 'plaintext';
}

/**
 * Get a CSS color associated with a file extension for icon styling.
 */
export function getLanguageColor(filename: string): string {
  const lang = detectLanguage(filename);
  const colorMap: Record<string, string> = {
    javascript: '#f7df1e',
    typescript: '#3178c6',
    html: '#e44d26',
    css: '#264de4',
    scss: '#cd6799',
    json: '#f5a623',
    markdown: '#519aba',
    python: '#3776ab',
    ruby: '#cc342d',
    go: '#00add8',
    rust: '#dea584',
    java: '#f89820',
    kotlin: '#7f52ff',
    csharp: '#239120',
    php: '#777bb4',
    swift: '#fa7343',
    shell: '#4eaa25',
    sql: '#e38c00',
    graphql: '#e535ab',
    yaml: '#cb171e',
    xml: '#f26522',
    dockerfile: '#2496ed',
  };
  return colorMap[lang] || '#a1a1b5';
}
