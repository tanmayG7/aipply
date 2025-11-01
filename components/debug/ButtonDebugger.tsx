/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  authenticateUser, 
  checkEmailSignInMethods,
  auth 
} from "@/lib/firebaseConfig/firebaseConfig";
import { useRouter } from "next/navigation";

interface DebugResult {
  test: string;
  status: "pending" | "success" | "error";
  message: string;
  timestamp?: string;
}

export function ButtonDebugger() {
  const [results, setResults] = useState<DebugResult[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();

  const addResult = (test: string, status: "success" | "error", message: string) => {
    const result: DebugResult = {
      test,
      status,
      message,
      timestamp: new Date().toLocaleTimeString()
    };
    setResults(prev => [...prev, result]);
  };

  const clearResults = () => {
    setResults([]);
  };

  // Test 1: Basic button click
  const testBasicClick = () => {
    addResult("Basic Click", "success", "Button click event handler working!");
  };

  // Test 2: Router navigation
  const testRouterNavigation = () => {
    try {
      // Test if router is available
      if (router) {
        addResult("Router Navigation", "success", "Next.js router is available and functional");
      } else {
        addResult("Router Navigation", "error", "Next.js router not available");
      }
    } catch (error: any) {
      addResult("Router Navigation", "error", error.message);
    }
  };

  // Test 3: Firebase Auth status
  const testFirebaseAuth = () => {
    try {
      if (auth) {
        const user = auth.currentUser;
        addResult("Firebase Auth", "success", `Firebase auth available. User: ${user ? user.email : 'None'}`);
      } else {
        addResult("Firebase Auth", "error", "Firebase auth not available");
      }
    } catch (error: any) {
      addResult("Firebase Auth", "error", error.message);
    }
  };

  // Test 4: Check email methods function
  const testEmailCheck = async () => {
    try {
      const methods = await checkEmailSignInMethods("test@example.com");
      addResult("Email Check Function", "success", `Email check working: ${JSON.stringify(methods)}`);
    } catch (error: any) {
      addResult("Email Check Function", "error", error.message);
    }
  };

  // Test 5: Authentication function
  const testAuthFunction = async () => {
    try {
      // Just test that the function exists and is callable (don't actually authenticate)
      if (typeof authenticateUser === 'function') {
        addResult("Auth Function", "success", "authenticateUser function is available");
      } else {
        addResult("Auth Function", "error", "authenticateUser function not found");
      }
    } catch (error: any) {
      addResult("Auth Function", "error", error.message);
    }
  };

  // Test 6: Environment variables
  const testEnvironmentVars = () => {
    const firebaseVars = [
      'NEXT_PUBLIC_FIREBASE_API_KEY',
      'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
      'NEXT_PUBLIC_FIREBASE_PROJECT_ID'
    ];
    
    const missing = firebaseVars.filter(varName => !process.env[varName]);
    
    if (missing.length === 0) {
      addResult("Environment Variables", "success", "All Firebase environment variables are set");
    } else {
      addResult("Environment Variables", "error", `Missing variables: ${missing.join(', ')}`);
    }
  };

  // Run all tests
  const runAllTests = async () => {
    clearResults();
    addResult("Starting Tests", "success", "Running comprehensive button and auth tests...");
    
    testBasicClick();
    testRouterNavigation();
    testFirebaseAuth();
    testEnvironmentVars();
    await testEmailCheck();
    await testAuthFunction();
    
    addResult("All Tests Complete", "success", "Check results above for any issues");
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button 
          onClick={() => setIsVisible(true)}
          className="bg-red-600 hover:bg-red-700 text-white"
          size="sm"
        >
          🔧 Debug Buttons
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed inset-4 bg-black/90 z-50 overflow-auto p-4 rounded-lg border border-gray-700">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">🔧 Button & Auth Debugger</h2>
          <Button 
            onClick={() => setIsVisible(false)}
            variant="outline"
            size="sm"
          >
            Close
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-white">Individual Tests</h3>
            <Button onClick={testBasicClick} size="sm" className="w-full">
              Test Basic Click
            </Button>
            <Button onClick={testRouterNavigation} size="sm" className="w-full">
              Test Router
            </Button>
            <Button onClick={testFirebaseAuth} size="sm" className="w-full">
              Test Firebase
            </Button>
            <Button onClick={testEmailCheck} size="sm" className="w-full">
              Test Email Check
            </Button>
            <Button onClick={testAuthFunction} size="sm" className="w-full">
              Test Auth Function
            </Button>
            <Button onClick={testEnvironmentVars} size="sm" className="w-full">
              Test Environment
            </Button>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-white">Batch Tests</h3>
            <Button onClick={runAllTests} className="w-full bg-green-600 hover:bg-green-700">
              🚀 Run All Tests
            </Button>
            <Button onClick={clearResults} variant="outline" className="w-full">
              Clear Results
            </Button>
          </div>
        </div>

        <div className="bg-gray-900 p-4 rounded-lg max-h-96 overflow-auto">
          <h3 className="text-lg font-semibold text-white mb-2">Test Results</h3>
          {results.length === 0 ? (
            <p className="text-gray-400">No tests run yet. Click a test button above.</p>
          ) : (
            <div className="space-y-2">
              {results.map((result, index) => (
                <div 
                  key={index} 
                  className={`p-2 rounded text-sm ${
                    result.status === 'success' 
                      ? 'bg-green-900 text-green-200' 
                      : 'bg-red-900 text-red-200'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-semibold">
                      {result.status === 'success' ? '✅' : '❌'} {result.test}
                    </span>
                    {result.timestamp && (
                      <span className="text-xs opacity-70">{result.timestamp}</span>
                    )}
                  </div>
                  <div className="mt-1">{result.message}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 p-4 bg-blue-900 rounded-lg">
          <h3 className="text-white font-semibold mb-2">💡 Quick Fixes</h3>
          <ul className="text-blue-200 text-sm space-y-1">
            <li>• If router test fails: Make sure you&apos;re using this component inside a Next.js page</li>
            <li>• If Firebase test fails: Check your environment variables (.env.local)</li>
            <li>• If auth function fails: Verify Firebase config and imports</li>
            <li>• If all tests pass but buttons don't work: Check browser console for errors</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default ButtonDebugger;
