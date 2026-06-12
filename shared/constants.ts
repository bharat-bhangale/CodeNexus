// ═══════════════════════════════════════════
// CodeNexus — Shared Constants
// ═══════════════════════════════════════════

export const API_BASE_URL = '/api/v1';

// ─── Socket Events ───
export const SOCKET_EVENTS = {
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',
  FILE_CHANGED: 'file:changed',
  FILE_SAVED: 'file:saved',
  CURSOR_MOVED: 'cursor:moved',
  AI_STREAM_START: 'ai:stream:start',
  AI_STREAM_CHUNK: 'ai:stream:chunk',
  AI_STREAM_END: 'ai:stream:end',
  AI_STREAM_ERROR: 'ai:stream:error',
  TERMINAL_INPUT: 'terminal:input',
  TERMINAL_OUTPUT: 'terminal:output',
  TERMINAL_RESIZE: 'terminal:resize',
};

// ─── Intent Types ───
export const INTENT_TYPES = {
  PERFORMANCE: 'performance',
  SECURITY: 'security',
  READABILITY: 'readability',
  SCALABILITY: 'scalability',
  TEST_COVERAGE: 'test-coverage',
};

// ─── Decision Types ───
export const DECISION_TYPES = {
  INTENT: 'intent',
  REVIEW: 'review',
  CHAT: 'chat',
  SCAFFOLD: 'scaffold',
};

// ─── Graph Types (Explain My Code) ───
export const GRAPH_TYPES = {
  DEPENDENCY: 'dependency',
  CALL_GRAPH: 'call-graph',
  COMPONENT_TREE: 'component-tree',
  DATA_FLOW: 'data-flow',
};

// ─── Feature Flags ───
export const FEATURES = {
  INTENT_MODE: true,
  EXPLAIN_CODE: true,
  DECISION_MEMORY: true,
  SMART_CHAT: true,
  CODE_REVIEW: true,
  HEALTH_DASHBOARD: true,
  SCAFFOLDING: true,
  TERMINAL: true,
  REGEX_PLAYGROUND: true,
  SNAPSHOTS: false, // Phase 5
};

// ─── Severity Levels ───
export const SEVERITY = {
  CRITICAL: 'critical',
  WARNING: 'warning',
  SUGGESTION: 'suggestion',
  INFO: 'info',
};

// ─── Supported Languages ───
export const LANGUAGES = [
  'javascript', 'typescript', 'python', 'java', 'cpp', 'csharp',
  'go', 'rust', 'ruby', 'php', 'swift', 'kotlin', 'html', 'css',
  'json', 'yaml', 'markdown', 'sql', 'shell', 'dockerfile',
];
