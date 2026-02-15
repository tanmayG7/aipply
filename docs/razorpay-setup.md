# Razorpay Configuration

## Required Secrets

AiPply uses three Razorpay credentials. They serve different purposes and cannot substitute for each other.

| Variable | Location | Purpose | Where to Find |
|----------|----------|---------|---------------|
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | `.env.local` | Public identifier for checkout modal | Razorpay Dashboard > Settings > API Keys |
| `RAZORPAY_KEY_SECRET` | `.env.local` | Private key for API authentication | Razorpay Dashboard > Settings > API Keys > "Show" |
| `RAZORPAY_WEBHOOK_SECRET` | `.env.local` | Verifies webhook event signatures | Generated when creating webhook in dashboard |

### How They Work

**API Authentication** (subscription creation, cancellation, refunds):
```
Authorization: Basic base64(KEY_ID:KEY_SECRET)
```

**Webhook Verification** (incoming events from Razorpay):
```
HMAC-SHA256(request_body, WEBHOOK_SECRET) == x-razorpay-signature header
```

## .env.local Configuration

```bash
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=your_key_secret_here
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here
```

Only `NEXT_PUBLIC_RAZORPAY_KEY_ID` is exposed to the client. The other two are server-side only.

## Code Usage

| File | Uses |
|------|------|
| `lib/utils/razorpayAdmin.ts` | KEY_ID + KEY_SECRET for API calls |
| `app/api/create-subscription/route.ts` | KEY_ID + KEY_SECRET for subscription creation |
| `app/api/razorpay/webhook/route.ts` | WEBHOOK_SECRET for signature verification |

## Webhook Setup

1. Go to Razorpay Dashboard > Settings > Webhooks
2. Click "Add New Webhook"
3. URL: `https://aipply.io/api/razorpay/webhook` (no trailing slash, HTTPS only)
4. Copy the generated webhook secret immediately
5. Enable events:
   - `subscription.authenticated`
   - `subscription.activated`
   - `subscription.charged`
   - `subscription.cancelled`
   - `subscription.completed`
   - `subscription.halted`
   - `payment.captured`
   - `payment.failed`
6. Set alert email for failed webhooks

## What Breaks Without KEY_SECRET

- Subscription creation returns "Payment system not configured"
- Admin panel cancellation/refund fails with "Razorpay credentials not configured"
- Webhooks still work (they use WEBHOOK_SECRET, not KEY_SECRET)
- Razorpay checkout modal still opens (only needs KEY_ID)

## Troubleshooting

**No webhook events received**: Check webhook URL configuration in Razorpay dashboard. Common mistakes: using `http://` instead of `https://`, adding `www.`, or trailing slash.

**"Invalid signature" in webhook logs**: Webhook secret mismatch. Re-copy the secret from Razorpay dashboard, check for trailing spaces.

**Subscription not activating after payment**: Webhook not configured or failing. Check `webhook_logs` collection in Firestore.
