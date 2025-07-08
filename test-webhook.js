// test-webhook.js
// Run with: node test-webhook.js

const crypto = require('crypto');

const WEBHOOK_SECRET = 'a_uN7XaMRMBJ@fy';
const WEBHOOK_URL = 'https://www.aipply.io/api/razorpay/webhook'; // Your production URL

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
const signature = crypto
  .createHmac('sha256', WEBHOOK_SECRET)
  .update(bodyString, 'utf8')
  .digest('hex');

console.log('🧪 Testing webhook...');
console.log('📡 URL:', WEBHOOK_URL);
console.log('🔐 Generated Signature:', signature);
console.log('📝 Payload:', bodyString);

// Using fetch (Node 18+) or curl fallback
async function testWebhook() {
  try {
    // Try with fetch first
    if (typeof fetch !== 'undefined') {
      console.log('\n🚀 Sending request with fetch...');
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-razorpay-signature': signature,
          'User-Agent': 'Razorpay-Webhook'
        },
        body: bodyString
      });
      
      const result = await response.text();
      console.log('📊 Response Status:', response.status);
      console.log('📊 Response Body:', result);
      
    } else {
      throw new Error('Fetch not available, using curl');
    }
    
  } catch (error) {
    console.log('\n🔧 Using curl instead...');
    
    const { exec } = require('child_process');
    const curlCommand = `curl -X POST "${WEBHOOK_URL}" \
      -H "Content-Type: application/json" \
      -H "x-razorpay-signature: ${signature}" \
      -H "User-Agent: Razorpay-Webhook" \
      -d '${bodyString}' \
      -w "\\nHTTP Status: %{http_code}\\n" \
      -s`;

    exec(curlCommand, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Curl Error:', error.message);
        console.log('\n📋 Manual curl command:');
        console.log(curlCommand.replace(/\s+/g, ' '));
        return;
      }
      
      console.log('📊 Curl Response:', stdout);
      if (stderr) {
        console.error('⚠️ Stderr:', stderr);
      }
    });
  }
}

testWebhook();
