'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  Bot,
  Braces,
  Copy,
  Loader2,
  Save,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { sendChatMessage } from '@/services/chatApi';

type RegexFlag = 'g' | 'i' | 'm' | 's';

interface RegexFlags {
  g: boolean;
  i: boolean;
  m: boolean;
  s: boolean;
}

interface MatchGroup {
  index: number;
  text: string;
}

interface RegexMatch {
  index: number;
  start: number;
  end: number;
  text: string;
  groups: MatchGroup[];
}

interface HighlightSegment {
  text: string;
  matchIndex?: number;
}

interface SavedPattern {
  id: string;
  name: string;
  pattern: string;
  flags: string;
  createdAt: string;
}

interface GeneratedPattern {
  pattern: string;
  flags: string;
  note: string;
}

const LIBRARY_STORAGE_KEY = 'codenexus.regex.patterns';
const DEFAULT_FLAGS: RegexFlags = { g: true, i: false, m: false, s: false };
const FLAG_OPTIONS: RegexFlag[] = ['g', 'i', 'm', 's'];

const SAMPLE_TEXT = [
  'alice@example.com opened PR #42 on 2026-06-20.',
  'bob.smith@company.io reviewed https://codenexus.dev/docs.',
  'Build failed: Error E102 at line 18.',
].join('\n');

function flagsToString(flags: RegexFlags): string {
  return FLAG_OPTIONS.filter((flag) => flags[flag]).join('');
}

function stringToFlags(flags: string): RegexFlags {
  return {
    g: flags.includes('g'),
    i: flags.includes('i'),
    m: flags.includes('m'),
    s: flags.includes('s'),
  };
}

function collectMatches(pattern: string, flags: string, testString: string): RegexMatch[] {
  if (!pattern) return [];

  const regex = new RegExp(pattern, flags);
  const matches: RegexMatch[] = [];

  if (!flags.includes('g')) {
    const match = regex.exec(testString);
    if (!match || match.index === undefined) return [];

    matches.push({
      index: 0,
      start: match.index,
      end: match.index + match[0].length,
      text: match[0],
      groups: collectGroups(match),
    });
    return matches;
  }

  let match: RegExpExecArray | null;
  let index = 0;
  while ((match = regex.exec(testString)) !== null) {
    matches.push({
      index,
      start: match.index,
      end: match.index + match[0].length,
      text: match[0],
      groups: collectGroups(match),
    });
    index += 1;

    if (match[0] === '') {
      regex.lastIndex += 1;
    }
  }

  return matches;
}

function collectGroups(match: RegExpExecArray): MatchGroup[] {
  return match
    .slice(1)
    .map((text, index) => ({ index: index + 1, text: text ?? '' }))
    .filter((group) => group.text !== '');
}

function buildSegments(testString: string, matches: RegexMatch[]): HighlightSegment[] {
  if (matches.length === 0) return [{ text: testString }];

  const segments: HighlightSegment[] = [];
  let cursor = 0;

  matches.forEach((match) => {
    if (match.start > cursor) {
      segments.push({ text: testString.slice(cursor, match.start) });
    }
    segments.push({
      text: testString.slice(match.start, match.end),
      matchIndex: match.index,
    });
    cursor = match.end;
  });

  if (cursor < testString.length) {
    segments.push({ text: testString.slice(cursor) });
  }

  return segments;
}

function fallbackExplain(pattern: string, flags: string): string {
  if (!pattern) return 'Enter a regex pattern to explain.';

  const notes: string[] = [`/${pattern}/${flags || ''} is tested as a JavaScript regular expression.`];

  if (pattern.includes('^')) notes.push('^ anchors the match to the start of the string or line.');
  if (pattern.includes('$')) notes.push('$ anchors the match to the end of the string or line.');
  if (/\\d/.test(pattern)) notes.push('\\d matches numeric digits.');
  if (/\\w/.test(pattern)) notes.push('\\w matches letters, digits, and underscore.');
  if (/\\s/.test(pattern)) notes.push('\\s matches whitespace.');
  if (/\[[^\]]+\]/.test(pattern)) notes.push('Character classes in [] match one character from the allowed set.');
  if (/\([^)]+\)/.test(pattern)) notes.push('Parentheses create capture groups that are reported in the match details.');
  if (pattern.includes('|')) notes.push('| adds an OR choice between alternatives.');
  if (/[+*?]/.test(pattern)) notes.push('Quantifiers such as +, *, and ? control how many times the previous token may repeat.');
  if (/\{\d/.test(pattern)) notes.push('Brace quantifiers set exact or ranged repetition counts.');
  if (flags.includes('g')) notes.push('g returns every match instead of stopping at the first one.');
  if (flags.includes('i')) notes.push('i makes matching case-insensitive.');
  if (flags.includes('m')) notes.push('m makes ^ and $ work per line.');
  if (flags.includes('s')) notes.push('s lets . match newline characters.');

  if (notes.length === 1) {
    notes.push('It matches the literal token sequence and any escaped metacharacters currently in the pattern.');
  }

  return notes.join('\n');
}

function fallbackGenerate(description: string): GeneratedPattern {
  const prompt = description.toLowerCase();

  if (prompt.includes('email')) {
    return {
      pattern: '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}',
      flags: 'gi',
      note: 'Matches common email addresses.',
    };
  }
  if (prompt.includes('url') || prompt.includes('link') || prompt.includes('http')) {
    return {
      pattern: 'https?:\\/\\/[^\\s]+',
      flags: 'gi',
      note: 'Matches HTTP and HTTPS URLs.',
    };
  }
  if (prompt.includes('phone') || prompt.includes('mobile')) {
    return {
      pattern: '\\+?\\d[\\d\\s().-]{7,}\\d',
      flags: 'g',
      note: 'Matches flexible international phone number formats.',
    };
  }
  if (prompt.includes('date')) {
    return {
      pattern: '\\b\\d{4}-\\d{2}-\\d{2}\\b',
      flags: 'g',
      note: 'Matches ISO dates such as 2026-06-20.',
    };
  }
  if (prompt.includes('uuid')) {
    return {
      pattern: '\\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\\b',
      flags: 'gi',
      note: 'Matches UUID values.',
    };
  }
  if (prompt.includes('ip')) {
    return {
      pattern: '\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b',
      flags: 'g',
      note: 'Matches IPv4-shaped addresses.',
    };
  }
  if (prompt.includes('hex')) {
    return {
      pattern: '#(?:[0-9a-fA-F]{3}){1,2}\\b',
      flags: 'g',
      note: 'Matches short and long hex colors.',
    };
  }
  if (prompt.includes('error') || prompt.includes('failed')) {
    return {
      pattern: '\\b(?:Error|failed|failure|exception)\\b.*',
      flags: 'gim',
      note: 'Matches common error lines.',
    };
  }
  if (prompt.includes('number') || prompt.includes('digit')) {
    return {
      pattern: '\\b\\d+(?:\\.\\d+)?\\b',
      flags: 'g',
      note: 'Matches integers and decimals.',
    };
  }

  return {
    pattern: description.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&') || '.+',
    flags: 'g',
    note: 'Matches the literal description text. Refine the description for a more specific pattern.',
  };
}

function extractGeneratedRegex(response: string): GeneratedPattern | null {
  const slashMatch = response.match(/\/((?:\\\/|[^/\n])+?)\/([gims]*)/);
  if (slashMatch) {
    return {
      pattern: slashMatch[1].replace(/\\\//g, '/'),
      flags: slashMatch[2] || 'g',
      note: response.trim(),
    };
  }

  const patternMatch = response.match(/(?:pattern|regex)\s*[:=]\s*`?([^`\n]+)`?/i);
  if (patternMatch) {
    return {
      pattern: patternMatch[1].replace(/^\/|\/[gims]*$/g, '').trim(),
      flags: response.match(/flags\s*[:=]\s*`?([gims]+)`?/i)?.[1] || 'g',
      note: response.trim(),
    };
  }

  return null;
}

async function askRegexAssistant(
  message: string,
  context: Record<string, unknown>,
  onChunk: (content: string) => void
): Promise<string> {
  let response = '';
  let requestError = '';

  await sendChatMessage(
    message,
    context,
    undefined,
    (chunk) => {
      response += chunk;
      onChunk(response);
    },
    undefined,
    (error) => {
      requestError = error;
    }
  );

  if (requestError) {
    throw new Error(requestError);
  }

  return response.trim();
}

function loadSavedPatterns(): SavedPattern[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(LIBRARY_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SavedPattern[]) : [];
  } catch {
    return [];
  }
}

function persistSavedPatterns(patterns: SavedPattern[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(LIBRARY_STORAGE_KEY, JSON.stringify(patterns));
}

export default function RegexPlayground() {
  const [pattern, setPattern] = useState('[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}');
  const [flags, setFlags] = useState<RegexFlags>({ ...DEFAULT_FLAGS, i: true });
  const [testString, setTestString] = useState(SAMPLE_TEXT);
  const [description, setDescription] = useState('');
  const [libraryName, setLibraryName] = useState('');
  const [library, setLibrary] = useState<SavedPattern[]>([]);
  const [assistantText, setAssistantText] = useState('');
  const [assistantBusy, setAssistantBusy] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setLibrary(loadSavedPatterns());
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const flagString = useMemo(() => flagsToString(flags), [flags]);

  const regexState = useMemo(() => {
    try {
      const matches = collectMatches(pattern, flagString, testString);
      return {
        error: '',
        matches,
        segments: buildSegments(testString, matches),
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Invalid regex',
        matches: [] as RegexMatch[],
        segments: [{ text: testString }] as HighlightSegment[],
      };
    }
  }, [flagString, pattern, testString]);

  const toggleFlag = (flag: RegexFlag) => {
    setFlags((current) => ({ ...current, [flag]: !current[flag] }));
  };

  const savePattern = () => {
    if (!pattern.trim()) return;

    const nextPattern: SavedPattern = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name: libraryName.trim() || `/${pattern}/${flagString}`,
      pattern,
      flags: flagString,
      createdAt: new Date().toISOString(),
    };

    const nextLibrary = [
      nextPattern,
      ...library.filter((item) => !(item.pattern === pattern && item.flags === flagString)),
    ].slice(0, 20);

    setLibrary(nextLibrary);
    persistSavedPatterns(nextLibrary);
    setLibraryName('');
  };

  const loadPattern = (savedPattern: SavedPattern) => {
    setPattern(savedPattern.pattern);
    setFlags(stringToFlags(savedPattern.flags));
    setAssistantText('');
  };

  const deletePattern = (patternId: string) => {
    const nextLibrary = library.filter((item) => item.id !== patternId);
    setLibrary(nextLibrary);
    persistSavedPatterns(nextLibrary);
  };

  const explainRegex = async () => {
    setAssistantBusy(true);
    setAssistantText('');

    const fallback = fallbackExplain(pattern, flagString);

    try {
      const response = await askRegexAssistant(
        [
          'Explain this JavaScript regex in plain English.',
          'Keep the response concise and focus on matching behavior, capture groups, and flags.',
          `Regex: /${pattern}/${flagString}`,
          `Test sample:\n${testString.slice(0, 1200)}`,
        ].join('\n\n'),
        {
          projectId: 'default',
          selectedText: `/${pattern}/${flagString}`,
          activeFile: {
            path: 'regex-playground',
            name: 'Regex Playground',
            language: 'regex',
            content: testString,
          },
        },
        setAssistantText
      );

      if (!response || response.includes('I understand you')) {
        setAssistantText(fallback);
      }
    } catch {
      setAssistantText(fallback);
    } finally {
      setAssistantBusy(false);
    }
  };

  const generateRegex = async () => {
    if (!description.trim()) return;

    setAssistantBusy(true);
    setAssistantText('');
    const fallback = fallbackGenerate(description);

    try {
      const response = await askRegexAssistant(
        [
          'Generate exactly one JavaScript regex for this description.',
          'Return the regex in /pattern/flags form, then one short sentence explaining it.',
          `Description: ${description}`,
        ].join('\n\n'),
        {
          projectId: 'default',
          selectedText: description,
          activeFile: {
            path: 'regex-playground',
            name: 'Regex Playground',
            language: 'regex',
          },
        },
        setAssistantText
      );

      const generated = extractGeneratedRegex(response) || fallback;
      setPattern(generated.pattern);
      setFlags(stringToFlags(generated.flags));
      setAssistantText(generated.note);
    } catch {
      setPattern(fallback.pattern);
      setFlags(stringToFlags(fallback.flags));
      setAssistantText(fallback.note);
    } finally {
      setAssistantBusy(false);
    }
  };

  const copyRegex = async () => {
    await navigator.clipboard.writeText(`/${pattern}/${flagString}`);
  };

  return (
    <div className="regex-playground" id="regex-playground">
      <div className="regex-header">
        <div className="regex-header-title">
          <Braces size={14} />
          <span>Regex Playground</span>
        </div>
        <button className="regex-icon-btn" onClick={copyRegex} title="Copy regex" aria-label="Copy regex">
          <Copy size={13} />
        </button>
      </div>

      <div className="regex-workspace">
        <section className="regex-section regex-pattern-section" aria-label="Regex pattern">
          <div className="regex-input-row">
            <span className="regex-delimiter">/</span>
            <input
              className="regex-pattern-input"
              value={pattern}
              onChange={(event) => setPattern(event.target.value)}
              spellCheck={false}
              aria-label="Regex pattern"
            />
            <span className="regex-delimiter">/</span>
          </div>
          <div className="regex-flag-row" aria-label="Regex flags">
            {FLAG_OPTIONS.map((flag) => (
              <button
                key={flag}
                className={`regex-flag ${flags[flag] ? 'regex-flag-active' : ''}`}
                onClick={() => toggleFlag(flag)}
                aria-pressed={flags[flag]}
                title={`Toggle ${flag} flag`}
              >
                {flag}
              </button>
            ))}
          </div>
          {regexState.error && (
            <div className="regex-error" role="alert">
              {regexState.error}
            </div>
          )}
        </section>

        <section className="regex-section regex-test-section" aria-label="Test string">
          <textarea
            className="regex-test-input"
            value={testString}
            onChange={(event) => setTestString(event.target.value)}
            spellCheck={false}
            aria-label="Test string"
          />
        </section>

        <section className="regex-section regex-results-section" aria-label="Regex results">
          <div className="regex-results-summary">
            <span>{regexState.matches.length} matches</span>
            <span>/{pattern || ' '}/{flagString}</span>
          </div>
          <pre className="regex-highlighted-text" aria-label="Highlighted matches">
            {regexState.segments.map((segment, index) =>
              segment.matchIndex === undefined ? (
                <span key={`${segment.text}-${index}`}>{segment.text}</span>
              ) : (
                <mark
                  key={`${segment.text}-${index}`}
                  className={`regex-match regex-match-${segment.matchIndex % 6}`}
                >
                  {segment.text}
                </mark>
              )
            )}
          </pre>

          <div className="regex-match-list">
            {regexState.matches.map((match) => (
              <div className="regex-match-row" key={`${match.start}-${match.index}`}>
                <span className={`regex-match-index regex-group-color-${match.index % 6}`}>
                  #{match.index + 1}
                </span>
                <code>{match.text || '(empty)'}</code>
                <span className="regex-match-position">
                  {match.start}-{match.end}
                </span>
                {match.groups.map((group) => (
                  <span
                    className={`regex-group-badge regex-group-color-${group.index % 6}`}
                    key={`${match.index}-${group.index}`}
                  >
                    ${group.index}: {group.text}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </section>

        <section className="regex-section regex-ai-section" aria-label="Regex AI actions">
          <div className="regex-action-row">
            <button className="regex-primary-btn" onClick={explainRegex} disabled={assistantBusy || !pattern}>
              {assistantBusy ? <Loader2 size={13} className="regex-spin" /> : <Bot size={13} />}
              <span>Explain this regex</span>
            </button>
          </div>
          <div className="regex-generate-row">
            <input
              className="regex-description-input"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Generate from description"
              aria-label="Regex description"
            />
            <button
              className="regex-icon-btn regex-generate-btn"
              onClick={generateRegex}
              disabled={assistantBusy || !description.trim()}
              title="Generate regex"
              aria-label="Generate regex"
            >
              {assistantBusy ? <Loader2 size={13} className="regex-spin" /> : <Sparkles size={13} />}
            </button>
          </div>
          {assistantText && <div className="regex-ai-output">{assistantText}</div>}
        </section>

        <section className="regex-section regex-library-section" aria-label="Pattern library">
          <div className="regex-library-header">
            <div className="regex-library-title">
              <BookOpen size={13} />
              <span>Pattern Library</span>
            </div>
          </div>
          <div className="regex-save-row">
            <input
              className="regex-library-input"
              value={libraryName}
              onChange={(event) => setLibraryName(event.target.value)}
              placeholder="Pattern name"
              aria-label="Pattern name"
            />
            <button className="regex-icon-btn" onClick={savePattern} title="Save pattern" aria-label="Save pattern">
              <Save size={13} />
            </button>
          </div>
          <div className="regex-library-list">
            {library.length === 0 ? (
              <div className="regex-library-empty">No saved patterns</div>
            ) : (
              library.map((savedPattern) => (
                <div className="regex-library-item" key={savedPattern.id}>
                  <button
                    className="regex-library-load"
                    onClick={() => loadPattern(savedPattern)}
                    title={`Load ${savedPattern.name}`}
                  >
                    <span>{savedPattern.name}</span>
                    <code>/{savedPattern.pattern}/{savedPattern.flags}</code>
                  </button>
                  <button
                    className="regex-icon-btn"
                    onClick={() => deletePattern(savedPattern.id)}
                    title="Delete pattern"
                    aria-label={`Delete ${savedPattern.name}`}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
