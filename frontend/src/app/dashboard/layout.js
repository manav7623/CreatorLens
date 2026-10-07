'use client';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({ children }) {
  const { user } = useSelector(state => state.auth);
  const router = useRouter();

  useEffect(() => {
    if (!user) router.push('/auth/login');
  }, [user]);

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
