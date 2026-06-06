import * as admin from 'firebase-admin';

const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

// A valid private key must be a PEM-encoded RSA key starting with this header.
// If the value is a placeholder like "your_private_key", this check will be false.
const hasCredentials =
  !!projectId &&
  !!clientEmail &&
  !!privateKey &&
  privateKey.trimStart().startsWith('-----BEGIN');

if (!admin.apps.length) {
  if (!hasCredentials) {
    console.warn(
      '[Firebase Admin] Missing or invalid credentials. ' +
        'Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY ' +
        'to enable Firebase Admin features. Skipping initialization.'
    );
  } else {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      });
    } catch (error) {
      console.error(
        '[Firebase Admin] Initialization error:',
        error instanceof Error ? error.stack : error
      );
    }
  }
}

/**
 * Returns a Firebase Admin service only if the SDK was initialized.
 * Throws a descriptive error at runtime (inside Route Handlers / Server Actions)
 * instead of at build time.
 */
function getAdminApp(): admin.app.App {
  const app = admin.apps[0];
  if (!app) {
    throw new Error(
      '[Firebase Admin] SDK is not initialized. ' +
        'Please configure FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY.'
    );
  }
  return app;
}

// Lazy accessors – evaluated only when a Route Handler actually calls them.
export const adminDb: admin.firestore.Firestore = new Proxy({} as admin.firestore.Firestore, {
  get(_target, prop) {
    return (getAdminApp().firestore() as any)[prop];
  },
});

export const adminAuth: admin.auth.Auth = new Proxy({} as admin.auth.Auth, {
  get(_target, prop) {
    return (getAdminApp().auth() as any)[prop];
  },
});

export const adminStorage: admin.storage.Storage = new Proxy({} as admin.storage.Storage, {
  get(_target, prop) {
    return (getAdminApp().storage() as any)[prop];
  },
});
