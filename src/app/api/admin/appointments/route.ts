import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { verifyAdmin } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    await verifyAdmin(request);
    
    const snap = await adminDb.collection('appointments').get();
      
    const appointments = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      .sort((a: any, b: any) => {
        if (a.date === b.date) return b.startTime.localeCompare(a.startTime);
        return b.date.localeCompare(a.date);
      });

    return NextResponse.json({ appointments });
  } catch (error: any) {
    console.error('Appointments error:', error);
    return NextResponse.json({ error: error.message }, { status: error.message === 'Invalid token' ? 401 : 500 });
  }
}
