'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useChatStore } from '@/stores/chatStore';
import { useEditorStore } from '@/stores/editorStore';
import { sendChatMessage, fetchChatHistory, clearChatHistory } from '@/services/chatApi';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { MessageSquare, Trash2, FileCode2, Loader2 } from 'lucide-react';

export default function ChatPanel() {
  const messages = useChatStore((s) => s.messages);
  const isStreaming = useChatStore((s) => s.isStreaming);
  const streamingMessageId = useChatStore((s) => s.streamingMessageId);
  const addUserMessage = useChatStore((s) => s.addUserMessage);
  const startStreaming = useChatStore((s) => s.startStreaming);
  const appendStreamChunk = useChatStore((s) => s.appendStreamChunk);
  const finalizeStream = useChatStore((s) => s.finalizeStream);
  const setMessages = useChatStore((s) => s.setMessages);
  const clearMessages = useChatStore((s) => s.clearMessages);
  const setError = useChatStore((s) => s.setError);

  const activeFile = useEditorStore((s) => s.getActiveFile());
  const cursorPosition = useEditorStore((s) => s.cursorPosition);
  const selection = useEditorStore((s) => s.selection);
  const openFiles = useEditorStore((s) => s.openFiles);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  // Load history on mount
  useEffect(() => {
    if (historyLoaded) return;
    (async () => {
      try {
        const history = await fetchChatHistory();
        if (history.length > 0) {
          setMessages(history);
        }
      } catch {
        // Silently fail
      }
      setHistoryLoaded(true);
    })();
  }, [historyLoaded, setMessages]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (autoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, autoScroll]);

  // Detect manual scroll
  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 60;
    setAutoScroll(isAtBottom);
  }, []);

  const handleSend = useCallback(
    async (message: string, command?: string) => {
      // Build context
      const context: Record<string, any> = { projectId: 'default' };
      if (activeFile) {
        context.activeFile = {
          path: activeFile.path,
          name: activeFile.name,
          language: activeFile.language,
          content: activeFile.content,
        };
      }
      if (selection) {
        // Extract selected text from active file
        if (activeFile && selection.startLineNumber && selection.endLineNumber) {
          const lines = activeFile.content.split('\n');
          const selectedLines = lines.slice(
            selection.startLineNumber - 1,
            selection.endLineNumber
          );
          if (selectedLines.length > 0) {
            // Trim first and last line to column boundaries
            selectedLines[0] = selectedLines[0].slice(selection.startColumn - 1);
            if (selectedLines.length > 1) {
              selectedLines[selectedLines.length - 1] = selectedLines[selectedLines.length - 1].slice(
                0,
                selection.endColumn - 1
              );
            }
            context.selectedText = selectedLines.join('\n');
          }
        }
      }
      context.cursorPosition = cursorPosition;
      context.openFiles = openFiles.map((f) => f.path);

      // Add user message to store
      const userMsgId = `user_${Date.now()}`;
      addUserMessage({
        id: userMsgId,
        role: 'user',
        content: command ? `${command} ${message}` : message,
        timestamp: new Date().toISOString(),
        command,
        context: {
          activeFile: activeFile
            ? { path: activeFile.path, name: activeFile.name, language: activeFile.language }
            : undefined,
        },
      });

      // Start streaming placeholder
      const streamId = `stream_${Date.now()}`;
      startStreaming(streamId);
      setAutoScroll(true);

      // Send to backend
      await sendChatMessage(
        message,
        context,
        command,
        (chunk) => appendStreamChunk(chunk),
        (messageId, latency) => finalizeStream(messageId, latency),
        (error) => setError(error)
      );
    },
    [
      activeFile,
      selection,
      cursorPosition,
      openFiles,
      addUserMessage,
      startStreaming,
      appendStreamChunk,
      finalizeStream,
      setError,
    ]
  );

  const handleClear = useCallback(async () => {
    clearMessages();
    try {
      await clearChatHistory();
    } catch {
      // Silently fail
    }
  }, [clearMessages]);

  return (
    <div className="chat-panel" id="chat-panel">
      {/* Header */}
      <div className="chat-header">
        <div className="chat-header-title">
          <MessageSquare size={14} />
          <span>AI Chat</span>
        </div>
        <div className="chat-header-actions">
          {activeFile && (
            <span className="chat-context-badge" title={activeFile.path}>
              <FileCode2 size={10} />
              {activeFile.name}
            </span>
          )}
          <button
            className="chat-clear-btn"
            onClick={handleClear}
            title="Clear chat"
            disabled={messages.length === 0}
            aria-label="Clear chat history"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div
        className="chat-messages"
        ref={messagesContainerRef}
        onScroll={handleScroll}
        id="chat-messages-container"
      >
        {messages.length === 0 && (
          <div className="chat-welcome">
            <div className="chat-welcome-icon">
              <MessageSquare size={28} />
            </div>
            <h3 className="chat-welcome-title">CodeNexus AI</h3>
            <p className="chat-welcome-text">
              Ask anything about your code. I know your project.
            </p>
            <div className="chat-welcome-commands">
              <span className="chat-welcome-cmd">/explain</span>
              <span className="chat-welcome-cmd">/refactor</span>
              <span className="chat-welcome-cmd">/test</span>
              <span className="chat-welcome-cmd">/debug</span>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            message={msg}
            isStreaming={isStreaming && msg.id === streamingMessageId}
          />
        ))}

        {isStreaming && messages[messages.length - 1]?.content === '' && (
          <div className="chat-thinking">
            <Loader2 size={14} className="chat-thinking-spinner" />
            <span>Thinking...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput onSend={handleSend} isStreaming={isStreaming} />
    </div>
  );
}
