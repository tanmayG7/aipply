import { NextRequest, NextResponse } from 'next/server';
import { getAdminUserId } from '@/lib/middleware/adminMiddleware';
import { getUserSubscription, updateUserSubscription, getUserProfile } from '@/lib/firebaseConfig/firebaseConfig';
import { cancelRazorpaySubscription, getSubscriptionPayments, createRefund } from '@/lib/utils/razorpayAdmin';
import { firestore } from '@/lib/firebaseConfig/firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import { CancellationReason } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    const adminUserId = await getAdminUserId(request);
    if (!adminUserId) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }

    // Get admin profile for audit log
    const adminProfile = await getUserProfile(adminUserId);

    // Parse request body
    const body = await request.json();
    const {
      userId,
      reason,
      reasonDetails,
      cancellationType, // 'immediate' or 'end_of_period'
      issueRefund,
      refundAmount,
    }: {
      userId: string;
      reason: CancellationReason;
      reasonDetails?: string;
      cancellationType: 'immediate' | 'end_of_period';
      issueRefund: boolean;
      refundAmount?: number;
    } = body;

    if (!userId || !reason || !cancellationType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get user subscription
    const subscription = await getUserSubscription(userId);

    if (!subscription.razorpaySubscriptionId) {
      return NextResponse.json(
        { error: 'No active Razorpay subscription found' },
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
        { error: `Failed to cancel Razorpay subscription: ${cancelResult.error}` },
        { status: 500 }
      );
    }

    // Handle refund if requested
    let refundSuccess = false;
    let refundData = null;

    if (issueRefund) {
      // Get subscription payments
      const paymentsResult = await getSubscriptionPayments(subscription.razorpaySubscriptionId);

      if (paymentsResult.success && paymentsResult.data?.items?.length > 0) {
        // Get the most recent successful payment
        const recentPayment = paymentsResult.data.items.find(
          (payment: any) => payment.status === 'captured'
        );

        if (recentPayment) {
          // Calculate refund amount (in paise)
          const refundAmountPaise = refundAmount
            ? refundAmount * 100
            : recentPayment.amount;

          const refundResult = await createRefund(
            recentPayment.id,
            refundAmountPaise,
            {
              reason: 'Admin initiated cancellation',
              cancelled_by: adminProfile.email || 'admin',
            }
          );

          if (refundResult.success) {
            refundSuccess = true;
            refundData = refundResult.data;
          }
        }
      }
    }

    // Update subscription in Firebase
    const now = new Date();
    const updateData: any = {
      cancelledDate: now.toISOString(),
      cancelledBy: 'admin',
    };

    if (cancellationType === 'immediate') {
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
      // Keep premium until end of period
      updateData.subscriptionStatus = 'premium';
      // The webhook will handle the final status change
    }

    await updateUserSubscription(userId, updateData);

    // Log cancellation details
    const cancellationLog = {
      userId,
      subscriptionId: subscription.razorpaySubscriptionId,
      reason,
      reasonDetails: reasonDetails || '',
      cancelledAt: now.toISOString(),
      cancelledBy: 'admin',
      cancellationType,
      retentionOfferShown: false,
      retentionOfferAccepted: false,
      refundIssued: refundSuccess,
      refundAmount: refundSuccess && refundData ? refundData.amount / 100 : 0,
    };

    await addDoc(collection(firestore, 'cancellations'), cancellationLog);

    // Log admin action
    const adminActionLog = {
      actionId: `cancel_${Date.now()}`,
      adminUserId,
      adminEmail: adminProfile.email || 'admin',
      targetUserId: userId,
      actionType: 'cancel_subscription',
      actionDetails: {
        reason,
        reasonDetails,
        cancellationType,
        refundIssued: refundSuccess,
        refundAmount: refundSuccess && refundData ? refundData.amount / 100 : 0,
      },
      timestamp: now.toISOString(),
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
    };

    await addDoc(collection(firestore, 'adminActions'), adminActionLog);

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Subscription cancelled successfully',
      cancellationType,
      refundIssued: refundSuccess,
      refundAmount: refundSuccess && refundData ? refundData.amount / 100 : 0,
    });

  } catch (error: any) {
    console.error('Error cancelling subscription:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
