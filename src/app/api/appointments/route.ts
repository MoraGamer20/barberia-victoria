export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import * as admin from 'firebase-admin';
import { addMinutes, parse, format, startOfDay, isBefore } from 'date-fns';
import { calculateAvailableSlots } from '@/lib/timeUtils';
import { createCalendarEvent } from '@/lib/googleCalendar';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      customerName, 
      customerPhone, 
      customerEmail, 
      notes, 
      date, 
      startTime, 
      serviceId, 
      professionalId 
    } = body;

    if (!customerName || !customerPhone || !date || !startTime || !serviceId || !professionalId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validations before transaction
    const requestedDate = parse(date, 'yyyy-MM-dd', new Date());
    if (isBefore(startOfDay(requestedDate), startOfDay(new Date()))) {
      return NextResponse.json({ error: 'Cannot book in the past' }, { status: 400 });
    }

    // RUN TRANSACTION
    const result = await adminDb.runTransaction(async (transaction) => {
      // 1. Fetch static resources (Service, Settings, Professional)
      const serviceRef = adminDb.collection('services').doc(serviceId);
      const profRef = adminDb.collection('professionals').doc(professionalId);
      const settingsRef = adminDb.collection('business_settings').doc('default');

      const [serviceDoc, profDoc, settingsDoc] = await Promise.all([
        transaction.get(serviceRef),
        transaction.get(profRef),
        transaction.get(settingsRef)
      ]);

      if (!serviceDoc.exists || !profDoc.exists) {
        throw new Error('Service or Professional not found');
      }

      const service = serviceDoc.data()!;
      const professional = profDoc.data()!;
      const settings = settingsDoc.data()!;

      if (!professional.active) throw new Error('Professional is inactive');
      if (!service.isActive) throw new Error('Service is inactive');

      // 2. Fetch dynamically changing collections within the transaction (locks them if using optimistic locking)
      // Since Firestore doesn't lock queries, we query, but if someone inserts, the write will fail if we set a lock document or if we read a document that changes. 
      // Firestore transactions require reads before writes. 
      // To strictly prevent overlapping, we read all conflicting appointments for this day/professional.
      const appointmentsQuery = adminDb.collection('appointments')
        .where('date', '==', date)
        .where('professionalId', '==', professionalId)
        .where('status', '==', 'confirmed');
        
      const blockedTimesQuery = adminDb.collection('blocked_times')
        .where('date', '==', date)
        .where('professionalId', '==', professionalId);
        
      const blockedDaysQuery = adminDb.collection('blocked_days')
        .where('date', '==', date)
        .where('professionalId', 'in', ['all', professionalId]);

      const [appointmentsSnap, blockedTimesSnap, blockedDaysSnap] = await Promise.all([
        transaction.get(appointmentsQuery),
        transaction.get(blockedTimesQuery),
        transaction.get(blockedDaysQuery)
      ]);

      if (!blockedDaysSnap.empty) {
        throw new Error('This day is completely blocked');
      }

      const occupiedIntervals = appointmentsSnap.docs.map(d => ({ start: d.data().startTime, end: d.data().endTime }));
      const blockedIntervals = blockedTimesSnap.docs.map(d => ({ start: d.data().startTime, end: d.data().endTime }));

      // 3. Double validate Availability!
      const availableSlots = calculateAvailableSlots(
        date,
        service.durationMinutes,
        settings.openingTime || '09:00',
        settings.closingTime || '20:00',
        occupiedIntervals,
        blockedIntervals
      );

      // If the exact requested startTime is not in availableSlots, it was taken!
      if (!availableSlots.includes(startTime)) {
        throw new Error('SLOT_TAKEN');
      }

      // 4. Calculate End Time
      const startDateTime = parse(startTime, 'HH:mm', new Date());
      const endDateTime = addMinutes(startDateTime, service.durationMinutes);
      const endTime = format(endDateTime, 'HH:mm');

      // 5. Write Appointment
      const newAppointmentRef = adminDb.collection('appointments').doc();
      const appointmentData = {
        id: newAppointmentRef.id,
        customerName,
        customerPhone,
        customerEmail: customerEmail || null,
        notes: notes || null,
        area: professional.area,
        professionalId,
        professionalName: professional.name,
        serviceId,
        serviceName: service.name,
        date,
        startTime,
        endTime,
        status: 'confirmed', // As requested
        googleCalendarEventId: null as string | null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      transaction.set(newAppointmentRef, appointmentData);

      return appointmentData;
    });

    // Google Calendar Sync
    if (process.env.NEXT_PUBLIC_ENABLE_GOOGLE_CALENDAR === 'true') {
      try {
        const eventId = await createCalendarEvent({
          customerName: result.customerName,
          customerPhone: result.customerPhone,
          customerEmail: result.customerEmail,
          notes: result.notes,
          serviceName: result.serviceName,
          professionalName: result.professionalName,
          date: result.date,
          startTime: result.startTime,
          endTime: result.endTime,
          status: result.status,
        });

        if (eventId) {
          await adminDb.collection('appointments').doc(result.id).update({
            googleCalendarEventId: eventId,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
          result.googleCalendarEventId = eventId;
        }
      } catch (calErr) {
        console.error('[Google Calendar] Post-booking sync error:', calErr);
      }
    }

    return NextResponse.json({ success: true, appointment: result });

  } catch (error: any) {
    console.error('Error in appointment transaction:', error);
    if (error?.message?.includes('SDK is not initialized')) {
      return NextResponse.json(
        { error: 'Firebase Admin not configured. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY.' },
        { status: 503 }
      );
    }
    if (error.message === 'SLOT_TAKEN') {
      return NextResponse.json({ error: 'Este horario ya fue reservado por alguien más. Por favor elige otro.' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message || 'No se pudo completar la reserva' }, { status: 500 });
  }
}
