'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import { Terminal, Wrench } from 'lucide-react';
import TerminalTabs, { type TerminalTab } from './TerminalTabs';
import { fetchFileContent } from '@/services/fileApi';
import { useEditorStore, type OpenFile } from '@/stores/editorStore';
import { useFileStore, type FileTreeNode } from '@/stores/fileStore';

interface TerminalEntry {
  command: string;
  output: string;
  failed: boolean;
  fix?: string;
}

interface TerminalSession {
  id: string;
  title: string;
  input: string;
  entries: TerminalEntry[];
  history: string[];
  historyCursor: number | null;
}

interface CommandResult {
  output: string;
  failed?: boolean;
}

const PROMPT = '\x1b[32mCodeNexus\x1b[0m:\x1b[36m/\x1b[0m$ ';
const WELCOME_TEXT = [
  'CodeNexus terminal v1 (simulated shell)',
  'Type "help" for available commands.',
  '',
].join('\r\n');

const INITIAL_SESSION_ID = 'terminal-1';
const STORAGE_HINT_LIMIT = 80;

function createSession(index: number): TerminalSession {
  return {
    id: `terminal-${index}`,
    title: `Terminal ${index}`,
    input: '',
    entries: [],
    history: [],
    historyCursor: null,
  };
}

function normalizePath(path: string): string {
  const cleaned = path.trim().replace(/\\/g, '/');
  if (!cleaned || cleaned === '.') return '/';
  if (cleaned.startsWith('/')) return cleaned.replace(/\/+/g, '/');
  if (cleaned.startsWith('./')) return `/${cleaned.slice(2)}`.replace(/\/+/g, '/');
  return `/${cleaned}`.replace(/\/+/g, '/');
}

function stripLeadingSlash(path: string): string {
  return normalizePath(path).replace(/^\//, '');
}

function pathMatches(candidatePath: string, inputPath: string, candidateName: string): boolean {
  const normalizedCandidate = normalizePath(candidatePath);
  const normalizedInput = normalizePath(inputPath);

  return (
    normalizedCandidate === normalizedInput ||
    stripLeadingSlash(normalizedCandidate) === stripLeadingSlash(normalizedInput) ||
    candidateName === inputPath.trim()
  );
}

function flattenTree(nodes: FileTreeNode[]): FileTreeNode[] {
  return nodes.flatMap((node) => [
    node,
    ...(node.children ? flattenTree(node.children) : []),
  ]);
}

function findNode(nodes: FileTreeNode[], inputPath: string): FileTreeNode | undefined {
  const flatNodes = flattenTree(nodes);
  return flatNodes.find((node) => pathMatches(node.path, inputPath, node.name));
}

function findDirectoryChildren(nodes: FileTreeNode[], inputPath?: string): FileTreeNode[] | null {
  if (!inputPath || inputPath.trim() === '' || normalizePath(inputPath) === '/') {
    return nodes;
  }

  const node = findNode(nodes, inputPath);
  if (!node || !node.isDirectory) return null;
  return node.children || [];
}

function tokenizeCommand(command: string): string[] {
  const matches = command.match(/"[^"]*"|'[^']*'|\S+/g) || [];
  return matches.map((part) => part.replace(/^["']|["']$/g, ''));
}

function ensureTerminalNewline(text: string): string {
  if (!text) return '';
  const normalized = text.replace(/\r?\n/g, '\r\n');
  return normalized.endsWith('\r\n') ? normalized : `${normalized}\r\n`;
}

function sanitizeTerminalText(text: string): string {
  return text.replace(/\x1b\[[0-9;?]*[ -/]*[@-~]/g, '');
}

function toDisplayOutput(output: string, failed: boolean): string {
  const text = ensureTerminalNewline(sanitizeTerminalText(output));
  return failed ? `\x1b[31m${text}\x1b[0m` : text;
}

function toAiFixLine(fix: string): string {
  return `\x1b[33mAI fix:\x1b[0m ${sanitizeTerminalText(fix)}\r\n`;
}

function formatDirectory(nodes: FileTreeNode[], openFiles: OpenFile[]): string {
  if (nodes.length > 0) {
    return nodes
      .map((node) => `${node.name}${node.isDirectory ? '/' : ''}`)
      .sort((a, b) => a.localeCompare(b))
      .join('  ');
  }

  if (openFiles.length > 0) {
    return openFiles
      .map((file) => file.path || file.name)
      .slice(0, STORAGE_HINT_LIMIT)
      .join('  ');
  }

  return 'No files loaded. Open or create files in Explorer to populate this simulated shell.';
}

function buildInlineFix(command: string, output: string): string | undefined {
  if (!/(error|failed)/i.test(output)) return undefined;

  const [name] = tokenizeCommand(command);
  if (name === 'cat') {
    return 'Run "ls" to confirm the path, then use "cat <file>" with one of the listed files.';
  }
  if (name === 'ls') {
    return 'Check the folder path or run "ls" without arguments to list the project root.';
  }
  if (['npm', 'node', 'git', 'pnpm', 'yarn'].includes(name)) {
    return 'This browser terminal is simulated in v1. Use help, ls, cat, echo, or clear here.';
  }
  return 'Type "help" to see the simulated commands available in this terminal.';
}

function getSuggestion(
  input: string,
  activeFile: OpenFile | undefined,
  openFiles: OpenFile[],
  fileTree: FileTreeNode[]
): string {
  const value = input.trimStart();
  if (!value) return '';

  const fileCandidates = [
    activeFile?.path,
    ...openFiles.map((file) => file.path),
    ...flattenTree(fileTree)
      .filter((node) => !node.isDirectory)
      .map((node) => node.path),
  ].filter(Boolean) as string[];

  const preferredFile = fileCandidates[0] ? stripLeadingSlash(fileCandidates[0]) : 'README.md';
  const suggestions = [
    `cat ${preferredFile}`,
    'ls',
    'help',
    'clear',
    'echo "Hello from CodeNexus"',
  ];

  const direct = suggestions.find((suggestion) =>
    suggestion.toLowerCase().startsWith(value.toLowerCase())
  );
  if (direct && direct.length > value.length) return direct;

  if ('cat'.startsWith(value.toLowerCase())) return `cat ${preferredFile}`;
  if ('echo'.startsWith(value.toLowerCase())) return 'echo "Hello from CodeNexus"';
  return '';
}

export default function TerminalPanel() {
  const [sessions, setSessions] = useState<TerminalSession[]>([createSession(1)]);
  const [activeSessionId, setActiveSessionId] = useState(INITIAL_SESSION_ID);
  const [latestFix, setLatestFix] = useState<string | null>(null);

  const terminalHostRef = useRef<HTMLDivElement | null>(null);
  const terminalRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const sessionsRef = useRef<TerminalSession[]>(sessions);
  const activeSessionIdRef = useRef(activeSessionId);
  const inputRef = useRef('');
  const ghostRef = useRef<{ suggestion: string; suffix: string } | null>(null);
  const suggestionTimerRef = useRef<number | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const activeFile = useEditorStore((s) => s.getActiveFile());
  const openFiles = useEditorStore((s) => s.openFiles);
  const fileTree = useFileStore((s) => s.fileTree);
  const activeFileRef = useRef(activeFile);
  const openFilesRef = useRef(openFiles);
  const fileTreeRef = useRef(fileTree);

  useEffect(() => {
    sessionsRef.current = sessions;
  }, [sessions]);

  useEffect(() => {
    activeSessionIdRef.current = activeSessionId;
  }, [activeSessionId]);

  useEffect(() => {
    activeFileRef.current = activeFile;
  }, [activeFile]);

  useEffect(() => {
    openFilesRef.current = openFiles;
  }, [openFiles]);

  useEffect(() => {
    fileTreeRef.current = fileTree;
  }, [fileTree]);

  const tabs = useMemo<TerminalTab[]>(
    () => sessions.map(({ id, title }) => ({ id, title })),
    [sessions]
  );

  const getActiveSession = useCallback(() => {
    return sessionsRef.current.find((session) => session.id === activeSessionIdRef.current);
  }, []);

  const updateSession = useCallback(
    (sessionId: string, updater: (session: TerminalSession) => TerminalSession) => {
      setSessions((current) => {
        const next = current.map((session) =>
          session.id === sessionId ? updater(session) : session
        );
        sessionsRef.current = next;
        return next;
      });
    },
    []
  );

  const writePrompt = useCallback((input = '') => {
    terminalRef.current?.write(`${PROMPT}${input}`);
  }, []);

  const clearGhostSuggestion = useCallback(() => {
    const ghost = ghostRef.current;
    if (!ghost || !terminalRef.current) return;

    terminalRef.current.write('\b \b'.repeat(ghost.suffix.length));
    ghostRef.current = null;
  }, []);

  const renderSession = useCallback(
    (session: TerminalSession) => {
      const terminal = terminalRef.current;
      if (!terminal) return;

      ghostRef.current = null;
      inputRef.current = session.input;
      terminal.clear();
      terminal.write(WELCOME_TEXT);

      session.entries.forEach((entry) => {
        terminal.write(`${PROMPT}${entry.command}\r\n`);
        terminal.write(toDisplayOutput(entry.output, entry.failed));
        if (entry.fix) terminal.write(toAiFixLine(entry.fix));
      });

      writePrompt(session.input);
      fitAddonRef.current?.fit();
    },
    [writePrompt]
  );

  const replaceCurrentInput = useCallback(
    (nextInput: string, historyCursor: number | null = null) => {
      const session = getActiveSession();
      if (!session || !terminalRef.current) return;

      clearGhostSuggestion();
      inputRef.current = nextInput;
      terminalRef.current.write(`\x1b[2K\r${PROMPT}${nextInput}`);
      updateSession(session.id, (current) => ({
        ...current,
        input: nextInput,
        historyCursor,
      }));
    },
    [clearGhostSuggestion, getActiveSession, updateSession]
  );

  const showGhostSuggestion = useCallback(() => {
    const terminal = terminalRef.current;
    const input = inputRef.current;
    if (!terminal || ghostRef.current || !input.trim()) return;

    const suggestion = getSuggestion(
      input,
      activeFileRef.current,
      openFilesRef.current,
      fileTreeRef.current
    );

    if (!suggestion || !suggestion.toLowerCase().startsWith(input.toLowerCase())) return;

    const suffix = suggestion.slice(input.length);
    if (!suffix) return;

    ghostRef.current = { suggestion, suffix };
    terminal.write(`\x1b[2m${suffix}\x1b[0m`);
  }, []);

  const scheduleSuggestion = useCallback(() => {
    if (suggestionTimerRef.current) {
      window.clearTimeout(suggestionTimerRef.current);
    }

    suggestionTimerRef.current = window.setTimeout(showGhostSuggestion, 420);
  }, [showGhostSuggestion]);

  const acceptGhostSuggestion = useCallback(() => {
    const ghost = ghostRef.current;
    const session = getActiveSession();
    if (!ghost || !session || !terminalRef.current) return false;

    const nextInput = ghost.suggestion;
    clearGhostSuggestion();
    terminalRef.current.write(ghost.suffix);
    inputRef.current = nextInput;
    updateSession(session.id, (current) => ({
      ...current,
      input: nextInput,
      historyCursor: null,
    }));
    return true;
  }, [clearGhostSuggestion, getActiveSession, updateSession]);

  const runCommand = useCallback(async (command: string): Promise<CommandResult> => {
    const parts = tokenizeCommand(command);
    const [name = '', ...args] = parts;
    const fileTreeSnapshot = fileTreeRef.current;
    const openFilesSnapshot = openFilesRef.current;

    if (!name) return { output: '' };

    switch (name) {
      case 'help':
        return {
          output: [
            'Available simulated commands:',
            '  help              Show this command list',
            '  ls [path]         List project files from Explorer',
            '  cat <file>        Show open or stored file content',
            '  echo <text>       Print text',
            '  clear             Clear this terminal session',
            '',
            'Tip: pause while typing to see an AI command suggestion.',
          ].join('\n'),
        };

      case 'echo':
        return { output: command.replace(/^echo\s?/, '') || '' };

      case 'ls': {
        const targetPath = args.join(' ');
        const children = findDirectoryChildren(fileTreeSnapshot, targetPath);
        if (children === null) {
          return {
            output: `Error: ${targetPath || '/'} is not a directory or does not exist`,
            failed: true,
          };
        }
        return { output: formatDirectory(children, openFilesSnapshot) };
      }

      case 'cat': {
        const targetPath = args.join(' ');
        if (!targetPath) {
          return { output: 'Error: missing file path. Usage: cat <file>', failed: true };
        }

        const openFile = openFilesSnapshot.find((file) =>
          pathMatches(file.path, targetPath, file.name)
        );

        if (openFile) {
          return { output: openFile.content || '(empty file)' };
        }

        const node = findNode(fileTreeSnapshot, targetPath);
        if (!node) {
          return { output: `Error: file not found: ${targetPath}`, failed: true };
        }
        if (node.isDirectory) {
          return { output: `Error: ${targetPath} is a directory`, failed: true };
        }

        try {
          const file = await fetchFileContent(node.id);
          return { output: file.content || '(empty file)' };
        } catch (error) {
          const message = error instanceof Error ? error.message : 'failed to read file';
          return { output: `Error: ${message}`, failed: true };
        }
      }

      case 'clear':
        return { output: '__CLEAR__' };

      default:
        return {
          output: `Error: command not found: ${name}`,
          failed: true,
        };
    }
  }, []);

  const executeCommand = useCallback(
    async (sessionId: string, rawCommand: string) => {
      const command = rawCommand.trim();
      const terminal = terminalRef.current;
      if (!terminal) return;

      clearGhostSuggestion();
      terminal.write('\r\n');
      inputRef.current = '';

      if (!command) {
        updateSession(sessionId, (session) => ({
          ...session,
          input: '',
          historyCursor: null,
        }));
        writePrompt();
        return;
      }

      const result = await runCommand(command);

      if (result.output === '__CLEAR__') {
        updateSession(sessionId, (session) => ({
          ...session,
          entries: [],
          input: '',
          history: [...session.history, command],
          historyCursor: null,
        }));
        setLatestFix(null);

        const activeSession = sessionsRef.current.find((session) => session.id === sessionId);
        if (activeSession && activeSessionIdRef.current === sessionId) {
          renderSession({ ...activeSession, entries: [], input: '' });
        }
        return;
      }

      const failed = Boolean(result.failed || /(error|failed)/i.test(result.output));
      const fix = buildInlineFix(command, result.output);

      updateSession(sessionId, (session) => ({
        ...session,
        input: '',
        history: [...session.history, command],
        historyCursor: null,
        entries: [
          ...session.entries,
          {
            command,
            output: result.output,
            failed,
            fix,
          },
        ],
      }));

      if (fix) {
        setLatestFix(fix);
      } else if (!failed) {
        setLatestFix(null);
      }

      if (activeSessionIdRef.current === sessionId) {
        terminal.write(toDisplayOutput(result.output, failed));
        if (fix) terminal.write(toAiFixLine(fix));
        writePrompt();
      }
    },
    [clearGhostSuggestion, renderSession, runCommand, updateSession, writePrompt]
  );

  const handleHistoryNavigation = useCallback(
    (direction: 'previous' | 'next') => {
      const session = getActiveSession();
      if (!session || session.history.length === 0) return;

      let nextCursor: number | null;
      if (direction === 'previous') {
        nextCursor =
          session.historyCursor === null
            ? session.history.length - 1
            : Math.max(0, session.historyCursor - 1);
      } else {
        nextCursor =
          session.historyCursor === null
            ? null
            : session.historyCursor + 1 >= session.history.length
              ? null
              : session.historyCursor + 1;
      }

      replaceCurrentInput(nextCursor === null ? '' : session.history[nextCursor], nextCursor);
    },
    [getActiveSession, replaceCurrentInput]
  );

  const handleTerminalData = useCallback(
    (data: string) => {
      const session = getActiveSession();
      if (!session || !terminalRef.current) return;

      if (data === '\x1b[A') {
        handleHistoryNavigation('previous');
        return;
      }

      if (data === '\x1b[B') {
        handleHistoryNavigation('next');
        return;
      }

      if (data === '\t' || data === '\x1b[C') {
        acceptGhostSuggestion();
        return;
      }

      if (data === '\u0003') {
        clearGhostSuggestion();
        terminalRef.current.write('^C\r\n');
        inputRef.current = '';
        updateSession(session.id, (current) => ({
          ...current,
          input: '',
          historyCursor: null,
        }));
        writePrompt();
        return;
      }

      if (data === '\r') {
        const command = inputRef.current;
        updateSession(session.id, (current) => ({
          ...current,
          input: '',
          historyCursor: null,
        }));
        void executeCommand(session.id, command);
        return;
      }

      if (data === '\u007F') {
        clearGhostSuggestion();
        if (inputRef.current.length === 0) return;

        const nextInput = inputRef.current.slice(0, -1);
        inputRef.current = nextInput;
        terminalRef.current.write('\b \b');
        updateSession(session.id, (current) => ({
          ...current,
          input: nextInput,
          historyCursor: null,
        }));
        scheduleSuggestion();
        return;
      }

      const printable = Array.from(data).filter((char) => char >= ' ' && char !== '\x7f');
      if (printable.length === 0) return;

      clearGhostSuggestion();
      const nextText = printable.join('');
      const nextInput = `${inputRef.current}${nextText}`;
      inputRef.current = nextInput;
      terminalRef.current.write(nextText);
      updateSession(session.id, (current) => ({
        ...current,
        input: nextInput,
        historyCursor: null,
      }));
      scheduleSuggestion();
    },
    [
      acceptGhostSuggestion,
      clearGhostSuggestion,
      executeCommand,
      getActiveSession,
      handleHistoryNavigation,
      scheduleSuggestion,
      updateSession,
      writePrompt,
    ]
  );

  useEffect(() => {
    if (!terminalHostRef.current || terminalRef.current) return;

    const fitAddon = new FitAddon();
    const terminal = new XTerm({
      cursorBlink: true,
      convertEol: true,
      fontFamily: 'var(--font-mono)',
      fontSize: 12,
      lineHeight: 1.35,
      scrollback: 1000,
      theme: {
        background: '#0a0a0f',
        foreground: '#e6edf3',
        cursor: '#818cf8',
        selectionBackground: '#6366f155',
        black: '#0a0a0f',
        blue: '#3b82f6',
        cyan: '#06b6d4',
        green: '#22c55e',
        magenta: '#8b5cf6',
        red: '#ef4444',
        white: '#e6edf3',
        yellow: '#f59e0b',
      },
    });

    terminal.loadAddon(fitAddon);
    terminal.loadAddon(new WebLinksAddon());
    terminal.open(terminalHostRef.current);

    terminalRef.current = terminal;
    fitAddonRef.current = fitAddon;

    const disposable = terminal.onData(handleTerminalData);
    renderSession(sessionsRef.current[0]);
    terminal.focus();

    resizeObserverRef.current = new ResizeObserver(() => fitAddon.fit());
    resizeObserverRef.current.observe(terminalHostRef.current);
    window.setTimeout(() => fitAddon.fit(), 0);

    return () => {
      if (suggestionTimerRef.current) window.clearTimeout(suggestionTimerRef.current);
      disposable.dispose();
      resizeObserverRef.current?.disconnect();
      terminal.dispose();
      terminalRef.current = null;
      fitAddonRef.current = null;
    };
  }, [handleTerminalData, renderSession]);

  useEffect(() => {
    const session = sessionsRef.current.find((item) => item.id === activeSessionId);
    if (session) {
      renderSession(session);
      window.setTimeout(() => terminalRef.current?.focus(), 0);
    }
  }, [activeSessionId, renderSession]);

  const handleCreateSession = useCallback(() => {
    const nextIndex = sessionsRef.current.length + 1;
    const nextSession = createSession(nextIndex);
    setSessions((current) => {
      const next = [...current, nextSession];
      sessionsRef.current = next;
      return next;
    });
    setActiveSessionId(nextSession.id);
  }, []);

  const handleSelectSession = useCallback((sessionId: string) => {
    setActiveSessionId(sessionId);
  }, []);

  return (
    <div className="bottom-panel terminal-panel" id="terminal-panel">
      <div className="bottom-panel-header terminal-panel-header">
        <div className="bottom-panel-tabs">
          <button className="bottom-panel-tab bottom-panel-tab-active" id="btn-terminal-tab">
            <Terminal size={14} />
            <span>Terminal</span>
          </button>
          <button className="bottom-panel-tab" id="btn-output-tab" disabled>
            <span>Output</span>
          </button>
          <button className="bottom-panel-tab" id="btn-problems-tab" disabled>
            <span>Problems</span>
          </button>
        </div>

        <TerminalTabs
          tabs={tabs}
          activeTabId={activeSessionId}
          onSelect={handleSelectSession}
          onCreate={handleCreateSession}
        />
      </div>

      <div className="terminal-workspace">
        <div className="terminal-xterm-host" ref={terminalHostRef} />
        {latestFix && (
          <div className="terminal-ai-fix" role="status">
            <Wrench size={13} />
            <span>{latestFix}</span>
          </div>
        )}
      </div>
    </div>
  );
}
