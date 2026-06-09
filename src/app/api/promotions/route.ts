import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

export const dynamic = 'force-dynamic';

interface PromotionRecord {
  id: string;
  isDeleted?: boolean;
  validFrom?: string;
  validTo?: string;
  order?: number;
  [key: string]: unknown;
}

export async function GET() {
  try {
    const snap = await adminDb.collection('promotions')
      .where('isActive', '==', true)
      .get();

    // Get today's local date string in YYYY-MM-DD format
    const todayStr = new Date().toLocaleDateString('sv');

    const promotions = snap.docs
      .map((doc) => ({ id: doc.id, ...(doc.data() as Record<string, unknown>) } as PromotionRecord))
      .filter((promo) => {
        // Soft delete filter
        if (promo.isDeleted) return false;

        // Validity dates check
        const validFrom = promo.validFrom || '';
        const validTo = promo.validTo || '';

        const isAfterStart = !validFrom || todayStr >= validFrom;
        const isBeforeEnd = !validTo || todayStr <= validTo;

        return isAfterStart && isBeforeEnd;
      })
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    return NextResponse.json({ promotions });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message.includes('SDK is not initialized')) {
      return NextResponse.json(
        { error: 'Firebase Admin not configured. Set credentials.' },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
