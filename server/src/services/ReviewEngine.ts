import { logger } from '../utils/logger.js';
import type { IReviewIssue, IReviewSummary, IssueSeverity, IssueCategory } from '../models/ReviewResult.js';
import mongoose from 'mongoose';

export interface ReviewRequest {
  code: string;
  language: string;
  filePath: string;
  categories?: IssueCategory[];
  dismissedPatterns?: string[];
  projectRules?: string[];
}

export interface ReviewResponse {
  issues: IReviewIssue[];
  summary: IReviewSummary;
  model: string;
  latency: number;
}

export interface FixRequest {
  code: string;
  language: string;
  issue: {
    title: string;
    description: string;
    lineStart: number;
    lineEnd: number;
    codeSnippet?: string;
    category: string;
  };
}

export interface FixResponse {
  fixedCode: string;
  explanation: string;
}

// ─── Review Code ───
export async function reviewCode(req: ReviewRequest): Promise<ReviewResponse> {
  const startTime = Date.now();

  const apiKey = process.env.GEMINI_API_KEY;
  const hasValidKey =
    apiKey && apiKey.length > 20 && !apiKey.includes('your') && !apiKey.includes('here');

  let issues: IReviewIssue[];
  let model: string;

  if (hasValidKey) {
    try {
      const result = await callGeminiReview(req, apiKey!);
      issues = result.issues;
      model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    } catch (err: any) {
      logger.error(`Gemini review error: ${err.message}`);
      issues = getMockReviewResults(req.code, req.language);
      model = 'mock';
    }
  } else {
    issues = getMockReviewResults(req.code, req.language);
    model = 'mock';
  }

  // Filter out dismissed patterns
  if (req.dismissedPatterns && req.dismissedPatterns.length > 0) {
    issues = issues.filter((i) => !req.dismissedPatterns!.includes(i.title));
  }

  const summary = buildSummary(issues);
  const latency = Date.now() - startTime;

  logger.info(`Review completed: ${issues.length} issues found in ${latency}ms (${model})`);

  return { issues, summary, model, latency };
}

// ─── Generate Fix ───
export async function generateFix(req: FixRequest): Promise<FixResponse> {
  const apiKey = process.env.GEMINI_API_KEY;
  const hasValidKey =
    apiKey && apiKey.length > 20 && !apiKey.includes('your') && !apiKey.includes('here');

  if (hasValidKey) {
    try {
      return await callGeminiFix(req, apiKey!);
    } catch (err: any) {
      logger.error(`Gemini fix error: ${err.message}`);
      return getMockFix(req);
    }
  }

  return getMockFix(req);
}

// ─── Gemini Calls ───

async function callGeminiReview(
  req: ReviewRequest,
  apiKey: string
): Promise<{ issues: IReviewIssue[] }> {
  const { GoogleGenAI, Type } = await import('@google/genai');
  const ai = new GoogleGenAI({ apiKey });

  const systemInstruction = `You are a senior code reviewer. Analyze the code for issues in these categories: bugs, security vulnerabilities, performance problems, style issues, accessibility concerns, and best-practice violations.

Return a JSON array of issues.
${req.projectRules?.length ? `\nProject rules to follow:\n${req.projectRules.map((r) => `- ${r}`).join('\n')}` : ''}`;

  const userPrompt = `Review this ${req.language} code from "${req.filePath}":\n\n\`\`\`${req.language}\n${req.code}\n\`\`\``;

  const response = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    contents: userPrompt,
    config: {
      systemInstruction,
      temperature: 0.2,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          issues: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                severity: { type: Type.STRING },
                category: { type: Type.STRING },
                lineStart: { type: Type.INTEGER },
                lineEnd: { type: Type.INTEGER },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                codeSnippet: { type: Type.STRING },
                suggestedFix: { type: Type.STRING },
                fixExplanation: { type: Type.STRING }
              },
              required: ["severity", "category", "lineStart", "lineEnd", "title", "description"]
            }
          }
        }
      }
    }
  });

  const content = response.text() || '{"issues":[]}';
  const parsed = JSON.parse(content);
  const rawIssues = Array.isArray(parsed) ? parsed : parsed.issues || [];

  return {
    issues: rawIssues.map((i: any) => ({
      id: new mongoose.Types.ObjectId().toString(),
      severity: i.severity || 'info',
      category: i.category || 'style',
      lineStart: i.lineStart || 1,
      lineEnd: i.lineEnd || i.lineStart || 1,
      title: i.title || 'Unnamed issue',
      description: i.description || '',
      codeSnippet: i.codeSnippet,
      suggestedFix: i.suggestedFix,
      fixExplanation: i.fixExplanation,
      status: 'open' as const,
      dismissCount: 0,
    })),
  };
}

async function callGeminiFix(req: FixRequest, apiKey: string): Promise<FixResponse> {
  const { GoogleGenAI, Type } = await import('@google/genai');
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `Fix this issue in the ${req.language} code:

Issue: ${req.issue.title}
Description: ${req.issue.description}
Category: ${req.issue.category}
Lines ${req.issue.lineStart}-${req.issue.lineEnd}
${req.issue.codeSnippet ? `Problematic code:\n\`\`\`\n${req.issue.codeSnippet}\n\`\`\`` : ''}

Full file:
\`\`\`${req.language}
${req.code}
\`\`\``;

  const response = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    contents: prompt,
    config: {
      temperature: 0.1,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          fixedCode: { type: Type.STRING, description: "the entire file with the fix applied" },
          explanation: { type: Type.STRING, description: "brief explanation of the changes" }
        },
        required: ["fixedCode", "explanation"]
      }
    }
  });

  const content = response.text() || '{}';
  const parsed = JSON.parse(content);
  return {
    fixedCode: parsed.fixedCode || req.code,
    explanation: parsed.explanation || 'Fix applied.',
  };
}

// ─── Mock Results ───

function getMockReviewResults(code: string, language: string): IReviewIssue[] {
  const lines = code.split('\n');
  const issues: IReviewIssue[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    // console.log detection
    if (/console\.(log|debug|warn)\s*\(/.test(line)) {
      issues.push(makeIssue({
        severity: 'warning',
        category: 'style',
        lineStart: lineNum,
        lineEnd: lineNum,
        title: 'Console statement left in code',
        description: 'Console statements should be removed or replaced with a proper logging utility before deployment.',
        codeSnippet: line.trim(),
        suggestedFix: `// ${line.trim()} // TODO: Remove or replace with logger`,
        fixExplanation: 'Replace console.log with a structured logger or remove debug statements.',
      }));
    }

    // eval() detection
    if (/\beval\s*\(/.test(line)) {
      issues.push(makeIssue({
        severity: 'critical',
        category: 'security',
        lineStart: lineNum,
        lineEnd: lineNum,
        title: 'Use of eval() is a security risk',
        description: 'eval() executes arbitrary code and is a common vector for code injection attacks. Use safer alternatives like JSON.parse() or Function constructors.',
        codeSnippet: line.trim(),
        suggestedFix: line.replace(/eval\s*\(/, 'JSON.parse('),
        fixExplanation: 'eval() should be avoided entirely. If parsing JSON, use JSON.parse(). For other cases, use specific parsers.',
      }));
    }

    // innerHTML detection
    if (/\.innerHTML\s*=/.test(line)) {
      issues.push(makeIssue({
        severity: 'critical',
        category: 'security',
        lineStart: lineNum,
        lineEnd: lineNum,
        title: 'innerHTML assignment — XSS vulnerability',
        description: 'Setting innerHTML with user-controlled data can lead to Cross-Site Scripting (XSS) attacks. Use textContent or a sanitization library.',
        codeSnippet: line.trim(),
        suggestedFix: line.replace('.innerHTML', '.textContent'),
        fixExplanation: 'textContent sets plain text safely without parsing HTML, preventing XSS attacks.',
      }));
    }

    // Empty catch blocks
    if (/catch\s*\([^)]*\)\s*\{\s*\}/.test(line) || (/catch\s*\(/.test(line) && i + 1 < lines.length && lines[i + 1].trim() === '}')) {
      issues.push(makeIssue({
        severity: 'warning',
        category: 'bug',
        lineStart: lineNum,
        lineEnd: lineNum + 1,
        title: 'Empty catch block swallows errors',
        description: 'Silently catching errors makes debugging very difficult. At minimum, log the error or re-throw it.',
        codeSnippet: line.trim(),
        suggestedFix: `catch (err) {\n  console.error('Unexpected error:', err);\n}`,
        fixExplanation: 'Always handle or log caught errors so failures are visible during debugging.',
      }));
    }

    // var usage
    if (/\bvar\s+\w/.test(line)) {
      issues.push(makeIssue({
        severity: 'info',
        category: 'best-practice',
        lineStart: lineNum,
        lineEnd: lineNum,
        title: 'Use const or let instead of var',
        description: 'var has function-scoping and hoisting behaviors that lead to subtle bugs. Use const for values that don\'t change and let for mutable bindings.',
        codeSnippet: line.trim(),
        suggestedFix: line.replace(/\bvar\s+/, 'const '),
        fixExplanation: 'const/let have block scoping and prevent accidental redeclaration.',
      }));
    }

    // == instead of ===
    if (/[^!=]==(?!=)/.test(line) && !/===/.test(line)) {
      issues.push(makeIssue({
        severity: 'warning',
        category: 'bug',
        lineStart: lineNum,
        lineEnd: lineNum,
        title: 'Use strict equality (===) instead of (==)',
        description: 'Loose equality (==) performs type coercion which can produce unexpected results. Always use strict equality (===) for predictable comparisons.',
        codeSnippet: line.trim(),
        suggestedFix: line.replace(/([^!=])==(?!=)/g, '$1==='),
        fixExplanation: 'Strict equality avoids implicit type coercion bugs.',
      }));
    }

    // TODO comments
    if (/\/\/\s*TODO/i.test(line)) {
      issues.push(makeIssue({
        severity: 'info',
        category: 'style',
        lineStart: lineNum,
        lineEnd: lineNum,
        title: 'Unresolved TODO comment',
        description: 'TODO comments indicate unfinished work. Consider addressing or tracking this in your issue tracker.',
        codeSnippet: line.trim(),
      }));
    }

    // Large function (heuristic: function with > 30 lines to its closing brace)
    if (/^(export\s+)?(async\s+)?function\s+\w+/.test(line.trim()) || /=>\s*\{/.test(line)) {
      let braceCount = 0;
      let funcEnd = i;
      for (let j = i; j < lines.length && j < i + 80; j++) {
        for (const ch of lines[j]) {
          if (ch === '{') braceCount++;
          if (ch === '}') braceCount--;
        }
        if (braceCount === 0 && j > i) {
          funcEnd = j;
          break;
        }
      }
      if (funcEnd - i > 40) {
        issues.push(makeIssue({
          severity: 'info',
          category: 'performance',
          lineStart: lineNum,
          lineEnd: funcEnd + 1,
          title: 'Function is too long — consider splitting',
          description: `This function spans ${funcEnd - i + 1} lines. Long functions are harder to test and maintain. Consider extracting logical sections into helper functions.`,
          codeSnippet: line.trim(),
        }));
      }
    }
  }

  // If no issues found, add a generic style note
  if (issues.length === 0) {
    issues.push(makeIssue({
      severity: 'info',
      category: 'style',
      lineStart: 1,
      lineEnd: 1,
      title: 'Consider adding JSDoc documentation',
      description: 'This file could benefit from JSDoc/TSDoc documentation on exported functions and classes for better IDE support and documentation generation.',
    }));
  }

  return issues;
}

function makeIssue(data: Partial<IReviewIssue> & { severity: IssueSeverity; category: IssueCategory; lineStart: number; lineEnd: number; title: string; description: string }): IReviewIssue {
  return {
    id: new mongoose.Types.ObjectId().toString(),
    severity: data.severity,
    category: data.category,
    lineStart: data.lineStart,
    lineEnd: data.lineEnd,
    columnStart: data.columnStart,
    columnEnd: data.columnEnd,
    title: data.title,
    description: data.description,
    codeSnippet: data.codeSnippet,
    suggestedFix: data.suggestedFix,
    fixExplanation: data.fixExplanation,
    status: 'open',
    dismissCount: 0,
  };
}

function getMockFix(req: FixRequest): FixResponse {
  const lines = req.code.split('\n');
  const start = req.issue.lineStart - 1;
  const end = req.issue.lineEnd;

  // Simple fix: comment out the problematic lines and add a note
  const fixed = [...lines];
  if (req.issue.codeSnippet && req.issue.category === 'security') {
    for (let i = start; i < end && i < fixed.length; i++) {
      if (fixed[i].includes('eval(')) {
        fixed[i] = fixed[i].replace(/eval\s*\(/, 'JSON.parse(');
      } else if (fixed[i].includes('.innerHTML')) {
        fixed[i] = fixed[i].replace('.innerHTML', '.textContent');
      }
    }
  } else if (req.issue.category === 'style' && /console\.(log|debug)/.test(req.issue.codeSnippet || '')) {
    for (let i = start; i < end && i < fixed.length; i++) {
      if (/console\.(log|debug)/.test(fixed[i])) {
        fixed[i] = `// ${fixed[i].trim()} // Removed: use logger instead`;
      }
    }
  } else if (/\bvar\b/.test(req.issue.codeSnippet || '')) {
    for (let i = start; i < end && i < fixed.length; i++) {
      fixed[i] = fixed[i].replace(/\bvar\s+/, 'const ');
    }
  }

  return {
    fixedCode: fixed.join('\n'),
    explanation: `Fixed "${req.issue.title}" on lines ${req.issue.lineStart}-${req.issue.lineEnd}. ${req.issue.category === 'security' ? 'Replaced insecure API with a safe alternative.' : 'Applied recommended best practice.'}`,
  };
}

function buildSummary(issues: IReviewIssue[]): IReviewSummary {
  return {
    totalIssues: issues.length,
    criticalCount: issues.filter((i) => i.severity === 'critical').length,
    warningCount: issues.filter((i) => i.severity === 'warning').length,
    infoCount: issues.filter((i) => i.severity === 'info').length,
    fixedCount: issues.filter((i) => i.status === 'fixed').length,
    dismissedCount: issues.filter((i) => i.status === 'dismissed').length,
  };
}
