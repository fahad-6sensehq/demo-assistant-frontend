'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AuthGuard } from '@/components/auth-guard';
import { MessageBubble } from '@/components/chat/message-bubble';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { api } from '@/lib/api';
import type { AdminUserChat } from '@/lib/types';

export default function AdminUserChatPage() {
  const params = useParams<{ userId: string }>();
  const userId = params.userId;
  const [chat, setChat] = useState<AdminUserChat | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userId) return;

    void (async () => {
      try {
        const data = await api.adminGetUserChat(userId);
        setChat(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load chat');
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  return (
    <AuthGuard adminOnly>
      <div className="flex h-screen bg-[#212121]">
        <AppSidebar active="admin" />

        <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <header className="border-b border-zinc-800 px-6 py-4">
            <Link
              href="/admin"
              className="text-sm text-emerald-400 hover:underline"
            >
              ← Back to admin
            </Link>
            <h2 className="mt-2 text-base font-medium text-zinc-100">
              {chat?.user.name ?? 'User chat'}
            </h2>
            <p className="text-sm text-zinc-500">
              {chat?.user.email} · Read-only
            </p>
          </header>

          <div className="flex-1 overflow-y-auto">
            <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-6">
              {loading && (
                <p className="text-center text-sm text-zinc-500">
                  Loading conversation...
                </p>
              )}
              {error && (
                <p className="text-center text-sm text-red-400">{error}</p>
              )}
              {!loading && !error && chat?.messages.length === 0 && (
                <p className="text-center text-sm text-zinc-500">
                  This user has not started chatting yet.
                </p>
              )}
              {chat?.messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
