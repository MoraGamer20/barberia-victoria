import { Scissors, Sparkles } from 'lucide-react';
import Link from 'next/link';

const services = [
  {
    area: 'Barbería',
    icon: <Scissors className="w-8 h-8 text-gold-500" />,
    items: [
      { name: 'Corte Clásico', price: '$150', duration: '30 min' },
      { name: 'Corte + Barba', price: '$250', duration: '60 min' },
      { name: 'Fade / Taper', price: '$180', duration: '45 min' },
    ],
  },
  {
    area: 'Estética',
    icon: <Sparkles className="w-8 h-8 text-gold-500" />,
    items: [
      { name: 'Corte Dama', price: '$200', duration: '45 min' },
      { name: 'Tinte Completo', price: '$800', duration: '90 min' },
      { name: 'Tratamiento Capilar', price: '$400', duration: '60 min' },
    ],
  }
];

export default function ServicesSection() {
  return (
    <section id="servicios" className="py-24 bg-dark-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Nuestros Servicios</h2>
          <div className="w-24 h-1 bg-gold-500 mx-auto rounded-full"></div>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {services.map((category, idx) => (
            <div key={idx} className="bg-dark-700 rounded-2xl p-8 border border-white/5 shadow-xl">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-dark-900 rounded-lg">
                  {category.icon}
                </div>
                <h3 className="text-2xl font-bold text-white">{category.area}</h3>
              </div>
              
              <div className="space-y-6">
                {category.items.map((item, itemIdx) => (
                  <div key={itemIdx} className="flex justify-between items-center group">
                    <div>
                      <h4 className="text-lg font-medium text-gray-200 group-hover:text-gold-500 transition-colors">{item.name}</h4>
                      <p className="text-sm text-gray-400">{item.duration}</p>
                    </div>
                    <div className="text-lg font-bold text-white">
                      {item.price}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10">
                <Link 
                  href={`/reservar?area=${category.area.toLowerCase()}`}
                  className="block w-full py-3 px-4 bg-dark-900 hover:bg-dark-900/80 border border-gold-500/30 text-gold-500 text-center rounded-lg transition-colors font-semibold"
                >
                  Agendar en {category.area}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
