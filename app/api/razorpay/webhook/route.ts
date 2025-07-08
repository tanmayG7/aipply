// app/api/razorpay/webhook/route.ts (COMPLETE INTEGRATION)
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { 
  updateUserSubscription, 
  getUserSubscription,
  createUserSubscription 
} from '@/lib/firebaseConfig/firebaseConfig';

const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  try {
    console.log('🔔 Razorpay webhook received');
    
    const body = await request.text();
    const signature = request.headers.get('x-razorpay-signature');
    
    if (!signature || !RAZORPAY_WEBHOOK_SECRET) {
      console.error('❌ Missing signature or webhook secret');
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }
    
    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
      .update(body)
      .digest('hex');
    
    if (signature !== expectedSignature) {
      console.error('❌ Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }
    
    const event = JSON.parse(body);
    console.log('📧 Webhook event:', event.event);
    
    // Handle different webhook events
    switch (event.event) {
      case 'subscription.authenticated':
      case 'subscription.activated':
        await handleSubscriptionActivated(event);
        break;
        
      case 'subscription.charged':
        await handleSubscriptionCharged(event);
        break;
        
      case 'subscription.cancelled':
        await handleSubscriptionCancelled(event);
        break;
        
      case 'subscription.completed':
      case 'subscription.halted':
        await handleSubscriptionExpired(event);
        break;
        
      default:
        console.log(`ℹ️ Unhandled webhook event: ${event.event}`);
    }
    
    return NextResponse.json({ status: 'success' });
    
  } catch (error) {
    console.error('❌ Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

// Handle successful subscription activation/authentication
async function handleSubscriptionActivated(event: any) {
  try {
    console.log('🎉 Processing subscription activation');
    
    const subscription = event.payload.subscription.entity;
    const userId = subscription.notes?.userId;
    
    if (!userId) {
      console.error('❌ No userId found in subscription notes');
      return;
    }
    
    console.log(`👤 Activating subscription for user: ${userId}`);
    console.log(`📋 Plan ID: ${subscription.plan_id}`);
    console.log(`💰 Subscription ID: ${subscription.id}`);
    
    // Determine plan details based on plan_id
    const planDetails = getPlanDetails(subscription.plan_id);
    
    if (!planDetails) {
      console.error(`❌ Unknown plan ID: ${subscription.plan_id}`);
      return;
    }
    
    // Calculate dates
    const now = new Date();
    const renewalDate = new Date(now);
    renewalDate.setDate(renewalDate.getDate() + planDetails.durationDays);
    
    // Prepare subscription update data
    const subscriptionUpdate = {
      subscriptionStatus: 'premium' as const,
      planType: planDetails.type,
      planTier: 'premium' as const,
      razorpaySubscriptionId: subscription.id,
      razorpayCustomerId: subscription.customer_id,
      razorpayPlanId: subscription.plan_id,
      subscriptionStartDate: now.toISOString(),
      renewalDate: renewalDate.toISOString(),
      lastPaymentDate: now.toISOString(),
      nextBillingDate: subscription.current_end ? new Date(subscription.current_end * 1000).toISOString() : renewalDate.toISOString(),
      planPrice: planDetails.price,
      planCurrency: 'INR' as const,
      features: planDetails.features,
      // Clear any previous cancellation/expiry data
      cancelledDate: null,
      expiredDate: null,
      gracePeriodEndDate: null,
    };
    
    // Update or create user subscription
    try {
      await updateUserSubscription(userId, subscriptionUpdate);
      console.log(`✅ Successfully activated premium subscription for user ${userId}`);
      console.log(`📅 Renewal date: ${renewalDate.toISOString()}`);
      console.log(`💎 Plan: ${planDetails.name} (${planDetails.type})`);
    } catch (updateError) {
      console.log('🔄 User subscription not found, creating new one...');
      await createUserSubscription(userId);
      await updateUserSubscription(userId, subscriptionUpdate);
      console.log(`✅ Created and activated subscription for user ${userId}`);
    }
    
  } catch (error) {
    console.error('❌ Error in handleSubscriptionActivated:', error);
  }
}

// Handle successful subscription charges (renewals)
async function handleSubscriptionCharged(event: any) {
  try {
    console.log('💳 Processing subscription charge/renewal');
    
    const subscription = event.payload.subscription.entity;
    const payment = event.payload.payment.entity;
    const userId = subscription.notes?.userId;
    
    if (!userId) {
      console.error('❌ No userId found in subscription.charged');
      return;
    }
    
    console.log(`💳 Processing payment for user: ${userId}`);
    console.log(`💰 Payment ID: ${payment.id}`);
    console.log(`💵 Amount: ₹${payment.amount / 100}`);
    
    // Get plan details
    const planDetails = getPlanDetails(subscription.plan_id);
    
    if (planDetails) {
      // Calculate new renewal date
      const renewalDate = new Date();
      renewalDate.setDate(renewalDate.getDate() + planDetails.durationDays);
      
      // Update subscription with successful payment
      await updateUserSubscription(userId, {
        subscriptionStatus: 'premium' as const,
        lastPaymentDate: new Date().toISOString(),
        renewalDate: renewalDate.toISOString(),
        nextBillingDate: subscription.current_end ? new Date(subscription.current_end * 1000).toISOString() : renewalDate.toISOString(),
        // Clear any grace period or expiry data since payment was successful
        cancelledDate: null,
        expiredDate: null,
        gracePeriodEndDate: null,
      });
      
      console.log(`✅ Subscription renewed for user ${userId} until ${renewalDate.toISOString()}`);
    }
    
  } catch (error) {
    console.error('❌ Error in handleSubscriptionCharged:', error);
  }
}

// Handle subscription cancellation
async function handleSubscriptionCancelled(event: any) {
  try {
    console.log('❌ Processing subscription cancellation');
    
    const subscription = event.payload.subscription.entity;
    const userId = subscription.notes?.userId;
    
    if (!userId) {
      console.error('❌ No userId found in subscription.cancelled');
      return;
    }
    
    console.log(`❌ Cancelling subscription for user: ${userId}`);
    
    // Get current subscription to check if they have remaining time
    const currentSubscription = await getUserSubscription(userId);
    const now = new Date();
    const renewalDate = currentSubscription.renewalDate ? new Date(currentSubscription.renewalDate) : now;
    
    if (renewalDate > now) {
      // User has paid time remaining - let them use it until renewal date
      console.log(`⏰ User has time remaining until ${renewalDate.toISOString()}`);
      await updateUserSubscription(userId, {
        subscriptionStatus: 'premium' as const, // Keep premium until renewal date
        cancelledDate: now.toISOString(),
        // Don't change renewalDate - let them use paid time
      });
      console.log(`✅ Marked as cancelled but keeping premium until ${renewalDate.toISOString()}`);
    } else {
      // No remaining time - immediate downgrade
      await updateUserSubscription(userId, {
        subscriptionStatus: 'cancelled' as const,
        planTier: 'free' as const,
        features: {
          autoApply: false,
          unlimitedJobListings: false,
          aiResumeBuilder: false,
          aiMockInterviews: false,
          prioritySupport: false,
          maxAutoApplyPerDay: 0,
          maxAutoApplyPerMonth: 0,
          hasManualApply: true
        },
        cancelledDate: now.toISOString(),
        // Reset usage since they're now free
        usage: {
          autoApplyToday: 0,
          autoApplyThisMonth: 0,
          lastResetDate: now.toISOString().split('T')[0],
          lastMonthlyResetDate: now.toISOString().substring(0, 7),
          timezone: 'Asia/Kolkata'
        }
      });
      console.log(`❌ Immediate downgrade to free for user ${userId}`);
    }
    
  } catch (error) {
    console.error('❌ Error in handleSubscriptionCancelled:', error);
  }
}

// Handle subscription expiry/completion
async function handleSubscriptionExpired(event: any) {
  try {
    console.log('⏰ Processing subscription expiry');
    
    const subscription = event.payload.subscription.entity;
    const userId = subscription.notes?.userId;
    
    if (!userId) {
      console.error('❌ No userId found in subscription expiry event');
      return;
    }
    
    console.log(`⏰ Starting grace period for user: ${userId}`);
    
    // Start 7-day grace period
    const gracePeriodEnd = new Date();
    gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 7);
    
    await updateUserSubscription(userId, {
      subscriptionStatus: 'grace_period' as const,
      expiredDate: new Date().toISOString(),
      gracePeriodEndDate: gracePeriodEnd.toISOString(),
    });
    
    console.log(`⏰ Grace period started for user ${userId} until ${gracePeriodEnd.toISOString()}`);
    
  } catch (error) {
    console.error('❌ Error in handleSubscriptionExpired:', error);
  }
}

// Helper function to get plan details
function getPlanDetails(planId: string) {
  const planMap: Record<string, any> = {
    // LIVE Plan IDs
    'plan_Qpq8Ccn726wjfX': {
      name: 'Monthly Premium',
      type: 'monthly',
      price: 666,
      durationDays: 30,
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
    },
    'plan_Qpq96uaFwtJnrF': {
      name: 'Quarterly Premium',
      type: 'quarterly',
      price: 1497,
      durationDays: 90,
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
    },
    'plan_QpqBIEeMGX2B2C': {
      name: 'Yearly Premium',
      type: 'yearly',
      price: 4188,
      durationDays: 365,
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
    }
  };
  
  return planMap[planId] || null;
}
