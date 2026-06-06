import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { verifyAdmin } from '@/lib/adminAuth';
import { format, startOfWeek, endOfWeek, startOfDay, endOfDay } from 'date-fns';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    await verifyAdmin(request);

    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const todayAppointmentsSnap = await adminDb.collection('appointments').where('date', '==', todayStr).get();
    
    const todayAppointments = todayAppointmentsSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })).sort((a: any, b: any) => a.startTime.localeCompare(b.startTime));

    // Stats
    let completed = 0;
    let cancelled = 0;
    let todayCount = todayAppointmentsSnap.size;

    todayAppointments.forEach((app: any) => {
      if (app.status === 'completed') completed++;
      if (app.status === 'cancelled') cancelled++;
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
    const upcoming = todayAppointments.find((a: any) => a.startTime >= nowTime && a.status === 'confirmed');
    const nextAppointment = upcoming ? {
      time: (upcoming as any).startTime as string,
      client: (upcoming as any).customerName as string,
      area: ((upcoming as any).area === 'barberia' ? 'Barbería' : 'Estética')
    } : null;

    return NextResponse.json({
      stats: {
        today: todayCount,
        thisWeek: thisWeekCount,
        completed,
        cancelled,
        nextAppointment
      },
      todayAppointments
    });
    
  } catch (error: any) {
    console.error('Dashboard Error:', error);
    return NextResponse.json({ error: 'Unauthorized or Error', details: error.message }, { status: 401 });
  }
}
