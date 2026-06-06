'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Search, Eye, Edit2, XCircle, CheckCircle } from 'lucide-react';

const MOCK_APPOINTMENTS = [
  { id: '1', date: '2026-06-05', startTime: '10:00', endTime: '10:30', customerName: 'Juan Pérez', customerPhone: '5512345678', serviceName: 'Corte Clásico', professionalName: 'Alejandro', area: 'barberia', status: 'confirmed' },
  { id: '2', date: '2026-06-05', startTime: '11:00', endTime: '12:30', customerName: 'María G.', customerPhone: '5598765432', serviceName: 'Tinte Completo', professionalName: 'Ana', area: 'estetica', status: 'pending' },
  { id: '3', date: '2026-06-06', startTime: '14:00', endTime: '14:30', customerName: 'Carlos R.', customerPhone: '5511223344', serviceName: 'Corte + Barba', professionalName: 'Alejandro', area: 'barberia', status: 'completed' },
  { id: '4', date: '2026-06-06', startTime: '16:00', endTime: '16:30', customerName: 'Luis M.', customerPhone: '5544332211', serviceName: 'Corte Clásico', professionalName: 'Alejandro', area: 'barberia', status: 'cancelled' },
];

export default function AppointmentsManagement() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState(MOCK_APPOINTMENTS);
  const [filterArea, setFilterArea] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const handleStatusChange = async (id: string, newStatus: string) => {
    // Aquí iría el llamado a la API real pasando el token
    /*
    const token = await user.getIdToken();
    await fetch(`/api/admin/appointments/${id}`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    */
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
  };

  const filtered = appointments.filter(a => {
    if (filterArea !== 'all' && a.area !== filterArea) return false;
    if (filterStatus !== 'all' && a.status !== filterStatus) return false;
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'completed': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'cancelled': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'pending': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Gestión de Citas</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-4 bg-dark-800 p-4 rounded-xl border border-white/5">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Buscar cliente, servicio o fecha..." 
            className="w-full bg-dark-900 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-gold-500"
          />
        </div>
        <select 
          value={filterArea}
          onChange={(e) => setFilterArea(e.target.value)}
          className="bg-dark-900 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-gold-500"
        >
          <option value="all">Todas las Áreas</option>
          <option value="barberia">Barbería</option>
          <option value="estetica">Estética</option>
        </select>
        <select 
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-dark-900 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-gold-500"
        >
          <option value="all">Todos los Estados</option>
          <option value="pending">Pendientes</option>
          <option value="confirmed">Confirmadas</option>
          <option value="completed">Completadas</option>
          <option value="cancelled">Canceladas</option>
        </select>
      </div>

      <div className="bg-dark-800 rounded-xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-dark-700 text-gray-300 text-sm">
              <tr>
                <th className="p-4 font-medium">Fecha y Hora</th>
                <th className="p-4 font-medium">Cliente</th>
                <th className="p-4 font-medium">Servicio</th>
                <th className="p-4 font-medium">Profesional</th>
                <th className="p-4 font-medium">Área</th>
                <th className="p-4 font-medium">Estado</th>
                <th className="p-4 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map(app => (
                <tr key={app.id} className="hover:bg-dark-700/50 transition-colors">
                  <td className="p-4">
                    <div className="text-white font-medium">{app.date}</div>
                    <div className="text-gray-400 text-sm">{app.startTime} - {app.endTime}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-white">{app.customerName}</div>
                    <div className="text-gray-400 text-sm">{app.customerPhone}</div>
                  </td>
                  <td className="p-4 text-gray-300">{app.serviceName}</td>
                  <td className="p-4 text-gray-300">{app.professionalName}</td>
                  <td className="p-4">
                    <span className="capitalize text-gray-300 bg-dark-900 px-2 py-1 rounded text-xs border border-white/10">
                      {app.area}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs uppercase tracking-wider border ${getStatusColor(app.status)}`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 hover:bg-dark-900 rounded-lg text-gray-400 hover:text-white transition-colors" title="Ver Detalle">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-dark-900 rounded-lg text-gray-400 hover:text-gold-500 transition-colors" title="Reprogramar">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {app.status !== 'completed' && app.status !== 'cancelled' && (
                        <>
                          <button 
                            onClick={() => handleStatusChange(app.id, 'completed')}
                            className="p-2 hover:bg-dark-900 rounded-lg text-gray-400 hover:text-green-500 transition-colors" title="Marcar Completada"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleStatusChange(app.id, 'cancelled')}
                            className="p-2 hover:bg-dark-900 rounded-lg text-gray-400 hover:text-red-500 transition-colors" title="Cancelar Cita"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No se encontraron citas con estos filtros.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
