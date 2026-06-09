'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Edit, Trash2, Plus, Tag, Calendar, Image as ImageIcon, Sparkles } from 'lucide-react';
import { Promotion } from '@/types/promotions';

const TAG_COLOR_PRESETS = [
  { name: 'Naranja (Más Popular)', value: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
  { name: 'Azul (Especial / Familia)', value: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  { name: 'Púrpura (Entre Semana)', value: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
  { name: 'Rosa (Estética)', value: 'text-pink-400 bg-pink-500/10 border-pink-500/20' },
  { name: 'Dorado (Premium)', value: 'text-gold-500 bg-gold-500/10 border-gold-500/20' },
];

const EMOJI_PRESETS = ['🔥', '👨‍👦', '📅', '💎', '✂️', '💈', '🌟', '🎁', '⚡', '💆'];

export default function PromotionsAdminPage() {
  const { user } = useAuth();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Promotion | null>(null);

  // Form states
  const [selectedEmoji, setSelectedEmoji] = useState('🔥');
  const [tagColor, setTagColor] = useState(TAG_COLOR_PRESETS[0].value);
  const [isCustomColor, setIsCustomColor] = useState(false);
  const [customColor, setCustomColor] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    fetchPromotions();
  }, [user]);

  async function fetchPromotions() {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/admin/promotions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.promotions) {
        setPromotions(data.promotions);
      }
    } catch (err) {
      console.error('Error fetching promotions:', err);
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setEditingPromo(null);
    setSelectedEmoji('🔥');
    setTagColor(TAG_COLOR_PRESETS[0].value);
    setIsCustomColor(false);
    setCustomColor('');
    setImageUrl('');
    setIsModalOpen(true);
  }

  function openEditModal(promo: Promotion) {
    setEditingPromo(promo);
    setSelectedEmoji(promo.emoji || '🔥');
    setImageUrl(promo.imageUrl || '');
    
    const isPreset = TAG_COLOR_PRESETS.some(p => p.value === promo.tagColor);
    if (isPreset) {
      setTagColor(promo.tagColor);
      setIsCustomColor(false);
    } else {
      setTagColor('custom');
      setIsCustomColor(true);
      setCustomColor(promo.tagColor || '');
    }
    
    setIsModalOpen(true);
  }

  async function savePromotion(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return;
    
    const token = await user.getIdToken();
    const formData = new FormData(e.currentTarget);
    
    const finalTagColor = isCustomColor ? customColor : tagColor;
    
    const payload = {
      emoji: selectedEmoji,
      tag: formData.get('tag'),
      tagColor: finalTagColor,
      name: formData.get('name'),
      description: formData.get('description'),
      originalPrice: formData.get('originalPrice') ? Number(formData.get('originalPrice')) : null,
      promoPrice: formData.get('promoPrice') ? Number(formData.get('promoPrice')) : null,
      discount: formData.get('discount'),
      validFrom: formData.get('validFrom'),
      validTo: formData.get('validTo'),
      imageUrl: imageUrl || null,
      order: Number(formData.get('order') || 0),
      isActive: formData.get('isActive') === 'on',
    };

    try {
      const method = editingPromo?.id ? 'PUT' : 'POST';
      const body = editingPromo?.id ? { ...payload, id: editingPromo.id } : payload;
      
      const res = await fetch('/api/admin/promotions', {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      
      if (res.ok) {
        setIsModalOpen(false);
        setEditingPromo(null);
        fetchPromotions();
      } else {
        const errData = await res.json();
        alert(`Error al guardar: ${errData.error}`);
      }
    } catch (err) {
      console.error('Error saving promotion:', err);
    }
  }

  async function deletePromotion(id: string) {
    if (!user) return;
    if (!confirm('¿Estás seguro de que deseas eliminar esta promoción? (Borrado lógico)')) return;
    
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/admin/promotions?id=${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        fetchPromotions();
      } else {
        const errData = await res.json();
        alert(`Error al eliminar: ${errData.error}`);
      }
    } catch (err) {
      console.error('Error deleting promotion:', err);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin w-8 h-8 border-4 border-gold-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Promociones</h1>
          <p className="text-gray-400 text-sm mt-1">Administra los paquetes y ofertas especiales visibles en la Landing Page.</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="bg-gold-500 text-dark-900 px-4 py-2.5 rounded-lg font-bold hover:bg-gold-600 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Nueva Promoción
        </button>
      </div>

      <div className="bg-dark-800 rounded-xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-white border-collapse">
            <thead className="bg-dark-700/50 border-b border-white/5">
              <tr>
                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-gray-400">Orden / Info</th>
                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-gray-400">Tag / Badge</th>
                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-gray-400">Descuento</th>
                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-gray-400">Precios</th>
                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-gray-400">Vigencia</th>
                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-gray-400">Estado</th>
                <th className="p-4 text-xs font-semibold uppercase tracking-wider text-gray-400">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {promotions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    No se encontraron promociones. ¡Crea una nueva promoción para empezar!
                  </td>
                </tr>
              ) : (
                promotions.map(p => (
                  <tr key={p.id} className="hover:bg-white/5 transition-colors">
                    {/* Info */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500 font-bold bg-dark-900 px-2 py-1 rounded">#{p.order}</span>
                        <span className="text-2xl">{p.emoji}</span>
                        <div>
                          <p className="font-bold text-white text-sm sm:text-base">{p.name}</p>
                          <p className="text-xs text-gray-400 max-w-[200px] truncate">{p.description}</p>
                          {p.imageUrl && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-gold-500 mt-1">
                              <ImageIcon className="w-3 h-3" /> Con imagen banner
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    
                    {/* Tag */}
                    <td className="p-4">
                      {p.tag ? (
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${p.tagColor}`}>
                          {p.tag}
                        </span>
                      ) : (
                        <span className="text-gray-600">-</span>
                      )}
                    </td>
                    
                    {/* Discount */}
                    <td className="p-4 font-black text-gold-500 text-sm">{p.discount}</td>

                    {/* Prices */}
                    <td className="p-4 text-sm">
                      {p.promoPrice ? (
                        <div className="flex flex-col">
                          <span className="font-bold text-green-400">${p.promoPrice}</span>
                          <span className="text-gray-500 line-through text-xs">${p.originalPrice}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>

                    {/* Validity */}
                    <td className="p-4 text-xs text-gray-400">
                      <div className="flex flex-col gap-0.5">
                        <span>Desde: {p.validFrom || 'N/A'}</span>
                        <span>Hasta: {p.validTo || 'N/A'}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${p.isActive ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'}`}>
                        {p.isActive ? 'Activo' : 'Pausado'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => openEditModal(p)}
                          className="text-gray-400 hover:text-gold-500 transition-colors p-1 rounded"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => deletePromotion(p.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-dark-800 p-6 rounded-2xl w-full max-w-lg border border-white/10 my-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-gold-500" />
              {editingPromo ? 'Editar Promoción' : 'Nueva Promoción'}
            </h2>
            
            <form onSubmit={savePromotion} className="space-y-4">
              {/* Emoji Selector */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Emoji Representativo</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {EMOJI_PRESETS.map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setSelectedEmoji(emoji)}
                      className={`text-xl p-2 rounded-lg border transition-all ${selectedEmoji === emoji ? 'bg-gold-500/20 border-gold-500 scale-110' : 'bg-dark-900 border-white/5 hover:border-white/20'}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                <input 
                  required 
                  value={selectedEmoji} 
                  onChange={(e) => setSelectedEmoji(e.target.value)}
                  className="w-full p-2.5 bg-dark-900 rounded-lg border border-white/10 text-white text-sm"
                  placeholder="O escribe/pega otro emoji"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Name */}
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm text-gray-400 mb-1">Nombre</label>
                  <input required defaultValue={editingPromo?.name} name="name" className="w-full p-2.5 bg-dark-900 rounded-lg border border-white/10 text-white text-sm focus:border-gold-500 focus:outline-none" />
                </div>
                {/* Discount text */}
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm text-gray-400 mb-1">Texto Descuento (ej. 20% OFF)</label>
                  <input required defaultValue={editingPromo?.discount} name="discount" placeholder="10% OFF, Regalo Gratis..." className="w-full p-2.5 bg-dark-900 rounded-lg border border-white/10 text-white text-sm focus:border-gold-500 focus:outline-none" />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Descripción</label>
                <textarea required defaultValue={editingPromo?.description} name="description" rows={2} className="w-full p-2.5 bg-dark-900 rounded-lg border border-white/10 text-white text-sm focus:border-gold-500 focus:outline-none" />
              </div>

              {/* Prices */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Precio Original ($) (opcional)</label>
                  <input type="number" defaultValue={editingPromo?.originalPrice ?? ''} name="originalPrice" className="w-full p-2.5 bg-dark-900 rounded-lg border border-white/10 text-white text-sm focus:border-gold-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Precio Promo ($) (opcional)</label>
                  <input type="number" defaultValue={editingPromo?.promoPrice ?? ''} name="promoPrice" className="w-full p-2.5 bg-dark-900 rounded-lg border border-white/10 text-white text-sm focus:border-gold-500 focus:outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Valid From */}
                <div>
                  <label className="block text-sm text-gray-400 mb-1 flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-gold-500" /> Vigente Desde
                  </label>
                  <input type="date" required defaultValue={editingPromo?.validFrom || new Date().toLocaleDateString('sv')} name="validFrom" className="w-full p-2.5 bg-dark-900 rounded-lg border border-white/10 text-white text-sm focus:border-gold-500 focus:outline-none" />
                </div>
                {/* Valid To */}
                <div>
                  <label className="block text-sm text-gray-400 mb-1 flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-gold-500" /> Vigente Hasta
                  </label>
                  <input type="date" required defaultValue={editingPromo?.validTo || ''} name="validTo" className="w-full p-2.5 bg-dark-900 rounded-lg border border-white/10 text-white text-sm focus:border-gold-500 focus:outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Tag label */}
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Etiqueta / Tag (ej. MÁS POPULAR)</label>
                  <input defaultValue={editingPromo?.tag} name="tag" placeholder="MÁS POPULAR" className="w-full p-2.5 bg-dark-900 rounded-lg border border-white/10 text-white text-sm focus:border-gold-500 focus:outline-none" />
                </div>
                {/* Display Order */}
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Orden de Visualización</label>
                  <input type="number" defaultValue={editingPromo?.order ?? 1} name="order" className="w-full p-2.5 bg-dark-900 rounded-lg border border-white/10 text-white text-sm focus:border-gold-500 focus:outline-none" />
                </div>
              </div>

              {/* Tag Color Selector */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Color de la Etiqueta</label>
                <select 
                  value={isCustomColor ? 'custom' : tagColor} 
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'custom') {
                      setIsCustomColor(true);
                      setTagColor('custom');
                    } else {
                      setIsCustomColor(false);
                      setTagColor(val);
                    }
                  }}
                  className="w-full p-2.5 bg-dark-900 rounded-lg border border-white/10 text-white text-sm focus:border-gold-500 focus:outline-none mb-2"
                >
                  {TAG_COLOR_PRESETS.map(preset => (
                    <option key={preset.name} value={preset.value}>{preset.name}</option>
                  ))}
                  <option value="custom">Clases de Tailwind personalizadas...</option>
                </select>
                {isCustomColor && (
                  <input 
                    required 
                    value={customColor} 
                    onChange={(e) => setCustomColor(e.target.value)}
                    placeholder="ej. text-red-400 bg-red-500/10 border-red-500/20" 
                    className="w-full p-2.5 bg-dark-900 rounded-lg border border-white/10 text-white text-sm focus:border-gold-500 focus:outline-none"
                  />
                )}
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-sm text-gray-400 mb-1 flex items-center gap-1">
                  <ImageIcon className="w-4 h-4 text-gold-500" /> URL de Imagen Banner (Opcional)
                </label>
                <input 
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://ejemplo.com/imagen.jpg" 
                  className="w-full p-2.5 bg-dark-900 rounded-lg border border-white/10 text-white text-sm focus:border-gold-500 focus:outline-none"
                />
                {imageUrl && (
                  <div className="mt-2 relative w-full h-24 rounded-lg overflow-hidden border border-white/10 bg-dark-900">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imageUrl} alt="Vista previa banner" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Toggle Switch */}
              <div className="flex items-center gap-2 pt-2">
                <input type="checkbox" name="isActive" id="isActive" defaultChecked={editingPromo ? editingPromo.isActive : true} className="w-4 h-4 accent-gold-500 cursor-pointer" />
                <label htmlFor="isActive" className="text-white text-sm font-semibold select-none cursor-pointer">Promoción Activa (visible en landing)</label>
              </div>

              <div className="flex gap-3 pt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-dark-700 rounded-lg text-white font-bold hover:bg-dark-600 transition-colors">Cancelar</button>
                <button type="submit" className="flex-1 py-3 bg-gold-500 rounded-lg text-dark-900 font-bold hover:bg-gold-600 transition-colors">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
