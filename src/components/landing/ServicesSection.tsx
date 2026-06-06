import Link from 'next/link';

const SERVICES = [
  { icon: '✂', area: 'barberia', name: 'Corte Clásico', price: 150, duration: '30 min', description: 'Corte preciso adaptado a tu estilo.' },
  { icon: '🪒', area: 'barberia', name: 'Corte + Barba', price: 250, duration: '60 min', description: 'Combo completo de imagen masculina.' },
  { icon: '✨', area: 'estetica', name: 'Tinte Completo', price: 800, duration: '90 min', description: 'Color profesional con productos premium.' },
  { icon: '💆', area: 'estetica', name: 'Tratamiento Capilar', price: 450, duration: '60 min', description: 'Hidratación y restauración profunda.' },
  { icon: '👶', area: 'barberia', name: 'Corte Infantil', price: 100, duration: '30 min', description: 'Cuidado especial para los más pequeños.' },
  { icon: '🌟', area: 'estetica', name: 'Balayage', price: 1200, duration: '120 min', description: 'Degradado natural que ilumina tu look.' },
];

export default function ServicesSection() {
  return (
    <section id="servicios" className="py-24 bg-dark-900 relative overflow-hidden">
      {/* Background texture */}
      <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(212,175,55,0.3) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-gold-500 font-medium tracking-widest uppercase text-sm">Nuestros servicios</span>
          <h2 className="text-4xl sm:text-5xl font-black text-white mt-3 mb-4">
            Servicios que <span className="text-gold-500">Transforman</span>
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto text-lg">
            Dos áreas especializadas, un solo estándar de excelencia.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES.map((service) => (
            <div
              key={service.name}
              className="group relative bg-dark-800 border border-white/5 rounded-2xl p-6 hover:border-gold-500/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-gold-500/10"
            >
              {/* Area badge */}
              <span className={`absolute top-4 right-4 text-xs uppercase tracking-wider font-medium px-2 py-0.5 rounded-full ${service.area === 'barberia' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'}`}>
                {service.area === 'barberia' ? '💈 Barbería' : '✨ Estética'}
              </span>

              <div className="text-4xl mb-4">{service.icon}</div>
              <h3 className="text-xl font-bold text-white mb-2">{service.name}</h3>
              <p className="text-gray-400 text-sm mb-4 leading-relaxed">{service.description}</p>

              <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                <div>
                  <p className="text-2xl font-black text-gold-500">${service.price}</p>
                  <p className="text-xs text-gray-500">{service.duration}</p>
                </div>
                <Link
                  href="/reservar"
                  id={`reservar-${service.name.toLowerCase().replace(/\s+/g, '-')}`}
                  className="bg-gold-500/10 hover:bg-gold-500 text-gold-500 hover:text-dark-900 font-bold text-sm px-4 py-2 rounded-lg transition-all duration-300 border border-gold-500/30 hover:border-gold-500"
                >
                  Reservar →
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/reservar" className="inline-flex items-center gap-2 text-gold-500 hover:text-gold-400 font-medium group">
            Ver todos los servicios
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
