'use client';

import { useEffect, useState } from 'react';
import { CalendarX, Clock, Pencil, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface BlockItem {
  id: string;
  date: string;
  professionalId?: string;
  reason?: string;
  startTime?: string;
  endTime?: string;
}

export default function BlocksManagement() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'days' | 'times'>('days');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [blockedDays, setBlockedDays] = useState<BlockItem[]>([]);
  const [blockedTimes, setBlockedTimes] = useState<BlockItem[]>([]);
  const [editingDay, setEditingDay] = useState<BlockItem | null>(null);
  const [editingTime, setEditingTime] = useState<BlockItem | null>(null);
  const [dayForm, setDayForm] = useState({ date: '', professionalId: 'all', reason: '' });
  const [timeForm, setTimeForm] = useState({ date: '', startTime: '09:00', endTime: '10:00', professionalId: '', reason: '' });

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  async function loadData() {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const [blocksRes, professionalsRes] = await Promise.all([
        fetch('/api/admin/blocks', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/professionals', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const blocksData = await blocksRes.json();
      const professionalsData = await professionalsRes.json();

      setBlockedDays(blocksData.blockedDays || []);
      setBlockedTimes(blocksData.blockedTimes || []);
      setProfessionals(professionalsData.professionals || []);
      if (!timeForm.professionalId && (professionalsData.professionals || []).length) {
        setTimeForm((prev) => ({ ...prev, professionalId: professionalsData.professionals[0].id }));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function saveBlock(type: 'day' | 'time') {
    if (!user) return;
    setSaving(true);

    try {
      const token = await user.getIdToken();
      const payload = type === 'day'
        ? { type: 'day', ...dayForm }
        : { type: 'time', ...timeForm };
      const method = (type === 'day' && editingDay) || (type === 'time' && editingTime) ? 'PUT' : 'POST';
      const body = method === 'PUT'
        ? { ...payload, id: type === 'day' ? editingDay?.id : editingTime?.id }
        : payload;

      await fetch('/api/admin/blocks', {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (type === 'day') {
        setEditingDay(null);
        setDayForm({ date: '', professionalId: 'all', reason: '' });
      } else {
        setEditingTime(null);
        setTimeForm({ date: '', startTime: '09:00', endTime: '10:00', professionalId: professionals[0]?.id || '', reason: '' });
      }

      await loadData();
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  }

  async function deleteBlock(type: 'day' | 'time', id: string) {
    if (!user) return;
    if (!confirm('¿Eliminar este bloqueo?')) return;

    try {
      const token = await user.getIdToken();
      await fetch(`/api/admin/blocks/${id}?type=${type}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      await loadData();
    } catch (error) {
      console.error(error);
    }
  }

  function startEditingDay(item: BlockItem) {
    setEditingDay(item);
    setActiveTab('days');
    setDayForm({ date: item.date, professionalId: item.professionalId || 'all', reason: item.reason || '' });
  }

  function startEditingTime(item: BlockItem) {
    setEditingTime(item);
    setActiveTab('times');
    setTimeForm({
      date: item.date,
      startTime: item.startTime || '09:00',
      endTime: item.endTime || '10:00',
      professionalId: item.professionalId || professionals[0]?.id || '',
      reason: item.reason || '',
    });
  }

  function getProfessionalName(id?: string) {
    if (!id || id === 'all') return 'Todo el local';
    return professionals.find((p) => p.id === id)?.name || id;
  }

  if (loading) return <div className="text-white">Cargando bloqueos...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Gestión de bloqueos</h1>
          <p className="text-gray-400 mt-1">Crea bloqueos por día o por horario y reflejalos automáticamente en la disponibilidad.</p>
        </div>
      </div>

      <div className="flex gap-4 border-b border-white/10 pb-4">
        <button onClick={() => setActiveTab('days')} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'days' ? 'bg-gold-500 text-dark-900' : 'text-gray-400 hover:text-white hover:bg-dark-800'}`}>
          <CalendarX className="w-5 h-5" />
          Días completos
        </button>
        <button onClick={() => setActiveTab('times')} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'times' ? 'bg-gold-500 text-dark-900' : 'text-gray-400 hover:text-white hover:bg-dark-800'}`}>
          <Clock className="w-5 h-5" />
          Horarios específicos
        </button>
      </div>

      {activeTab === 'days' && (
        <div className="grid md:grid-cols-3 gap-6">
          <section className="md:col-span-1 bg-dark-800 p-6 rounded-xl border border-white/5 h-fit">
            <h2 className="text-xl font-bold text-white mb-4">{editingDay ? 'Editar bloqueo por día' : 'Nuevo bloqueo por día'}</h2>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); saveBlock('day'); }}>
              <div>
                <label htmlFor="dayDate" className="block text-sm text-gray-400 mb-1">Fecha a bloquear</label>
                <input id="dayDate" type="date" value={dayForm.date} onChange={(e) => setDayForm((prev) => ({ ...prev, date: e.target.value }))} className="w-full bg-dark-900 border border-white/10 rounded-lg p-2 text-white focus:border-gold-500" required />
              </div>
              <div>
                <label htmlFor="dayProfessional" className="block text-sm text-gray-400 mb-1">Profesional (o todos)</label>
                <select id="dayProfessional" value={dayForm.professionalId} onChange={(e) => setDayForm((prev) => ({ ...prev, professionalId: e.target.value }))} className="w-full bg-dark-900 border border-white/10 rounded-lg p-2 text-white focus:border-gold-500">
                  <option value="all">Todo el local</option>
                  {professionals.map((prof) => <option key={prof.id} value={prof.id}>{prof.name}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="dayReason" className="block text-sm text-gray-400 mb-1">Motivo</label>
                <input id="dayReason" type="text" value={dayForm.reason} onChange={(e) => setDayForm((prev) => ({ ...prev, reason: e.target.value }))} placeholder="Ej. Vacaciones, Día festivo" className="w-full bg-dark-900 border border-white/10 rounded-lg p-2 text-white focus:border-gold-500" required />
              </div>
              <button type="submit" disabled={saving} className="w-full bg-gold-500 text-dark-900 font-bold py-2 rounded-lg hover:bg-gold-600 transition-colors disabled:opacity-70">
                {saving ? 'Guardando...' : editingDay ? 'Actualizar bloqueo' : 'Guardar bloqueo'}
              </button>
              {editingDay && <button type="button" onClick={() => { setEditingDay(null); setDayForm({ date: '', professionalId: 'all', reason: '' }); }} className="w-full rounded-lg border border-white/10 bg-dark-900 text-white py-2">Cancelar edición</button>}
            </form>
          </section>

          <section className="md:col-span-2 bg-dark-800 rounded-xl border border-white/5 overflow-hidden">
            <table className="w-full text-left text-white">
              <thead className="bg-dark-700 text-gray-300 text-sm">
                <tr><th className="p-4">Fecha</th><th className="p-4">Profesional</th><th className="p-4">Motivo</th><th className="p-4 text-right">Acciones</th></tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {blockedDays.length === 0 ? <tr><td colSpan={4} className="p-4 text-gray-400">No hay bloqueos por día registrados.</td></tr> : blockedDays.map((item) => (
                  <tr key={item.id} className="hover:bg-dark-700/50">
                    <td className="p-4 font-medium text-white">{item.date}</td>
                    <td className="p-4 text-gray-200">{getProfessionalName(item.professionalId)}</td>
                    <td className="p-4 text-gray-200">{item.reason}</td>
                    <td className="p-4 text-right space-x-2">
                      <button type="button" aria-label="Editar bloqueo por día" onClick={() => startEditingDay(item)} className="rounded-lg border border-white/10 p-2 text-gold-400 hover:bg-dark-900"><Pencil className="w-4 h-4" /></button>
                      <button type="button" aria-label="Eliminar bloqueo por día" onClick={() => deleteBlock('day', item.id)} className="rounded-lg border border-white/10 p-2 text-red-400 hover:bg-dark-900"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      )}

      {activeTab === 'times' && (
        <div className="grid md:grid-cols-3 gap-6">
          <section className="md:col-span-1 bg-dark-800 p-6 rounded-xl border border-white/5 h-fit">
            <h2 className="text-xl font-bold text-white mb-4">{editingTime ? 'Editar bloqueo por horario' : 'Nuevo bloqueo por horario'}</h2>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); saveBlock('time'); }}>
              <div>
                <label htmlFor="timeDate" className="block text-sm text-gray-400 mb-1">Fecha</label>
                <input id="timeDate" type="date" value={timeForm.date} onChange={(e) => setTimeForm((prev) => ({ ...prev, date: e.target.value }))} className="w-full bg-dark-900 border border-white/10 rounded-lg p-2 text-white focus:border-gold-500" required />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="timeStart" className="block text-sm text-gray-400 mb-1">Hora inicio</label>
                  <input id="timeStart" type="time" value={timeForm.startTime} onChange={(e) => setTimeForm((prev) => ({ ...prev, startTime: e.target.value }))} className="w-full bg-dark-900 border border-white/10 rounded-lg p-2 text-white focus:border-gold-500" required />
                </div>
                <div>
                  <label htmlFor="timeEnd" className="block text-sm text-gray-400 mb-1">Hora fin</label>
                  <input id="timeEnd" type="time" value={timeForm.endTime} onChange={(e) => setTimeForm((prev) => ({ ...prev, endTime: e.target.value }))} className="w-full bg-dark-900 border border-white/10 rounded-lg p-2 text-white focus:border-gold-500" required />
                </div>
              </div>
              <div>
                <label htmlFor="timeProfessional" className="block text-sm text-gray-400 mb-1">Profesional</label>
                <select id="timeProfessional" value={timeForm.professionalId} onChange={(e) => setTimeForm((prev) => ({ ...prev, professionalId: e.target.value }))} className="w-full bg-dark-900 border border-white/10 rounded-lg p-2 text-white focus:border-gold-500">
                  {professionals.map((prof) => <option key={prof.id} value={prof.id}>{prof.name}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="timeReason" className="block text-sm text-gray-400 mb-1">Motivo</label>
                <input id="timeReason" type="text" value={timeForm.reason} onChange={(e) => setTimeForm((prev) => ({ ...prev, reason: e.target.value }))} placeholder="Ej. Hora de comida" className="w-full bg-dark-900 border border-white/10 rounded-lg p-2 text-white focus:border-gold-500" required />
              </div>
              <button type="submit" disabled={saving} className="w-full bg-gold-500 text-dark-900 font-bold py-2 rounded-lg hover:bg-gold-600 transition-colors disabled:opacity-70">
                {saving ? 'Guardando...' : editingTime ? 'Actualizar bloqueo' : 'Guardar bloqueo'}
              </button>
              {editingTime && <button type="button" onClick={() => { setEditingTime(null); setTimeForm({ date: '', startTime: '09:00', endTime: '10:00', professionalId: professionals[0]?.id || '', reason: '' }); }} className="w-full rounded-lg border border-white/10 bg-dark-900 text-white py-2">Cancelar edición</button>}
            </form>
          </section>

          <section className="md:col-span-2 bg-dark-800 rounded-xl border border-white/5 overflow-hidden">
            <table className="w-full text-left text-white">
              <thead className="bg-dark-700 text-gray-300 text-sm">
                <tr><th className="p-4">Fecha y hora</th><th className="p-4">Profesional</th><th className="p-4">Motivo</th><th className="p-4 text-right">Acciones</th></tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {blockedTimes.length === 0 ? <tr><td colSpan={4} className="p-4 text-gray-400">No hay bloqueos por horario registrados.</td></tr> : blockedTimes.map((item) => (
                  <tr key={item.id} className="hover:bg-dark-700/50">
                    <td className="p-4 font-medium text-white">{item.date}<br /><span className="text-sm text-gray-400">{item.startTime} - {item.endTime}</span></td>
                    <td className="p-4 text-gray-200">{getProfessionalName(item.professionalId)}</td>
                    <td className="p-4 text-gray-200">{item.reason}</td>
                    <td className="p-4 text-right space-x-2">
                      <button type="button" aria-label="Editar bloqueo por horario" onClick={() => startEditingTime(item)} className="rounded-lg border border-white/10 p-2 text-gold-400 hover:bg-dark-900"><Pencil className="w-4 h-4" /></button>
                      <button type="button" aria-label="Eliminar bloqueo por horario" onClick={() => deleteBlock('time', item.id)} className="rounded-lg border border-white/10 p-2 text-red-400 hover:bg-dark-900"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      )}
    </div>
  );
}
