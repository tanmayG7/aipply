# Admin Panel & Subscription Management Setup Guide

## Overview

A comprehensive admin panel for managing user subscriptions, cancellations, and payments with Razorpay integration.

## Features Implemented

### 1. Admin Authentication & Authorization
- ✅ Admin role system (`userRole: 'admin'` in UserDetails)
- ✅ Protected admin routes with middleware
- ✅ Admin-only API endpoints with authentication

### 2. Admin Dashboard
- ✅ Overview statistics (users, subscriptions, MRR)
- ✅ Quick action cards
- ✅ Real-time data from Firebase

### 3. Subscription Management
- ✅ View all subscriptions with search and filters
- ✅ Status filtering (active, cancelled, expired, grace period)
- ✅ Individual subscription details page
- ✅ User profile integration

### 4. Expert Unsubscribe Flow
- ✅ Two cancellation types:
  - **Immediate**: Revoke access immediately
  - **End of Period**: Keep access until billing period ends
- ✅ Cancellation reason tracking (6 categories)
- ✅ Optional refund processing
- ✅ Razorpay API integration for cancellation
- ✅ Audit logging for all admin actions
- ✅ Confirmation dialogs with warnings

### 5. Data & Logging
- ✅ Cancellation history in Firestore (`cancellations` collection)
- ✅ Admin action logs (`adminActions` collection)
- ✅ Comprehensive subscription data

## File Structure

```
app/
├── admin/
│   ├── layout.tsx                    # Protected admin layout
│   ├── page.tsx                      # Dashboard home
│   ├── subscriptions/
│   │   ├── page.tsx                  # All subscriptions list
│   │   └── [userId]/
│   │       └── page.tsx              # Individual subscription details
│   ├── analytics/                    # (Pending) Analytics dashboard
│   └── users/                        # (Pending) User management

app/api/
├── admin/
│   ├── stats/
│   │   └── route.ts                  # Dashboard statistics API
│   └── subscriptions/
│       ├── route.ts                  # List all subscriptions
│       └── cancel/
│           └── route.ts              # Cancel subscription API

components/
├── admin/
│   ├── AdminSidebar.tsx              # Navigation sidebar
│   ├── SubscriptionTable.tsx         # Subscription data table
│   └── CancelSubscriptionDialog.tsx  # Cancellation wizard

lib/
├── types.ts                          # Updated with admin types
├── utils/
│   ├── adminAuth.ts                  # Admin authentication helpers
│   └── razorpayAdmin.ts              # Razorpay admin utilities
└── middleware/
    └── adminMiddleware.ts            # Route protection middleware
```

## Setup Instructions

### Step 1: Grant Admin Access

To make a user an admin, update their profile in Firebase:

```javascript
// In Firebase Console or via script:
await setDoc(doc(firestore, "users", userId), {
  userRole: 'admin'
}, { merge: true });
```

Or add your email to the admin list in `lib/utils/adminAuth.ts`:

```typescript
export const ADMIN_EMAILS = [
  'admin@aipply.io',
  'your-email@example.com', // Add your email here
];
```

### Step 2: Environment Variables

Ensure you have the following in your `.env.local`:

```bash
# Razorpay Credentials
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_secret_key
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Step 3: Firebase Collections

The system automatically creates these Firestore collections:

- **subscriptions**: User subscription data
- **cancellations**: Cancellation history with reasons
- **adminActions**: Audit log of all admin actions

No manual setup required - collections are created on first write.

### Step 4: Access the Admin Panel

1. Log in to your app with an admin account
2. Navigate to `/admin`
3. You'll see the admin dashboard

**If not admin**: You'll be redirected to the regular user dashboard.

## Usage Guide

### Viewing Subscriptions

1. Go to **Admin Panel** → **Subscriptions**
2. Use filters to narrow down:
   - Search by name, email, or subscription ID
   - Filter by status (All, Active, Cancelled, etc.)
3. Click "View Details" on any subscription

### Cancelling a Subscription

1. Navigate to a user's subscription details
2. Click **"Cancel Subscription"** button
3. In the dialog:
   - Select cancellation type:
     - **End of Billing Period** (recommended): User keeps access until their paid period ends
     - **Immediate**: Access revoked immediately
   - Choose a reason from dropdown
   - Optionally add details
   - Check "Issue Refund" if refunding
   - Adjust refund amount if needed
4. Click **"Cancel Subscription"**
5. Confirm in the warning dialog

### What Happens on Cancellation

#### End of Period Cancellation:
- Subscription remains "premium" until billing date
- Razorpay cancels auto-renewal
- User keeps access until renewal date
- Status changes to "cancelled" after period ends (via webhook)

#### Immediate Cancellation:
- Subscription status → "cancelled"
- Plan tier → "free"
- Features immediately downgraded
- Razorpay subscription cancelled

#### If Refund Selected:
- Refund processed via Razorpay API
- Amount recorded in cancellation log
- User notified (if email system configured)

### Audit Logging

All admin actions are logged to `adminActions` collection:

```typescript
{
  actionId: "cancel_1234567890",
  adminUserId: "admin_user_id",
  adminEmail: "admin@aipply.io",
  targetUserId: "target_user_id",
  actionType: "cancel_subscription",
  actionDetails: {
    reason: "too_expensive",
    cancellationType: "immediate",
    refundIssued: true,
    refundAmount: 666
  },
  timestamp: "2025-10-12T10:30:00.000Z",
  ipAddress: "192.168.1.1"
}
```

## API Reference

### GET /api/admin/stats

Get dashboard statistics.

**Auth**: Admin token required

**Response**:
```json
{
  "totalUsers": 1234,
  "activeSubscriptions": 456,
  "cancelledSubscriptions": 78,
  "expiredSubscriptions": 90,
  "gracePeriodSubscriptions": 12,
  "monthlyRecurringRevenue": 45600,
  "newSubscriptionsToday": 5,
  "cancellationsToday": 2
}
```

### GET /api/admin/subscriptions

List all subscriptions with filters.

**Auth**: Admin token required

**Query Params**:
- `status`: Filter by status (premium, cancelled, expired, etc.)
- `search`: Search by name, email, or ID

**Response**:
```json
{
  "subscriptions": [...],
  "total": 456
}
```

### POST /api/admin/subscriptions/cancel

Cancel a user's subscription.

**Auth**: Admin token required

**Request Body**:
```json
{
  "userId": "user_id",
  "reason": "too_expensive",
  "reasonDetails": "Optional details",
  "cancellationType": "immediate",
  "issueRefund": true,
  "refundAmount": 666
}
```

**Response**:
```json
{
  "success": true,
  "message": "Subscription cancelled successfully",
  "cancellationType": "immediate",
  "refundIssued": true,
  "refundAmount": 666
}
```

## Security Features

1. **Admin-Only Access**: All admin routes protected by middleware
2. **Token Verification**: Firebase tokens validated on every request
3. **Role-Based Access Control**: Only users with `userRole: 'admin'` can access
4. **Audit Logging**: All actions logged with admin ID, timestamp, and IP
5. **Confirmation Dialogs**: Prevent accidental cancellations
6. **Input Validation**: All inputs sanitized and validated

## Next Steps (Pending Implementation)

- [ ] User-facing self-service cancellation
- [ ] Retention offers system
- [ ] Email notifications for cancellations
- [ ] Analytics dashboard with charts
- [ ] Subscription extension/refund UI
- [ ] Rate limiting on API endpoints
- [ ] E2E tests for cancellation flow

## Troubleshooting

### "Admin access required" error
- Ensure your user has `userRole: 'admin'` in Firestore
- Check that you're logged in
- Verify Firebase token is valid

### Razorpay cancellation fails
- Check Razorpay API credentials in `.env.local`
- Verify subscription ID exists in Razorpay
- Check Razorpay dashboard for errors

### Refund not processing
- Ensure payment was captured (not pending)
- Check refund amount doesn't exceed original payment
- Verify Razorpay refund permissions

## Support

For issues or questions:
1. Check the [GitHub Issues](https://github.com/anthropics/aipply/issues)
2. Review Razorpay API documentation
3. Check Firebase console for errors

## License

[Your License Here]
