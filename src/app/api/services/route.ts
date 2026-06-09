import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

export const dynamic = 'force-dynamic';

interface ServiceRecord {
  id: string;
  order?: number;
  name?: string;
  [key: string]: unknown;
}

export async function GET() {
  try {
    const servicesSnap = await adminDb.collection('services').where('isActive', '==', true).get();
    
    const services: ServiceRecord[] = servicesSnap.docs
      .map((doc) => {
        const data = doc.data() as Record<string, unknown>;
        return {
          id: doc.id,
          ...data,
        } as ServiceRecord;
      })
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || String(a.name ?? '').localeCompare(String(b.name ?? '')));

    return NextResponse.json({ services });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching services:', error);
    return NextResponse.json(
      { error: 'Error fetching services', details: message },
      { status: 500 }
    );
  }
}
