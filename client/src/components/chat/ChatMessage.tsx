'use client';

import { useCallback, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { ChatMessage as ChatMessageType } from '@/stores/chatStore';
import { useEditorStore } from '@/stores/editorStore';
import { createDecision } from '@/services/memoryApi';
import { Copy, CheckCheck, Play, User, Bot } from 'lucide-react';
import { useState } from 'react';

interface ChatMessageProps {
  message: ChatMessageType;
  isStreaming: boolean;
}

export default function ChatMessage({ message, isStreaming }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`chat-msg ${isUser ? 'chat-msg-user' : 'chat-msg-ai'}`}>
      <div className="chat-msg-avatar">
        {isUser ? <User size={14} /> : <Bot size={14} />}
      </div>
      <div className={`chat-msg-bubble ${isUser ? 'chat-bubble-user' : 'chat-bubble-ai'}`}>
        {isUser ? (
          <p className="chat-msg-text">{message.content}</p>
        ) : (
          <div className="chat-msg-markdown">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code: ({ className, children, ...props }) => {
                  const match = /language-(\w+)/.exec(className || '');
                  const codeString = String(children).replace(/\n$/, '');
                  if (match) {
                    return (
                      <CodeBlock
                        code={codeString}
                        language={match[1]}
                      />
                    );
                  }
                  return (
                    <code className="chat-inline-code" {...props}>
                      {children}
                    </code>
                  );
                },
                pre: ({ children }) => <>{children}</>,
              }}
            >
              {message.content}
            </ReactMarkdown>
            {isStreaming && <span className="chat-streaming-cursor" />}
          </div>
        )}
        {message.metadata?.latency && (
          <span className="chat-msg-latency">{message.metadata.latency}ms</span>
        )}
      </div>
    </div>
  );
}

function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);
  const [applied, setApplied] = useState(false);
  const activeFile = useEditorStore((s) => s.getActiveFile());
  const updateFileContent = useEditorStore((s) => s.updateFileContent);
  const selection = useEditorStore((s) => s.selection);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  const handleApply = useCallback(async () => {
    if (!activeFile) return;

    // Apply code to editor
    const content = activeFile.content;
    let newContent: string;

    if (selection && selection.startLineNumber !== selection.endLineNumber ||
        selection && selection.startColumn !== selection.endColumn) {
      // Replace selection
      const lines = content.split('\n');
      const before = lines.slice(0, selection!.startLineNumber - 1).join('\n');
      const startLinePrefix = lines[selection!.startLineNumber - 1]?.slice(0, selection!.startColumn - 1) || '';
      const endLineSuffix = lines[selection!.endLineNumber - 1]?.slice(selection!.endColumn - 1) || '';
      const after = lines.slice(selection!.endLineNumber).join('\n');
      newContent = before + (before ? '\n' : '') + startLinePrefix + code + endLineSuffix + (after ? '\n' + after : '');
    } else {
      // Insert at cursor (append at end as fallback)
      newContent = content + '\n' + code;
    }

    updateFileContent(activeFile.id, newContent);

    // Record decision in Decision Memory
    try {
      await createDecision({
        title: `Applied code from chat`,
        description: `Applied a ${language} code block to ${activeFile.name}`,
        type: 'chat_apply',
        tags: ['chat', language],
        codeContext: {
          filePath: activeFile.path,
          fileName: activeFile.name,
          language: activeFile.language,
          afterCode: code,
        },
        affectedFiles: [{ path: activeFile.path, name: activeFile.name }],
      });
    } catch {
      // Decision recording failed silently
    }

    setApplied(true);
    setTimeout(() => setApplied(false), 3000);
  }, [code, language, activeFile, selection, updateFileContent]);

  return (
    <div className="chat-code-block">
      <div className="chat-code-header">
        <span className="chat-code-lang">{language}</span>
        <div className="chat-code-actions">
          <button
            className="chat-code-btn"
            onClick={handleCopy}
            title="Copy code"
          >
            {copied ? <CheckCheck size={12} /> : <Copy size={12} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button
            className={`chat-code-btn chat-code-btn-apply ${applied ? 'chat-code-btn-applied' : ''}`}
            onClick={handleApply}
            title="Apply to editor"
          >
            <Play size={12} />
            <span>{applied ? `Applied to ${activeFile?.name || 'file'}` : 'Apply'}</span>
          </button>
        </div>
      </div>
      <pre className="chat-code-content">
        <code>{code}</code>
      </pre>
    </div>
  );
}
