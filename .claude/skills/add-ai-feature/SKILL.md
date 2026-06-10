---
name: add-ai-feature
description: Creates a complete AI-powered feature pipeline for CodeNexus — prompt template, backend endpoint with SSE streaming, React hook, UI component, and Decision Memory integration. Use this for any new AI capability.
user-invocable: true
---

# Add AI Feature

You are adding a new AI-powered feature to **CodeNexus**.

## Input Required
The user will provide:
- **Feature name** (e.g., `Intent Mode`, `Code Review`, `Smart Chat`)
- **What context the AI needs** (current file, selection, project structure, decision history)
- **Expected AI output format** (structured JSON, free text, diff patches)

## Steps

### Step 1 — Create the prompt template
**Path:** `server/src/prompts/{feature}.prompts.js`

```javascript
export const build{Feature}Prompt = ({ code, language, context, decisionHistory, projectRules }) => ({
  system: `You are an expert ${language} developer specializing in [FEATURE_SPECIALTY].
You are working within CodeNexus, an AI code editor.

Rules:
- Analyze the provided code carefully before responding
- Consider the user's past decisions and coding patterns
- Respond ONLY with valid JSON matching the specified format
- Be specific and actionable in your suggestions`,

  user: `## Code to Analyze
\`\`\`${language}
${code}
\`\`\`

## Project Context
${context ? `- Current file: ${context.filePath}` : ''}
${context?.selection ? `- Selected lines: ${context.selection.startLine}-${context.selection.endLine}` : ''}

## User's Past Decisions (follow these patterns)
${JSON.stringify(decisionHistory?.slice(-10) || [], null, 2)}

## Project Rules
${JSON.stringify(projectRules || [], null, 2)}

## Instructions
[SPECIFIC STEP-BY-STEP INSTRUCTIONS FOR THIS FEATURE]

## Response Format
Respond ONLY with valid JSON:
{
  "result": [...],
  "summary": "one-line summary of what was found/done",
  "confidence": 0-100
}`,
});
```

Requirements:
- System prompt defines the AI's role and constraints
- User prompt provides code, context, and instructions
- Always include Decision Memory context (last 10 decisions)
- Always request JSON output for structured data
- Keep static content under 4000 tokens (leave room for user code)

### Step 2 — Add token budget management
```javascript
const estimateTokens = (text) => Math.ceil(text.length / 4);

export const buildPromptWithBudget = (params, maxTokens = 8000) => {
  let prompt = build{Feature}Prompt(params);
  let totalTokens = estimateTokens(prompt.system + prompt.user);

  // Truncate code if over budget
  if (totalTokens > maxTokens && params.code.length > 2000) {
    const lines = params.code.split('\n');
    params.code = [...lines.slice(0, 50), '// ... truncated ...', ...lines.slice(-50)].join('\n');
    prompt = build{Feature}Prompt(params);
  }

  // Reduce decision history if still over
  if (estimateTokens(prompt.system + prompt.user) > maxTokens) {
    params.decisionHistory = params.decisionHistory?.slice(-5);
    prompt = build{Feature}Prompt(params);
  }

  return prompt;
};
```

### Step 3 — Create the backend endpoint
**Path:** `server/src/controllers/ai.controller.js` (add new handler)

```javascript
export const handle{Feature} = async (req, res, next) => {
  try {
    const { code, language, context } = req.body;

    // Fetch decision history
    const decisions = await Decision.find({ projectId: req.body.projectId })
      .sort('-createdAt').limit(10).lean();

    // Build prompt
    const prompt = buildPromptWithBudget({
      code, language, context,
      decisionHistory: decisions,
      projectRules: [],
    });

    // Set SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    // Stream response
    const stream = await aiService.streamCompletion(prompt);
    for await (const chunk of stream) {
      res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
    }
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    next(error);
  }
};
```

### Step 4 — Add the API route
**Path:** `server/src/routes/ai.routes.js`

```javascript
router.post('/{feature}', authenticate, rateLimiter, controller.handle{Feature});
```

### Step 5 — Create the frontend React hook
**Path:** `client/src/hooks/use{Feature}.js`

```javascript
import { useState, useCallback } from 'react';
import { stream{Feature} } from '../services/aiService.js';
import useAIStore from '../stores/aiStore.js';

const use{Feature} = () => {
  const [result, setResult] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);
  const setLastResponse = useAIStore(s => s.setLastResponse);

  const execute = useCallback(async (params) => {
    setIsStreaming(true);
    setError(null);
    setResult(null);

    try {
      let fullResponse = '';
      await stream{Feature}(params, (chunk) => {
        fullResponse += chunk;
        setResult(fullResponse);
      });
      setLastResponse(fullResponse);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsStreaming(false);
    }
  }, [setLastResponse]);

  const cancel = useCallback(() => {
    // abort controller logic
    setIsStreaming(false);
  }, []);

  return { result, isStreaming, error, execute, cancel };
};

export default use{Feature};
```

### Step 6 — Update the frontend AI service
**Path:** `client/src/services/aiService.js`

```javascript
export const stream{Feature} = async (params, onChunk) => {
  const response = await fetch('/api/v1/ai/{feature}', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    const text = decoder.decode(value);
    const lines = text.split('\n').filter(l => l.startsWith('data: '));
    for (const line of lines) {
      const data = line.slice(6);
      if (data === '[DONE]') return;
      onChunk(JSON.parse(data).chunk);
    }
  }
};
```

### Step 7 — Create the UI component
Use the `/build-component` skill to create the panel component for this feature.

### Step 8 — Integrate with Decision Memory
When the user **accepts** the AI output:
```javascript
await fetch('/api/v1/decisions', {
  method: 'POST',
  body: JSON.stringify({
    type: '{feature}',
    projectId,
    context: { filePath, language },
    before: originalCode,
    after: modifiedCode,
    aiSuggestion: result,
  }),
});
```

## Rules
- ✅ ALL AI calls go through the backend — NEVER call OpenAI from the frontend
- ✅ Use SSE (`text/event-stream`) for streaming responses
- ✅ Always include Decision Memory context in prompts
- ✅ Handle four UI states: idle, streaming, success, error
- ✅ Provide a cancel button for long-running AI operations
- ✅ Record accepted suggestions in Decision Memory
- ✅ Token budget management — truncate context if over limit
