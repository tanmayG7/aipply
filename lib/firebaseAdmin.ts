import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

let adminApp: App;

export function getAdminApp(): App {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  try {
    // For production/deployment, use service account credentials from environment
    if (process.env.FIREBASE_ADMIN_PRIVATE_KEY && process.env.FIREBASE_ADMIN_CLIENT_EMAIL) {
      adminApp = initializeApp({
        credential: cert({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
      });
      console.log('🔑 Firebase Admin initialized with service account credentials');
    } else {
      // For local development, use application default credentials
      // This works when you've run `firebase login` or have GOOGLE_APPLICATION_CREDENTIALS set
      adminApp = initializeApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'aipply-17c23',
      });
      console.log('🔑 Firebase Admin initialized with default credentials');
    }

    return adminApp;
  } catch (error) {
    console.error('❌ Error initializing Firebase Admin:', error);
    throw error;
  }
}

export function getAdminFirestore() {
  const app = getAdminApp();
  return getFirestore(app);
}
