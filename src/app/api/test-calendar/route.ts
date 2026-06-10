export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createCalendarEvent } from '@/lib/googleCalendar';

/**
 * GET /api/test-calendar
 * Creates a test event on Google Calendar to verify credentials are working.
 * DELETE this file after testing.
 */
export async function GET() {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const hour = now.getHours();
  const startTime = `${String(hour).padStart(2, '0')}:00`;
  const endTime = `${String(hour + 1).padStart(2, '0')}:00`;

  try {
    const eventId = await createCalendarEvent({
      customerName: 'Cliente de Prueba',
      customerPhone: '8341234567',
      customerEmail: 'prueba@test.com',
      notes: 'Este es un evento de prueba para verificar la integración con Google Calendar.',
      serviceName: 'Corte Clásico (PRUEBA)',
      professionalName: 'Alejandro',
      date: dateStr,
      startTime,
      endTime,
      status: 'confirmed',
    });

    if (eventId) {
      return NextResponse.json({
        success: true,
        message: '✅ Evento creado en Google Calendar correctamente.',
        eventId,
        calendarId: process.env.GOOGLE_CALENDAR_ID,
        date: dateStr,
        time: `${startTime} - ${endTime}`,
      });
    } else {
      return NextResponse.json({
        success: false,
        message: '❌ createCalendarEvent devolvió null. Revisa las credenciales y los logs del servidor.',
        calendarEnabled: process.env.NEXT_PUBLIC_ENABLE_GOOGLE_CALENDAR,
        emailSet: !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        keySet: process.env.GOOGLE_PRIVATE_KEY?.startsWith('-----BEGIN') ?? false,
        calendarId: process.env.GOOGLE_CALENDAR_ID,
      }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
