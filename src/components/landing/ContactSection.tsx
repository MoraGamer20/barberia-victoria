const WHATSAPP_NUMBER = '5211234567890';

const HOURS = [
  { day: 'Lunes a Sábado', hours: '9:00 AM — 8:00 PM' },
  { day: 'Domingo', hours: 'Cerrado' },
];

export default function ContactSection() {
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hola, me gustaría obtener más información.')}`;

  return (
    <section id="contacto" className="py-24 bg-dark-900 relative overflow-hidden">
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <span className="text-gold-500 font-medium tracking-widest uppercase text-sm">Encuéntranos</span>
          <h2 className="text-4xl sm:text-5xl font-black text-white mt-3 mb-4">
            Visítanos o <span className="text-gold-500">Contáctanos</span>
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto text-lg">
            Estamos listos para atenderte. Reserva en línea o contáctanos directamente por WhatsApp.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Contact Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* WhatsApp card */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              id="contact-whatsapp-btn"
              className="flex items-center gap-4 p-5 bg-[#25D366]/10 border border-[#25D366]/20 hover:border-[#25D366]/50 rounded-2xl transition-all duration-300 hover:scale-[1.02] group"
            >
              <div className="w-12 h-12 rounded-xl bg-[#25D366] flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </div>
              <div>
                <p className="text-[#25D366] font-bold text-sm uppercase tracking-wider">WhatsApp Directo</p>
                <p className="text-white font-medium">(521) 123-4567-890</p>
                <p className="text-gray-400 text-sm group-hover:text-[#25D366] transition-colors">Toca para abrir WhatsApp →</p>
              </div>
            </a>

            {/* Hours */}
            <div className="p-5 bg-dark-800 border border-white/5 rounded-2xl">
              <p className="text-gold-500 font-bold uppercase tracking-wider text-sm mb-4">🕐 Horarios de Atención</p>
              <div className="space-y-3">
                {HOURS.map(item => (
                  <div key={item.day} className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">{item.day}</span>
                    <span className={`font-bold text-sm ${item.hours === 'Cerrado' ? 'text-red-400' : 'text-white'}`}>
                      {item.hours}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Address */}
            <div className="p-5 bg-dark-800 border border-white/5 rounded-2xl">
              <p className="text-gold-500 font-bold uppercase tracking-wider text-sm mb-3">📍 Dirección</p>
              <p className="text-white font-medium">Calle Principal #123</p>
              <p className="text-gray-400 text-sm">Col. Centro, C.P. 12345</p>
              <p className="text-gray-400 text-sm">Ciudad, Estado</p>
            </div>
          </div>

          {/* Map Embed */}
          <div className="lg:col-span-3 rounded-2xl overflow-hidden border border-white/10 min-h-[400px] bg-dark-800 relative">
            {/* Placeholder map with Google Maps embed structure */}
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d120959.27!2d-99.1332!3d19.4326!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85d1ff35f5bd1563%3A0x6c366f0e2de02ff7!2sCiudad%20de%20M%C3%A9xico!5e0!3m2!1ses!2smx!4v1680000000000"
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: '400px' }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Ubicación Lumen Studio"
            />
          </div>
        </div>

        {/* Footer bar */}
        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-gray-500 text-sm">
          <p>© 2026 Lumen Studio. Todos los derechos reservados.</p>
          <p>Barbería & Estética Unisex — Reservas en línea 24/7</p>
        </div>
      </div>
    </section>
  );
}
