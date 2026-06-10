'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

// Types for Admin View
interface DashboardStats {
  today: number;
  thisWeek: number;
  pending: number;
  inProcess: number;
  completed: number;
  cancelled: number;
  nextAppointment: any | null;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [todayAppointments, setTodayAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const res = await fetch('/api/admin/dashboard', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (!res.ok) {
          const msg = data.error || data.details || `Error ${res.status}`;
          console.error('[Dashboard] API error:', msg, data);
          setError(`${res.status}: ${msg}`);
          return;
        }
        console.log('[Dashboard] Loaded stats:', data.stats);
        setStats(data.stats);
        setTodayAppointments(data.todayAppointments);
      } catch (err: any) {
        console.error('Dashboard Error:', err);
        setError(`Error de red: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [user]);

  async function handleUpdateStatus(id: string, newStatus: string) {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/admin/appointments/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) {
        throw new Error('Error updating status');
      }
      
      // Reload stats and appointments after update
      const updatedRes = await fetch('/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const updatedData = await updatedRes.json();
      if (updatedRes.ok) {
        setStats(updatedData.stats);
        setTodayAppointments(updatedData.todayAppointments);
      }
    } catch (err) {
      console.error(err);
      alert('No se pudo actualizar el estado de la cita.');
    }
  }

  if (loading) return <div className="text-white p-8">Cargando dashboard...</div>;

  if (error) return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold text-white">Dashboard</h1>
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
        <p className="text-red-400 font-bold mb-2">⚠ Sin acceso al panel</p>
        <p className="text-red-300 text-sm font-mono mb-3">{error}</p>
        <p className="text-gray-400 text-sm">
          Si ves <strong>Unauthorized role</strong>: abre en el navegador
          {' '}<code className="text-gold-400">/api/setup-admin?email={user?.email}</code>{' '}
          para registrarte como administrador, luego recarga esta página.
        </p>
      </div>
    </div>
  );

  const STATUS_LABELS: Record<string, string> = {
    pending: 'Pendiente',
    confirmed: 'Confirmada',
    in_process: 'En proceso',
    postponed: 'Pospuesta',
    completed: 'Terminada',
    cancelled: 'Cancelada',
  };

  const STATUS_COLORS: Record<string, string> = {
    pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    confirmed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    in_process: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    postponed: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    completed: 'bg-green-500/10 text-green-400 border-green-500/20',
    cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
  };

  const activeAppointments = todayAppointments.filter(
    (a) => a.status !== 'completed' && a.status !== 'cancelled'
  );
  const finishedAppointments = todayAppointments.filter(
    (a) => a.status === 'completed' || a.status === 'cancelled'
  );

  const barberiaActive = activeAppointments.filter((a) => a.area === 'barberia');
  const esteticaActive = activeAppointments.filter((a) => a.area === 'estetica');

  const barberiaFinished = finishedAppointments.filter((a) => a.area === 'barberia');
  const esteticaFinished = finishedAppointments.filter((a) => a.area === 'estetica');

  const renderCard = (app: any) => (
    <div
      key={app.id}
      className={`p-4 rounded-lg border bg-dark-900 border-white/5 hover:border-white/10 transition-all`}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gold-500 font-bold text-sm">
            {app.startTime} - {app.endTime}
          </p>
          <p className="text-white font-semibold text-base mt-0.5">{app.customerName}</p>
          {app.customerPhone && (
            <p className="text-sm text-gray-400 font-mono mt-0.5">📞 {app.customerPhone}</p>
          )}
          <p className="text-sm text-gray-300 mt-1">
            ✂️ {app.serviceName}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            👤 {app.professionalName || app.professionalId || 'No asignado'}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            📅 {app.date}
          </p>
        </div>
        <span
          className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded border ${
            STATUS_COLORS[app.status] || 'bg-gray-500/10 text-gray-300 border-gray-500/20'
          }`}
        >
          {STATUS_LABELS[app.status] || app.status}
        </span>
      </div>

      {/* Acciones de un solo clic */}
      <div className="mt-3 pt-3 border-t border-white/5 flex flex-wrap gap-1.5">
        {app.status === 'pending' && (
          <>
            <button
              onClick={() => handleUpdateStatus(app.id, 'confirmed')}
              className="px-2 py-1 text-[11px] font-bold rounded bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
            >
              Confirmar
            </button>
            <button
              onClick={() => handleUpdateStatus(app.id, 'postponed')}
              className="px-2 py-1 text-[11px] font-bold rounded bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 transition-colors"
            >
              Posponer
            </button>
            <button
              onClick={() => handleUpdateStatus(app.id, 'cancelled')}
              className="px-2 py-1 text-[11px] font-bold rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
            >
              Cancelar
            </button>
          </>
        )}
        {app.status === 'confirmed' && (
          <>
            <button
              onClick={() => handleUpdateStatus(app.id, 'in_process')}
              className="px-2 py-1 text-[11px] font-bold rounded bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 transition-colors"
            >
              Iniciar
            </button>
            <button
              onClick={() => handleUpdateStatus(app.id, 'postponed')}
              className="px-2 py-1 text-[11px] font-bold rounded bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 transition-colors"
            >
              Posponer
            </button>
            <button
              onClick={() => handleUpdateStatus(app.id, 'cancelled')}
              className="px-2 py-1 text-[11px] font-bold rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
            >
              Cancelar
            </button>
          </>
        )}
        {app.status === 'in_process' && (
          <>
            <button
              onClick={() => handleUpdateStatus(app.id, 'completed')}
              className="px-2 py-1 text-[11px] font-bold rounded bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
            >
              Terminar
            </button>
            <button
              onClick={() => handleUpdateStatus(app.id, 'postponed')}
              className="px-2 py-1 text-[11px] font-bold rounded bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 transition-colors"
            >
              Posponer
            </button>
          </>
        )}
        {app.status === 'postponed' && (
          <>
            <button
              onClick={() => handleUpdateStatus(app.id, 'confirmed')}
              className="px-2 py-1 text-[11px] font-bold rounded bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
            >
              Confirmar
            </button>
            <button
              onClick={() => handleUpdateStatus(app.id, 'cancelled')}
              className="px-2 py-1 text-[11px] font-bold rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
            >
              Cancelar
            </button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Hola, {user?.email || 'Administrador'}</h1>
        <p className="text-gray-400">Este es el resumen operativo de tu negocio para hoy.</p>
      </div>

      {/* Tarjetas de Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-dark-800 p-6 rounded-xl border border-white/5 shadow-lg">
          <p className="text-gray-400 text-sm mb-1">Citas Hoy</p>
          <p className="text-3xl font-bold text-white">{stats?.today || 0}</p>
        </div>
        <div className="bg-dark-800 p-6 rounded-xl border border-white/5 shadow-lg">
          <p className="text-gray-400 text-sm mb-1">Citas Pendientes</p>
          <p className="text-3xl font-bold text-yellow-500">{stats?.pending || 0}</p>
        </div>
        <div className="bg-dark-800 p-6 rounded-xl border border-white/5 shadow-lg">
          <p className="text-gray-400 text-sm mb-1">Citas en Proceso</p>
          <p className="text-3xl font-bold text-indigo-400">{stats?.inProcess || 0}</p>
        </div>
        <div className="bg-dark-800 p-6 rounded-xl border border-white/5 shadow-lg">
          <p className="text-gray-400 text-sm mb-1">Citas Terminadas</p>
          <p className="text-3xl font-bold text-green-500">{stats?.completed || 0}</p>
        </div>
        <div className="bg-dark-800 p-6 rounded-xl border border-white/5 shadow-lg">
          <p className="text-gray-400 text-sm mb-1">Citas Canceladas</p>
          <p className="text-3xl font-bold text-red-500">{stats?.cancelled || 0}</p>
        </div>
      </div>

      {/* Agenda Activa */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Agenda Activa (Pendiente de terminar)</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Columna Barbería Activa */}
          <div className="bg-dark-800 rounded-xl border border-white/5 overflow-hidden">
            <div className="bg-dark-700 py-3 px-4 border-b border-white/5">
              <h3 className="font-bold text-white text-lg">💈 Barbería</h3>
            </div>
            <div className="p-4 space-y-3">
              {barberiaActive.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No hay trabajo activo registrado.</p>
              ) : (
                barberiaActive.map(renderCard)
              )}
            </div>
          </div>

          {/* Columna Estética Activa */}
          <div className="bg-dark-800 rounded-xl border border-white/5 overflow-hidden">
            <div className="bg-dark-700 py-3 px-4 border-b border-white/5">
              <h3 className="font-bold text-white text-lg">✨ Estética</h3>
            </div>
            <div className="p-4 space-y-3">
              {esteticaActive.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No hay trabajo activo registrado.</p>
              ) : (
                esteticaActive.map(renderCard)
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Citas Finalizadas */}
      <div className="space-y-4 pt-4">
        <h2 className="text-2xl font-bold text-white text-gray-300">Historial y Citas Finalizadas (Hoy)</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Columna Barbería Historial */}
          <div className="bg-dark-800 rounded-xl border border-white/5 overflow-hidden opacity-80">
            <div className="bg-dark-700/60 py-3 px-4 border-b border-white/5">
              <h3 className="font-bold text-gray-300 text-lg">💈 Barbería — Finalizadas</h3>
            </div>
            <div className="p-4 space-y-3">
              {barberiaFinished.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No hay citas finalizadas.</p>
              ) : (
                barberiaFinished.map(renderCard)
              )}
            </div>
          </div>

          {/* Columna Estética Historial */}
          <div className="bg-dark-800 rounded-xl border border-white/5 overflow-hidden opacity-80">
            <div className="bg-dark-700/60 py-3 px-4 border-b border-white/5">
              <h3 className="font-bold text-gray-300 text-lg">✨ Estética — Finalizadas</h3>
            </div>
            <div className="p-4 space-y-3">
              {esteticaFinished.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No hay citas finalizadas.</p>
              ) : (
                esteticaFinished.map(renderCard)
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
