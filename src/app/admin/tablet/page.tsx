'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase/config';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Appointment {
  id: string;
  customerName: string;
  customerPhone: string;
  serviceName: string;
  professionalName?: string;
  professionalId?: string;
  startTime: string;
  endTime: string;
  date: string;
  status: string;
  area: string;
  notes?: string;
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  in_process: 'En proceso',
  postponed: 'Pospuesta',
  completed: 'Terminada',
  cancelled: 'Cancelada',
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/25',
  confirmed: 'bg-blue-500/10 text-blue-400 border-blue-500/25',
  in_process: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/25',
  postponed: 'bg-orange-500/10 text-orange-400 border-orange-500/25',
  completed: 'bg-green-500/10 text-green-400 border-green-500/25',
  cancelled: 'bg-red-500/10 text-red-400 border-red-500/25',
};

export default function TabletDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedArea, setSelectedArea] = useState<'all' | 'barberia' | 'estetica'>('all');

  useEffect(() => {
    if (!user) return;

    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const q = query(
      collection(db, 'appointments'),
      where('date', '==', todayStr)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Appointment[];

        // Sort chronologically ascending
        list.sort((a, b) => a.startTime.localeCompare(b.startTime));

        setAppointments(list);
        setLoading(false);
      },
      (err) => {
        console.error('Real-time listener error:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  async function handleUpdateStatus(id: string, newStatus: string) {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/admin/appointments/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        throw new Error('Error updating status');
      }
    } catch (err) {
      console.error(err);
      alert('No se pudo actualizar el estado de la cita.');
    }
  }

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-white">
        <div className="animate-spin w-12 h-12 border-4 border-gold-500 border-t-transparent rounded-full mb-4"></div>
        <p className="text-gray-400 font-medium">Estableciendo conexión en tiempo real...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-white space-y-4">
        <p className="text-red-500 font-bold text-xl">⚠️ Error de conexión</p>
        <p className="text-gray-400 font-mono">{error}</p>
      </div>
    );
  }

  // Filtered by selected area
  const areaFiltered = appointments.filter(
    (a) => selectedArea === 'all' || a.area === selectedArea
  );

  // Split Active and Finished
  const activeApps = areaFiltered.filter(
    (a) => a.status !== 'completed' && a.status !== 'cancelled'
  );
  const finishedApps = areaFiltered.filter(
    (a) => a.status === 'completed' || a.status === 'cancelled'
  );

  // Stats
  const totalCount = areaFiltered.length;
  const pendingCount = areaFiltered.filter((a) => a.status === 'pending').length;
  const inProcessCount = areaFiltered.filter((a) => a.status === 'in_process').length;
  const completedCount = areaFiltered.filter((a) => a.status === 'completed').length;
  const cancelledCount = areaFiltered.filter((a) => a.status === 'cancelled').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-dark-800 p-6 rounded-2xl border border-white/5 shadow-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="text-[10px] text-green-400 font-bold tracking-widest uppercase">Panel En Vivo</span>
          </div>
          <h1 className="text-3xl font-black text-white capitalize">
            {format(new Date(), 'eeee, d \'de\' MMMM', { locale: es })}
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">Pantalla de control operativa para tablet.</p>
        </div>

        {/* Area selector */}
        <div className="flex bg-dark-900 border border-white/10 rounded-xl p-1 gap-1">
          <button
            onClick={() => setSelectedArea('all')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              selectedArea === 'all' ? 'bg-gold-500 text-dark-900' : 'text-gray-400 hover:text-white'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setSelectedArea('barberia')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              selectedArea === 'barberia' ? 'bg-gold-500 text-dark-900' : 'text-gray-400 hover:text-white'
            }`}
          >
            💈 Barbería
          </button>
          <button
            onClick={() => setSelectedArea('estetica')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              selectedArea === 'estetica' ? 'bg-gold-500 text-dark-900' : 'text-gray-400 hover:text-white'
            }`}
          >
            ✨ Estética
          </button>
        </div>
      </div>

      {/* Metric counters */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-dark-800 p-4 rounded-xl border border-white/5 flex flex-col justify-between shadow">
          <span className="text-gray-400 text-xs font-semibold">Total Citas</span>
          <span className="text-3xl font-black text-white mt-1">{totalCount}</span>
        </div>
        <div className="bg-dark-800 p-4 rounded-xl border border-white/5 flex flex-col justify-between shadow">
          <span className="text-yellow-500 text-xs font-semibold">Pendientes</span>
          <span className="text-3xl font-black text-yellow-500 mt-1">{pendingCount}</span>
        </div>
        <div className="bg-dark-800 p-4 rounded-xl border border-white/5 flex flex-col justify-between shadow">
          <span className="text-indigo-400 text-xs font-semibold">En Proceso</span>
          <span className="text-3xl font-black text-indigo-400 mt-1">{inProcessCount}</span>
        </div>
        <div className="bg-dark-800 p-4 rounded-xl border border-white/5 flex flex-col justify-between shadow">
          <span className="text-green-500 text-xs font-semibold">Terminadas</span>
          <span className="text-3xl font-black text-green-500 mt-1">{completedCount}</span>
        </div>
        <div className="bg-dark-800 p-4 rounded-xl border border-white/5 flex flex-col justify-between shadow">
          <span className="text-red-500 text-xs font-semibold">Canceladas</span>
          <span className="text-3xl font-black text-red-500 mt-1">{cancelledCount}</span>
        </div>
      </div>

      {/* Main Agenda Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Active Queue */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>📋</span> Cola de Citas Activas
          </h2>

          {activeApps.length === 0 ? (
            <div className="bg-dark-800 p-8 rounded-2xl border border-white/5 text-center text-gray-500">
              No hay citas activas programadas para hoy.
            </div>
          ) : (
            <div className="space-y-4">
              {activeApps.map((app) => (
                <div
                  key={app.id}
                  className="bg-dark-800 p-5 rounded-2xl border border-white/5 shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-white/10 transition-all"
                >
                  <div className="flex gap-4 items-start">
                    {/* Time badge */}
                    <div className="bg-dark-900 border border-gold-500/20 px-4 py-3 rounded-xl text-center shrink-0 min-w-[90px]">
                      <span className="block text-gold-500 font-extrabold text-base leading-none">
                        {app.startTime}
                      </span>
                      <span className="block text-gray-500 text-[10px] mt-1 uppercase font-semibold tracking-wider">
                        {app.area === 'barberia' ? 'Barber' : 'Estética'}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-bold text-white leading-none">{app.customerName}</h3>
                        <span
                          className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded border ${
                            STATUS_COLORS[app.status]
                          }`}
                        >
                          {STATUS_LABELS[app.status]}
                        </span>
                      </div>

                      <p className="text-sm font-mono text-gray-400">📞 {app.customerPhone}</p>
                      <p className="text-sm text-gray-300">
                        <strong className="text-gold-500/90 font-medium">Servicio:</strong> {app.serviceName}
                      </p>
                      <p className="text-xs text-gray-400">
                        <strong>Profesional:</strong> {app.professionalName || app.professionalId || 'No asignado'}
                      </p>
                      {app.notes && (
                        <p className="text-xs text-gray-500 italic mt-1 bg-dark-900/50 p-2 rounded-lg border border-white/5">
                          📝 {app.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Operational controls */}
                  <div className="flex flex-wrap gap-2 w-full sm:w-auto pt-3 sm:pt-0 border-t border-white/5 sm:border-0 justify-end">
                    {app.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(app.id, 'confirmed')}
                          className="px-4 py-2.5 text-xs font-bold rounded-xl bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 active:scale-95 transition-all min-h-[44px]"
                        >
                          Confirmar
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(app.id, 'postponed')}
                          className="px-4 py-2.5 text-xs font-bold rounded-xl bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 active:scale-95 transition-all min-h-[44px]"
                        >
                          Posponer
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(app.id, 'cancelled')}
                          className="px-4 py-2.5 text-xs font-bold rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 active:scale-95 transition-all min-h-[44px]"
                        >
                          Cancelar
                        </button>
                      </>
                    )}
                    {app.status === 'confirmed' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(app.id, 'in_process')}
                          className="px-4 py-2.5 text-xs font-bold rounded-xl bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 active:scale-95 transition-all min-h-[44px]"
                        >
                          Iniciar
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(app.id, 'postponed')}
                          className="px-4 py-2.5 text-xs font-bold rounded-xl bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 active:scale-95 transition-all min-h-[44px]"
                        >
                          Posponer
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(app.id, 'cancelled')}
                          className="px-4 py-2.5 text-xs font-bold rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 active:scale-95 transition-all min-h-[44px]"
                        >
                          Cancelar
                        </button>
                      </>
                    )}
                    {app.status === 'in_process' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(app.id, 'completed')}
                          className="px-4 py-2.5 text-xs font-bold rounded-xl bg-green-500/20 text-green-400 hover:bg-green-500/30 active:scale-95 transition-all min-h-[44px]"
                        >
                          Terminar
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(app.id, 'postponed')}
                          className="px-4 py-2.5 text-xs font-bold rounded-xl bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 active:scale-95 transition-all min-h-[44px]"
                        >
                          Posponer
                        </button>
                      </>
                    )}
                    {app.status === 'postponed' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(app.id, 'confirmed')}
                          className="px-4 py-2.5 text-xs font-bold rounded-xl bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 active:scale-95 transition-all min-h-[44px]"
                        >
                          Confirmar
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(app.id, 'cancelled')}
                          className="px-4 py-2.5 text-xs font-bold rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 active:scale-95 transition-all min-h-[44px]"
                        >
                          Cancelar
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right column - Finalized History */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-400 flex items-center gap-2">
            <span>✅</span> Historial / Finalizadas
          </h2>

          {finishedApps.length === 0 ? (
            <div className="bg-dark-800 p-8 rounded-2xl border border-white/5 text-center text-gray-600">
              No hay citas terminadas o canceladas hoy todavía.
            </div>
          ) : (
            <div className="space-y-3 opacity-75">
              {finishedApps.map((app) => (
                <div
                  key={app.id}
                  className="bg-dark-800 p-4 rounded-xl border border-white/5 flex justify-between items-center gap-4 hover:border-white/10 transition-all"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-gold-500 font-bold text-sm">{app.startTime}</span>
                      <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">
                        {app.area === 'barberia' ? 'Barber' : 'Estética'}
                      </span>
                    </div>
                    <h4 className="text-white font-bold text-sm mt-0.5">{app.customerName}</h4>
                    <p className="text-[11px] text-gray-400">{app.serviceName}</p>
                  </div>

                  <span
                    className={`px-2 py-0.5 text-[8px] font-bold uppercase rounded border ${
                      STATUS_COLORS[app.status]
                    }`}
                  >
                    {STATUS_LABELS[app.status]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
