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

  // States for postponing an appointment
  const [postponeAppointment, setPostponeAppointment] = useState<any | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newStartTime, setNewStartTime] = useState('');
  const [newEndTime, setNewEndTime] = useState('');
  const [rescheduling, setRescheduling] = useState(false);

  const parseTime = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };

  const formatTime = (totalMinutes: number) => {
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  const openPostponeModal = (app: any) => {
    setPostponeAppointment(app);
    setNewDate(app.date);
    setNewStartTime(app.startTime);
    setNewEndTime(app.endTime);
  };

  const handleStartTimeChange = (startTimeVal: string) => {
    setNewStartTime(startTimeVal);
    if (!postponeAppointment) return;

    const startMinOrig = parseTime(postponeAppointment.startTime);
    const endMinOrig = parseTime(postponeAppointment.endTime);
    const duration = endMinOrig - startMinOrig;

    if (duration > 0) {
      const startMinNew = parseTime(startTimeVal);
      const endMinNew = startMinNew + duration;
      setNewEndTime(formatTime(endMinNew));
    }
  };

  async function refreshDashboardData(token: string) {
    const res = await fetch('/api/admin/dashboard', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await res.json();
    if (res.ok) {
      setStats(data.stats);
      setTodayAppointments(data.todayAppointments);
    }
  }

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
      await refreshDashboardData(token);
    } catch (err) {
      console.error(err);
      alert('No se pudo actualizar el estado de la cita.');
    }
  }

  async function handleConfirmPostpone() {
    if (!postponeAppointment || !user) return;
    setRescheduling(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/admin/appointments/${postponeAppointment.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'postponed',
          date: newDate,
          startTime: newStartTime,
          endTime: newEndTime,
        }),
      });
      if (!res.ok) {
        throw new Error('Error updating appointment');
      }
      setPostponeAppointment(null);
      await refreshDashboardData(token);
    } catch (err) {
      console.error(err);
      alert('No se pudo reprogramar la cita.');
    } finally {
      setRescheduling(false);
    }
  }

  async function handleDeleteAppointment(id: string) {
    if (!user) return;
    if (!window.confirm('¿Estás seguro de que deseas eliminar permanentemente esta cita? Esta acción no se puede deshacer.')) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/admin/appointments/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error deleting appointment');
      }
      await refreshDashboardData(token);
    } catch (err: any) {
      console.error(err);
      alert(`No se pudo eliminar la cita: ${err.message}`);
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
      <div className="mt-3 pt-3 border-t border-white/5 flex flex-wrap gap-1.5 items-center">
        {app.status === 'pending' && (
          <>
            <button
              onClick={() => handleUpdateStatus(app.id, 'confirmed')}
              className="px-2 py-1 text-[11px] font-bold rounded bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
            >
              Confirmar
            </button>
            <button
              onClick={() => openPostponeModal(app)}
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
              onClick={() => openPostponeModal(app)}
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
              onClick={() => openPostponeModal(app)}
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
        <button
          onClick={() => handleDeleteAppointment(app.id)}
          className="px-2 py-1 text-[11px] font-bold rounded bg-red-600/30 text-red-300 hover:bg-red-600/50 border border-red-500/25 transition-colors ml-auto"
        >
          Eliminar
        </button>
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

      {/* Modal para Posponer / Reprogramar */}
      {postponeAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-dark-800 border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div>
              <h3 className="text-xl font-bold text-white">Posponer Cita</h3>
              <p className="text-gray-400 text-sm mt-1">
                Selecciona la nueva fecha y hora para la cita de <strong className="text-white">{postponeAppointment.customerName}</strong>.
              </p>
            </div>

            <div className="space-y-4">
              {/* Fecha */}
              <div className="space-y-1.5">
                <label className="text-gray-300 text-xs font-semibold">Fecha</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-gold-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Hora de Inicio */}
                <div className="space-y-1.5">
                  <label className="text-gray-300 text-xs font-semibold">Hora de Inicio</label>
                  <input
                    type="time"
                    value={newStartTime}
                    onChange={(e) => handleStartTimeChange(e.target.value)}
                    className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-gold-500 transition-colors"
                  />
                </div>

                {/* Hora de Fin */}
                <div className="space-y-1.5">
                  <label className="text-gray-300 text-xs font-semibold">Hora de Fin</label>
                  <input
                    type="time"
                    value={newEndTime}
                    onChange={(e) => setNewEndTime(e.target.value)}
                    className="w-full bg-dark-900 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-gold-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setPostponeAppointment(null)}
                className="flex-1 py-3 px-4 rounded-xl text-sm font-bold text-gray-400 hover:text-white border border-white/10 hover:bg-white/5 active:scale-95 transition-all"
                disabled={rescheduling}
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmPostpone}
                className="flex-1 py-3 px-4 rounded-xl text-sm font-bold bg-gold-500 text-dark-900 hover:bg-gold-400 active:scale-95 transition-all disabled:opacity-50"
                disabled={rescheduling || !newDate || !newStartTime || !newEndTime}
              >
                {rescheduling ? 'Guardando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
