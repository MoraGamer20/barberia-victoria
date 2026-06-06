export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { verifyAdmin } from '@/lib/adminAuth';
import * as admin from 'firebase-admin';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const decodedToken = await verifyAdmin(request);
    const { id } = await params;
    const body = await request.json();
    const { status, date, startTime, endTime } = body;

    const updateData: any = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: decodedToken.uid
    };

    if (status) updateData.status = status;
    
    // Si es reprogramación
    if (date && startTime && endTime) {
      updateData.date = date;
      updateData.startTime = startTime;
      updateData.endTime = endTime;
    }

    await adminDb.collection('appointments').doc(id).update(updateData);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Update appointment error:', error);
    return NextResponse.json({ error: error.message }, { status: error.message === 'Invalid token' ? 401 : 500 });
  }
}
