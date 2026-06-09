export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { verifyAdmin } from '@/lib/adminAuth';
import * as admin from 'firebase-admin';
import { deleteCalendarEvent, updateCalendarEvent } from '@/lib/googleCalendar';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const decodedToken = await verifyAdmin(request);
    const { id } = await params;
    const body = await request.json();
    const { status, date, startTime, endTime } = body;

    const updateData: Record<string, unknown> = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: decodedToken.uid
    };

    if (status) updateData.status = status;
    
    // Si es reprogramación
    if (date && startTime && endTime) {
      updateData.date = date;
      updateData.startTime = startTime;
      updateData.endTime = endTime;
    }

    // Google Calendar Sync
    const appRef = adminDb.collection('appointments').doc(id);
    const appDoc = await appRef.get();
    
    if (appDoc.exists && process.env.NEXT_PUBLIC_ENABLE_GOOGLE_CALENDAR === 'true') {
      const appData = appDoc.data()!;
      const calendarEventId = appData.googleCalendarEventId;

      if (calendarEventId) {
        try {
          if (status === 'cancelled') {
            await deleteCalendarEvent(calendarEventId);
            updateData.googleCalendarEventId = null;
          } else {
            await updateCalendarEvent(calendarEventId, {
              customerName: appData.customerName,
              customerPhone: appData.customerPhone,
              customerEmail: appData.customerEmail,
              notes: appData.notes,
              serviceName: appData.serviceName,
              professionalName: appData.professionalName,
              professionalId: appData.professionalId,
              date: date || appData.date,
              startTime: startTime || appData.startTime,
              endTime: endTime || appData.endTime,
              status: status || appData.status,
            });
          }
        } catch (calErr) {
          console.error('[Google Calendar] PATCH sync error:', calErr);
        }
      }
    }

    await appRef.update(updateData);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Update appointment error:', error);
    return NextResponse.json({ error: message }, { status: message === 'Invalid token' ? 401 : 500 });
  }
}
