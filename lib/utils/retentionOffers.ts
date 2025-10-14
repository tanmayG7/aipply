import { UserSubscription, RetentionOffer } from '@/lib/types';

/**
 * Calculate retention offers for a subscription
 */
export function calculateRetentionOffers(subscription: UserSubscription): RetentionOffer[] {
  const offers: RetentionOffer[] = [];
  const currentPrice = subscription.planPrice || 0;
  const planType = subscription.planType;

  // Offer 1: 20% Discount
  const discountPercent = 20;
  const discountedPrice = Math.round(currentPrice * (1 - discountPercent / 100));
  const savings = currentPrice - discountedPrice;

  offers.push({
    type: 'discount',
    title: `Get ${discountPercent}% Off Your Next Payment`,
    description: `Pay only ₹${discountedPrice} instead of ₹${currentPrice}. Save ₹${savings}!`,
    discountPercent,
  });

  // Offer 2: Pause Subscription
  offers.push({
    type: 'pause',
    title: 'Pause Your Subscription',
    description: 'Take a break for 1-3 months. Resume anytime without losing your data.',
    pauseMonths: 2,
  });

  // Offer 3: Downgrade Plan (if applicable)
  if (planType === 'yearly') {
    offers.push({
      type: 'downgrade',
      title: 'Switch to Quarterly Plan',
      description: 'More flexibility with quarterly billing at ₹499/month. Switch anytime.',
      newPlanType: 'quarterly',
    });
  } else if (planType === 'quarterly') {
    offers.push({
      type: 'downgrade',
      title: 'Switch to Monthly Plan',
      description: 'Maximum flexibility with monthly billing at ₹666/month. Cancel anytime.',
      newPlanType: 'monthly',
    });
  }

  return offers;
}

/**
 * Calculate savings from a retention offer
 */
export function calculateOfferSavings(
  subscription: UserSubscription,
  offerType: 'discount' | 'pause' | 'downgrade'
): number {
  const currentPrice = subscription.planPrice || 0;

  switch (offerType) {
    case 'discount':
      return Math.round(currentPrice * 0.2); // 20% savings

    case 'pause':
      // Savings = current price (since they won't pay for pause period)
      return currentPrice;

    case 'downgrade':
      if (subscription.planType === 'yearly') {
        // Yearly (₹349/mo) to Quarterly (₹499/mo) - actually costs more monthly
        // But provides flexibility, so show as "More flexibility"
        return 0;
      } else if (subscription.planType === 'quarterly') {
        // Quarterly (₹499/mo) to Monthly (₹666/mo) - costs more
        return 0;
      }
      return 0;

    default:
      return 0;
  }
}

/**
 * Get plan ID for downgrade
 */
export function getDowngradePlanId(currentPlanType: string, newPlanType: string): string | null {
  // Map of plan types to Razorpay plan IDs
  const planIds: Record<string, string> = {
    monthly: 'plan_Qpq8Ccn726wjfX',      // ₹666
    quarterly: 'plan_Qpq96uaFwtJnrF',    // ₹1497
    yearly: 'plan_QpqBIEeMGX2B2C',       // ₹4188
  };

  return planIds[newPlanType] || null;
}

/**
 * Get plan price for a plan type
 */
export function getPlanPrice(planType: 'monthly' | 'quarterly' | 'yearly'): number {
  const prices: Record<string, number> = {
    monthly: 666,
    quarterly: 1497,
    yearly: 4188,
  };

  return prices[planType] || 0;
}

/**
 * Calculate monthly equivalent price
 */
export function getMonthlyEquivalentPrice(planType: 'monthly' | 'quarterly' | 'yearly', planPrice: number): number {
  switch (planType) {
    case 'monthly':
      return planPrice;
    case 'quarterly':
      return Math.round(planPrice / 3);
    case 'yearly':
      return Math.round(planPrice / 12);
    default:
      return planPrice;
  }
}
