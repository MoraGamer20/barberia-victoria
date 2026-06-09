import { NextResponse } from 'next/server';
import * as admin from 'firebase-admin';
import { adminDb } from '@/lib/firebase/admin';
import { verifyAdmin } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

const defaultSettings = {
  openingTime: '09:00',
  closingTime: '20:00',
  whatsappNumber: '528341656549',
  address: 'Calle Principal #123, Centro',
  instagram: 'https://www.instagram.com/',
  facebook: 'https://www.facebook.com/',
  closedDays: [],
};

export async function GET(request: Request) {
  try {
    await verifyAdmin(request);
    const doc = await adminDb.collection('business_settings').doc('default').get();

    return NextResponse.json({
      settings: doc.exists
        ? { ...defaultSettings, ...doc.data() }
        : defaultSettings,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

export async function PUT(request: Request) {
  try {
    await verifyAdmin(request);
    const body = await request.json();

    const settings = {
      ...defaultSettings,
      ...body,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await adminDb.collection('business_settings').doc('default').set(settings, { merge: true });

    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}
