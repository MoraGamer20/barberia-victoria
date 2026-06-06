import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const profsSnap = await adminDb.collection('professionals').where('active', '==', true).get();
    
    const professionals = profsSnap.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
      };
    });

    return NextResponse.json({ professionals });
  } catch (error: any) {
    console.error('Error fetching professionals:', error);
    return NextResponse.json(
      { error: 'Error fetching professionals', details: error.message },
      { status: 500 }
    );
  }
}
