import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="fixed w-full z-50 bg-dark-900/90 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-white tracking-wider">
              LUMEN <span className="text-gold-500">STUDIO</span>
            </Link>
          </div>
          <div className="hidden md:flex space-x-8">
            <Link href="#servicios" className="text-gray-300 hover:text-white transition-colors">Servicios</Link>
            <Link href="#galeria" className="text-gray-300 hover:text-white transition-colors">Galería</Link>
            <Link href="#contacto" className="text-gray-300 hover:text-white transition-colors">Contacto</Link>
          </div>
          <div>
            <Link 
              href="/reservar" 
              className="bg-gold-500 hover:bg-gold-600 text-dark-900 font-semibold py-2 px-6 rounded-md transition-all duration-300 shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:shadow-[0_0_25px_rgba(212,175,55,0.5)]"
            >
              Reservar Cita
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
