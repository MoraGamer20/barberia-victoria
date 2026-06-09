import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { verifyAdmin } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    await verifyAdmin(request);
    const snap = await adminDb.collection('promotions').get();
    
    const promotions = snap.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as any))
      .filter(promo => !promo.isDeleted)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    return NextResponse.json({ promotions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    await verifyAdmin(request);
    const body = await request.json();
    const docRef = adminDb.collection('promotions').doc();
    
    const data = {
      ...body,
      id: docRef.id,
      originalPrice: body.originalPrice !== undefined && body.originalPrice !== null && body.originalPrice !== '' ? Number(body.originalPrice) : null,
      promoPrice: body.promoPrice !== undefined && body.promoPrice !== null && body.promoPrice !== '' ? Number(body.promoPrice) : null,
      order: Number(body.order ?? 0),
      isActive: body.isActive ?? true,
      isDeleted: false,
      createdAt: Date.now()
    };
    
    await docRef.set(data);
    return NextResponse.json({ success: true, promotion: data });
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
    
    // Normalize fields
    if (updateData.originalPrice !== undefined) {
      updateData.originalPrice = updateData.originalPrice !== null && updateData.originalPrice !== '' ? Number(updateData.originalPrice) : null;
    }
    if (updateData.promoPrice !== undefined) {
      updateData.promoPrice = updateData.promoPrice !== null && updateData.promoPrice !== '' ? Number(updateData.promoPrice) : null;
    }
    if (updateData.order !== undefined) {
      updateData.order = Number(updateData.order ?? 0);
    }
    
    await adminDb.collection('promotions').doc(id).update(updateData);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

export async function DELETE(request: Request) {
  try {
    await verifyAdmin(request);
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    if (!id) throw new Error('ID required');
    
    // Soft delete
    await adminDb.collection('promotions').doc(id).update({ isDeleted: true });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}
