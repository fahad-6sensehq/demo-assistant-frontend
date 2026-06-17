'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AuthGuard } from '@/components/auth-guard';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { api } from '@/lib/api';
import type { AdminChatSummary, AdminUser } from '@/lib/types';

export default function AdminPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [chats, setChats] = useState<AdminChatSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    void (async () => {
      try {
        const [usersData, chatsData] = await Promise.all([
          api.adminListUsers(),
          api.adminListChats(),
        ]);
        setUsers(usersData);
        setChats(chatsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load admin data');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <AuthGuard adminOnly>
      <div className="flex h-screen bg-[#212121]">
        <AppSidebar active="admin" />

        <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <header className="border-b border-zinc-800 px-6 py-4">
            <h2 className="text-base font-medium text-zinc-100">Admin panel</h2>
            <p className="text-sm text-zinc-500">
              Read-only view of all user conversations
            </p>
          </header>

          <div className="flex-1 overflow-y-auto p-6">
            {loading && (
              <p className="text-sm text-zinc-500">Loading admin data...</p>
            )}
            {error && <p className="text-sm text-red-400">{error}</p>}

            {!loading && !error && (
              <div className="grid gap-6 lg:grid-cols-2">
                <section className="rounded-xl border border-zinc-800 bg-[#171717]">
                  <div className="border-b border-zinc-800 px-4 py-3">
                    <h3 className="font-medium text-zinc-200">Users</h3>
                  </div>
                  <div className="divide-y divide-zinc-800">
                    {users.map((user, index) => (
                      <div
                        key={user.id || `${user.email}-${index}`}
                        className="flex items-center justify-between px-4 py-3"
                      >
                        <div>
                          <p className="text-sm font-medium text-zinc-200">
                            {user.name}
                          </p>
                          <p className="text-xs text-zinc-500">{user.email}</p>
                        </div>
                        <Link
                          href={`/admin/users/${user.id}`}
                          className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800"
                        >
                          View chat
                        </Link>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="rounded-xl border border-zinc-800 bg-[#171717]">
                  <div className="border-b border-zinc-800 px-4 py-3">
                    <h3 className="font-medium text-zinc-200">
                      Active conversations
                    </h3>
                  </div>
                  <div className="divide-y divide-zinc-800">
                    {chats.length === 0 && (
                      <p className="px-4 py-6 text-sm text-zinc-500">
                        No conversations yet
                      </p>
                    )}
                    {chats.map((chat, index) => (
                      <div
                        key={
                          chat.conversationId ||
                          `${chat.user?.id ?? chat.user?.email ?? 'chat'}-${index}`
                        }
                        className="px-4 py-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-zinc-200">
                              {chat.user?.name ?? 'Unknown user'}
                            </p>
                            <p className="truncate text-xs text-zinc-500">
                              {chat.user?.email}
                            </p>
                            {chat.lastMessage && (
                              <p className="mt-2 line-clamp-2 text-xs text-zinc-400">
                                <span className="text-zinc-500">
                                  {chat.lastMessage.role}:{' '}
                                </span>
                                {chat.lastMessage.content}
                              </p>
                            )}
                          </div>
                          <div className="shrink-0 text-right">
                            <p className="text-xs text-zinc-500">
                              {chat.messageCount} msgs
                            </p>
                            {chat.user && (
                              <Link
                                href={`/admin/users/${chat.user.id}`}
                                className="mt-2 inline-block text-xs text-emerald-400 hover:underline"
                              >
                                Open
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
