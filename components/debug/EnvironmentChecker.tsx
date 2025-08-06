// components/debug/EnvironmentChecker.tsx
"use client";

import { useEffect } from 'react';

export const EnvironmentChecker = () => {
  useEffect(() => {
    // Only run in development mode
    if (process.env.NODE_ENV !== 'development') {
      return;
    }
    
    console.log('🔧 Environment Check Starting...');
    
    // Check Firebase vars (client-side accessible)
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
    };
    
    console.log('🔥 Firebase Config Check:', {
      hasApiKey: !!firebaseConfig.apiKey,
      hasAuthDomain: !!firebaseConfig.authDomain,
      hasProjectId: !!firebaseConfig.projectId,
      hasStorageBucket: !!firebaseConfig.storageBucket,
      hasMessagingSenderId: !!firebaseConfig.messagingSenderId,
      hasAppId: !!firebaseConfig.appId,
      projectId: firebaseConfig.projectId,
      authDomain: firebaseConfig.authDomain
    });
    
    // Check for any missing Firebase config
    const missingFirebaseVars = Object.entries(firebaseConfig)
      .filter(([key, value]) => !value)
      .map(([key]) => key);
    
    if (missingFirebaseVars.length > 0) {
      console.error('❌ Missing Firebase environment variables:', missingFirebaseVars);
    } else {
      console.log('✅ All Firebase environment variables present');
    }
    
    // MongoDB vars are server-side only, so we can't check them here
    console.log('📊 MongoDB vars are server-side only - will be checked in API calls');
    
    // Check browser capabilities
    console.log('🌐 Browser Environment:', {
      hasLocalStorage: typeof(Storage) !== "undefined",
      hasIndexedDB: 'indexedDB' in window,
      hasWebGL: !!window.WebGLRenderingContext,
      cookiesEnabled: navigator.cookieEnabled,
      language: navigator.language,
      platform: navigator.platform,
      onLine: navigator.onLine
    });
    
    // Test Firebase initialization
    try {
      // Use dynamic import to avoid SSR issues
      import('firebase/app').then(({ initializeApp, getApps }) => {
        const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
        console.log('✅ Firebase app initialized successfully:', app.name);
      }).catch((error) => {
        console.error('❌ Firebase initialization failed:', error);
      });
    } catch (error) {
      console.error('❌ Firebase import failed:', error);
    }
    
  }, []);

  // This component doesn't render anything visible
  return null;
};
