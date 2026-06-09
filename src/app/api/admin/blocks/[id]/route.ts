import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { verifyAdmin } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await verifyAdmin(request);

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (!type || !['day', 'time'].includes(type)) {
      throw new Error('Type required: day or time');
    }

    const collectionName = type === 'day' ? 'blocked_days' : 'blocked_times';
    await adminDb.collection(collectionName).doc(id).delete();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}
