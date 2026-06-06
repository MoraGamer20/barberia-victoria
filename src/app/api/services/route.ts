import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const servicesSnap = await adminDb.collection('services').where('isActive', '==', true).get();
    
    const services = servicesSnap.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
      };
    });

    return NextResponse.json({ services });
  } catch (error: any) {
    console.error('Error fetching services:', error);
    return NextResponse.json(
      { error: 'Error fetching services', details: error.message },
      { status: 500 }
    );
  }
}
