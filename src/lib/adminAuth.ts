import { adminAuth, adminDb } from '@/lib/firebase/admin';

export async function verifyAdmin(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No token provided');
  }

  const token = authHeader.split('Bearer ')[1];
  
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    
    // Verify user is in the 'users' collection with role 'admin'
    const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
    if (!userDoc.exists || userDoc.data()?.role !== 'admin') {
      throw new Error('Unauthorized role');
    }

    return decodedToken;
  } catch (error) {
    throw new Error('Invalid token');
  }
}
