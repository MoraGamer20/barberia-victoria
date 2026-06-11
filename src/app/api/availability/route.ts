export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { calculateAvailableSlots } from '@/lib/timeUtils';


export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const professionalId = searchParams.get('professionalId');
    const serviceId = searchParams.get('serviceId');

    if (!date || !professionalId || !serviceId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // 1. Check if date is in the past using business timezone (America/Mexico_City)
    const todayStr = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Mexico_City',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date());

    if (date < todayStr) {
      return NextResponse.json({ error: 'Cannot book in the past' }, { status: 400 });
    }

    // 2. Fetch business settings, professional, and service in parallel
    const [settingsDoc, professionalDoc, serviceDoc] = await Promise.all([
      adminDb.collection('business_settings').doc('default').get(),
      adminDb.collection('professionals').doc(professionalId).get(),
      adminDb.collection('services').doc(serviceId).get()
    ]);

    if (!settingsDoc.exists || !professionalDoc.exists || !serviceDoc.exists) {
      return NextResponse.json({ error: 'System configuration error' }, { status: 400 });
    }

    const settings = settingsDoc.data()!;
    const professional = professionalDoc.data()!;
    const service = serviceDoc.data()!;

    // 3. Check active states
    if (!professional.active) return NextResponse.json({ error: 'Professional is not active' }, { status: 400 });
    if (!service.isActive) return NextResponse.json({ error: 'Service is not active' }, { status: 400 });

    // 4. Check if day of week is closed
    const [y, m, d] = date.split('-').map(Number);
    const dayOfWeek = new Date(y, m - 1, d).getDay();
    if (settings.closedDays && settings.closedDays.includes(dayOfWeek)) {
      return NextResponse.json({ slots: [] }); // Day is closed
    }

    // 5. Check blocked_days
    const blockedDaysSnapshot = await adminDb.collection('blocked_days')
      .where('date', '==', date)
      .where('professionalId', 'in', ['all', professionalId])
      .get();
      
    if (!blockedDaysSnapshot.empty) {
      return NextResponse.json({ slots: [] }); // The whole day is blocked
    }

    // 6. Fetch blocked_times and appointments
    const [blockedTimesSnapshot, appointmentsSnapshot] = await Promise.all([
      adminDb.collection('blocked_times')
        .where('date', '==', date)
        .where('professionalId', '==', professionalId)
        .get(),
      adminDb.collection('appointments')
        .where('date', '==', date)
        .where('professionalId', '==', professionalId)
        .get()
    ]);

    const blockedIntervals = blockedTimesSnapshot.docs.map(doc => {
      const data = doc.data();
      return { start: data.startTime, end: data.endTime };
    });

    const occupiedIntervals = appointmentsSnapshot.docs
      .map(doc => doc.data())
      .filter(data => data.status !== 'cancelled' && data.status !== 'completed')
      .map(data => ({ start: data.startTime, end: data.endTime }));

    // 7. Calculate available slots
    const availableSlots = calculateAvailableSlots(
      date,
      service.durationMinutes,
      settings.openingTime || '09:00',
      settings.closingTime || '20:00',
      occupiedIntervals,
      blockedIntervals
    );

    return NextResponse.json({ slots: availableSlots });
  } catch (error: any) {
    console.error('Error fetching availability:', error);
    if (error?.message?.includes('SDK is not initialized')) {
      return NextResponse.json(
        { error: 'Firebase Admin not configured. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY.' },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
