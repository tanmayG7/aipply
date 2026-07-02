import { NextRequest, NextResponse } from 'next/server';
import { getUserSubscription, updateUserSubscription } from '@/lib/firebaseConfig/firebaseConfig';
import { pauseRazorpaySubscription, updateSubscriptionSchedule } from '@/lib/utils/razorpayAdmin';
import { getDowngradePlanId, getPlanPrice } from '@/lib/utils/retentionOffers';
import { firestore } from '@/lib/firebaseConfig/firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    // Guard: ensure Firestore is initialized before anything else
    if (!firestore) {
      return NextResponse.json(
        { error: 'Database not initialized' },
        { status: 500 }
      );
    }

    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized: No token provided' },
        { status: 401 }
      );
    }

    // Extract and verify token
    const token = authHeader.substring(7);
    let userId: string;

    try {
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      userId = decodedToken.user_id || decodedToken.uid;
    } catch {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid token' },
        { status: 401 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid token payload' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      offerType,
      newPlanType,
      pauseMonths,
    }: {
      offerType: 'discount' | 'pause' | 'downgrade';
      newPlanType?: 'monthly' | 'quarterly' | 'yearly';
      pauseMonths?: number;
    } = body;

    if (!offerType) {
      return NextResponse.json(
        { error: 'Offer type is required' },
        { status: 400 }
      );
    }

    // Get user subscription
    const subscription = await getUserSubscription(userId);

    if (subscription.subscriptionStatus !== 'premium') {
      return NextResponse.json(
        { error: 'No active premium subscription' },
        { status: 400 }
      );
    }

    if (!subscription.razorpaySubscriptionId) {
      return NextResponse.json(
        { error: 'No Razorpay subscription found' },
        { status: 404 }
      );
    }

    interface OfferResult {
      success: boolean;
      message: string;
      newPrice?: number;
      savings?: number;
      pauseUntil?: string;
      newPlanType?: string;
    }

    let result: OfferResult;
    const now = new Date();

    switch (offerType) {
      case 'discount': {
        // Apply 20% discount
        const currentPrice = subscription.planPrice || 0;
        const discountedPrice = Math.round(currentPrice * 0.8);

        await updateUserSubscription(userId, {
          planPrice: discountedPrice,
          updatedAt: now.toISOString(),
        });

        await addDoc(collection(firestore!, 'retentionOffers'), {
          userId,
          subscriptionId: subscription.razorpaySubscriptionId,
          offerType: 'discount',
          discountPercent: 20,
          originalPrice: currentPrice,
          discountedPrice,
          acceptedAt: now.toISOString(),
        });

        result = {
          success: true,
          message: '20% discount applied to your subscription',
          newPrice: discountedPrice,
          savings: currentPrice - discountedPrice,
        };
        break;
      }

      case 'pause': {
        const months = pauseMonths || 2;
        const pauseUntil = new Date();
        pauseUntil.setMonth(pauseUntil.getMonth() + months);

        const pauseResult = await pauseRazorpaySubscription(
          subscription.razorpaySubscriptionId,
          'now'
        );

        if (!pauseResult.success) {
          return NextResponse.json(
            { error: `Failed to pause subscription: ${pauseResult.error}` },
            { status: 500 }
          );
        }

        await updateUserSubscription(userId, {
          subscriptionStatus: 'premium',
          updatedAt: now.toISOString(),
        });

        await addDoc(collection(firestore!, 'retentionOffers'), {
          userId,
          subscriptionId: subscription.razorpaySubscriptionId,
          offerType: 'pause',
          pauseMonths: months,
          pauseUntil: pauseUntil.toISOString(),
          acceptedAt: now.toISOString(),
        });

        result = {
          success: true,
          message: `Subscription paused for ${months} months`,
          pauseUntil: pauseUntil.toISOString(),
        };
        break;
      }

      case 'downgrade': {
        if (!newPlanType) {
          return NextResponse.json(
            { error: 'New plan type is required for downgrade' },
            { status: 400 }
          );
        }

        const newPlanId = getDowngradePlanId(subscription.planType || '', newPlanType);
        if (!newPlanId) {
          return NextResponse.json(
            { error: 'Invalid plan downgrade' },
            { status: 400 }
          );
        }

        const scheduleResult = await updateSubscriptionSchedule(
          subscription.razorpaySubscriptionId,
          {
            plan_id: newPlanId,
            schedule_change_at: 'now',
          }
        );

        if (!scheduleResult.success) {
          return NextResponse.json(
            { error: `Failed to downgrade subscription: ${scheduleResult.error}` },
            { status: 500 }
          );
        }

        const newPrice = getPlanPrice(newPlanType);

        await updateUserSubscription(userId, {
          planType: newPlanType,
          planPrice: newPrice,
          razorpayPlanId: newPlanId,
          updatedAt: now.toISOString(),
        });

        await addDoc(collection(firestore!, 'retentionOffers'), {
          userId,
          subscriptionId: subscription.razorpaySubscriptionId,
          offerType: 'downgrade',
          oldPlanType: subscription.planType,
          newPlanType,
          oldPrice: subscription.planPrice,
          newPrice,
          acceptedAt: now.toISOString(),
        });

        result = {
          success: true,
          message: `Plan downgraded to ${newPlanType}`,
          newPlanType,
          newPrice,
        };
        break;
      }

      default:
        return NextResponse.json(
          { error: 'Invalid offer type' },
          { status: 400 }
        );
    }

    return NextResponse.json(result);

  } catch (error: unknown) {
    console.error('Error applying retention offer:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
