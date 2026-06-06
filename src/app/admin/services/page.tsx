'use client';

import { useState } from 'react';
import { Edit2, ToggleLeft, ToggleRight } from 'lucide-react';

const MOCK_SERVICES = [
  { id: 's1', area: 'barberia', name: 'Corte Clásico', durationMinutes: 30, price: 150, isActive: true },
  { id: 's2', area: 'barberia', name: 'Corte + Barba', durationMinutes: 60, price: 250, isActive: true },
  { id: 's3', area: 'estetica', name: 'Tinte Completo', durationMinutes: 90, price: 800, isActive: true },
  { id: 's4', area: 'estetica', name: 'Manicura', durationMinutes: 45, price: 200, isActive: false },
];

export default function ServicesManagement() {
  const [services, setServices] = useState(MOCK_SERVICES);

  const toggleActive = (id: string) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Gestión de Servicios</h1>
        <button className="bg-gold-500 hover:bg-gold-600 text-dark-900 font-bold py-2 px-4 rounded-lg transition-colors">
          + Nuevo Servicio
        </button>
      </div>

      <div className="bg-dark-800 rounded-xl border border-white/5 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-dark-700 text-gray-300 text-sm">
            <tr>
              <th className="p-4 font-medium">Servicio</th>
              <th className="p-4 font-medium">Área</th>
              <th className="p-4 font-medium">Duración</th>
              <th className="p-4 font-medium">Precio</th>
              <th className="p-4 font-medium text-center">Estado</th>
              <th className="p-4 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {services.map(service => (
              <tr key={service.id} className={`hover:bg-dark-700/50 transition-colors ${!service.isActive ? 'opacity-50' : ''}`}>
                <td className="p-4 text-white font-medium">{service.name}</td>
                <td className="p-4 text-gray-300 capitalize">{service.area}</td>
                <td className="p-4 text-gray-300">{service.durationMinutes} min</td>
                <td className="p-4 text-gold-500 font-bold">${service.price}</td>
                <td className="p-4 text-center">
                  <span className={`px-2 py-1 rounded text-xs uppercase tracking-wider border ${service.isActive ? 'text-green-400 bg-green-400/10 border-green-400/20' : 'text-gray-400 bg-gray-400/10 border-gray-400/20'}`}>
                    {service.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-2 hover:bg-dark-900 rounded-lg text-gray-400 hover:text-white transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => toggleActive(service.id)}
                      className={`p-2 hover:bg-dark-900 rounded-lg transition-colors ${service.isActive ? 'text-green-500 hover:text-gray-400' : 'text-gray-500 hover:text-green-400'}`}
                    >
                      {service.isActive ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
