'use client';

import { useState } from 'react';
import { Edit2, ToggleLeft, ToggleRight } from 'lucide-react';

const MOCK_PROFESSIONALS = [
  { id: 'p1', name: 'Alejandro', area: 'barberia', active: true },
  { id: 'p2', name: 'María', area: 'estetica', active: true },
  { id: 'p3', name: 'Juan', area: 'barberia', active: false },
];

export default function ProfessionalsManagement() {
  const [professionals, setProfessionals] = useState(MOCK_PROFESSIONALS);

  const toggleActive = (id: string) => {
    setProfessionals(prev => prev.map(p => p.id === id ? { ...p, active: !p.active } : p));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Gestión de Profesionales</h1>
        <button className="bg-gold-500 hover:bg-gold-600 text-dark-900 font-bold py-2 px-4 rounded-lg transition-colors">
          + Nuevo Profesional
        </button>
      </div>

      <div className="bg-dark-800 rounded-xl border border-white/5 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-dark-700 text-gray-300 text-sm">
            <tr>
              <th className="p-4 font-medium">Nombre</th>
              <th className="p-4 font-medium">Área</th>
              <th className="p-4 font-medium text-center">Estado</th>
              <th className="p-4 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {professionals.map(prof => (
              <tr key={prof.id} className={`hover:bg-dark-700/50 transition-colors ${!prof.active ? 'opacity-50' : ''}`}>
                <td className="p-4 text-white font-medium">{prof.name}</td>
                <td className="p-4 text-gray-300 capitalize">{prof.area}</td>
                <td className="p-4 text-center">
                  <span className={`px-2 py-1 rounded text-xs uppercase tracking-wider border ${prof.active ? 'text-green-400 bg-green-400/10 border-green-400/20' : 'text-gray-400 bg-gray-400/10 border-gray-400/20'}`}>
                    {prof.active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-2 hover:bg-dark-900 rounded-lg text-gray-400 hover:text-white transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => toggleActive(prof.id)}
                      className={`p-2 hover:bg-dark-900 rounded-lg transition-colors ${prof.active ? 'text-green-500 hover:text-gray-400' : 'text-gray-500 hover:text-green-400'}`}
                    >
                      {prof.active ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
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
