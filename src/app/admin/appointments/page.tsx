'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function AppointmentsPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
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

  useEffect(() => {
    fetchAppointments();
  }, [user]);

  async function fetchAppointments() {
    if (!user) return;
    setError(null);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/admin/appointments', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = data.error || `Error ${res.status}`;
        console.error('[Appointments] API error:', msg, data);
        setError(`Error ${res.status}: ${msg}${data.details ? ' — ' + data.details : ''}`);
        return;
      }
      console.log('[Appointments] Loaded:', data.appointments?.length, 'records');
      if (data.appointments) setAppointments(data.appointments);
      else setAppointments([]);
    } catch (err: any) {
      console.error('[Appointments] Fetch failed:', err);
      setError(`Error de red: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: string, newStatus: string) {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      await fetch(`/api/admin/appointments/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      fetchAppointments();
    } catch (err) {
      console.error(err);
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
      fetchAppointments();
    } catch (err) {
      console.error(err);
      alert('No se pudo reprogramar la cita.');
    } finally {
      setRescheduling(false);
    }
  }

  async function deleteAppointment(id: string) {
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
      fetchAppointments();
    } catch (err: any) {
      console.error(err);
      alert(`No se pudo eliminar la cita: ${err.message}`);
    }
  }

  if (loading) return <div className="text-white p-8">Cargando citas...</div>;

  if (error) return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold text-white">Citas</h1>
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
        <p className="text-red-400 font-bold mb-2">⚠ Error al cargar las citas</p>
        <p className="text-red-300 text-sm font-mono">{error}</p>
        <p className="text-gray-400 text-sm mt-3">
          Si ves <strong>401 / Unauthorized role</strong>: tu usuario no tiene el documento
          en <code>Firestore &gt; users &gt; &#123;tu_uid&#125;</code> con <code>role: &quot;admin&quot;</code>.
          Ve a <code>/api/setup-admin?email=TU_CORREO</code> para solucionarlo.
        </p>
        <button
          onClick={fetchAppointments}
          className="mt-4 px-4 py-2 bg-gold-500 text-dark-900 font-bold rounded-lg text-sm hover:bg-gold-400 transition-colors"
        >
          Reintentar
        </button>
      </div>
    </div>
  );

  const filteredAppointments = appointments.filter(a => filter === 'all' || a.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-white">Citas</h1>
        <select 
          value={filter} 
          onChange={e => setFilter(e.target.value)}
          className="bg-dark-700 text-white border border-white/10 rounded-lg p-2"
        >
          <option value="all">Todas</option>
          <option value="pending">Pendientes</option>
          <option value="confirmed">Confirmadas</option>
          <option value="completed">Completadas</option>
          <option value="cancelled">Canceladas</option>
        </select>
      </div>

      <div className="bg-dark-800 rounded-xl border border-white/5 overflow-hidden overflow-x-auto">
        <table className="w-full text-left text-white min-w-[800px]">
          <thead className="bg-dark-700 border-b border-white/5">
            <tr>
              <th className="p-4">Fecha</th>
              <th className="p-4">Cliente</th>
              <th className="p-4">Servicio</th>
              <th className="p-4">Profesional</th>
              <th className="p-4">Estado</th>
              <th className="p-4">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredAppointments.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500">No hay citas registradas.</td>
              </tr>
            ) : (
              filteredAppointments.map(a => (
                <tr key={a.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="p-4">
                    <div className="font-bold">{a.date}</div>
                    <div className="text-gold-500 text-sm">{a.startTime} - {a.endTime}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-bold">{a.customerName}</div>
                    <div className="text-sm text-gray-400">{a.customerPhone}</div>
                  </td>
                  <td className="p-4">{a.serviceName}</td>
                  <td className="p-4">{a.professionalName || a.professionalId || 'No asignado'}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs rounded-full uppercase tracking-wider
                      ${a.status === 'completed' ? 'bg-green-500/20 text-green-400' : ''}
                      ${a.status === 'confirmed' ? 'bg-blue-500/20 text-blue-400' : ''}
                      ${a.status === 'in_process' ? 'bg-indigo-500/20 text-indigo-400' : ''}
                      ${a.status === 'postponed' ? 'bg-orange-500/20 text-orange-400' : ''}
                      ${a.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : ''}
                      ${a.status === 'cancelled' ? 'bg-red-500/20 text-red-400' : ''}
                    `}>
                      {a.status === 'in_process' ? 'En proceso' : a.status === 'postponed' ? 'Pospuesta' : a.status === 'completed' ? 'Terminada' : a.status === 'confirmed' ? 'Confirmada' : a.status === 'pending' ? 'Pendiente' : a.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1.5 items-center">
                      {a.status === 'pending' && (
                        <>
                          <button
                            onClick={() => updateStatus(a.id, 'confirmed')}
                            className="px-2 py-0.5 text-[10px] font-bold rounded bg-blue-500/20 text-blue-400 hover:bg-blue-500/35 transition-colors"
                          >
                            Confirmar
                          </button>
                          <button
                            onClick={() => openPostponeModal(a)}
                            className="px-2 py-0.5 text-[10px] font-bold rounded bg-orange-500/20 text-orange-400 hover:bg-orange-500/35 transition-colors"
                          >
                            Posponer
                          </button>
                          <button
                            onClick={() => updateStatus(a.id, 'cancelled')}
                            className="px-2 py-0.5 text-[10px] font-bold rounded bg-red-500/20 text-red-400 hover:bg-red-500/35 transition-colors"
                          >
                            Cancelar
                          </button>
                        </>
                      )}
                      {a.status === 'confirmed' && (
                        <>
                          <button
                            onClick={() => updateStatus(a.id, 'in_process')}
                            className="px-2 py-0.5 text-[10px] font-bold rounded bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/35 transition-colors"
                          >
                            Iniciar
                          </button>
                          <button
                            onClick={() => openPostponeModal(a)}
                            className="px-2 py-0.5 text-[10px] font-bold rounded bg-orange-500/20 text-orange-400 hover:bg-orange-500/35 transition-colors"
                          >
                            Posponer
                          </button>
                          <button
                            onClick={() => updateStatus(a.id, 'cancelled')}
                            className="px-2 py-0.5 text-[10px] font-bold rounded bg-red-500/20 text-red-400 hover:bg-red-500/35 transition-colors"
                          >
                            Cancelar
                          </button>
                        </>
                      )}
                      {a.status === 'in_process' && (
                        <>
                          <button
                            onClick={() => updateStatus(a.id, 'completed')}
                            className="px-2 py-0.5 text-[10px] font-bold rounded bg-green-500/20 text-green-400 hover:bg-green-500/35 transition-colors"
                          >
                            Terminar
                          </button>
                          <button
                            onClick={() => openPostponeModal(a)}
                            className="px-2 py-0.5 text-[10px] font-bold rounded bg-orange-500/20 text-orange-400 hover:bg-orange-500/35 transition-colors"
                          >
                            Posponer
                          </button>
                        </>
                      )}
                      {a.status === 'postponed' && (
                        <>
                          <button
                            onClick={() => updateStatus(a.id, 'confirmed')}
                            className="px-2 py-0.5 text-[10px] font-bold rounded bg-blue-500/20 text-blue-400 hover:bg-blue-500/35 transition-colors"
                          >
                            Confirmar
                          </button>
                          <button
                            onClick={() => updateStatus(a.id, 'cancelled')}
                            className="px-2 py-0.5 text-[10px] font-bold rounded bg-red-500/20 text-red-400 hover:bg-red-500/35 transition-colors"
                          >
                            Cancelar
                          </button>
                        </>
                      )}
                      
                      <button
                        onClick={() => deleteAppointment(a.id)}
                        className="px-2 py-0.5 text-[10px] font-bold rounded bg-red-600/30 text-red-300 hover:bg-red-600/50 border border-red-500/25 transition-colors"
                        title="Eliminar permanentemente"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
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
