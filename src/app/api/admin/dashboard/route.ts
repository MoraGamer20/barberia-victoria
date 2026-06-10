import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { verifyAdmin } from '@/lib/adminAuth';
import { format, startOfWeek, endOfWeek } from 'date-fns';

export const dynamic = 'force-dynamic';

interface DashboardAppointment {
  id: string;
  startTime: string;
  status?: string;
  customerName?: string;
  area?: string;
  [key: string]: unknown;
}

export async function GET(request: Request) {
  try {
    await verifyAdmin(request);

    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const todayAppointmentsSnap = await adminDb.collection('appointments').where('date', '==', todayStr).get();
    
    const todayAppointments = todayAppointmentsSnap.docs
      .map((doc) => ({
        id: doc.id,
        ...(doc.data() as Record<string, unknown>),
      } as DashboardAppointment))
      .sort((a, b) => a.startTime.localeCompare(b.startTime));

    // Stats
    let pending = 0;
    let inProcess = 0;
    let completed = 0;
    let cancelled = 0;
    const todayCount = todayAppointmentsSnap.size;

    todayAppointments.forEach((app: DashboardAppointment) => {
      if (app.status === 'pending') pending++;
      else if (app.status === 'in_process') inProcess++;
      else if (app.status === 'completed') completed++;
      else if (app.status === 'cancelled') cancelled++;
    });

    // Approximate "This Week" (we will just query >= startOfWeek)
    const startWeekStr = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
    const endWeekStr = format(endOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
    
    const weekSnap = await adminDb.collection('appointments')
      .where('date', '>=', startWeekStr)
      .where('date', '<=', endWeekStr)
      .get();
      
    const thisWeekCount = weekSnap.size;

    // Next Appointment
    const nowTime = format(new Date(), 'HH:mm');
    const upcoming = todayAppointments.find((a) => a.startTime >= nowTime && a.status === 'confirmed');
    const nextAppointment = upcoming ? {
      time: upcoming.startTime,
      client: upcoming.customerName ?? 'Cliente',
      area: upcoming.area === 'barberia' ? 'Barbería' : 'Estética'
    } : null;

    return NextResponse.json({
      stats: {
        today: todayCount,
        thisWeek: thisWeekCount,
        pending,
        inProcess,
        completed,
        cancelled,
        nextAppointment
      },
      todayAppointments
    });
    
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Dashboard Error:', error);
    return NextResponse.json({ error: 'Unauthorized or Error', details: message }, { status: 401 });
  }
}
