'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface ServiceItem {
  id: string;
  name: string;
  area: string;
  price: number;
  durationMinutes?: number;
  description?: string;
  isActive?: boolean;
  order?: number;
}

const areaBadges: Record<string, { label: string; classes: string }> = {
  barberia: { label: '💈 Barbería', classes: 'bg-blue-500/10 text-blue-400 border border-blue-500/20' },
  estetica: { label: '✨ Estética', classes: 'bg-purple-500/10 text-purple-400 border border-purple-500/20' },
};

export default function ServicesSection() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadServices() {
      try {
        const res = await fetch('/api/services');
        const data = await res.json();

        const items = Array.isArray(data.services)
          ? [...data.services].sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.name.localeCompare(b.name))
          : [];

        setServices(items);
      } catch (error) {
        console.error('Error loading services', error);
      } finally {
        setLoading(false);
      }
    }

    loadServices();
  }, []);

  return (
    <section id="servicios" className="py-24 bg-dark-900 relative overflow-hidden">
      <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_1px_1px,rgba(212,175,55,0.3)_1px,transparent_0)] bg-[length:40px_40px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <span className="text-gold-500 font-medium tracking-widest uppercase text-sm">Nuestros servicios</span>
          <h2 className="text-4xl sm:text-5xl font-black text-white mt-3 mb-4">Servicios que <span className="text-gold-500">Transforman</span></h2>
          <p className="text-gray-400 max-w-xl mx-auto text-lg">Servicios activos, ordenados y conectados directamente a Firestore.</p>
        </div>

        {loading ? (
          <div className="text-center text-gray-300">Cargando servicios…</div>
        ) : services.length === 0 ? (
          <div className="rounded-2xl border border-white/5 bg-dark-800 p-6 text-center text-gray-300">No hay servicios activos en este momento.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => {
              const badge = areaBadges[service.area] || { label: service.area, classes: 'bg-gold-500/10 text-gold-400 border border-gold-500/20' };

              return (
                <article
                  key={service.id}
                  className="group relative bg-dark-800 border border-white/5 rounded-2xl p-6 hover:border-gold-500/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-gold-500/10"
                >
                  <span className={`absolute top-4 right-4 text-xs uppercase tracking-wider font-medium px-2 py-0.5 rounded-full ${badge.classes}`}>
                    {badge.label}
                  </span>

                  <div className="text-4xl mb-4">{service.area === 'barberia' ? '✂' : '✨'}</div>
                  <h3 className="text-xl font-bold text-white mb-2">{service.name}</h3>
                  <p className="text-gray-400 text-sm mb-4 leading-relaxed">{service.description || 'Servicio profesional con atención personalizada.'}</p>

                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                    <div>
                      <p className="text-2xl font-black text-gold-500">${service.price}</p>
                      <p className="text-xs text-gray-500">{service.durationMinutes ? `${service.durationMinutes} min` : 'Duración variable'}</p>
                    </div>
                    <Link
                      href="/reservar"
                      id={`reservar-${service.name.toLowerCase().replace(/\s+/g, '-')}`}
                      className="bg-gold-500/10 hover:bg-gold-500 text-gold-500 hover:text-dark-900 font-bold text-sm px-4 py-2 rounded-lg transition-all duration-300 border border-gold-500/30 hover:border-gold-500"
                    >
                      Reservar →
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <div className="text-center mt-12">
          <Link href="/reservar" className="inline-flex items-center gap-2 text-gold-500 hover:text-gold-400 font-medium group">Ver todos los servicios <span className="group-hover:translate-x-1 transition-transform">→</span></Link>
        </div>
      </div>
    </section>
  );
}
