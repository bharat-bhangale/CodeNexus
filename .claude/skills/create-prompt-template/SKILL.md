---
name: create-prompt-template
description: Creates a new AI prompt template function for CodeNexus with system prompt, user prompt, Decision Memory context injection, token budget management, and JSON output specification.
user-invocable: true
---

# Create Prompt Template

## Input Required
- **Feature name** (e.g., `intent`, `explain`, `review`, `chat`, `scaffold`)
- **AI specialty** — what role the AI plays (e.g., "code performance optimizer", "security reviewer")
- **Required context** — what data the prompt needs (code, file path, selection, decisions)
- **Output format** — the JSON shape the AI should return

## Steps

### Step 1 — Create the prompt file
**Path:** `server/src/prompts/{feature}.prompts.js`

```javascript
/**
 * Prompt template for {Feature Name}
 * @param {Object} params
 * @param {string} params.code - The source code to analyze
 * @param {string} params.language - Programming language (e.g., 'javascript')
 * @param {Object} params.context - Additional context (filePath, selection, etc.)
 * @param {Array}  params.decisionHistory - Recent Decision Memory entries
 * @param {Array}  params.projectRules - Project-specific rules/preferences
 */
export const build{Feature}Prompt = ({
  code,
  language = 'javascript',
  context = {},
  decisionHistory = [],
  projectRules = [],
}) => ({
  system: `You are an expert ${language} developer specializing in {AI_SPECIALTY}.
You are working within CodeNexus, an AI-powered code editor.

Your responsibilities:
- {RESPONSIBILITY_1}
- {RESPONSIBILITY_2}
- {RESPONSIBILITY_3}

Constraints:
- Respond ONLY with valid JSON matching the specified format
- Be specific and actionable — no vague suggestions
- Consider the user's past decisions shown in "Decision History"
- If unsure, express uncertainty in the confidence score (0-100)`,

  user: `## Source Code
\`\`\`${language}
${code}
\`\`\`

## Context
- File: ${context.filePath || 'unknown'}
- Language: ${language}
${context.selection ? `- Selection: lines ${context.selection.startLine}-${context.selection.endLine}` : '- Scope: entire file'}
${context.projectStructure ? `- Project structure:\n${context.projectStructure}` : ''}

## Decision History (follow these established patterns)
${decisionHistory.length > 0
  ? decisionHistory.map((d) => `- [${d.type}] ${d.summary}`).join('\n')
  : '- No prior decisions recorded'}

## Project Rules
${projectRules.length > 0
  ? projectRules.map((r) => `- ${r}`).join('\n')
  : '- No specific rules'}

## Task
{DETAILED_STEP_BY_STEP_INSTRUCTIONS}

## Required Output Format
Respond ONLY with valid JSON:
\`\`\`json
{
  "results": [
    {
      "type": "string",
      "description": "string",
      "suggestion": "string",
      "before": "code before change",
      "after": "code after change",
      "line": 0,
      "severity": "info|warning|critical"
    }
  ],
  "summary": "one-line summary of findings",
  "confidence": 0-100,
  "tokensUsed": 0
}
\`\`\``,
});

// ─── Token Budget Management ───
const estimateTokens = (text) => Math.ceil((text || '').length / 4);

export const build{Feature}PromptWithBudget = (params, maxTokens = 8000) => {
  let prompt = build{Feature}Prompt(params);
  let total = estimateTokens(prompt.system) + estimateTokens(prompt.user);

  // Phase 1: Truncate code if over budget
  if (total > maxTokens && params.code && params.code.length > 2000) {
    const lines = params.code.split('\n');
    const head = lines.slice(0, 50).join('\n');
    const tail = lines.slice(-50).join('\n');
    params.code = `${head}\n\n// ... (${lines.length - 100} lines truncated for token budget) ...\n\n${tail}`;
    prompt = build{Feature}Prompt(params);
    total = estimateTokens(prompt.system) + estimateTokens(prompt.user);
  }

  // Phase 2: Reduce decision history
  if (total > maxTokens && params.decisionHistory?.length > 5) {
    params.decisionHistory = params.decisionHistory.slice(-5);
    prompt = build{Feature}Prompt(params);
  }

  // Phase 3: Remove project structure context
  if (total > maxTokens && params.context?.projectStructure) {
    params.context = { ...params.context, projectStructure: null };
    prompt = build{Feature}Prompt(params);
  }

  return prompt;
};
```

### Step 2 — Test the prompt output
Create a quick test to verify the prompt generates valid content:

```javascript
// Quick validation
const prompt = build{Feature}Prompt({
  code: 'const x = 1;',
  language: 'javascript',
  context: { filePath: 'test.js' },
  decisionHistory: [{ type: 'refactor', summary: 'Prefer const over let' }],
  projectRules: ['Use ES modules'],
});
console.log('System tokens:', estimateTokens(prompt.system));
console.log('User tokens:', estimateTokens(prompt.user));
```

## Rules
- ✅ Always request JSON output for structured responses
- ✅ Always include Decision Memory context (even if empty)
- ✅ Keep static prompt content under 4000 tokens
- ✅ Include token budget management with graceful degradation
- ✅ System prompt: role + constraints + format rules
- ✅ User prompt: code + context + instructions + output spec
- ✅ Include confidence score (0-100) in output format
- ✅ Export both `build{Feature}Prompt` and `build{Feature}PromptWithBudget`
