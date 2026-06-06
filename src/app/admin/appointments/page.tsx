'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function AppointmentsPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchAppointments();
  }, [user]);

  async function fetchAppointments() {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/admin/appointments', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.appointments) setAppointments(data.appointments);
    } catch (err) {
      console.error(err);
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

  if (loading) return <div className="text-white">Cargando...</div>;

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
                  <td className="p-4">{a.professionalId}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs rounded-full uppercase tracking-wider
                      ${a.status === 'completed' ? 'bg-green-500/20 text-green-400' : ''}
                      ${a.status === 'confirmed' ? 'bg-blue-500/20 text-blue-400' : ''}
                      ${a.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : ''}
                      ${a.status === 'cancelled' ? 'bg-red-500/20 text-red-400' : ''}
                    `}>
                      {a.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <select 
                      className="bg-dark-900 border border-white/10 rounded p-1 text-sm focus:border-gold-500"
                      value=""
                      onChange={(e) => {
                        if (e.target.value) updateStatus(a.id, e.target.value);
                      }}
                    >
                      <option value="" disabled>Cambiar a...</option>
                      {a.status !== 'confirmed' && <option value="confirmed">Confirmar</option>}
                      {a.status !== 'completed' && <option value="completed">Completar</option>}
                      {a.status !== 'cancelled' && <option value="cancelled">Cancelar</option>}
                      {a.status !== 'pending' && <option value="pending">Pendiente</option>}
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
