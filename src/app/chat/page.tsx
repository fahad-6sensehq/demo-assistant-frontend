'use client';

import { useEffect, useRef, useState } from 'react';
import { AuthGuard } from '@/components/auth-guard';
import { ChatInput } from '@/components/chat/chat-input';
import {
  MessageBubble,
  TypingIndicator,
} from '@/components/chat/message-bubble';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { api } from '@/lib/api';
import type { ChatMessage } from '@/lib/types';

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void (async () => {
      try {
        const history = await api.getChatHistory();
        setMessages(history.messages);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load chat');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  async function handleSend(content: string) {
    const optimisticId = `temp-${crypto.randomUUID()}`;
    const optimisticMessage: ChatMessage = {
      id: optimisticId,
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setSending(true);
    setError('');

    try {
      const response = await api.sendMessage(content);
      const mergedMessages = response.messages.map((message) =>
        message.id === response.reply.id && !message.sources && response.sources
          ? { ...message, sources: response.sources }
          : message,
      );
      setMessages(mergedMessages);
    } catch (err) {
      setMessages((prev) => prev.filter((message) => message.id !== optimisticId));
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setSending(false);
    }
  }

  function handleCitationClick(fileId: string) {
    console.log(fileId);
  }

  return (
    <AuthGuard>
      <div className="flex h-screen bg-[#212121]">
        <AppSidebar active="chat" />

        <main className="flex min-w-0 flex-1 flex-col">
          <header className="border-b border-zinc-800 px-6 py-4">
            <h2 className="text-base font-medium text-zinc-100">Assistant</h2>
            <p className="text-sm text-zinc-500">
              One continuous conversation with full history
            </p>
          </header>

          <div className="flex-1 overflow-y-auto">
            <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-6">
              {loading && (
                <p className="text-center text-sm text-zinc-500">
                  Loading conversation...
                </p>
              )}

              {!loading && messages.length === 0 && (
                <div className="flex flex-1 flex-col items-center justify-center py-24 text-center">
                  <h3 className="text-2xl font-medium text-zinc-200">
                    How can I help you today?
                  </h3>
                  <p className="mt-2 max-w-md text-sm text-zinc-500">
                    Start typing below. Your messages and replies are saved in
                    this single conversation.
                  </p>
                </div>
              )}

              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  onCitationClick={handleCitationClick}
                />
              ))}

              {sending && <TypingIndicator />}
              <div ref={bottomRef} />
            </div>
          </div>

          {error && (
            <p className="px-6 pb-2 text-center text-sm text-red-400">{error}</p>
          )}

          <ChatInput onSend={handleSend} disabled={loading || sending} />
        </main>
      </div>
    </AuthGuard>
  );
}
