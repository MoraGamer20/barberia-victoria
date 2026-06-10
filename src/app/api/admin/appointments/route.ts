import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { verifyAdmin } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

interface AppointmentRecord {
  id?: string;
  date?: string;
  startTime?: string;
  [key: string]: unknown;
}

export async function GET(request: Request) {
  try {
    await verifyAdmin(request);
    
    const snap = await adminDb.collection('appointments').get();
      
    const appointments = snap.docs
      .map((doc) => ({ id: doc.id, ...(doc.data() as Record<string, unknown>) } as AppointmentRecord))
      .sort((a: AppointmentRecord, b: AppointmentRecord) => {
        const aDate = String(a.date);
        const bDate = String(b.date);
        const aTime = String(a.startTime);
        const bTime = String(b.startTime);

        if (aDate === bDate) return aTime.localeCompare(bTime);
        return aDate.localeCompare(bDate);
      });

    return NextResponse.json({ appointments });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Appointments error:', error);
    return NextResponse.json({ error: message }, { status: message === 'Invalid token' ? 401 : 500 });
  }
}
