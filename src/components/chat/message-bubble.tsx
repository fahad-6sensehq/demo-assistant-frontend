'use client';

import type { ChatMessage } from '@/lib/types';
import { MessageContent } from '@/components/chat/message-content';

function formatTime(dateString: string) {
  return new Date(dateString).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';

  return (
    <div
      className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed ${
          isUser
            ? 'bg-[#2f2f2f] text-zinc-100'
            : 'bg-transparent text-zinc-100'
        }`}
      >
        {!isUser && (
          <div className="mb-1 text-xs font-medium text-emerald-400">
            Assistant
          </div>
        )}
        <MessageContent content={message.content} isUser={isUser} />
        <div
          className={`mt-2 text-[11px] ${isUser ? 'text-zinc-500' : 'text-zinc-600'}`}
        >
          {formatTime(message.createdAt)}
        </div>
      </div>
    </div>
  );
}

export function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="rounded-2xl px-4 py-3 text-zinc-400">
        <div className="flex items-center gap-1">
          <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-500 [animation-delay:-0.3s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-500 [animation-delay:-0.15s]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-500" />
        </div>
      </div>
    </div>
  );
}
