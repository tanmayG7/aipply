// Create this file: components/debug/EnvironmentChecker.tsx

"use client";

import { useEffect } from 'react';

export const EnvironmentChecker = () => {
  useEffect(() => {
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
      const { initializeApp, getApps } = require('firebase/app');
      const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
      console.log('✅ Firebase app initialized successfully:', app.name);
    } catch (error) {
      console.error('❌ Firebase initialization failed:', error);
    }
    
  }, []);

  // This component doesn't render anything visible
  return null;
};

// Create this file: components/debug/ServerEnvironmentChecker.tsx

"use server";

export const checkServerEnvironment = () => {
  console.log('🔧 Server Environment Check:');
  
  // Check MongoDB vars (server-side only)
  const mongoUri = process.env.MONGODB_URI;
  const mongoDb = process.env.MONGODB_DB;
  
  console.log('📊 MongoDB Config:', {
    hasUri: !!mongoUri,
    hasDb: !!mongoDb,
    uriPreview: mongoUri ? `${mongoUri.substring(0, 30)}...` : 'Missing',
    dbName: mongoDb || 'Missing'
  });
  
  // Check other server-side vars if any
  const nodeEnv = process.env.NODE_ENV;
  const nexttelemetry = process.env.NEXT_TELEMETRY_DISABLED;
  
  console.log('⚙️ Server Config:', {
    nodeEnv,
    telemetryDisabled: nexttelemetry,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });
  
  return {
    mongodb: !!mongoUri && !!mongoDb,
    nodeEnv
  };
};
