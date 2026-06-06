'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

// Types for Admin View
interface DashboardStats {
  today: number;
  thisWeek: number;
  completed: number;
  cancelled: number;
  nextAppointment: any | null;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [todayAppointments, setTodayAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real scenario with server validation, we would fetch from /api/admin/dashboard
    // using the Firebase ID token in the Authorization header.
    // For this MVP presentation, we use mock data to show the layout requested.
    
    setTimeout(() => {
      setStats({
        today: 5,
        thisWeek: 24,
        completed: 12,
        cancelled: 2,
        nextAppointment: { time: '14:00', client: 'Carlos R.', area: 'Barbería' }
      });

      setTodayAppointments([
        { id: '1', startTime: '10:00', endTime: '10:30', customerName: 'Juan Pérez', serviceName: 'Corte Clásico', professionalName: 'Alejandro', area: 'barberia', status: 'completed' },
        { id: '2', startTime: '11:00', endTime: '12:30', customerName: 'María G.', serviceName: 'Tinte Completo', professionalName: 'Ana', area: 'estetica', status: 'confirmed' },
        { id: '3', startTime: '14:00', endTime: '14:30', customerName: 'Carlos R.', serviceName: 'Corte + Barba', professionalName: 'Alejandro', area: 'barberia', status: 'confirmed' },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) return <div className="text-white">Cargando dashboard...</div>;

  const barberiaAppointments = todayAppointments.filter(a => a.area === 'barberia');
  const esteticaAppointments = todayAppointments.filter(a => a.area === 'estetica');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Hola, {user?.email || 'Administrador'}</h1>
        <p className="text-gray-400">Este es el resumen de tu negocio para hoy.</p>
      </div>

      {/* Tarjetas de Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-dark-800 p-6 rounded-xl border border-white/5 shadow-lg">
          <p className="text-gray-400 text-sm mb-1">Citas Hoy</p>
          <p className="text-3xl font-bold text-white">{stats?.today}</p>
        </div>
        <div className="bg-dark-800 p-6 rounded-xl border border-white/5 shadow-lg">
          <p className="text-gray-400 text-sm mb-1">Esta Semana</p>
          <p className="text-3xl font-bold text-white">{stats?.thisWeek}</p>
        </div>
        <div className="bg-dark-800 p-6 rounded-xl border border-white/5 shadow-lg">
          <p className="text-gray-400 text-sm mb-1">Completadas</p>
          <p className="text-3xl font-bold text-green-500">{stats?.completed}</p>
        </div>
        <div className="bg-dark-800 p-6 rounded-xl border border-white/5 shadow-lg">
          <p className="text-gray-400 text-sm mb-1">Canceladas</p>
          <p className="text-3xl font-bold text-red-500">{stats?.cancelled}</p>
        </div>
        <div className="bg-gold-500/10 p-6 rounded-xl border border-gold-500/20 shadow-lg">
          <p className="text-gold-500 text-sm mb-1 font-medium">Próxima Cita</p>
          <p className="text-xl font-bold text-white">{stats?.nextAppointment?.time}</p>
          <p className="text-sm text-gray-300">{stats?.nextAppointment?.client}</p>
        </div>
      </div>

      {/* Agenda Dual Visual */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Agenda del Día</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Columna Barbería */}
          <div className="bg-dark-800 rounded-xl border border-white/5 overflow-hidden">
            <div className="bg-dark-700 py-3 px-4 border-b border-white/5">
              <h3 className="font-bold text-white text-lg">💈 Barbería</h3>
            </div>
            <div className="p-4 space-y-3">
              {barberiaAppointments.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No hay citas registradas.</p>
              ) : (
                barberiaAppointments.map(app => (
                  <div key={app.id} className={`p-4 rounded-lg border ${app.status === 'completed' ? 'border-green-500/30 bg-green-500/5' : 'border-white/10 bg-dark-900'} flex justify-between items-center`}>
                    <div>
                      <p className="text-gold-500 font-bold">{app.startTime} - {app.endTime}</p>
                      <p className="text-white font-medium">{app.customerName}</p>
                      <p className="text-sm text-gray-400">{app.serviceName} con {app.professionalName}</p>
                    </div>
                    <div className="text-xs uppercase tracking-wider px-2 py-1 rounded bg-dark-700 text-gray-300">
                      {app.status}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Columna Estética */}
          <div className="bg-dark-800 rounded-xl border border-white/5 overflow-hidden">
            <div className="bg-dark-700 py-3 px-4 border-b border-white/5">
              <h3 className="font-bold text-white text-lg">✨ Estética</h3>
            </div>
            <div className="p-4 space-y-3">
              {esteticaAppointments.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No hay citas registradas.</p>
              ) : (
                esteticaAppointments.map(app => (
                  <div key={app.id} className={`p-4 rounded-lg border ${app.status === 'completed' ? 'border-green-500/30 bg-green-500/5' : 'border-white/10 bg-dark-900'} flex justify-between items-center`}>
                    <div>
                      <p className="text-gold-500 font-bold">{app.startTime} - {app.endTime}</p>
                      <p className="text-white font-medium">{app.customerName}</p>
                      <p className="text-sm text-gray-400">{app.serviceName} con {app.professionalName}</p>
                    </div>
                    <div className="text-xs uppercase tracking-wider px-2 py-1 rounded bg-dark-700 text-gray-300">
                      {app.status}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
