import { NextRequest, NextResponse } from 'next/server';
import { getRazorpaySubscription } from '@/lib/utils/razorpayAdmin';
import { getUserSubscription } from '@/lib/firebaseConfig/firebaseConfig';

/**
 * Debug endpoint to compare Firebase and Razorpay subscription data
 * Usage: GET /api/subscription/debug?userId=<userId>
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId parameter is required' },
        { status: 400 }
      );
    }

    console.log('🔍 [Debug] Starting subscription diagnostics for user:', userId);

    // Get Firebase subscription
    const firebaseSubscription = await getUserSubscription(userId);

    console.log('📊 [Debug] Firebase subscription:', {
      status: firebaseSubscription.subscriptionStatus,
      razorpayId: firebaseSubscription.razorpaySubscriptionId,
      nextBilling: firebaseSubscription.nextBillingDate,
      renewalDate: firebaseSubscription.renewalDate,
    });

    // Get Razorpay subscription
    let razorpayData = null;
    let razorpayError = null;

    if (firebaseSubscription.razorpaySubscriptionId) {
      console.log('🔍 [Debug] Fetching Razorpay subscription...');
      const razorpayResult = await getRazorpaySubscription(
        firebaseSubscription.razorpaySubscriptionId
      );

      if (razorpayResult.success) {
        razorpayData = razorpayResult.data;
        console.log('✅ [Debug] Razorpay data fetched successfully');
      } else {
        razorpayError = razorpayResult.error;
        console.error('❌ [Debug] Failed to fetch Razorpay data:', razorpayError);
      }
    } else {
      console.warn('⚠️ [Debug] No Razorpay subscription ID in Firebase');
    }

    // Calculate matches and discrepancies
    const statusMatch = razorpayData
      ? firebaseSubscription.subscriptionStatus === razorpayData.status
      : null;

    const now = new Date();
    const nextBillingDate = firebaseSubscription.nextBillingDate
      ? new Date(firebaseSubscription.nextBillingDate)
      : null;
    const renewalDate = firebaseSubscription.renewalDate
      ? new Date(firebaseSubscription.renewalDate)
      : null;

    const nextBillingInPast = nextBillingDate ? nextBillingDate < now : null;
    const renewalDateInPast = renewalDate ? renewalDate < now : null;

    // Prepare response
    const debugInfo = {
      timestamp: new Date().toISOString(),
      userId,

      firebase: {
        status: firebaseSubscription.subscriptionStatus,
        planType: firebaseSubscription.planType,
        planPrice: firebaseSubscription.planPrice,
        razorpaySubscriptionId: firebaseSubscription.razorpaySubscriptionId,
        razorpayCustomerId: firebaseSubscription.razorpayCustomerId,
        nextBillingDate: firebaseSubscription.nextBillingDate,
        renewalDate: firebaseSubscription.renewalDate,
        cancelledDate: firebaseSubscription.cancelledDate,
        subscriptionStartDate: firebaseSubscription.subscriptionStartDate,
      },

      razorpay: razorpayData ? {
        id: razorpayData.id,
        status: razorpayData.status,
        planId: razorpayData.plan_id,
        customerId: razorpayData.customer_id,
        currentStart: razorpayData.current_start,
        currentEnd: razorpayData.current_end,
        endedAt: razorpayData.ended_at,
        chargeAt: razorpayData.charge_at,
        startAt: razorpayData.start_at,
        cancelledAt: razorpayData.cancelled_at,
        totalCount: razorpayData.total_count,
        paidCount: razorpayData.paid_count,
        remainingCount: razorpayData.remaining_count,
      } : null,

      razorpayError,

      diagnostics: {
        hasRazorpayId: !!firebaseSubscription.razorpaySubscriptionId,
        razorpayDataFetched: !!razorpayData,
        statusMatch,
        nextBillingInPast,
        renewalDateInPast,
        daysUntilNextBilling: nextBillingDate
          ? Math.ceil((nextBillingDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          : null,
        daysUntilRenewal: renewalDate
          ? Math.ceil((renewalDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          : null,
      },

      recommendations: [] as string[]
    };

    // Add recommendations based on diagnostics
    if (!firebaseSubscription.razorpaySubscriptionId) {
      debugInfo.recommendations.push(
        'No Razorpay subscription ID found in Firebase. This is either a test user or data migration issue.'
      );
    }

    if (razorpayError) {
      debugInfo.recommendations.push(
        `Cannot fetch Razorpay data: ${razorpayError}. Check if subscription ID exists in Razorpay dashboard.`
      );
    }

    if (statusMatch === false) {
      debugInfo.recommendations.push(
        `Status mismatch: Firebase shows '${firebaseSubscription.subscriptionStatus}' but Razorpay shows '${razorpayData?.status}'. Sync Firebase with Razorpay.`
      );
    }

    if (nextBillingInPast) {
      debugInfo.recommendations.push(
        `Next billing date (${firebaseSubscription.nextBillingDate}) is in the past. Update subscription dates.`
      );
    }

    if (renewalDateInPast) {
      debugInfo.recommendations.push(
        `Renewal date (${firebaseSubscription.renewalDate}) is in the past. Update subscription dates.`
      );
    }

    if (razorpayData && razorpayData.status === 'cancelled' && firebaseSubscription.subscriptionStatus !== 'cancelled') {
      debugInfo.recommendations.push(
        'Subscription is cancelled in Razorpay but active in Firebase. Run sync to update Firebase.'
      );
    }

    console.log('✅ [Debug] Diagnostics complete');
    console.log('📋 [Debug] Recommendations:', debugInfo.recommendations);

    return NextResponse.json(debugInfo, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      }
    });

  } catch (error: any) {
    console.error('💥 [Debug] Error during diagnostics:', error);
    return NextResponse.json(
      {
        error: 'Internal server error during diagnostics',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
