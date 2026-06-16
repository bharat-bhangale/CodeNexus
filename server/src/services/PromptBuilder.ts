import { getRecentForContext } from './DecisionService.js';
import { getProjectRules } from './PatternDetector.js';

interface ChatContext {
  activeFile?: { path: string; name: string; language: string; content?: string };
  selectedText?: string;
  cursorPosition?: { line: number; column: number };
  openFiles?: string[];
  projectId?: string;
}

interface SlashCommand {
  name: string;
  label: string;
  description: string;
  instruction: string;
}

const SLASH_COMMANDS: SlashCommand[] = [
  {
    name: '/explain',
    label: 'Explain',
    description: 'Explain the selected code step by step',
    instruction:
      'Explain the selected code step by step. Break down what each part does, why it exists, and how the pieces connect. Use clear, jargon-free language where possible.',
  },
  {
    name: '/refactor',
    label: 'Refactor',
    description: 'Refactor the code for readability and best practices',
    instruction:
      'Refactor the selected code for improved readability, maintainability, and adherence to modern best practices. Show the refactored code with explanations for each change.',
  },
  {
    name: '/test',
    label: 'Test',
    description: 'Generate comprehensive unit tests',
    instruction:
      'Generate comprehensive unit tests for the selected code using Vitest and React Testing Library (if React components). Cover happy paths, edge cases, and error conditions. Include setup, assertions, and cleanup.',
  },
  {
    name: '/doc',
    label: 'Document',
    description: 'Generate JSDoc/TSDoc documentation',
    instruction:
      'Generate complete JSDoc/TSDoc documentation for the selected code. Include @param, @returns, @throws, @example tags. Document the purpose, behavior, and usage.',
  },
  {
    name: '/debug',
    label: 'Debug',
    description: 'Identify bugs and suggest fixes',
    instruction:
      'Analyze the selected code for potential bugs, logic errors, race conditions, and edge cases. For each issue found, explain the problem and provide a fix with code.',
  },
  {
    name: '/perf',
    label: 'Performance',
    description: 'Analyze for performance issues',
    instruction:
      'Analyze the selected code for performance issues including: unnecessary re-renders, O(n²) operations, memory leaks, missing memoization, expensive computations, and suboptimal data structures. Provide optimized alternatives.',
  },
  {
    name: '/security',
    label: 'Security',
    description: 'Review for security vulnerabilities',
    instruction:
      'Review the selected code for security vulnerabilities including: XSS, injection attacks, insecure data handling, missing input validation, exposed secrets, and CSRF risks. Provide secure alternatives for each issue.',
  },
];

export function getSlashCommands(): SlashCommand[] {
  return SLASH_COMMANDS;
}

export function getSlashCommandInstruction(commandName: string): string | null {
  const cmd = SLASH_COMMANDS.find((c) => c.name === commandName);
  return cmd ? cmd.instruction : null;
}

export async function buildChatPrompt(
  userMessage: string,
  context: ChatContext,
  command?: string
): Promise<{ systemPrompt: string; userPrompt: string }> {
  const projectId = context.projectId || 'default';

  // Build system prompt
  const systemParts: string[] = [
    'You are CodeNexus, an expert AI coding assistant embedded in an IDE.',
    'You have full context of the user\'s active file, cursor position, selected text, and project structure.',
    'Always provide helpful, accurate, and concise responses.',
    'When showing code, use fenced code blocks with the language specified.',
    'If you reference files, use their paths. If you suggest changes, show the complete code.',
  ];

  // Add active file context
  if (context.activeFile) {
    const content = context.activeFile.content || '';
    const truncated = content.length > 3000 ? content.slice(0, 3000) + '\n// ... (truncated)' : content;
    systemParts.push(
      `\n--- Active File ---`,
      `File: ${context.activeFile.path} (${context.activeFile.language})`,
      `\`\`\`${context.activeFile.language}\n${truncated}\n\`\`\``
    );
  }

  // Add selected text
  if (context.selectedText) {
    const selectedTrunc =
      context.selectedText.length > 2000
        ? context.selectedText.slice(0, 2000) + '\n// ... (truncated)'
        : context.selectedText;
    systemParts.push(`\n--- Selected Text ---`, `\`\`\`\n${selectedTrunc}\n\`\`\``);
  }

  // Add cursor position
  if (context.cursorPosition) {
    systemParts.push(
      `Cursor position: Line ${context.cursorPosition.line}, Column ${context.cursorPosition.column}`
    );
  }

  // Add open files
  if (context.openFiles && context.openFiles.length > 0) {
    systemParts.push(`Open files: ${context.openFiles.join(', ')}`);
  }

  // Add recent decisions
  try {
    const recentDecisions = await getRecentForContext(projectId, 5);
    if (recentDecisions.length > 0) {
      systemParts.push(`\n--- Recent Coding Decisions ---`);
      for (const d of recentDecisions) {
        systemParts.push(
          `- "${d.title}" (${d.type}${d.tags.length > 0 ? `, tags: ${d.tags.join(', ')}` : ''})`
        );
      }
    }
  } catch {
    // Decisions unavailable — continue without them
  }

  // Add project rules
  try {
    const rules = getProjectRules(projectId);
    if (rules.length > 0) {
      systemParts.push(`\n--- Project Rules (always follow these) ---`);
      for (const r of rules) {
        systemParts.push(`- ${r.rule}`);
      }
    }
  } catch {
    // Rules unavailable — continue without them
  }

  const systemPrompt = systemParts.join('\n');

  // Build user prompt with command instruction
  let userPrompt = userMessage;
  if (command) {
    const instruction = getSlashCommandInstruction(command);
    if (instruction) {
      userPrompt = `[Command: ${command}]\n${instruction}\n\nUser message: ${userMessage}`;
    }
  }

  return { systemPrompt, userPrompt };
}
