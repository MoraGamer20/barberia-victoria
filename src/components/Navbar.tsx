'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

const NAV_LINKS = [
  { name: 'Inicio', href: '#inicio' },
  { name: 'Servicios', href: '#servicios' },
  { name: 'Promociones', href: '#promociones' },
  { name: 'Galería', href: '#galeria' },
  { name: 'Productos', href: '#productos' },
  { name: 'Contacto', href: '#contacto' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('528341656549');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/business-settings');
        const data = await res.json();
        if (data.settings?.whatsappNumber) {
          setWhatsappNumber(data.settings.whatsappNumber.replace(/\D/g, ''));
        }
      } catch (err) {
        console.error('Error fetching settings for Navbar:', err);
      }
    }
    void fetchSettings();
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-dark-900/95 backdrop-blur-lg border-b border-white/5 shadow-lg' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-black text-white tracking-tight">
              LUMEN <span className="text-gold-500">STUDIO</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map(link => (
              <a
                key={link.name}
                href={link.href}
                className="text-gray-400 hover:text-white text-sm font-medium transition-colors duration-200"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#25D366] hover:text-[#1da851] text-sm font-medium transition-colors"
            >
              WhatsApp
            </a>
            <Link
              href="/reservar"
              id="nav-reservar-btn"
              className="bg-gold-500 hover:bg-gold-400 text-dark-900 font-bold text-sm px-5 py-2.5 rounded-lg transition-all duration-300 hover:scale-105"
            >
              Reservar Cita
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            id="navbar-mobile-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
            aria-label="Toggle menu"
          >
            <div className="space-y-1.5">
              <span className={`block h-0.5 w-6 bg-current transition-transform ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block h-0.5 w-6 bg-current transition-opacity ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`block h-0.5 w-6 bg-current transition-transform ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden bg-dark-800 rounded-xl border border-white/10 p-4 mb-4 space-y-3">
            {NAV_LINKS.map(link => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block py-2 text-gray-300 hover:text-white font-medium transition-colors"
              >
                {link.name}
              </a>
            ))}
            <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
              <Link
                href="/reservar"
                onClick={() => setMenuOpen(false)}
                className="w-full bg-gold-500 text-dark-900 font-bold py-3 px-4 rounded-lg text-center hover:bg-gold-400 transition-colors"
              >
                ✂ Reservar Cita
              </Link>
              <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#25D366] text-white font-bold py-3 px-4 rounded-lg text-center hover:bg-[#1da851] transition-colors text-sm flex items-center justify-center gap-2"
              >
                WhatsApp
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
