'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

const DEFAULT_WHATSAPP_NUMBER = '528341656549';

const PRODUCTS = [
  {
    id: 'p1',
    name: 'Set Grooming Premium',
    description: 'Kit completo de cuidado: cera, pomada, aceite de barba y shampoo para cabello grueso.',
    price: 450,
    image: '/prod_cera.png',
    tag: 'Más vendido',
  },
  {
    id: 'p2',
    name: 'Aceite de Barba Artesanal',
    description: 'Fórmula con aceites de argán y jojoba para suavizar, nutrir y dar brillo a tu barba.',
    price: 280,
    image: '/prod_aceite.png',
    tag: 'Premium',
  },
  {
    id: 'p3',
    name: 'Pomada de Fijación Fuerte',
    description: 'Control extremo con acabado mate. Ideal para pompadour y estilos estructurados.',
    price: 190,
    image: '/prod_cera.png',
    tag: 'Nuevo',
  },
  {
    id: 'p4',
    name: 'Shampoo Anti-Residuo',
    description: 'Limpieza profunda que elimina acumulación de productos. Uso semanal recomendado.',
    price: 220,
    image: '/prod_aceite.png',
    tag: null,
  },
];

export default function ProductsSection() {
  const [whatsappNumber, setWhatsappNumber] = useState(DEFAULT_WHATSAPP_NUMBER);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch(`/api/business-settings?t=${Date.now()}`);
        const data = await res.json();
        if (data.settings?.whatsappNumber) {
          setWhatsappNumber(data.settings.whatsappNumber.replace(/\D/g, ''));
        }
      } catch (err) {
        console.error('Error fetching settings for Products:', err);
      }
    }
    void fetchSettings();
  }, []);

  const makeWhatsAppUrl = (productName: string) => {
    const message = encodeURIComponent(`Hola, me interesa el producto: ${productName}. ¿Tienen disponibilidad?`);
    return `https://wa.me/${whatsappNumber}?text=${message}`;
  };

  return (
    <section id="productos" className="py-24 bg-dark-900 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500/3 rounded-full blur-3xl pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <span className="text-gold-500 font-medium tracking-widest uppercase text-sm">Tienda</span>
          <h2 className="text-4xl sm:text-5xl font-black text-white mt-3 mb-4">
            Productos <span className="text-gold-500">Profesionales</span>
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto text-lg">
            Los mismos productos que usamos en el estudio, ahora disponibles para ti.
            Consulta disponibilidad por WhatsApp.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PRODUCTS.map(product => (
            <div
              key={product.id}
              className="group bg-dark-800 border border-white/5 rounded-2xl overflow-hidden hover:border-gold-500/30 transition-all duration-300 hover:-translate-y-1 flex flex-col"
            >
              {/* Product Image */}
              <div className="relative aspect-square overflow-hidden bg-dark-700">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                {product.tag && (
                  <div className="absolute top-3 left-3 bg-gold-500 text-dark-900 text-xs font-black px-2 py-1 rounded-lg uppercase tracking-wide">
                    {product.tag}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-5 flex flex-col flex-1">
                <h3 className="text-white font-bold mb-2">{product.name}</h3>
                <p className="text-gray-400 text-sm mb-4 flex-1 leading-relaxed">{product.description}</p>

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <span className="text-2xl font-black text-gold-500">${product.price}</span>
                  <a
                    href={makeWhatsAppUrl(product.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    id={`product-wa-${product.id}`}
                    className="flex items-center gap-1.5 bg-[#25D366] hover:bg-[#1da851] text-white text-sm font-bold px-3 py-2 rounded-lg transition-colors"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    Consultar
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
