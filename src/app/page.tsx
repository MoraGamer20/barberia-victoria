import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/landing/HeroSection';
import ServicesSection from '@/components/landing/ServicesSection';
import PromoSection from '@/components/landing/PromoSection';
import BeforeAfterSection from '@/components/landing/BeforeAfterSection';
import GallerySection from '@/components/landing/GallerySection';
import ProductsSection from '@/components/landing/ProductsSection';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import ContactSection from '@/components/landing/ContactSection';

export const metadata: Metadata = {
  title: 'Lumen Studio | Barbería & Estética Unisex | Reserva en línea',
  description: 'Barbería profesional para caballeros y estética unisex en tu ciudad. Reserva tu cita en línea al instante. Cortes, tintes, tratamientos y más.',
  keywords: 'barbería, estética, corte de cabello, barba, tinte, reserva en línea',
  openGraph: {
    title: 'Lumen Studio | Barbería & Estética Unisex',
    description: 'Reserva tu cita en línea. Cortes, barba, tintes y más. Atención profesional garantizada.',
    url: 'https://lumenstudio.vercel.app',
    siteName: 'Lumen Studio',
    images: [{ url: '/hero.png', width: 1200, height: 630, alt: 'Lumen Studio Barbería' }],
    locale: 'es_MX',
    type: 'website',
  },
};

export default function Home() {
  return (
    <main className="bg-dark-900 min-h-screen overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <ServicesSection />
      <PromoSection />
      <BeforeAfterSection />
      <GallerySection />
      <ProductsSection />
      <TestimonialsSection />
      <ContactSection />
    </main>
  );
}
