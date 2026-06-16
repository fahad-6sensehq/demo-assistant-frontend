'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';

export function AuthGuard({
  children,
  adminOnly = false,
}: {
  children: React.ReactNode;
  adminOnly?: boolean;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace('/login');
      return;
    }

    if (adminOnly && !user.isAdmin) {
      router.replace('/chat');
    }
  }, [user, loading, adminOnly, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#212121] text-zinc-300">
        Loading...
      </div>
    );
  }

  if (!user || (adminOnly && !user.isAdmin)) {
    return null;
  }

  return <>{children}</>;
}
