'use client';

import { FormEvent, useRef, useState } from 'react';
import { FileUploadModal } from '@/components/chat/file-upload-modal';

interface ChatInputProps {
  onSend: (content: string) => Promise<void>;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
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
    <>
      <form
        onSubmit={handleSubmit}
        className="mx-auto w-full max-w-3xl px-4 pb-6 pt-2"
      >
        <div className="flex items-end gap-2">
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            disabled={disabled || sending}
            aria-label="Upload knowledge files"
            title="Upload files"
            className="mb-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-zinc-600 bg-[#2f2f2f] text-zinc-200 shadow-lg transition hover:border-zinc-500 hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
          </button>

          <div className="flex min-w-0 flex-1 items-end gap-3 rounded-3xl border border-zinc-700 bg-[#2f2f2f] px-4 py-3 shadow-lg">
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
        </div>
        <p className="mt-2 text-center text-xs text-zinc-600">
          Press Enter to send, Shift+Enter for new line
        </p>
      </form>

      <FileUploadModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
