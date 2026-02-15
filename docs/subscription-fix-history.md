# Subscription Fix History

## January 2026: Webhooks Not Triggering

### Problem
Users were paying real money but not receiving premium subscription activation. Investigation revealed zero webhook events in the `webhook_logs` Firestore collection over 7 days.

### Root Cause
Razorpay webhook URL was not configured in the Razorpay dashboard. Payments were collected successfully, but no webhook was triggered to activate subscriptions.

### Manual Fix
Three users were manually activated using `manual-subscription-activation.js`:
- Keshav (oberoikeshav35@gmail.com)
- Kunal (kunalg.2601@gmail.com)
- Mayank Yadav (myyadavmayank1998@gmail.com)

Each received 30 days of premium access with auto-apply enabled (20 jobs/day, 600 jobs/month).

### Code Analysis
The subscription creation code (`/api/create-subscription/route.ts`) and webhook handler (`/api/razorpay/webhook/route.ts`) were both working correctly. The issue was purely configuration.

### Resolution
Configure the Razorpay webhook URL in the dashboard. See `docs/razorpay-setup.md` for steps.

### Known Issue
Auto-apply limit discrepancy: the manual activation script sets `maxAutoApplyPerDay: 20`, but the webhook handler sets `maxAutoApplyPerDay: 5`. Decide on the correct limit and update the relevant code.

### Finding Affected Users
Any user with a Razorpay subscription but no corresponding Firestore subscription record is potentially affected. Cross-reference Razorpay subscriptions with the Firestore `subscriptions` collection.

### Prevention
- Monitor webhook logs regularly
- Implement webhook health check endpoint (`/api/health/webhook`)
- Consider automated Razorpay-to-Firestore sync job
