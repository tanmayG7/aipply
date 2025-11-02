// app/api/test-firebase-update/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { updateUserSubscription, createUserSubscription, getUserSubscription } from '@/lib/firebaseConfig/firebaseConfig';

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Testing Firebase update...');
    
    const body = await request.json();
    const { userId } = body;
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'Please provide userId in request body'
      }, { status: 400 });
    }
    
    console.log('👤 Testing with User ID:', userId);
    
    // Check current subscription first
    let currentSub;
    try {
      currentSub = await getUserSubscription(userId);
      console.log('📊 Current subscription status:', currentSub.subscriptionStatus);
    } catch {
      console.log('📝 No existing subscription found, creating one...');
      currentSub = await createUserSubscription(userId);
    }
    
    // Prepare test update - with ALL required fields
    const testUpdate = {
      subscriptionStatus: 'premium' as const,
      planTier: 'premium' as const,
      planType: 'monthly' as const,
      razorpaySubscriptionId: 'test_sub_' + Date.now(),
      razorpayCustomerId: 'test_cust_' + Date.now(),
      razorpayPlanId: 'plan_Qpq8Ccn726wjfX',
      subscriptionStartDate: new Date().toISOString(),
      renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      lastPaymentDate: new Date().toISOString(),
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      planPrice: 666,
      planCurrency: 'INR' as const,
      cancelledDate: null,
      expiredDate: null,
      gracePeriodEndDate: null,
      features: {
        autoApply: true,
        unlimitedJobListings: true,
        aiResumeBuilder: true,
        aiMockInterviews: true,
        prioritySupport: true,
        maxAutoApplyPerDay: 5,
        maxAutoApplyPerMonth: 100,
        hasManualApply: true
      }
    };
    
    console.log('🔄 Applying test update...');
    await updateUserSubscription(userId, testUpdate);
    
    // Verify the update
    const updatedSub = await getUserSubscription(userId);
    
    console.log('✅ Firebase update successful!');
    console.log('📊 New status:', updatedSub.subscriptionStatus);
    
    return NextResponse.json({
      success: true,
      message: 'Firebase subscription updated successfully!',
      before: {
        status: currentSub.subscriptionStatus,
        tier: currentSub.planTier
      },
      after: {
        subscriptionStatus: updatedSub.subscriptionStatus,
        planTier: updatedSub.planTier,
        razorpaySubscriptionId: updatedSub.razorpaySubscriptionId,
        lastPaymentDate: updatedSub.lastPaymentDate,
        renewalDate: updatedSub.renewalDate,
        features: updatedSub.features
      }
    });
    
  } catch (error) {
    console.error('❌ Firebase test failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: 'Check server logs for more details'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'This endpoint requires POST method with userId in body',
    example: { userId: 'your-user-id-here' }
  });
}
