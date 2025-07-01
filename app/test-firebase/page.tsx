"use client";
import { useEffect, useState } from 'react';
import { firestore } from '@/lib/firebaseConfig/firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';

export default function TestFirebase() {
  const [status, setStatus] = useState<string>('Testing Firebase connection...');

  useEffect(() => {
    testFirebase();
  }, []);

  const testFirebase = async () => {
    try {
      // Try to add a test document
      const docRef = await addDoc(collection(firestore, 'test'), {
        message: 'Test from AiPply',
        timestamp: new Date().toISOString()
      });
      
      setStatus(`Success! Document written with ID: ${docRef.id}`);
    } catch (error: any) {
      setStatus(`Error: ${error.message}`);
      console.error('Firebase test error:', error);
    }
  };

  return (
    <div className="p-8 bg-black min-h-screen text-white">
      <h1 className="text-2xl mb-4">Firebase Connection Test</h1>
      <p>{status}</p>
    </div>
  );
}
