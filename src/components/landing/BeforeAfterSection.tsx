'use client';

import Image from 'next/image';
import { useState } from 'react';

const BEFORE_AFTER = [
  {
    id: 'ba1',
    image: '/ba_corte.png',
    title: 'Fade Perfecto',
    description: 'Transformación completa con fade degradado y textura en la parte superior.',
    category: 'Barbería',
  },
  {
    id: 'ba2',
    image: '/ba_barba.png',
    title: 'Barba Definida',
    description: 'De barba sin forma a perfilado profesional con líneas limpias y acabado con aceite.',
    category: 'Barba',
  },
  {
    id: 'ba3',
    image: '/ba_tinte.png',
    title: 'Colorimetría Premium',
    description: 'Balayage caramelo que ilumina el rostro y da vida al cabello apagado.',
    category: 'Estética',
  },
];

export default function BeforeAfterSection() {
  const [active, setActive] = useState(0);

  return (
    <section id="antes-despues" className="py-24 bg-dark-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-gold-500/3 to-transparent pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <span className="text-gold-500 font-medium tracking-widest uppercase text-sm">Resultados reales</span>
          <h2 className="text-4xl sm:text-5xl font-black text-white mt-3 mb-4">
            Antes y <span className="text-gold-500">Después</span>
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto text-lg">
            No te decimos que somos buenos — te lo demostramos con resultados reales de nuestros clientes.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Main image display */}
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
            <Image
              src={BEFORE_AFTER[active].image}
              alt={BEFORE_AFTER[active].title}
              fill
              className="object-cover transition-opacity duration-500"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            {/* Before / After label overlay */}
            <div className="absolute inset-0 flex pointer-events-none">
              <div className="flex-1 flex items-end pb-4 pl-4">
                <span className="bg-dark-900/70 backdrop-blur-sm text-white text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-white/20">
                  ANTES
                </span>
              </div>
              <div className="w-px bg-white/20" />
              <div className="flex-1 flex items-end justify-end pb-4 pr-4">
                <span className="bg-gold-500/80 backdrop-blur-sm text-dark-900 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                  DESPUÉS
                </span>
              </div>
            </div>
          </div>

          {/* Cards selector */}
          <div className="space-y-4">
            {BEFORE_AFTER.map((item, index) => (
              <button
                key={item.id}
                onClick={() => setActive(index)}
                className={`w-full text-left p-5 rounded-xl border transition-all duration-300 ${
                  active === index
                    ? 'bg-gold-500/10 border-gold-500/40 shadow-lg shadow-gold-500/10'
                    : 'bg-dark-800 border-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${active === index ? 'bg-gold-500 text-dark-900' : 'bg-dark-700 text-gray-400'}`}>
                    <span className="text-xl font-black">{index + 1}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`font-bold text-lg ${active === index ? 'text-white' : 'text-gray-300'}`}>{item.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${active === index ? 'text-gold-500 border-gold-500/30 bg-gold-500/10' : 'text-gray-500 border-gray-600 bg-dark-700'}`}>
                        {item.category}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed">{item.description}</p>
                  </div>
                </div>
              </button>
            ))}

            <a
              href="/reservar"
              className="mt-6 w-full flex items-center justify-center gap-2 bg-gold-500 hover:bg-gold-400 text-dark-900 font-bold py-4 px-6 rounded-xl transition-all duration-300 hover:scale-105"
            >
              ✂ Quiero mi transformación
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
