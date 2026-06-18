'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import type { SlashCommandDef } from '@/services/chatApi';
import { ArrowUp, Slash } from 'lucide-react';

const DEFAULT_COMMANDS: SlashCommandDef[] = [
  { name: '/explain', label: 'Explain', description: 'Explain selected code step by step' },
  { name: '/refactor', label: 'Refactor', description: 'Improve code quality and readability' },
  { name: '/test', label: 'Test', description: 'Generate comprehensive unit tests' },
  { name: '/doc', label: 'Document', description: 'Generate JSDoc/TSDoc documentation' },
  { name: '/debug', label: 'Debug', description: 'Identify bugs and suggest fixes' },
  { name: '/perf', label: 'Performance', description: 'Analyze for performance issues' },
  { name: '/security', label: 'Security', description: 'Review for security vulnerabilities' },
];

interface ChatInputProps {
  onSend: (message: string, command?: string) => void;
  isStreaming: boolean;
}

export default function ChatInput({ onSend, isStreaming }: ChatInputProps) {
  const [value, setValue] = useState('');
  const [showPalette, setShowPalette] = useState(false);
  const [paletteIndex, setPaletteIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const filteredCommands = useMemo(() => {
    if (!showPalette) return [];
    const search = value.slice(1).toLowerCase();
    if (!search) return DEFAULT_COMMANDS;
    return DEFAULT_COMMANDS.filter(
      (c) => c.name.slice(1).startsWith(search) || c.label.toLowerCase().startsWith(search)
    );
  }, [showPalette, value]);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = '44px';
    ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`;
  }, [value]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const v = e.target.value;
    setValue(v);
    if (v.startsWith('/') && !v.includes(' ')) {
      setShowPalette(true);
      setPaletteIndex(0);
    } else {
      setShowPalette(false);
    }
  }, []);

  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || isStreaming) return;

    // Check if message starts with a slash command
    const parts = trimmed.match(/^(\/\w+)\s*([\s\S]*)/);
    if (parts) {
      const cmd = parts[1];
      const msg = parts[2] || `Use ${cmd} on the selected code`;
      onSend(msg, cmd);
    } else {
      onSend(trimmed);
    }
    setValue('');
    setShowPalette(false);
  }, [value, isStreaming, onSend]);

  const handleSelectCommand = useCallback(
    (cmd: SlashCommandDef) => {
      setValue(cmd.name + ' ');
      setShowPalette(false);
      textareaRef.current?.focus();
    },
    []
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (showPalette && filteredCommands.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setPaletteIndex((i) => (i + 1) % filteredCommands.length);
          return;
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          setPaletteIndex((i) => (i - 1 + filteredCommands.length) % filteredCommands.length);
          return;
        }
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleSelectCommand(filteredCommands[paletteIndex]);
          return;
        }
        if (e.key === 'Escape') {
          setShowPalette(false);
          return;
        }
      }

      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [showPalette, filteredCommands, paletteIndex, handleSend, handleSelectCommand]
  );

  return (
    <div className="chat-input-area" id="chat-input-area">
      {showPalette && filteredCommands.length > 0 && (
        <div className="chat-command-palette" id="chat-command-palette">
          {filteredCommands.map((cmd, i) => (
            <button
              key={cmd.name}
              className={`chat-cmd-item ${i === paletteIndex ? 'chat-cmd-item-active' : ''}`}
              onClick={() => handleSelectCommand(cmd)}
              onMouseEnter={() => setPaletteIndex(i)}
            >
              <Slash size={12} className="chat-cmd-icon" />
              <span className="chat-cmd-name">{cmd.name}</span>
              <span className="chat-cmd-desc">{cmd.description}</span>
            </button>
          ))}
        </div>
      )}
      <div className="chat-input-wrapper">
        <textarea
          ref={textareaRef}
          className="chat-input"
          placeholder="Type a message or use /commands..."
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={isStreaming}
          rows={1}
          id="chat-message-input"
          aria-label="Chat message input"
        />
        <button
          className={`chat-send-btn ${value.trim() && !isStreaming ? 'chat-send-btn-active' : ''}`}
          onClick={handleSend}
          disabled={!value.trim() || isStreaming}
          aria-label="Send message"
          id="chat-send-btn"
        >
          <ArrowUp size={16} />
        </button>
      </div>
    </div>
  );
}
