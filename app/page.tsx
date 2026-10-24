'use client';

import { useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/authContext';

function HomeContent() {
  const router = useRouter();
  const { user, isSetup, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (isSetup === false) {
      router.replace('/setup');
    } else if (user) {
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
  }, [user, isSetup, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-6 h-6 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 font-mono text-xs">Initializing HCM Lite Engine...</p>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#020617]">
        <div className="w-6 h-6 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
