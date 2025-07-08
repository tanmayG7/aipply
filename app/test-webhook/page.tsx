// app/test-webhook/page.tsx
"use client";
import { useState } from 'react';

export default function TestWebhook() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testWebhook = async () => {
    setLoading(true);
    setResult('Testing webhook...');

    try {
      // Create test payload
      const testPayload = {
        event: 'subscription.authenticated',
        payload: {
          subscription: {
            entity: {
              id: 'sub_test123',
              plan_id: 'pl_QqIH3ysYHYPnEP',
              customer_id: 'cust_test123',
              notes: {
                userId: 'test-user-123'
              }
            }
          }
        }
      };

      const bodyString = JSON.stringify(testPayload);

      // Generate signature (this mimics what Razorpay does)
      const response = await fetch('/api/test-signature', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ payload: bodyString })
      });

      const { signature } = await response.json();

      // Now call the actual webhook
      const webhookResponse = await fetch('/api/razorpay/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-razorpay-signature': signature,
          'User-Agent': 'Test-Webhook'
        },
        body: bodyString
      });

      const webhookResult = await webhookResponse.text();
      
      setResult(`
Status: ${webhookResponse.status}
Response: ${webhookResult}
Generated Signature: ${signature}
      `);

    } catch (error) {
      setResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Webhook Test Page</h1>
        
        <div className="mb-6">
          <button
            onClick={testWebhook}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-6 py-3 rounded-lg text-white font-medium"
          >
            {loading ? 'Testing...' : 'Test Webhook'}
          </button>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Test Result:</h2>
          <pre className="whitespace-pre-wrap font-mono text-sm">
            {result || 'Click "Test Webhook" to start test'}
          </pre>
        </div>

        <div className="mt-6 bg-blue-900/20 border border-blue-500 rounded-lg p-4">
          <h3 className="font-semibold mb-2">What this test does:</h3>
          <ul className="text-sm space-y-1">
            <li>• Generates a test webhook payload (like Razorpay would send)</li>
            <li>• Creates the proper HMAC signature</li>
            <li>• Calls your webhook endpoint</li>
            <li>• Shows you the debug output</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
