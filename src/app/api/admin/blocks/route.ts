import { NextResponse } from 'next/server';
import * as admin from 'firebase-admin';
import { adminDb } from '@/lib/firebase/admin';
import { verifyAdmin } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

function mapBlock(doc: any) {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    createdAt: data?.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data?.createdAt || null,
    updatedAt: data?.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data?.updatedAt || null,
  };
}

export async function GET(request: Request) {
  try {
    await verifyAdmin(request);

    const [blockedDaysSnap, blockedTimesSnap] = await Promise.all([
      adminDb.collection('blocked_days').orderBy('date', 'asc').get(),
      adminDb.collection('blocked_times').orderBy('date', 'asc').get(),
    ]);

    return NextResponse.json({
      blockedDays: blockedDaysSnap.docs.map(mapBlock),
      blockedTimes: blockedTimesSnap.docs.map(mapBlock),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    await verifyAdmin(request);
    const body = await request.json();
    const { type, ...payload } = body;

    if (!type || !['day', 'time'].includes(type)) {
      throw new Error('Type required: day or time');
    }

    const collectionName = type === 'day' ? 'blocked_days' : 'blocked_times';
    const docRef = adminDb.collection(collectionName).doc();
    const data = {
      ...payload,
      id: docRef.id,
      professionalId: payload.professionalId || 'all',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await docRef.set(data);

    return NextResponse.json({ success: true, block: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

export async function PUT(request: Request) {
  try {
    await verifyAdmin(request);
    const body = await request.json();
    const { id, type, ...updateData } = body;

    if (!id || !type || !['day', 'time'].includes(type)) {
      throw new Error('ID and type are required');
    }

    const collectionName = type === 'day' ? 'blocked_days' : 'blocked_times';
    await adminDb.collection(collectionName).doc(id).update({
      ...updateData,
      professionalId: updateData.professionalId || 'all',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}
