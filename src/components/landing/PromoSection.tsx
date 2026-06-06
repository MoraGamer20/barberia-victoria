import Link from 'next/link';

// MOCK DATA — en la Fase 6 esto se leerá desde Firestore (colección `promotions`)
const PROMOTIONS = [
  {
    id: 'promo1',
    emoji: '🔥',
    tag: 'MÁS POPULAR',
    tagColor: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    name: 'Corte + Barba Premium',
    description: 'Corte personalizado + perfilado de barba + mascarilla facial de regalo.',
    originalPrice: 300,
    promoPrice: 250,
    discount: '17% OFF',
    validity: 'Válido toda la semana',
  },
  {
    id: 'promo2',
    emoji: '👨‍👦',
    tag: 'ESPECIAL FAMILIA',
    tagColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    name: 'Paquete Padre e Hijo',
    description: 'Corte para papá + corte infantil. El mejor plan para dos caballeros.',
    originalPrice: 250,
    promoPrice: 200,
    discount: '20% OFF',
    validity: 'Fines de semana',
  },
  {
    id: 'promo3',
    emoji: '📅',
    tag: 'ENTRE SEMANA',
    tagColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    name: 'Descuento Lunes a Miércoles',
    description: 'Todos nuestros servicios de barbería con 15% de descuento los primeros días de la semana.',
    originalPrice: null,
    promoPrice: null,
    discount: '15% OFF',
    validity: 'Lunes a Miércoles',
  },
  {
    id: 'promo4',
    emoji: '💎',
    tag: 'ESTÉTICA',
    tagColor: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
    name: 'Transformación Completa',
    description: 'Tinte + tratamiento hidratante + corte de puntas. Renueva tu imagen.',
    originalPrice: 1600,
    promoPrice: 1300,
    discount: '19% OFF',
    validity: 'Con cita previa',
  },
];

export default function PromoSection() {
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
          {PROMOTIONS.map((promo) => (
            <div
              key={promo.id}
              className="relative bg-dark-800 border border-white/5 rounded-2xl p-6 flex flex-col hover:border-gold-500/30 transition-all duration-300 hover:-translate-y-1"
            >
              {/* Tag */}
              <span className={`inline-block self-start text-xs uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border mb-4 ${promo.tagColor}`}>
                {promo.tag}
              </span>

              {/* Discount badge */}
              <div className="absolute top-4 right-4 bg-gold-500 text-dark-900 font-black text-xs px-2 py-1 rounded-lg">
                {promo.discount}
              </div>

              <div className="text-3xl mb-3">{promo.emoji}</div>
              <h3 className="text-lg font-bold text-white mb-2">{promo.name}</h3>
              <p className="text-gray-400 text-sm mb-4 flex-1 leading-relaxed">{promo.description}</p>

              <div className="pt-4 border-t border-white/5">
                {promo.promoPrice && (
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-2xl font-black text-gold-500">${promo.promoPrice}</span>
                    <span className="text-gray-500 line-through text-sm">${promo.originalPrice}</span>
                  </div>
                )}
                <p className="text-xs text-gray-500 mb-3">{promo.validity}</p>
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
