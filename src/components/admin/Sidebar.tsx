'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calendar, Users, Scissors, Clock, LogOut, LayoutDashboard } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';

const NAV_ITEMS = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Citas', href: '/admin/appointments', icon: Calendar },
  { name: 'Bloqueos', href: '/admin/blocks', icon: Clock },
  { name: 'Servicios', href: '/admin/services', icon: Scissors },
  { name: 'Profesionales', href: '/admin/professionals', icon: Users },
];

export default function Sidebar() {
  const pathname = usePathname();

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <div className="w-64 bg-dark-800 border-r border-white/5 flex flex-col h-screen fixed left-0 top-0">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white tracking-wider">LUMEN <span className="text-gold-500">ADMIN</span></h1>
      </div>
      
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-gold-500/10 text-gold-500' : 'text-gray-400 hover:text-white hover:bg-dark-700'}`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full text-left rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
}
