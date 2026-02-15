# User Unsubscribe Flow

## Overview

Self-service subscription cancellation with a 4-step wizard, retention offers, and audit logging.

## Components

| File | Purpose |
|------|---------|
| `components/subscription/CancellationWizard.tsx` | 4-step cancellation wizard |
| `components/subscription/RetentionOffers.tsx` | Retention offer cards |
| `app/api/subscription/cancel/route.ts` | Cancellation API |
| `app/api/subscription/retention-offer/route.ts` | Retention offer API |
| `lib/utils/retentionOffers.ts` | Offer calculation utilities |
| `app/dashboard/subscription/page.tsx` | Subscription page (hosts wizard) |

## Cancellation Flow

### Step 1: Confirmation
Shows what the user will lose (auto-apply, AI features, priority support) and what they keep (profile, job tracker, manual apply).

### Step 2: Reason Collection
Six options: Too Expensive, Not Using Service, Found Better Alternative, Technical Issues, Missing Features, Other. Optional details text area.

### Step 3: Retention Offers
Three personalized offers based on current plan:
- **20% discount**: Monthly INR 666 -> INR 533, Quarterly INR 1,497 -> INR 1,198, Yearly INR 4,188 -> INR 3,350
- **Pause subscription**: 1-3 months, no charges during pause
- **Downgrade plan**: Yearly -> Quarterly, Quarterly -> Monthly

Accepting an offer prevents cancellation.

### Step 4: Final Confirmation
Summary of subscription details, access end date, and final cancel button.

## Cancellation Modes

**End of billing period (default)**: Razorpay auto-renewal cancelled, user keeps access until paid period ends. After renewal date, webhook changes status to "cancelled".

**Immediate**: Access revoked immediately, subscription status set to "cancelled", plan tier set to "free".

## Database Collections

### `cancellations`
```typescript
{
  userId: string
  subscriptionId: string
  reason: CancellationReason
  reasonDetails?: string
  cancelledAt: string
  cancelledBy: 'user' | 'admin'
  cancellationType: 'immediate' | 'end_of_period'
  retentionOfferShown: boolean
  retentionOfferAccepted: boolean
  userEmail: string
  planType: string
  planPrice: number
}
```

### `retentionOffers`
```typescript
{
  userId: string
  subscriptionId: string
  offerType: 'discount' | 'pause' | 'downgrade'
  acceptedAt: string
}
```

## Security
- Firebase token validation on every request
- Users can only cancel their own subscriptions
- Subscription ownership verification before cancellation
- Full audit trail in Firestore

## Limitations
- Email notifications on cancellation not implemented
- Rate limiting not implemented
- Refunds only via admin panel (self-service refunds excluded by design)
