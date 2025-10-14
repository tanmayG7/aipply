import { NextRequest, NextResponse } from 'next/server';
import { getUserSubscription, updateUserSubscription, getUserProfile } from '@/lib/firebaseConfig/firebaseConfig';
import { cancelRazorpaySubscription } from '@/lib/utils/razorpayAdmin';
import { firestore, auth } from '@/lib/firebaseConfig/firebaseConfig';
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
    } catch (error) {
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

    // Cancel subscription in Razorpay
    const cancelAtCycleEnd = cancellationType === 'end_of_period';
    const cancelResult = await cancelRazorpaySubscription(
      subscription.razorpaySubscriptionId,
      cancelAtCycleEnd
    );

    if (!cancelResult.success) {
      return NextResponse.json(
        { error: `Failed to cancel subscription: ${cancelResult.error}` },
        { status: 500 }
      );
    }

    // Update subscription in Firebase
    const now = new Date();
    const updateData: any = {
      cancelledDate: now.toISOString(),
      cancelledBy: 'user',
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

    // Get user profile for logging
    const userProfile = await getUserProfile(userId);

    // Log cancellation details
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
      userEmail: userProfile.email || '',
      userName: `${userProfile.firstName} ${userProfile.lastName}`.trim(),
      planType: subscription.planType,
      planPrice: subscription.planPrice,
    };

    await addDoc(collection(firestore, 'cancellations'), cancellationLog);

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

  } catch (error: any) {
    console.error('Error cancelling subscription:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
