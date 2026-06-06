'use client';

import Image from 'next/image';
import { useState } from 'react';

const CATEGORIES = ['Todos', 'Barbería', 'Barba', 'Estética', 'Colorimetría'];

const GALLERY_ITEMS = [
  { id: 'g1', category: 'Barbería', title: 'Fade Moderno', description: 'Degradado preciso con textura en la parte superior.', image: '/ba_corte.png' },
  { id: 'g2', category: 'Barba', title: 'Barba con Diseño', description: 'Perfilado clásico con cuchilla caliente.', image: '/ba_barba.png' },
  { id: 'g3', category: 'Colorimetría', title: 'Balayage Caramelo', description: 'Técnica de iluminación natural efecto sol.', image: '/ba_tinte.png' },
  { id: 'g4', category: 'Estética', title: 'Bob Elegante', description: 'Corte bob clásico con acabado liso.', image: '/hero.png' },
  { id: 'g5', category: 'Barbería', title: 'Pompadour Clásico', description: 'Estilo retro con fijado fuerte y lustre.', image: '/ba_corte.png' },
  { id: 'g6', category: 'Colorimetría', title: 'Mechas Platinadas', description: 'Decoloración controlada para look moderno.', image: '/ba_tinte.png' },
];

export default function GallerySection() {
  const [activeCategory, setActiveCategory] = useState('Todos');

  const filtered = activeCategory === 'Todos'
    ? GALLERY_ITEMS
    : GALLERY_ITEMS.filter(item => item.category === activeCategory);

  return (
    <section id="galeria" className="py-24 bg-dark-800 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-gold-500 font-medium tracking-widest uppercase text-sm">Nuestro trabajo</span>
          <h2 className="text-4xl sm:text-5xl font-black text-white mt-3 mb-4">
            Galería de <span className="text-gold-500">Estilos</span>
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto text-lg">
            Cada corte cuenta una historia. Estos son algunos de nuestros trabajos favoritos.
          </p>
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              id={`gallery-filter-${cat.toLowerCase()}`}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                activeCategory === cat
                  ? 'bg-gold-500 text-dark-900 shadow-lg shadow-gold-500/25'
                  : 'bg-dark-700 text-gray-400 hover:text-white hover:bg-dark-600 border border-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="group relative aspect-square rounded-2xl overflow-hidden border border-white/5 hover:border-gold-500/30 transition-all duration-500"
            >
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                <span className="text-gold-500 text-xs uppercase tracking-widest font-medium mb-1">{item.category}</span>
                <h3 className="text-white font-bold text-lg">{item.title}</h3>
                <p className="text-gray-300 text-sm mt-1">{item.description}</p>
              </div>

              {/* Category badge (always visible) */}
              <div className="absolute top-3 left-3 bg-dark-900/70 backdrop-blur-sm px-2 py-1 rounded-full text-xs text-gray-300 border border-white/10">
                {item.category}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
