export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

export async function GET() {
  try {
    // 1. Business Settings
    await adminDb.collection('business_settings').doc('default').set({
      openingTime: '09:00',
      closingTime: '20:00',
      closedDays: [0], // Sunday
      whatsappNumber: '528341656549',
      address: 'Calle Principal #123, Centro',
      instagram: 'https://www.instagram.com/',
      facebook: 'https://www.facebook.com/'
    });

    // 2. Professionals
    await adminDb.collection('professionals').doc('p1').set({
      id: 'p1',
      name: 'Alejandro',
      area: 'barberia',
      active: true
    });
    await adminDb.collection('professionals').doc('p2').set({
      id: 'p2',
      name: 'María',
      area: 'estetica',
      active: true
    });
    await adminDb.collection('professionals').doc('p3').set({
      id: 'p3',
      name: 'Juan',
      area: 'barberia',
      active: false // Inactive test
    });

    // 3. Services
    await adminDb.collection('services').doc('s1').set({
      id: 's1',
      area: 'barberia',
      name: 'Corte Clásico',
      durationMinutes: 30,
      price: 150,
      isActive: true
    });
    await adminDb.collection('services').doc('s2').set({
      id: 's2',
      area: 'estetica',
      name: 'Tinte Completo',
      durationMinutes: 90,
      price: 800,
      isActive: true
    });
    await adminDb.collection('services').doc('s3').set({
      id: 's3',
      area: 'barberia',
      name: 'Corte + Barba',
      durationMinutes: 60,
      price: 250,
      isActive: false // Inactive test
    });

    // 4. Blocked days and times for testing
    // Tomorrow blocked completely for Alejandro
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    
    await adminDb.collection('blocked_days').doc('bd1').set({
      id: 'bd1',
      date: dateStr,
      professionalId: 'p1',
      reason: 'Día libre'
    });

    // The day after tomorrow: block 10:00 - 11:00 for Alejandro
    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 2);
    const dayAfterStr = dayAfter.toISOString().split('T')[0];

    await adminDb.collection('blocked_times').doc('bt1').set({
      id: 'bt1',
      date: dayAfterStr,
      professionalId: 'p1',
      startTime: '10:00',
      endTime: '11:00',
      reason: 'Cita personal'
    });

    // 5. Promotions
    const promotionsSeed = [
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
        validFrom: '2026-06-01',
        validTo: '2026-07-31',
        imageUrl: null,
        order: 1,
        isActive: true,
        isDeleted: false,
        createdAt: Date.now()
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
        validFrom: '2026-06-01',
        validTo: '2026-08-31',
        imageUrl: null,
        order: 2,
        isActive: true,
        isDeleted: false,
        createdAt: Date.now()
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
        validFrom: '2026-06-01',
        validTo: '2026-12-31',
        imageUrl: null,
        order: 3,
        isActive: true,
        isDeleted: false,
        createdAt: Date.now()
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
        validFrom: '2026-06-01',
        validTo: '2026-06-30',
        imageUrl: null,
        order: 4,
        isActive: true,
        isDeleted: false,
        createdAt: Date.now()
      }
    ];

    for (const promo of promotionsSeed) {
      await adminDb.collection('promotions').doc(promo.id).set(promo);
    }

    return NextResponse.json({ success: true, message: 'Database seeded for testing' });
  } catch (error: any) {
    if (error?.message?.includes('SDK is not initialized')) {
      return NextResponse.json(
        { error: 'Firebase Admin not configured. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY.' },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
