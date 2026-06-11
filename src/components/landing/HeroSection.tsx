'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function HeroSection() {
  const [whatsappNumber, setWhatsappNumber] = useState('528341656549');

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch(`/api/business-settings?t=${Date.now()}`);
        const data = await res.json();
        if (data.settings?.whatsappNumber) {
          setWhatsappNumber(data.settings.whatsappNumber.replace(/\D/g, ''));
        }
      } catch (err) {
        console.error('Error fetching settings for Hero:', err);
      }
    }
    void fetchSettings();
  }, []);

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hola, me gustaría obtener más información.')}`;

  return (
    <section id="inicio" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/hero.png"
          alt="Lumen Studio Barbería"
          fill
          className="object-cover"
          priority
          quality={90}
        />
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-dark-900 via-dark-900/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-transparent to-dark-900/30" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="max-w-2xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-gold-500/10 border border-gold-500/30 rounded-full px-4 py-1.5 mb-6">
            <span className="w-2 h-2 rounded-full bg-gold-500 animate-pulse" />
            <span className="text-gold-500 text-sm font-medium tracking-wider uppercase">Reserva en Línea Disponible</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-tight mb-6">
            Donde el
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-600">
              Estilo
            </span>
            se perfecciona
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-gray-300 mb-4 leading-relaxed">
            <span className="text-gold-400 font-semibold">Barbería para caballeros</span> y{' '}
            <span className="text-gold-400 font-semibold">Estética unisex</span> de primer nivel.
            Atención profesional con reservación en línea, sin esperas.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-10">
            <Link
              href="/reservar"
              id="hero-reservar-btn"
              className="group flex items-center justify-center gap-2 bg-gold-500 hover:bg-gold-400 text-dark-900 font-bold text-lg px-8 py-4 rounded-xl transition-all duration-300 shadow-lg shadow-gold-500/25 hover:shadow-gold-500/40 hover:scale-105"
            >
              <span>✂</span>
              Reservar Cita
            </Link>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              id="hero-whatsapp-btn"
              className="group flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1da851] text-white font-bold text-lg px-8 py-4 rounded-xl transition-all duration-300 shadow-lg shadow-green-500/25 hover:scale-105"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Contactar por WhatsApp
            </a>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap gap-6 mt-12 pt-8 border-t border-white/10">
            {[
              { icon: '⭐', label: '5.0 en Google' },
              { icon: '✂', label: '+5 años de experiencia' },
              { icon: '📅', label: 'Reserva sin esperas' },
            ].map(badge => (
              <div key={badge.label} className="flex items-center gap-2 text-gray-300">
                <span className="text-lg">{badge.icon}</span>
                <span className="text-sm font-medium">{badge.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-500">
        <span className="text-xs tracking-widest uppercase">Descubre más</span>
        <div className="w-0.5 h-8 bg-gradient-to-b from-gold-500 to-transparent animate-pulse" />
      </div>
    </section>
  );
}
