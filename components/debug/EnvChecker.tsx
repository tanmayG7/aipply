"use client";
import React from "react";

export function EnvChecker() {
  const checkEnvVar = (name: string) => {
    const value = process.env[name];
    return {
      name,
      exists: !!value,
      value: value ? `${value.substring(0, 20)}...` : 'undefined',
      fullValue: value || 'undefined'
    };
  };

  const envVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', 
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID'
  ];

  const envStatus = envVars.map(checkEnvVar);

  return (
    <div className="bg-gray-900 p-4 rounded-lg text-white">
      <h3 className="text-lg font-bold mb-4">🔍 Environment Variable Debug</h3>
      
      <div className="space-y-2">
        {envStatus.map((env) => (
          <div key={env.name} className={`p-2 rounded ${env.exists ? 'bg-green-900' : 'bg-red-900'}`}>
            <div className="flex justify-between items-center">
              <span className="font-mono text-sm">{env.name}</span>
              <span className={env.exists ? 'text-green-200' : 'text-red-200'}>
                {env.exists ? '✅ SET' : '❌ MISSING'}
              </span>
            </div>
            <div className="text-xs opacity-70 mt-1">
              Value: {env.value}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-blue-900 rounded text-sm">
        <p className="font-semibold mb-2">💡 Debugging Tips:</p>
        <ul className="space-y-1 text-blue-200">
          <li>• Make sure .env.local is in project root (same folder as package.json)</li>
          <li>• No spaces around the = sign: VARIABLE=value</li>
          <li>• No quotes needed around values</li>
          <li>• Restart server after changes</li>
          <li>• Check file is saved with UTF-8 encoding</li>
        </ul>
      </div>
    </div>
  );
}

export default EnvChecker;
