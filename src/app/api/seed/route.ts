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
      whatsappNumber: '5211234567890'
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
