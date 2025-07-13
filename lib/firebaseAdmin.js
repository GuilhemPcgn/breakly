import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

let app;
let auth;

try {
  const firebaseAdminConfig = {
    credential: cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  };

  app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseAdminConfig);
  auth = getAuth(app);
} catch (error) {
  console.warn('Firebase Admin not configured yet. Add your credentials to .env file.');
  // Mock auth for development
  auth = {
    verifyIdToken: () => Promise.reject(new Error('Firebase Admin not configured')),
    setCustomUserClaims: () => Promise.reject(new Error('Firebase Admin not configured')),
  };
}

export { app, auth };