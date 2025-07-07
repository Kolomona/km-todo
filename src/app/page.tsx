'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        // User is authenticated, redirect to dashboard
        router.push('/dashboard');
      } else {
        // User is not authenticated, redirect to login
        router.push('/login');
      }
    } catch {
      // Error occurred, assume not authenticated and redirect to login
      router.push('/login');
    }
  }, [router]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600" role="status" aria-label="Loading"></div>
    </div>
  );
}
