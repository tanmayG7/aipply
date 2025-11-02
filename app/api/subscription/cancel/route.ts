import { NextRequest, NextResponse } from 'next/server';
import { getUserSubscription, updateUserSubscription, getUserProfile } from '@/lib/firebaseConfig/firebaseConfig';
import { cancelRazorpaySubscription, checkSubscriptionCancellable } from '@/lib/utils/razorpayAdmin';
import { firestore } from '@/lib/firebaseConfig/firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import { CancellationReason } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
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
      // Decode token to get user ID
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
      reason,
      reasonDetails,
      cancellationType = 'end_of_period', // Default to end of period
      retentionOfferShown = false,
      retentionOfferAccepted = false,
      retentionOfferType,
    }: {
      reason: CancellationReason;
      reasonDetails?: string;
      cancellationType?: 'immediate' | 'end_of_period';
      retentionOfferShown?: boolean;
      retentionOfferAccepted?: boolean;
      retentionOfferType?: 'discount' | 'pause' | 'downgrade';
    } = body;

    if (!reason) {
      return NextResponse.json(
        { error: 'Cancellation reason is required' },
        { status: 400 }
      );
    }

    // Get user subscription
    const subscription = await getUserSubscription(userId);

    // Validate subscription is active
    if (subscription.subscriptionStatus !== 'premium') {
      return NextResponse.json(
        { error: 'No active premium subscription to cancel' },
        { status: 400 }
      );
    }

    if (!subscription.razorpaySubscriptionId) {
      return NextResponse.json(
        { error: 'No Razorpay subscription found' },
        { status: 404 }
      );
    }

    // Check if this is a test/demo subscription (doesn't exist in Razorpay)
    const isTestSubscription = subscription.razorpaySubscriptionId.startsWith('test_');

    if (isTestSubscription) {
      console.log('🧪 [Cancel Route] Test subscription detected, skipping Razorpay API...');

      // For test subscriptions, just update Firebase directly
      const now = new Date();
      await updateUserSubscription(userId, {
        subscriptionStatus: 'cancelled',
        cancelledDate: now.toISOString(),
      });

      // Get user profile for logging (with fallback)
      let userEmail = '';
      let userName = '';
      try {
        const userProfile = await getUserProfile(userId);
        userEmail = userProfile.email || '';
        userName = `${userProfile.firstName} ${userProfile.lastName}`.trim();
      } catch {
        console.warn('⚠️ [Cancel Route] Could not fetch user profile, using fallback values');
      }

      // Log cancellation details
      try {
        const cancellationLog = {
          userId,
          subscriptionId: subscription.razorpaySubscriptionId,
          reason,
          reasonDetails: reasonDetails || '',
          cancelledAt: now.toISOString(),
          cancelledBy: 'user',
          cancellationType,
          retentionOfferShown: false,
          retentionOfferType: null,
          retentionOfferAccepted: false,
          refundIssued: false,
          refundAmount: 0,
          userEmail,
          userName,
          planType: subscription.planType,
          planPrice: subscription.planPrice,
          isTestSubscription: true,
        };

        await addDoc(collection(firestore, 'cancellations'), cancellationLog);
      } catch {
        console.warn('⚠️ [Cancel Route] Could not log cancellation, but subscription was cancelled');
      }

      const accessEndDate = subscription.renewalDate || subscription.nextBillingDate || now.toISOString();

      console.log('✅ [Cancel Route] Test subscription cancelled successfully');

      return NextResponse.json({
        success: true,
        message: 'Subscription cancelled successfully (test mode)',
        cancellationType: 'immediate',
        accessEndDate,
        remainingDays: 0,
      });
    }

    // Check if subscription can be cancelled
    console.log('🔍 [Cancel Route] Checking if subscription is cancellable...');
    const cancellableCheck = await checkSubscriptionCancellable(subscription.razorpaySubscriptionId);

    if (!cancellableCheck.cancellable) {
      console.error('❌ [Cancel Route] Subscription not cancellable:', cancellableCheck.reason);

      // If already cancelled in Razorpay, update Firebase to match
      if (cancellableCheck.status === 'cancelled') {
        console.log('📝 [Cancel Route] Subscription already cancelled in Razorpay, updating Firebase...');

        await updateUserSubscription(userId, {
          subscriptionStatus: 'cancelled',
          cancelledDate: new Date().toISOString(),
        });

        const accessEndDate = subscription.renewalDate || subscription.nextBillingDate;

        return NextResponse.json({
          success: true,
          message: 'Subscription was already cancelled',
          cancellationType: 'end_of_period',
          accessEndDate,
          remainingDays: accessEndDate
            ? Math.ceil((new Date(accessEndDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
            : 0,
        });
      }

      return NextResponse.json(
        {
          error: `Cannot cancel subscription: ${cancellableCheck.reason}`,
          details: {
            status: cancellableCheck.status,
            subscriptionId: subscription.razorpaySubscriptionId
          }
        },
        { status: 400 }
      );
    }

    console.log('✅ [Cancel Route] Subscription is cancellable, proceeding...');

    // Cancel subscription in Razorpay
    const cancelAtCycleEnd = cancellationType === 'end_of_period';
    const cancelResult = await cancelRazorpaySubscription(
      subscription.razorpaySubscriptionId,
      cancelAtCycleEnd
    );

    if (!cancelResult.success) {
      console.error('❌ [Cancel Route] Razorpay cancellation failed:', cancelResult.error);
      return NextResponse.json(
        { error: `Failed to cancel subscription: ${cancelResult.error}` },
        { status: 500 }
      );
    }

    console.log('✅ [Cancel Route] Razorpay cancellation successful');

    // Update subscription in Firebase
    const now = new Date();
    const updateData: {
      cancelledDate: string;
      subscriptionStatus?: 'cancelled' | 'premium';
      planTier?: 'free';
      features?: {
        autoApply: boolean;
        unlimitedJobListings: boolean;
        aiResumeBuilder: boolean;
        aiMockInterviews: boolean;
        prioritySupport: boolean;
        maxAutoApplyPerDay: number;
        maxAutoApplyPerMonth: number;
        hasManualApply: boolean;
      };
    } = {
      cancelledDate: now.toISOString(),
    };

    if (cancellationType === 'immediate') {
      // Immediate cancellation - downgrade now
      updateData.subscriptionStatus = 'cancelled';
      updateData.planTier = 'free';
      updateData.features = {
        autoApply: false,
        unlimitedJobListings: false,
        aiResumeBuilder: false,
        aiMockInterviews: false,
        prioritySupport: false,
        maxAutoApplyPerDay: 0,
        maxAutoApplyPerMonth: 0,
        hasManualApply: true,
      };
    } else {
      // End of period - keep premium until renewal date
      updateData.subscriptionStatus = 'premium';
      // Webhook will handle the final status change when period ends
    }

    await updateUserSubscription(userId, updateData);

    // Get user profile for logging (with fallback)
    let userEmail = '';
    let userName = '';
    try {
      const userProfile = await getUserProfile(userId);
      userEmail = userProfile.email || '';
      userName = `${userProfile.firstName} ${userProfile.lastName}`.trim();
    } catch {
      console.warn('⚠️ [Cancel Route] Could not fetch user profile, using fallback values');
    }

    // Log cancellation details
    try {
      const cancellationLog = {
        userId,
        subscriptionId: subscription.razorpaySubscriptionId,
        reason,
        reasonDetails: reasonDetails || '',
        cancelledAt: now.toISOString(),
        cancelledBy: 'user',
        cancellationType,
        retentionOfferShown,
        retentionOfferType: retentionOfferType || null,
        retentionOfferAccepted,
        refundIssued: false,
        refundAmount: 0,
        userEmail,
        userName,
        planType: subscription.planType,
        planPrice: subscription.planPrice,
      };

      await addDoc(collection(firestore, 'cancellations'), cancellationLog);
    } catch {
      console.warn('⚠️ [Cancel Route] Could not log cancellation, but subscription was cancelled');
    }

    // Calculate access end date
    const accessEndDate = subscription.renewalDate || subscription.nextBillingDate;

    // Return success response
    return NextResponse.json({
      success: true,
      message: cancellationType === 'immediate'
        ? 'Subscription cancelled immediately'
        : 'Subscription will be cancelled at the end of your billing period',
      cancellationType,
      accessEndDate,
      remainingDays: accessEndDate
        ? Math.ceil((new Date(accessEndDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        : 0,
    });

  } catch (error: unknown) {
    console.error('Error cancelling subscription:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
