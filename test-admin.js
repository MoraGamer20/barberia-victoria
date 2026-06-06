const fs = require('fs');
const admin = require('firebase-admin');

const envFile = fs.readFileSync('.env.local', 'utf8');
const envVars = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    envVars[match[1]] = match[2];
  }
});

async function testAdmin() {
  try {
    const app = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: envVars.FIREBASE_PROJECT_ID,
        clientEmail: envVars.FIREBASE_CLIENT_EMAIL,
        privateKey: envVars.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n').replace(/^"|"$/g, ''),
      }),
    });
    
    const db = admin.firestore(app);
    const snapshot = await db.collection('business_settings').limit(1).get();
    console.log('✅ Firestore Admin Connection Successful!');
    console.log('Docs found:', snapshot.size);

    process.exit(0);
  } catch (error) {
    console.error('❌ Firebase Admin Error:', error.message);
    process.exit(1);
  }
}

testAdmin();
