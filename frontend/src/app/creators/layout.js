'use client';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Sidebar from '@/components/Sidebar';

export default function CreatorsLayout({ children }) {
  const { user, isInitialized } = useSelector(state => state.auth);
  const router = useRouter();

  useEffect(() => {
    if (isInitialized && !user) {
      router.push('/auth/login');
    }
  }, [isInitialized, user, router]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col lg:flex-row">
      <Sidebar />
      <main className="flex-1 lg:ml-64 min-h-screen w-full">
        <div className="p-4 sm:p-6 lg:p-8 page-enter">
          {children}
        </div>
      </main>
    </div>
  );
}
