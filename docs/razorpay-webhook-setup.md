# Razorpay Webhook Setup Guide

## Overview

This guide explains how to configure webhooks in the Razorpay Dashboard to enable automatic subscription activation when users make payments.

**CRITICAL**: Without webhook configuration, payments will be collected but subscriptions will NOT be activated automatically. Users will need to use the manual sync button.

---

## Prerequisites

1. Razorpay account with API access
2. Environment variable `RAZORPAY_WEBHOOK_SECRET` configured in production
3. Production website deployed at `https://aipply.io`

---

## Step-by-Step Setup

### Step 1: Login to Razorpay Dashboard

1. Navigate to https://dashboard.razorpay.com
2. Login with your Razorpay account credentials
3. Ensure you're in **LIVE Mode** (not Test Mode)

### Step 2: Navigate to Webhooks Settings

1. In the left sidebar, click **Settings**
2. Under **Configuration** section, click **Webhooks**
3. Click the **+ Add New Webhook** button

### Step 3: Configure Webhook URL

**Webhook URL**: `https://aipply.io/api/razorpay/webhook`

- **Important**: Use HTTPS (not HTTP)
- **Important**: Use the production domain (not localhost or staging)
- **Important**: Do NOT add a trailing slash

### Step 4: Generate and Save Webhook Secret

1. Razorpay will display a **Webhook Secret**
2. **COPY THIS SECRET IMMEDIATELY** - it won't be shown again
3. Store this secret in your production environment variables as:
   ```
   RAZORPAY_WEBHOOK_SECRET=<your-secret-here>
   ```

### Step 5: Select Events to Listen For

Enable the following webhook events:

#### Subscription Events (REQUIRED for Auto-Apply)
- ✅ `subscription.authenticated` - Triggered when subscription is authenticated
- ✅ `subscription.activated` - Triggered when subscription is activated
- ✅ `subscription.charged` - Triggered when subscription is successfully charged (renewals)
- ✅ `subscription.cancelled` - Triggered when user cancels subscription
- ✅ `subscription.completed` - Triggered when subscription reaches total_count
- ✅ `subscription.halted` - Triggered when subscription fails after max retries

#### Payment Events (REQUIRED for CV Services)
- ✅ `payment.captured` - Triggered when one-time payment is captured
- ✅ `payment.failed` - Triggered when one-time payment fails

### Step 6: Set Alert Email (Optional but Recommended)

- Enter your admin email (e.g., `tanmay@aipply.io`)
- You'll receive notifications if webhooks fail

### Step 7: Enable the Webhook

- Click **Create Webhook** button
- Ensure the webhook status is **Active** (green indicator)

### Step 8: Test the Webhook

#### Option A: Use Razorpay Dashboard Test

1. In the webhook detail page, find the **Test Webhook** button
2. Select event type: `subscription.authenticated`
3. Click **Send Test Webhook**
4. Check webhook logs in Admin Dashboard: `https://aipply.io/dashboard/admin/webhooks`
5. Verify the test event appears with status: SUCCESS

#### Option B: Make a Real Test Payment

1. Use test plan: `plan_QqrdMIMXarYxg0` (₹10 test subscription)
2. Complete payment flow
3. Check Admin Webhook Dashboard for events
4. Verify subscription was activated

---

## Verifying Webhook Configuration

### Check 1: Environment Variable

Run this command on your production server:

```bash
echo $RAZORPAY_WEBHOOK_SECRET
```

**Expected**: Should output your webhook secret (not empty)

**If Empty**: Add to your environment file (`.env` or system environment)

### Check 2: Webhook Logs

1. Navigate to: https://aipply.io/dashboard/admin/webhooks
2. Login with admin account (`tanmay@aipply.io`)
3. Look for recent webhook events
4. Verify events show status: SUCCESS

### Check 3: Test Subscription

1. Create test subscription with ₹10 plan
2. Complete payment
3. Check Webhook Dashboard for `subscription.authenticated` event
4. Verify subscription appears as Premium in dashboard

---

## Troubleshooting

### Issue 1: "Invalid signature" error in logs

**Cause**: Webhook secret mismatch

**Solution**:
1. Copy webhook secret from Razorpay Dashboard
2. Update `RAZORPAY_WEBHOOK_SECRET` environment variable
3. Restart Next.js production server

### Issue 2: Webhook not being called

**Cause**: Webhook URL incorrect or webhook not enabled

**Solution**:
1. Verify webhook URL is exactly: `https://aipply.io/api/razorpay/webhook`
2. Check webhook status is **Active** in Razorpay Dashboard
3. Ensure HTTPS certificate is valid on production

### Issue 3: "Missing userId in subscription notes" error

**Cause**: Subscription created without userId in notes

**Solution**:
- This indicates bug in `/api/create-subscription` endpoint
- Verify userId is being passed in `notes` field (line 108 of create-subscription/route.ts)
- Check subscription creation logs

### Issue 4: Subscription not activating after payment

**Cause**: Multiple possible causes

**Solution**:
1. Check Admin Webhook Dashboard for errors
2. Verify webhook events are being received
3. Check server logs for errors
4. Use manual sync button as fallback

---

## Security Best Practices

### 1. Keep Webhook Secret Secure

- ❌ Never commit webhook secret to git
- ❌ Never expose in client-side code
- ✅ Store in environment variables only
- ✅ Use different secrets for test/live modes

### 2. Verify Signature

- The webhook handler already verifies HMAC-SHA256 signature
- Never disable signature verification
- Located at `/app/api/razorpay/webhook/route.ts:110-122`

### 3. Idempotency

- Webhook handler logs events to Firestore `webhook_logs` collection
- Prevents duplicate processing
- Check `additionalData.subscriptionId` for deduplication

### 4. Monitor Webhook Health

- Check Admin Webhook Dashboard daily
- Set up alerts for failed webhooks
- Review error patterns

---

## Webhook Event Flow

### Subscription Creation Flow

```
User clicks Subscribe
  ↓
Frontend calls /api/create-subscription
  ↓
Razorpay creates subscription (status: created)
  ↓
User completes payment in Razorpay modal
  ↓
Razorpay triggers webhook: subscription.authenticated
  ↓
Webhook handler receives event
  ↓
Signature verified (HMAC-SHA256)
  ↓
handleSubscriptionActivated() called
  ↓
Firestore subscription updated:
  - subscriptionStatus: 'premium'
  - features.autoApply: true
  - renewalDate: calculated
  ↓
Event logged to webhook_logs collection
  ↓
User sees Premium status on dashboard
```

### Subscription Renewal Flow

```
Razorpay auto-charges subscription (monthly/quarterly/yearly)
  ↓
Razorpay triggers webhook: subscription.charged
  ↓
handleSubscriptionCharged() called
  ↓
Firestore subscription updated:
  - lastPaymentDate: now
  - renewalDate: +30/90/365 days
  - Clear any grace period flags
  ↓
User retains Premium access
```

### Subscription Cancellation Flow

```
User cancels subscription (via dashboard or Razorpay)
  ↓
Razorpay triggers webhook: subscription.cancelled
  ↓
handleSubscriptionCancelled() called
  ↓
Check if user has paid time remaining:
  - If YES: Keep premium until renewal date
  - If NO: Immediate downgrade to free
  ↓
Firestore subscription updated accordingly
```

---

## Monitoring and Maintenance

### Daily Checks

1. Review Admin Webhook Dashboard for failures
2. Check for any "Missing userId" or "Unknown plan ID" errors
3. Verify recent subscriptions are activating correctly

### Weekly Checks

1. Run subscription verification cron job manually
2. Check for desync between Razorpay and Firestore
3. Review webhook failure rate (should be <1%)

### Monthly Checks

1. Audit all premium subscriptions
2. Verify renewal dates are accurate
3. Check for any orphaned subscriptions

---

## Contact Information

**Admin Email**: tanmay@aipply.io

**Razorpay Support**: https://razorpay.com/support

**Webhook Logs**: https://aipply.io/dashboard/admin/webhooks

**Manual Sync**: Available at https://aipply.io/dashboard/subscription (for free users)

---

## Appendix: Webhook Payload Examples

### subscription.authenticated

```json
{
  "event": "subscription.authenticated",
  "payload": {
    "subscription": {
      "entity": {
        "id": "sub_ABC123",
        "plan_id": "plan_Qpq8Ccn726wjfX",
        "customer_id": "cust_XYZ789",
        "status": "authenticated",
        "current_start": 1234567890,
        "current_end": 1237159890,
        "notes": {
          "userId": "firebase-uid-here",
          "planType": "monthly"
        }
      }
    }
  }
}
```

### payment.captured (CV Services)

```json
{
  "event": "payment.captured",
  "payload": {
    "payment": {
      "entity": {
        "id": "pay_ABC123",
        "order_id": "order_XYZ789",
        "amount": 299900,
        "status": "captured"
      }
    }
  }
}
```

---

## Change Log

**2025-12-22**: Initial documentation created
- Added comprehensive webhook setup instructions
- Included troubleshooting guide
- Added security best practices
- Documented all event flows
