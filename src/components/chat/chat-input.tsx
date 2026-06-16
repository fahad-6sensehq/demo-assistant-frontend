'use client';

import { FormEvent, useRef, useState } from 'react';

interface ChatInputProps {
  onSend: (content: string) => Promise<void>;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = content.trim();
    if (!trimmed || sending || disabled) return;

    setSending(true);
    setContent('');

    try {
      await onSend(trimmed);
    } finally {
      setSending(false);
      textareaRef.current?.focus();
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void handleSubmit(event);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto w-full max-w-3xl px-4 pb-6 pt-2"
    >
      <div className="flex items-end gap-3 rounded-3xl border border-zinc-700 bg-[#2f2f2f] px-4 py-3 shadow-lg">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(event) => setContent(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message the assistant..."
          rows={1}
          disabled={disabled || sending}
          className="max-h-40 min-h-[24px] flex-1 resize-none bg-transparent text-[15px] text-zinc-100 outline-none placeholder:text-zinc-500"
        />
        <button
          type="submit"
          disabled={!content.trim() || disabled || sending}
          className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {sending ? '...' : 'Send'}
        </button>
      </div>
      <p className="mt-2 text-center text-xs text-zinc-600">
        Press Enter to send, Shift+Enter for new line
      </p>
    </form>
  );
}
