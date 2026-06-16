import { create } from 'zustand';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  command?: string;
  context?: {
    activeFile?: { path: string; name: string; language: string };
    selectedText?: string;
  };
  metadata?: {
    model?: string;
    latency?: number;
    codeBlocks?: { language: string; code: string; applied: boolean }[];
  };
}

interface ChatState {
  messages: ChatMessage[];
  isStreaming: boolean;
  streamingMessageId: string | null;
  error: string | null;

  addUserMessage: (message: ChatMessage) => void;
  startStreaming: (id: string) => void;
  appendStreamChunk: (chunk: string) => void;
  finalizeStream: (messageId: string, latency?: number) => void;
  setMessages: (messages: ChatMessage[]) => void;
  clearMessages: () => void;
  setError: (error: string | null) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isStreaming: false,
  streamingMessageId: null,
  error: null,

  addUserMessage: (message) =>
    set((s) => ({ messages: [...s.messages, message], error: null })),

  startStreaming: (id) =>
    set((s) => ({
      isStreaming: true,
      streamingMessageId: id,
      messages: [
        ...s.messages,
        {
          id,
          role: 'assistant' as const,
          content: '',
          timestamp: new Date().toISOString(),
        },
      ],
    })),

  appendStreamChunk: (chunk) =>
    set((s) => ({
      messages: s.messages.map((m) =>
        m.id === s.streamingMessageId ? { ...m, content: m.content + chunk } : m
      ),
    })),

  finalizeStream: (messageId, latency) =>
    set((s) => ({
      isStreaming: false,
      streamingMessageId: null,
      messages: s.messages.map((m) =>
        m.id === s.streamingMessageId
          ? { ...m, id: messageId || m.id, metadata: { ...m.metadata, latency } }
          : m
      ),
    })),

  setMessages: (messages) => set({ messages }),

  clearMessages: () => set({ messages: [], error: null }),

  setError: (error) => set({ error, isStreaming: false, streamingMessageId: null }),
}));
