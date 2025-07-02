// Create this file: lib/debug/envChecker.ts

export const checkEnvironment = () => {
  console.log('🔧 Environment Check:');
  
  // Check MongoDB vars
  const mongoUri = process.env.MONGODB_URI;
  const mongoDb = process.env.MONGODB_DB;
  
  console.log('📊 MongoDB Config:', {
    hasUri: !!mongoUri,
    hasDb: !!mongoDb,
    uriPreview: mongoUri ? `${mongoUri.substring(0, 20)}...` : 'Missing'
  });
  
  // Check Firebase vars
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
  
  console.log('🔥 Firebase Config:', {
    hasApiKey: !!firebaseConfig.apiKey,
    hasAuthDomain: !!firebaseConfig.authDomain,
    hasProjectId: !!firebaseConfig.projectId,
    projectId: firebaseConfig.projectId
  });
  
  return {
    mongodb: !!mongoUri && !!mongoDb,
    firebase: Object.values(firebaseConfig).every(val => !!val)
  };
};

// Add this to your app/layout.tsx or any page to run the check
if (typeof window !== 'undefined') {
  checkEnvironment();
}
