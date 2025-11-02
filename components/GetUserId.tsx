"use client";
import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebaseConfig/firebaseConfig';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

export default function GetUserId() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log('🔍 Auth state changed:', currentUser ? 'User found' : 'No user');
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const copyUserId = () => {
    if (user?.uid) {
      navigator.clipboard.writeText(user.uid);
      alert('User ID copied to clipboard!');
    }
  };

  const testFirebase = () => {
    if (!user?.uid) {
      alert('No user ID found!');
      return;
    }

    fetch('/api/test-firebase-update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.uid })
    })
    .then(r => r.json())
    .then(data => {
      console.log('🧪 Firebase test result:', data);
      if (data.success) {
        alert('✅ Firebase test successful! Check console for details.');
      } else {
        alert('❌ Firebase test failed: ' + data.error);
      }
    })
    .catch(error => {
      console.error('Test failed:', error);
      alert('Test failed - check console');
    });
  };

  if (loading) {
    return (
      <div style={{ 
        background: '#333', 
        color: 'white', 
        padding: '20px', 
        margin: '20px',
        borderRadius: '8px'
      }}>
        <p>🔄 Loading user information...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ 
        background: '#d32f2f', 
        color: 'white', 
        padding: '20px', 
        margin: '20px',
        borderRadius: '8px'
      }}>
        <h3>❌ No User Logged In</h3>
        <p>Please log in to your account first, then refresh this page.</p>
      </div>
    );
  }

  return (
    <div style={{ 
      background: '#1976d2', 
      color: 'white', 
      padding: '20px', 
      margin: '20px',
      borderRadius: '8px'
    }}>
      <h3>👤 User Information Found!</h3>
      
      <div style={{ marginBottom: '15px' }}>
        <strong>Email:</strong> {user.email}
      </div>
      
      <div style={{ 
        background: '#000', 
        padding: '10px', 
        fontFamily: 'monospace',
        borderRadius: '4px',
        marginBottom: '15px',
        wordBreak: 'break-all'
      }}>
        <strong>User ID:</strong><br />
        {user.uid}
      </div>
      
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button 
          onClick={copyUserId}
          style={{ 
            background: '#4caf50', 
            color: 'white', 
            padding: '10px 15px', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          📋 Copy User ID
        </button>
        
        <button 
          onClick={testFirebase}
          style={{ 
            background: '#ff9800', 
            color: 'white', 
            padding: '10px 15px', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          🧪 Test Firebase Update
        </button>
      </div>
      
      <div style={{ 
        marginTop: '15px', 
        fontSize: '12px', 
        opacity: '0.8' 
      }}>
        💡 Click &quot;Test Firebase Update&quot; to check if Firebase integration is working
      </div>
    </div>
  );
}
