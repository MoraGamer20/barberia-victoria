'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function SettingsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    whatsappNumber: '',
    openingTime: '09:00',
    closingTime: '20:00',
    address: '',
    instagram: '',
    facebook: '',
  });

  useEffect(() => {
    if (!user) return;

    const currentUser = user;
    let isMounted = true;

    async function fetchSettings() {
      try {
        const token = await currentUser.getIdToken();
        const res = await fetch('/api/admin/settings', { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();

        if (!isMounted || !data.settings) return;

        setSettings({
          whatsappNumber: data.settings.whatsappNumber || '',
          openingTime: data.settings.openingTime || '09:00',
          closingTime: data.settings.closingTime || '20:00',
          address: data.settings.address || '',
          instagram: data.settings.instagram || '',
          facebook: data.settings.facebook || '',
        });
      } catch (error) {
        console.error(error);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    void fetchSettings();

    return () => {
      isMounted = false;
    };
  }, [user]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;

    setSaving(true);

    try {
      const token = await user.getIdToken();
      await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });

      alert('Configuración actualizada correctamente');
    } catch (error) {
      console.error(error);
      alert('No se pudo guardar la configuración');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="text-white">Cargando configuración...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Configuración del negocio</h1>
        <p className="text-gray-400 mt-2">Actualiza WhatsApp, horarios, dirección y redes sociales para que el landing y la reserva reflejen los cambios en tiempo real.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="bg-dark-800 rounded-xl border border-white/5 p-6 space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">WhatsApp</label>
            <input
              value={settings.whatsappNumber}
              onChange={(e) => setSettings((prev) => ({ ...prev, whatsappNumber: e.target.value }))}
              className="w-full rounded-lg border border-white/10 bg-dark-900 p-3 text-white"
              placeholder="528341656549"
              aria-label="WhatsApp"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Horario de apertura</label>
              <input
                type="time"
                value={settings.openingTime}
                onChange={(e) => setSettings((prev) => ({ ...prev, openingTime: e.target.value }))}
                className="w-full rounded-lg border border-white/10 bg-dark-900 p-3 text-white"
                aria-label="Horario de apertura"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Horario de cierre</label>
              <input
                type="time"
                value={settings.closingTime}
                onChange={(e) => setSettings((prev) => ({ ...prev, closingTime: e.target.value }))}
                className="w-full rounded-lg border border-white/10 bg-dark-900 p-3 text-white"
                aria-label="Horario de cierre"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Dirección</label>
            <textarea
              rows={3}
              value={settings.address}
              onChange={(e) => setSettings((prev) => ({ ...prev, address: e.target.value }))}
              className="w-full rounded-lg border border-white/10 bg-dark-900 p-3 text-white"
              placeholder="Calle Principal #123, Centro"
            />
          </div>
        </section>

        <section className="bg-dark-800 rounded-xl border border-white/5 p-6 space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Instagram</label>
            <input
              value={settings.instagram}
              onChange={(e) => setSettings((prev) => ({ ...prev, instagram: e.target.value }))}
              className="w-full rounded-lg border border-white/10 bg-dark-900 p-3 text-white"
              placeholder="https://www.instagram.com/tu_negocio"
              aria-label="Instagram"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Facebook</label>
            <input
              value={settings.facebook}
              onChange={(e) => setSettings((prev) => ({ ...prev, facebook: e.target.value }))}
              className="w-full rounded-lg border border-white/10 bg-dark-900 p-3 text-white"
              placeholder="https://www.facebook.com/tu_negocio"
              aria-label="Facebook"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-gold-500 px-4 py-3 text-dark-900 font-bold hover:bg-gold-600 disabled:opacity-70"
          >
            {saving ? 'Guardando...' : 'Guardar configuración'}
          </button>

          <div className="rounded-lg border border-gold-500/20 bg-gold-500/5 p-4 text-sm text-gray-200">
            Los cambios se aplican automáticamente a la reserva en línea y al landing principal.
          </div>
        </section>
      </form>
    </div>
  );
}
