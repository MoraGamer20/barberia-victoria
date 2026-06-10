export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase/admin';

/**
 * GET /api/setup-admin?email=moradoortegakevinalejandro@gmail.com
 *
 * Creates (or updates) a document in the `users` collection with role: 'admin'
 * for the Firebase Auth user that matches the given email.
 *
 * IMPORTANT: Remove or protect this endpoint after first use.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Missing ?email= parameter' },
        { status: 400 }
      );
    }

    // Look up the user in Firebase Auth by email
    const userRecord = await adminAuth.getUserByEmail(email);

    // Write / overwrite the users document with role: admin
    await adminDb.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email: userRecord.email,
      role: 'admin',
      createdAt: Date.now(),
    });

    return NextResponse.json({
      success: true,
      message: `User ${email} (uid: ${userRecord.uid}) is now an admin.`,
    });
  } catch (error: any) {
    const message = error?.message ?? 'Unknown error';

    if (message.includes('SDK is not initialized')) {
      return NextResponse.json(
        { error: 'Firebase Admin not configured. Check environment variables.' },
        { status: 503 }
      );
    }

    if (message.includes('There is no user record') || message.includes('auth/user-not-found')) {
      return NextResponse.json(
        { error: 'No Firebase Auth user found for that email. Create the user first in Firebase Console → Authentication.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
