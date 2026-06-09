'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Promotion } from '@/types/promotions';

function formatValidityDate(dateStr: string) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return `Válido hasta: ${dateStr}`;
  const monthIdx = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  
  const months = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];
  
  return `Válido hasta el ${day} de ${months[monthIdx]}`;
}

export default function PromoSection() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getPromotions() {
      try {
        const res = await fetch('/api/promotions');
        const data = await res.json();
        if (data.promotions) {
          setPromotions(data.promotions);
        }
      } catch (err) {
        console.error('Error loading promotions:', err);
      } finally {
        setLoading(false);
      }
    }
    getPromotions();
  }, []);

  if (loading) {
    return (
      <section id="promociones" className="py-24 bg-gradient-to-b from-dark-800 to-dark-900 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <span className="text-gold-500 font-medium tracking-widest uppercase text-sm">Ofertas especiales</span>
            <h2 className="text-4xl sm:text-5xl font-black text-white mt-3 mb-4">
              Promociones <span className="text-gold-500">Exclusivas</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-dark-800 border border-white/5 rounded-2xl p-6 h-80 animate-pulse flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-16 h-6 bg-white/5 rounded-full" />
                  <div className="w-full h-8 bg-white/5 rounded-lg" />
                  <div className="w-3/4 h-4 bg-white/5 rounded" />
                </div>
                <div className="w-full h-10 bg-white/5 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // If there are no promotions, we can hide the section or display a friendly message
  if (promotions.length === 0) {
    return null;
  }

  return (
    <section id="promociones" className="py-24 bg-gradient-to-b from-dark-800 to-dark-900 relative overflow-hidden">
      {/* Gold glow accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <span className="text-gold-500 font-medium tracking-widest uppercase text-sm">Ofertas especiales</span>
          <h2 className="text-4xl sm:text-5xl font-black text-white mt-3 mb-4">
            Promociones <span className="text-gold-500">Exclusivas</span>
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto text-lg">
            Aprovecha nuestros paquetes especiales diseñados para que luzcas mejor gastando menos.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {promotions.map((promo) => (
            <div
              key={promo.id}
              className="relative bg-dark-800 border border-white/5 rounded-2xl p-6 flex flex-col hover:border-gold-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-gold-500/5"
            >
              {/* Tag */}
              {promo.tag && (
                <span className={`inline-block self-start text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border mb-4 ${promo.tagColor}`}>
                  {promo.tag}
                </span>
              )}

              {/* Discount badge */}
              {promo.discount && (
                <div className="absolute top-4 right-4 bg-gold-500 text-dark-900 font-black text-xs px-2 py-1 rounded-lg">
                  {promo.discount}
                </div>
              )}

              {/* Promo Banner or Emoji */}
              {promo.imageUrl ? (
                <div className="relative w-full h-32 rounded-xl overflow-hidden mb-4 border border-white/5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={promo.imageUrl} alt={promo.name} className="w-full h-full object-cover" />
                  <span className="absolute bottom-2 right-2 text-2xl bg-dark-900/80 p-1 rounded-lg backdrop-blur-sm leading-none">
                    {promo.emoji}
                  </span>
                </div>
              ) : (
                <div className="text-4xl mb-4 select-none">{promo.emoji}</div>
              )}

              <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">{promo.name}</h3>
              <p className="text-gray-400 text-sm mb-4 flex-1 leading-relaxed line-clamp-3">{promo.description}</p>

              <div className="pt-4 border-t border-white/5">
                {promo.promoPrice ? (
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-2xl font-black text-gold-500">${promo.promoPrice}</span>
                    {promo.originalPrice && (
                      <span className="text-gray-500 line-through text-sm">${promo.originalPrice}</span>
                    )}
                  </div>
                ) : (
                  <div className="h-8 mb-1" /> // empty spacer for height alignment
                )}
                
                <p className="text-[11px] text-gray-500 mb-3 font-medium">
                  {promo.validTo ? formatValidityDate(promo.validTo) : 'Tiempo limitado'}
                </p>
                
                <Link
                  href="/reservar"
                  id={`promo-${promo.id}`}
                  className="block w-full text-center bg-gold-500/10 hover:bg-gold-500 text-gold-500 hover:text-dark-900 font-bold text-sm py-2.5 rounded-lg transition-all duration-300 border border-gold-500/30 hover:border-gold-500"
                >
                  Aprovechar oferta
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
