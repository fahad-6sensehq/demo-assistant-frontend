'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';

export function AppSidebar({ active }: { active: 'chat' | 'admin' }) {
  const { user, logout } = useAuth();

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-zinc-800 bg-[#171717]">
      <div className="border-b border-zinc-800 p-4">
        <h1 className="text-lg font-semibold text-zinc-100">AI Chat</h1>
        <p className="mt-1 text-sm text-zinc-500">Your conversation</p>
      </div>

      <nav className="flex-1 p-3">
        <Link
          href="/chat"
          className={`block rounded-lg px-3 py-2 text-sm ${
            active === 'chat'
              ? 'bg-zinc-800 text-zinc-100'
              : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
          }`}
        >
          Chat
        </Link>
        {user?.isAdmin && (
          <Link
            href="/admin"
            className={`mt-1 block rounded-lg px-3 py-2 text-sm ${
              active === 'admin'
                ? 'bg-zinc-800 text-zinc-100'
                : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
            }`}
          >
            Admin panel
          </Link>
        )}
      </nav>

      <div className="border-t border-zinc-800 p-4">
        <p className="truncate text-sm font-medium text-zinc-200">
          {user?.name}
        </p>
        <p className="truncate text-xs text-zinc-500">{user?.email}</p>
        <button
          onClick={logout}
          className="mt-3 w-full rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-300 transition hover:bg-zinc-800"
        >
          Log out
        </button>
      </div>
    </aside>
  );
}
