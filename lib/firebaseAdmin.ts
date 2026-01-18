import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

let adminApp: App;

export function getAdminApp(): App {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  // Check if explicit service account credentials are provided
  // Note: Using ADMIN_ prefix to avoid Firebase's reserved FIREBASE_ prefix
  const hasPrivateKey = !!process.env.ADMIN_PRIVATE_KEY;
  const hasClientEmail = !!process.env.ADMIN_CLIENT_EMAIL;

  // Build-time safeguard: Fail fast if credentials are missing in production
  // This prevents deployment timeouts when Firebase tries to analyze the code
  const isProduction = process.env.NODE_ENV === 'production';
  const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build';

  if (isProduction && !hasPrivateKey && !hasClientEmail && !isBuildPhase) {
    const errorMessage = [
      '❌ Firebase Admin SDK credentials not configured!',
      '',
      'Required environment variables are missing:',
      '  - ADMIN_CLIENT_EMAIL',
      '  - ADMIN_PRIVATE_KEY',
      '',
      'To fix this:',
      '1. Download service account key from Firebase Console',
      '2. Set secrets using: firebase functions:secrets:set ADMIN_CLIENT_EMAIL',
      '3. Set secrets using: firebase functions:secrets:set ADMIN_PRIVATE_KEY',
      '4. See ADMIN_SETUP.md for detailed instructions',
      ''
    ].join('\n');

    throw new Error(errorMessage);
  }

  try {

    if (hasPrivateKey && hasClientEmail) {
      // Use explicit service account credentials (recommended for production)
      console.log('🔑 Initializing Firebase Admin with service account credentials...');

      adminApp = initializeApp({
        credential: cert({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'aipply-17c23',
          clientEmail: process.env.ADMIN_CLIENT_EMAIL!,
          privateKey: process.env.ADMIN_PRIVATE_KEY!.replace(/\\n/g, '\n'),
        }),
      });

      console.log('✅ Firebase Admin initialized with service account credentials');
      return adminApp;
    }

    // Warn about missing credentials
    if (!hasPrivateKey || !hasClientEmail) {
      console.warn('⚠️ WARNING: Firebase Admin credentials not fully configured!');
      console.warn('Missing:', {
        ADMIN_PRIVATE_KEY: hasPrivateKey ? '✓' : '✗',
        ADMIN_CLIENT_EMAIL: hasClientEmail ? '✓' : '✗',
      });
      console.warn('Attempting to use Application Default Credentials (ADC)...');
      console.warn('This may fail in production. See ADMIN_SETUP.md for setup instructions.');
    }

    // Fallback to Application Default Credentials
    // This works in local development if you've run `firebase login`
    // but may NOT work in Firebase Hosting production environment
    adminApp = initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'aipply-17c23',
    });

    console.log('🔑 Firebase Admin initialized with Application Default Credentials');
    console.log('⚠️ If you see authentication errors, configure service account credentials.');

    return adminApp;
  } catch (error) {
    console.error('❌ Error initializing Firebase Admin SDK');
    console.error('Error details:', error);

    if (error instanceof Error && error.message.includes('Could not load the default credentials')) {
      console.error('');
      console.error('🔧 SOLUTION: Configure Firebase Admin service account credentials');
      console.error('1. Download service account key from Firebase Console');
      console.error('2. Set environment variables:');
      console.error('   - ADMIN_CLIENT_EMAIL');
      console.error('   - ADMIN_PRIVATE_KEY');
      console.error('3. See ADMIN_SETUP.md for detailed instructions');
      console.error('');
    }

    throw error;
  }
}

export function getAdminFirestore() {
  const app = getAdminApp();
  return getFirestore(app);
}

export const adminDb = getAdminFirestore();
