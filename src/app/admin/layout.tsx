'use client';

import Sidebar from '@/components/admin/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isLoginPage = pathname === '/admin/login';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900">
        <div className="animate-spin w-12 h-12 border-4 border-gold-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (isLoginPage) {
    return <>{children}</>;
  }

  // Double check, though AuthContext also handles this
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-dark-900 flex">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        {children}
      </main>
    </div>
  );
}
