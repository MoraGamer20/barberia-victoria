import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/calendar'];

function getCalendarClient() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  // Handle newlines in the private key if defined in .env
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!email || !privateKey) {
    console.warn('[Google Calendar] Missing credentials. Google Calendar integration is disabled.');
    return null;
  }

  try {
    const auth = new google.auth.JWT({
      email,
      key: privateKey,
      scopes: SCOPES,
    });
    return google.calendar({ version: 'v3', auth });
  } catch (error) {
    console.error('[Google Calendar] Initialization error:', error);
    return null;
  }
}

interface AppointmentData {
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  notes?: string | null;
  serviceName: string;
  professionalName?: string;
  professionalId?: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
}

export async function createCalendarEvent(appointment: AppointmentData): Promise<string | null> {
  const calendar = getCalendarClient();
  if (!calendar) return null;

  const timeZone = process.env.GOOGLE_CALENDAR_TIMEZONE || 'America/Mexico_City';
  const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';

  const startISO = `${appointment.date}T${appointment.startTime}:00`;
  const endISO = `${appointment.date}T${appointment.endTime}:00`;

  try {
    const event = {
      summary: `Cita: ${appointment.customerName} - ${appointment.serviceName}`,
      description: `Cliente: ${appointment.customerName}\n` +
                   `Teléfono: ${appointment.customerPhone}\n` +
                   `Correo: ${appointment.customerEmail || 'No proporcionado'}\n` +
                   `Servicio: ${appointment.serviceName}\n` +
                   `Profesional: ${appointment.professionalName || appointment.professionalId || 'No asignado'}\n` +
                   `Notas: ${appointment.notes || 'Ninguna'}\n` +
                   `Estado: ${appointment.status}`,
      start: {
        dateTime: startISO,
        timeZone: timeZone,
      },
      end: {
        dateTime: endISO,
        timeZone: timeZone,
      },
    };

    const response = await calendar.events.insert({
      calendarId,
      requestBody: event,
    });

    console.log(`[Google Calendar] Event created successfully with ID: ${response.data.id}`);
    return response.data.id || null;
  } catch (error) {
    console.error('[Google Calendar] Error creating event:', error);
    return null;
  }
}

export async function updateCalendarEvent(eventId: string, appointment: AppointmentData): Promise<boolean> {
  const calendar = getCalendarClient();
  if (!calendar) return false;

  const timeZone = process.env.GOOGLE_CALENDAR_TIMEZONE || 'America/Mexico_City';
  const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';

  const startISO = `${appointment.date}T${appointment.startTime}:00`;
  const endISO = `${appointment.date}T${appointment.endTime}:00`;

  try {
    const summaryPrefix = appointment.status === 'completed' ? '[COMPLETADA] ' :
                          appointment.status === 'cancelled' ? '[CANCELADA] ' :
                          appointment.status === 'pending' ? '[PENDIENTE] ' : '';

    const event = {
      summary: `${summaryPrefix}Cita: ${appointment.customerName} - ${appointment.serviceName}`,
      description: `Cliente: ${appointment.customerName}\n` +
                   `Teléfono: ${appointment.customerPhone}\n` +
                   `Correo: ${appointment.customerEmail || 'No proporcionado'}\n` +
                   `Servicio: ${appointment.serviceName}\n` +
                   `Profesional: ${appointment.professionalName || appointment.professionalId || 'No asignado'}\n` +
                   `Notas: ${appointment.notes || 'Ninguna'}\n` +
                   `Estado: ${appointment.status}`,
      start: {
        dateTime: startISO,
        timeZone: timeZone,
      },
      end: {
        dateTime: endISO,
        timeZone: timeZone,
      },
    };

    await calendar.events.update({
      calendarId,
      eventId,
      requestBody: event,
    });

    console.log(`[Google Calendar] Event ${eventId} updated successfully.`);
    return true;
  } catch (error: any) {
    // If the event was deleted on Google Calendar side, we might get 410 (Gone) or 404 (Not Found).
    console.error(`[Google Calendar] Error updating event ${eventId}:`, error.message || error);
    return false;
  }
}

export async function deleteCalendarEvent(eventId: string): Promise<boolean> {
  const calendar = getCalendarClient();
  if (!calendar) return false;

  const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';

  try {
    await calendar.events.delete({
      calendarId,
      eventId,
    });
    console.log(`[Google Calendar] Event ${eventId} deleted successfully.`);
    return true;
  } catch (error: any) {
    // Ignore error if the event was already deleted (410 / 404)
    if (error?.status === 410 || error?.status === 404) {
      console.log(`[Google Calendar] Event ${eventId} already deleted or not found.`);
      return true;
    }
    console.error(`[Google Calendar] Error deleting event ${eventId}:`, error.message || error);
    return false;
  }
}
