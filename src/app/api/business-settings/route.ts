import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const doc = await adminDb.collection('business_settings').doc('default').get();

    if (!doc.exists) {
      const response = NextResponse.json({
        settings: {
          openingTime: '09:00',
          closingTime: '20:00',
          whatsappNumber: '528341656549',
          address: 'Calle Principal #123, Centro',
          instagram: 'https://www.instagram.com/',
          facebook: 'https://www.facebook.com/',
          closedDays: [],
        },
      });
      response.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate');
      return response;
    }

    const response = NextResponse.json({ settings: doc.data() });
    response.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate');
    return response;
  } catch (error: any) {
    if (error?.message?.includes('SDK is not initialized')) {
      return NextResponse.json(
        { error: 'Firebase Admin not configured.' },
        { status: 503 }
      );
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
