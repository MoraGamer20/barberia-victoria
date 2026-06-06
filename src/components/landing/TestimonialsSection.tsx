const TESTIMONIALS = [
  {
    id: 't1',
    name: 'Ricardo M.',
    role: 'Cliente desde 2023',
    avatar: '👨‍💼',
    rating: 5,
    text: 'Alejandro es el mejor barbero que he tenido. Me hizo un fade increíble y el sistema de reserva en línea es súper fácil. Ya no pierdo tiempo esperando.',
    area: 'Barbería',
  },
  {
    id: 't2',
    name: 'Sofía R.',
    role: 'Cliente frecuente',
    avatar: '👩‍🦰',
    rating: 5,
    text: 'Vine por un tinte y salí completamente transformada. El resultado fue exactamente lo que quería. La atención es de primera y el estudio muy limpio y cómodo.',
    area: 'Estética',
  },
  {
    id: 't3',
    name: 'Carlos H.',
    role: 'Viene con su hijo',
    avatar: '👨',
    rating: 5,
    text: 'Venimos el paquete padre e hijo cada mes. Mi hijo adora venir porque lo atienden muy bien. El precio es excelente por la calidad que ofrecen.',
    area: 'Barbería',
  },
  {
    id: 't4',
    name: 'Valeria T.',
    role: 'Cliente desde 2024',
    avatar: '👩',
    rating: 5,
    text: 'El balayage que me hicieron quedó perfecto. María es muy profesional y me explicó todos los cuidados. Definitivamente regreso. ¡100% recomendado!',
    area: 'Estética',
  },
];

export default function TestimonialsSection() {
  return (
    <section id="opiniones" className="py-24 bg-dark-800 relative overflow-hidden">
      <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(212,175,55,0.3) 1px, transparent 0)', backgroundSize: '60px 60px' }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <span className="text-gold-500 font-medium tracking-widest uppercase text-sm">Lo que dicen</span>
          <h2 className="text-4xl sm:text-5xl font-black text-white mt-3 mb-4">
            Nuestros <span className="text-gold-500">Clientes</span> Hablan
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto text-lg">
            La satisfacción de nuestros clientes es nuestro mayor logro.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TESTIMONIALS.map(testimonial => (
            <div
              key={testimonial.id}
              className="bg-dark-900 border border-white/5 rounded-2xl p-6 flex flex-col hover:border-gold-500/20 transition-all duration-300"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <span key={i} className="text-gold-500 text-lg">★</span>
                ))}
              </div>

              {/* Quote */}
              <p className="text-gray-300 text-sm leading-relaxed flex-1 italic">
                "{testimonial.text}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 mt-6 pt-4 border-t border-white/5">
                <div className="w-10 h-10 rounded-full bg-dark-700 flex items-center justify-center text-xl">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="text-white font-bold text-sm">{testimonial.name}</p>
                  <p className="text-gray-500 text-xs">{testimonial.role}</p>
                </div>
                <span className={`ml-auto text-xs px-2 py-0.5 rounded-full border ${testimonial.area === 'Barbería' ? 'text-blue-400 border-blue-500/20 bg-blue-500/10' : 'text-purple-400 border-purple-500/20 bg-purple-500/10'}`}>
                  {testimonial.area}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Google rating summary */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 p-6 bg-dark-900/50 rounded-2xl border border-white/5">
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className="text-gold-500 text-2xl">★</span>
            ))}
          </div>
          <div className="text-center sm:text-left">
            <p className="text-white font-bold text-xl">5.0 en Google</p>
            <p className="text-gray-400 text-sm">Basado en +47 reseñas verificadas</p>
          </div>
        </div>
      </div>
    </section>
  );
}
