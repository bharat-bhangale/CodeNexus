import { Request, Response, NextFunction } from 'express';
import { ChatHistoryModel } from '../models/ChatHistory.js';
import { buildChatPrompt, getSlashCommands } from '../services/PromptBuilder.js';
import { logger } from '../utils/logger.js';

// ─── POST /chat — Stream SSE response ───
export async function chat(req: Request, res: Response, _next: NextFunction) {
  try {
    const { message, context = {}, command } = req.body as {
      message: string;
      context?: Record<string, any>;
      command?: string;
    };

    if (!message?.trim()) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'message is required' },
      });
    }

    const projectId = (context.projectId as string) || 'default';

    // Find or create chat history
    let history = await ChatHistoryModel.findOne({ projectId }).sort({ createdAt: -1 });
    if (!history) {
      history = new ChatHistoryModel({ projectId, messages: [] });
    }

    // Save user message
    const userMsgId = new (await import('mongoose')).default.Types.ObjectId().toString();
    history.messages.push({
      id: userMsgId,
      role: 'user',
      content: message,
      context: {
        activeFile: context.activeFile,
        selectedText: context.selectedText,
        cursorPosition: context.cursorPosition,
        openFiles: context.openFiles,
      },
      timestamp: new Date(),
    } as any);
    history.lastMessageAt = new Date();
    history.messageCount = history.messages.length;
    await history.save();

    // Build prompt
    const { systemPrompt, userPrompt } = await buildChatPrompt(message, context, command);

    // Build conversation history for context (last 20 messages)
    const recentMessages = history.messages.slice(-20).map((m) => ({
      role: m.role as 'user' | 'assistant' | 'system',
      content: m.content,
    }));
    // Replace the last user message with the enhanced prompt
    if (recentMessages.length > 0) {
      recentMessages[recentMessages.length - 1].content = userPrompt;
    }

    // Set up SSE
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    });
    res.flushHeaders();

    const startTime = Date.now();
    let fullResponse = '';

    // Check if Gemini is configured with a real key (not a placeholder)
    const apiKey = process.env.GEMINI_API_KEY;
    const hasValidKey = apiKey && apiKey.length > 20 && !apiKey.includes('your') && !apiKey.includes('here');

    if (hasValidKey) {
      // Real Gemini streaming
      try {
        const { GoogleGenAI } = await import('@google/genai');
        const ai = new GoogleGenAI({ apiKey });

        const contents = recentMessages.map((msg: any) => ({
          role: msg.role === 'assistant' || msg.role === 'model' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        }));

        const stream = await ai.models.generateContentStream({
          model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
          contents,
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.3,
          },
        });

        for await (const chunk of stream) {
          const content = chunk.text() || '';
          if (content) {
            fullResponse += content;
            res.write(`data: ${JSON.stringify({ content, done: false })}\n\n`);
          }
        }
      } catch (aiErr: any) {
        logger.error(`Gemini error: ${aiErr.message}`);
        const errorMsg = `I encountered an error: ${aiErr.message}. Please check your API key.`;
        fullResponse = errorMsg;
        res.write(`data: ${JSON.stringify({ content: errorMsg, done: false })}\n\n`);
      }
    } else {
      // Mock streaming response for development
      fullResponse = await mockStreamResponse(message, command, context, res);
    }

    const latency = Date.now() - startTime;

    // Extract code blocks from response
    const codeBlocks = extractCodeBlocks(fullResponse);

    // Save assistant message
    const assistantMsgId = new (await import('mongoose')).default.Types.ObjectId().toString();
    history.messages.push({
      id: assistantMsgId,
      role: 'assistant',
      content: fullResponse,
      metadata: {
        model: hasValidKey ? (process.env.GEMINI_MODEL || 'gemini-2.5-flash') : 'mock',
        latency,
        command: command || undefined,
        codeBlocks: codeBlocks.map((cb) => ({
          language: cb.language,
          code: cb.code,
          applied: false,
        })),
      },
      timestamp: new Date(),
    } as any);
    history.lastMessageAt = new Date();
    history.messageCount = history.messages.length;
    await history.save();

    // Send done event
    res.write(
      `data: ${JSON.stringify({
        content: '',
        done: true,
        messageId: assistantMsgId,
        latency,
      })}\n\n`
    );
    res.end();

    logger.info(`Chat response streamed (${latency}ms, ${fullResponse.length} chars)`);
  } catch (err: any) {
    logger.error(`Chat error: ${err.message}`);
    // If headers already sent, end the stream
    if (res.headersSent) {
      res.write(`data: ${JSON.stringify({ content: `\n\nError: ${err.message}`, done: true })}\n\n`);
      res.end();
    } else {
      res.status(500).json({
        success: false,
        error: { code: 'CHAT_ERROR', message: err.message },
      });
    }
  }
}

// ─── GET /chat/history — Load chat history ───
export async function getHistory(req: Request, res: Response, next: NextFunction) {
  try {
    const projectId = (req.query.projectId as string) || 'default';
    const history = await ChatHistoryModel.findOne({ projectId }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: history ? history.messages : [],
    });
  } catch (err) {
    next(err);
  }
}

// ─── DELETE /chat/history — Clear chat history ───
export async function clearHistory(req: Request, res: Response, next: NextFunction) {
  try {
    const projectId = (req.query.projectId as string) || 'default';
    await ChatHistoryModel.deleteMany({ projectId });

    res.json({ success: true, data: { cleared: true } });
  } catch (err) {
    next(err);
  }
}

// ─── GET /chat/commands — List slash commands ───
export function listCommands(_req: Request, res: Response) {
  res.json({ success: true, data: getSlashCommands() });
}

// ─── Helpers ───

async function mockStreamResponse(
  message: string,
  command: string | undefined,
  context: Record<string, any>,
  res: Response
): Promise<string> {
  const fileName = context.activeFile?.name || 'your file';
  const lang = context.activeFile?.language || 'javascript';

  let response: string;

  if (command === '/explain') {
    response = `## Code Explanation\n\nLet me break down the code in **${fileName}**:\n\n1. **Structure**: This file defines the core logic for the application.\n2. **Key Functions**: The main functions handle data processing and state management.\n3. **Dependencies**: It imports from several modules to compose its functionality.\n\n> This is a well-structured file that follows separation of concerns.\n\nWould you like me to dive deeper into any specific part?`;
  } else if (command === '/refactor') {
    response = `## Refactored Code\n\nHere's an improved version of the selected code:\n\n\`\`\`${lang}\n// Refactored: extracted helper function\nfunction processData(input: unknown): Result {\n  if (!input) {\n    throw new Error('Input is required');\n  }\n  \n  const validated = validateInput(input);\n  return transformData(validated);\n}\n\`\`\`\n\n### Changes Made\n- ✅ Extracted validation into a separate function\n- ✅ Added input validation with descriptive error\n- ✅ Improved type safety\n- ✅ Follows single responsibility principle`;
  } else if (command === '/test') {
    response = `## Unit Tests\n\n\`\`\`typescript\nimport { describe, it, expect, vi } from 'vitest';\nimport { processData } from './module';\n\ndescribe('processData', () => {\n  it('should process valid input', () => {\n    const result = processData({ name: 'test' });\n    expect(result).toBeDefined();\n    expect(result.status).toBe('success');\n  });\n\n  it('should throw on null input', () => {\n    expect(() => processData(null)).toThrow('Input is required');\n  });\n\n  it('should handle edge cases', () => {\n    const result = processData({ name: '' });\n    expect(result.status).toBe('warning');\n  });\n});\n\`\`\`\n\nThese tests cover the happy path, error cases, and edge cases.`;
  } else if (command === '/doc') {
    response = `## Documentation\n\n\`\`\`typescript\n/**\n * Processes and transforms the input data through the pipeline.\n *\n * @param input - The raw input data to process\n * @returns The transformed result object\n * @throws {Error} When input is null or undefined\n *\n * @example\n * const result = processData({ name: 'example' });\n * console.log(result.status); // 'success'\n */\n\`\`\``;
  } else if (command === '/debug') {
    response = `## Debug Analysis\n\n🔍 **Potential issues found:**\n\n1. **Missing null check** (Line ~15)\n   - The function doesn't validate input before processing\n   - Fix: Add early return or throw\n\n2. **Possible race condition** (Line ~32)\n   - Concurrent calls could corrupt shared state\n   - Fix: Use a mutex or queue\n\n\`\`\`${lang}\n// Fixed version\nif (!data) {\n  return { error: 'No data provided' };\n}\n\`\`\``;
  } else if (command === '/perf') {
    response = `## Performance Analysis\n\n⚡ **Issues found:**\n\n1. **O(n²) nested loop** — Consider using a Map/Set for O(n) lookup\n2. **Missing memoization** — This computation is repeated on every render\n3. **Large bundle impact** — The imported library adds 45kb\n\n\`\`\`${lang}\n// Optimized: O(n) with Map lookup\nconst lookup = new Map(items.map(i => [i.id, i]));\nconst result = ids.map(id => lookup.get(id));\n\`\`\``;
  } else if (command === '/security') {
    response = `## Security Review\n\n🔒 **Vulnerabilities found:**\n\n1. **XSS Risk** — User input rendered without sanitization\n2. **Missing input validation** — No schema validation on API input\n\n\`\`\`${lang}\n// Secure version\nconst sanitized = DOMPurify.sanitize(userInput);\n\`\`\``;
  } else {
    response = `I understand you're asking about **${fileName}**.\n\n${message}\n\nHere's what I can help with:\n\n\`\`\`${lang}\n// Example code suggestion\nconst result = await fetchData();\nconsole.log(result);\n\`\`\`\n\nYou can use slash commands for specific tasks:\n- \`/explain\` — Break down code\n- \`/refactor\` — Improve code quality\n- \`/test\` — Generate tests\n- \`/doc\` — Add documentation\n\nWould you like me to do something specific?`;
  }

  // Stream the mock response word by word
  const words = response.split(/(\s+)/);
  for (let i = 0; i < words.length; i++) {
    const chunk = words[i];
    res.write(`data: ${JSON.stringify({ content: chunk, done: false })}\n\n`);
    // Small delay for realistic streaming effect
    await new Promise((r) => setTimeout(r, 15));
  }

  return response;
}

function extractCodeBlocks(text: string): { language: string; code: string }[] {
  const blocks: { language: string; code: string }[] = [];
  const regex = /```(\w*)\n([\s\S]*?)```/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    blocks.push({
      language: match[1] || 'plaintext',
      code: match[2].trim(),
    });
  }
  return blocks;
}
