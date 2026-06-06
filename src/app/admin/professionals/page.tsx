'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function ProfessionalsPage() {
  const { user } = useAuth();
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProfessional, setEditingProfessional] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchProfessionals();
  }, [user]);

  async function fetchProfessionals() {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/admin/professionals', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.professionals) setProfessionals(data.professionals);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function saveProfessional(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return;
    const token = await user.getIdToken();
    const formData = new FormData(e.currentTarget);
    const payload = {
      name: formData.get('name'),
      area: formData.get('area'),
      active: formData.get('active') === 'on'
    };

    try {
      const method = editingProfessional?.id ? 'PUT' : 'POST';
      const body = editingProfessional?.id ? { ...payload, id: editingProfessional.id } : payload;
      
      await fetch('/api/admin/professionals', {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      
      setIsModalOpen(false);
      setEditingProfessional(null);
      fetchProfessionals();
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) return <div className="text-white">Cargando...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Profesionales</h1>
        <button 
          onClick={() => { setEditingProfessional(null); setIsModalOpen(true); }}
          className="bg-gold-500 text-dark-900 px-4 py-2 rounded-lg font-bold hover:bg-gold-600"
        >
          + Nuevo Profesional
        </button>
      </div>

      <div className="bg-dark-800 rounded-xl border border-white/5 overflow-hidden">
        <table className="w-full text-left text-white">
          <thead className="bg-dark-700 border-b border-white/5">
            <tr>
              <th className="p-4">Nombre</th>
              <th className="p-4">Área</th>
              <th className="p-4">Estado</th>
              <th className="p-4">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {professionals.map(p => (
              <tr key={p.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="p-4 font-bold">{p.name}</td>
                <td className="p-4 capitalize">{p.area}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${p.active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {p.active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="p-4">
                  <button 
                    onClick={() => { setEditingProfessional(p); setIsModalOpen(true); }}
                    className="text-gold-500 hover:text-white"
                  >
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-800 p-6 rounded-xl w-full max-w-md border border-white/10">
            <h2 className="text-xl font-bold text-white mb-4">
              {editingProfessional ? 'Editar Profesional' : 'Nuevo Profesional'}
            </h2>
            <form onSubmit={saveProfessional} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Nombre</label>
                <input required defaultValue={editingProfessional?.name} name="name" className="w-full p-2 bg-dark-900 rounded border border-white/10 text-white" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Área</label>
                <select name="area" defaultValue={editingProfessional?.area || 'barberia'} className="w-full p-2 bg-dark-900 rounded border border-white/10 text-white">
                  <option value="barberia">Barbería</option>
                  <option value="estetica">Estética</option>
                </select>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input type="checkbox" name="active" id="active" defaultChecked={editingProfessional ? editingProfessional.active : true} />
                <label htmlFor="active" className="text-white">Profesional Activo</label>
              </div>
              <div className="flex gap-2 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 p-2 bg-dark-700 rounded text-white hover:bg-dark-600">Cancelar</button>
                <button type="submit" className="flex-1 p-2 bg-gold-500 rounded text-dark-900 font-bold hover:bg-gold-600">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
