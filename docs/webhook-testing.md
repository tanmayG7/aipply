# Manual Webhook Testing

## Option 1: Razorpay Event Simulator

1. Go to https://dashboard.razorpay.com/app/webhooks
2. Click on your webhook
3. Look for "Events" or "Logs" tab
4. Some accounts have an "Event Simulator" or "Test Mode" toggle

## Option 2: Test Subscription (INR 10)

Use the test plan ID: `plan_QqrdMIMXarYxg0` (INR 10/month).

```bash
cd /path/to/aipply
node create-test-subscription.js
```

Complete the payment flow, then verify webhook was received.

## Option 3: Check Webhook Logs from Razorpay

1. Razorpay Dashboard > Webhooks
2. Click on your webhook
3. Check "Logs" or "Events" tab
4. Look for status codes (200 = success, 400/500 = failure)

## Verification

Check the `webhook_logs` collection in Firestore for:
- Event type (e.g., `subscription.authenticated`)
- Success: true
- User ID populated
- Timestamp

Or run:
```bash
cd /path/to/aipply
node check-webhook-logs.js
```
