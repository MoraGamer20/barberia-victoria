import Link from 'next/link';

export default function Hero() {
  return (
    <div className="relative min-h-screen flex items-center justify-center pt-16">
      {/* Background overlay with a dark elegant gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-dark-900/40 via-dark-900/80 to-dark-900 z-0" />
      
      {/* 
        Si el usuario desea poner una foto real de fondo en el futuro, 
        puede agregarla aquí con Image de Next.js y z-index negativo.
      */}

      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight">
          Estilo y Cuidado <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-500 to-yellow-200">
            Al Siguiente Nivel
          </span>
        </h1>
        <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
          Expertos en barbería clásica y estética vanguardista. Un espacio diseñado para tu bienestar y el mejor servicio.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            href="/reservar?area=barberia"
            className="w-full sm:w-auto px-8 py-4 bg-white text-dark-900 font-bold rounded-lg hover:bg-gray-100 transition-all transform hover:scale-105"
          >
            Reservar Barbería
          </Link>
          <Link 
            href="/reservar?area=estetica"
            className="w-full sm:w-auto px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-lg hover:bg-white/10 transition-all transform hover:scale-105"
          >
            Reservar Estética
          </Link>
        </div>
      </div>
    </div>
  );
}
