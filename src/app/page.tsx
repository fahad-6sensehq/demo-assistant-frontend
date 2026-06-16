'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace('/login');
      return;
    }

    router.replace(user.isAdmin ? '/admin' : '/chat');
  }, [user, loading, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#212121] text-zinc-400">
      Loading...
    </div>
  );
}
