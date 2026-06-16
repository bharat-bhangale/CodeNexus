import type { ChatMessage } from '@/stores/chatStore';

const BASE_URL = '/api/v1/chat';

export async function sendChatMessage(
  message: string,
  context: Record<string, any>,
  command?: string,
  onChunk?: (chunk: string) => void,
  onDone?: (messageId: string, latency: number) => void,
  onError?: (error: string) => void
): Promise<void> {
  try {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, context, command }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err?.error?.message || `HTTP ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No stream reader available');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Parse SSE events from buffer
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep incomplete line in buffer

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const jsonStr = line.slice(6).trim();
        if (!jsonStr) continue;

        try {
          const event = JSON.parse(jsonStr);
          if (event.done) {
            onDone?.(event.messageId || '', event.latency || 0);
          } else if (event.content) {
            onChunk?.(event.content);
          }
        } catch {
          // Skip malformed JSON
        }
      }
    }
  } catch (err: any) {
    onError?.(err.message || 'Chat request failed');
  }
}

export async function fetchChatHistory(): Promise<ChatMessage[]> {
  const res = await fetch(`${BASE_URL}/history?projectId=default`);
  const json = await res.json();
  if (!json.success) return [];
  return (json.data || []).map((m: any) => ({
    id: m.id || m._id,
    role: m.role,
    content: m.content,
    timestamp: m.timestamp,
    command: m.metadata?.command,
    context: m.context,
    metadata: m.metadata,
  }));
}

export async function clearChatHistory(): Promise<void> {
  await fetch(`${BASE_URL}/history?projectId=default`, { method: 'DELETE' });
}

export interface SlashCommandDef {
  name: string;
  label: string;
  description: string;
}

export async function fetchSlashCommands(): Promise<SlashCommandDef[]> {
  const res = await fetch(`${BASE_URL}/commands`);
  const json = await res.json();
  return json.data || [];
}
