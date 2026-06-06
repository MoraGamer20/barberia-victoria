'use client';

import { useState } from 'react';
import { CalendarX, Clock, Trash2 } from 'lucide-react';

export default function BlocksManagement() {
  const [activeTab, setActiveTab] = useState<'days' | 'times'>('days');

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white mb-6">Gestión de Bloqueos</h1>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-white/10 pb-4">
        <button 
          onClick={() => setActiveTab('days')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'days' ? 'bg-gold-500 text-dark-900' : 'text-gray-400 hover:text-white hover:bg-dark-800'}`}
        >
          <CalendarX className="w-5 h-5" />
          Días Completos
        </button>
        <button 
          onClick={() => setActiveTab('times')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'times' ? 'bg-gold-500 text-dark-900' : 'text-gray-400 hover:text-white hover:bg-dark-800'}`}
        >
          <Clock className="w-5 h-5" />
          Horarios Específicos
        </button>
      </div>

      {activeTab === 'days' && (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1 bg-dark-800 p-6 rounded-xl border border-white/5 h-fit">
            <h2 className="text-xl font-bold text-white mb-4">Nuevo Bloqueo (Día)</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Fecha a bloquear</label>
                <input type="date" className="w-full bg-dark-900 border border-white/10 rounded-lg p-2 text-white focus:border-gold-500" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Profesional (o Todos)</label>
                <select className="w-full bg-dark-900 border border-white/10 rounded-lg p-2 text-white focus:border-gold-500">
                  <option value="all">Todo el local (Cerrado)</option>
                  <option value="p1">Alejandro (Barbería)</option>
                  <option value="p2">María (Estética)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Motivo</label>
                <input type="text" placeholder="Ej. Vacaciones, Día festivo" className="w-full bg-dark-900 border border-white/10 rounded-lg p-2 text-white focus:border-gold-500" />
              </div>
              <button type="button" className="w-full bg-gold-500 text-dark-900 font-bold py-2 rounded-lg hover:bg-gold-600 transition-colors">
                Guardar Bloqueo
              </button>
            </form>
          </div>

          <div className="md:col-span-2 bg-dark-800 rounded-xl border border-white/5 overflow-hidden">
             <table className="w-full text-left">
              <thead className="bg-dark-700 text-gray-300 text-sm">
                <tr>
                  <th className="p-4">Fecha</th>
                  <th className="p-4">Profesional</th>
                  <th className="p-4">Motivo</th>
                  <th className="p-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <tr className="hover:bg-dark-700/50">
                  <td className="p-4 text-white font-medium">2026-12-25</td>
                  <td className="p-4 text-gray-300">Todo el local</td>
                  <td className="p-4 text-gray-300">Navidad</td>
                  <td className="p-4 text-right">
                    <button className="p-2 hover:bg-dark-900 rounded-lg text-red-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'times' && (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1 bg-dark-800 p-6 rounded-xl border border-white/5 h-fit">
            <h2 className="text-xl font-bold text-white mb-4">Nuevo Bloqueo (Hora)</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Fecha</label>
                <input type="date" className="w-full bg-dark-900 border border-white/10 rounded-lg p-2 text-white focus:border-gold-500" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Hora Inicio</label>
                  <input type="time" className="w-full bg-dark-900 border border-white/10 rounded-lg p-2 text-white focus:border-gold-500" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Hora Fin</label>
                  <input type="time" className="w-full bg-dark-900 border border-white/10 rounded-lg p-2 text-white focus:border-gold-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Profesional</label>
                <select className="w-full bg-dark-900 border border-white/10 rounded-lg p-2 text-white focus:border-gold-500">
                  <option value="p1">Alejandro (Barbería)</option>
                  <option value="p2">María (Estética)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Motivo</label>
                <input type="text" placeholder="Ej. Hora de comida" className="w-full bg-dark-900 border border-white/10 rounded-lg p-2 text-white focus:border-gold-500" />
              </div>
              <button type="button" className="w-full bg-gold-500 text-dark-900 font-bold py-2 rounded-lg hover:bg-gold-600 transition-colors">
                Guardar Bloqueo
              </button>
            </form>
          </div>

          <div className="md:col-span-2 bg-dark-800 rounded-xl border border-white/5 overflow-hidden">
             <table className="w-full text-left">
              <thead className="bg-dark-700 text-gray-300 text-sm">
                <tr>
                  <th className="p-4">Fecha y Hora</th>
                  <th className="p-4">Profesional</th>
                  <th className="p-4">Motivo</th>
                  <th className="p-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <tr className="hover:bg-dark-700/50">
                  <td className="p-4 text-white font-medium">2026-06-10<br/><span className="text-sm text-gray-400">14:00 - 15:00</span></td>
                  <td className="p-4 text-gray-300">Alejandro</td>
                  <td className="p-4 text-gray-300">Comida</td>
                  <td className="p-4 text-right">
                    <button className="p-2 hover:bg-dark-900 rounded-lg text-red-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
