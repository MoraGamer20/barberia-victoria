import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { verifyAdmin } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    await verifyAdmin(request);
    const snap = await adminDb.collection('professionals').get();
    const professionals = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json({ professionals });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    await verifyAdmin(request);
    const body = await request.json();
    const docRef = adminDb.collection('professionals').doc();
    const data = { ...body, id: docRef.id };
    await docRef.set(data);
    return NextResponse.json({ success: true, professional: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

export async function PUT(request: Request) {
  try {
    await verifyAdmin(request);
    const body = await request.json();
    const { id, ...updateData } = body;
    if (!id) throw new Error('ID required');
    await adminDb.collection('professionals').doc(id).update(updateData);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}
