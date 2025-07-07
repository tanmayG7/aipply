import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { 
  updateUserSubscription, 
  getUserSubscription 
} from '@/lib/firebaseConfig/firebaseConfig';
import { 
  RAZORPAY_PLAN_MAPPING, 
  PLAN_FEATURES 
} from '@/lib/types';

// Razorpay webhook secret - add this to your environment variables
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  try {
    console.log('🔔 Razorpay webhook received');
    
    // Get the raw body and signature
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
    
    // Parse the webhook data
    const event = JSON.parse(body);
    console.log('📧 Webhook event:', event.event);
    
    // Handle different webhook events
    switch (event.event) {
      case 'subscription.authenticated':
        await handleSubscriptionAuthenticated(event);
        break;
        
      case 'subscription.activated':
        await handleSubscriptionActivated(event);
        break;
        
      case 'subscription.charged':
        await handleSubscriptionCharged(event);
        break;
        
      case 'subscription.completed':
        await handleSubscriptionCompleted(event);
        break;
        
      case 'subscription.cancelled':
        await handleSubscriptionCancelled(event);
        break;
        
      case 'subscription.paused':
        await handleSubscriptionPaused(event);
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

// Handle when subscription is first created and authenticated
async function handleSubscriptionAuthenticated(event: any) {
  try {
    console.log('🔑 Processing subscription.authenticated');
    
    const subscription = event.payload.subscription.entity;
    const payment = event.payload.payment?.entity;
    
    // Extract user ID from subscription notes or metadata
    const userId = subscription.notes?.userId || payment?.notes?.userId;
    
    if (!userId) {
      console.error('❌ No userId found in subscription data');
      return;
    }
    
    console.log(`👤 User ID: ${userId}`);
    console.log(`📋 Plan ID: ${subscription.plan_id}`);
    
    // Get plan details from our mapping
    const planConfig = RAZORPAY_PLAN_MAPPING[subscription.plan_id];
    
    if (!planConfig) {
      console.error(`❌ Unknown plan ID: ${subscription.plan_id}`);
      return;
    }
    
    // Calculate renewal date
    const startDate = new Date();
    const renewalDate = new Date();
    renewalDate.setDate(renewalDate.getDate() + planConfig.duration);
    
    // Update user subscription to premium
    const subscriptionUpdates = {
      subscriptionStatus: 'premium' as const,
      planType: planConfig.type,
      planTier: 'premium' as const,
      razorpaySubscriptionId: subscription.id,
      razorpayCustomerId: subscription.customer_id,
      razorpayPlanId: subscription.plan_id,
      subscriptionStartDate: startDate.toISOString(),
      renewalDate: renewalDate.toISOString(),
      lastPaymentDate: new Date().toISOString(),
      nextBillingDate: new Date(subscription.current_end * 1000).toISOString(),
      planPrice: planConfig.price,
      features: PLAN_FEATURES.premium,
      cancelledDate: null,
      expiredDate: null,
      gracePeriodEndDate: null,
    };
    
    await updateUserSubscription(userId, subscriptionUpdates);
    
    console.log(`✅ User ${userId} upgraded to premium (${planConfig.name})`);
    
  } catch (error) {
    console.error('❌ Error in handleSubscriptionAuthenticated:', error);
  }
}

// Handle successful subscription activation
async function handleSubscriptionActivated(event: any) {
  try {
    console.log('🎉 Processing subscription.activated');
    
    const subscription = event.payload.subscription.entity;
    const userId = subscription.notes?.userId;
    
    if (!userId) {
      console.error('❌ No userId found in subscription.activated');
      return;
    }
    
    // Ensure user is marked as premium and active
    await updateUserSubscription(userId, {
      subscriptionStatus: 'premium',
      lastPaymentDate: new Date().toISOString(),
    });
    
    console.log(`✅ Subscription activated for user ${userId}`);
    
  } catch (error) {
    console.error('❌ Error in handleSubscriptionActivated:', error);
  }
}

// Handle successful subscription charges (renewals)
async function handleSubscriptionCharged(event: any) {
  try {
    console.log('💳 Processing subscription.charged');
    
    const subscription = event.payload.subscription.entity;
    const payment = event.payload.payment.entity;
    const userId = subscription.notes?.userId;
    
    if (!userId) {
      console.error('❌ No userId found in subscription.charged');
      return;
    }
    
    // Get plan details
    const planConfig = RAZORPAY_PLAN_MAPPING[subscription.plan_id];
    
    if (planConfig) {
      // Calculate new renewal date
      const renewalDate = new Date();
      renewalDate.setDate(renewalDate.getDate() + planConfig.duration);
      
      // Update subscription with new renewal date
      await updateUserSubscription(userId, {
        subscriptionStatus: 'premium',
        lastPaymentDate: new Date().toISOString(),
        renewalDate: renewalDate.toISOString(),
        nextBillingDate: new Date(subscription.current_end * 1000).toISOString(),
        // Clear any grace period or expiry data
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

// Handle subscription completion (rare, usually for limited-time subscriptions)
async function handleSubscriptionCompleted(event: any) {
  try {
    console.log('🏁 Processing subscription.completed');
    
    const subscription = event.payload.subscription.entity;
    const userId = subscription.notes?.userId;
    
    if (!userId) {
      console.error('❌ No userId found in subscription.completed');
      return;
    }
    
    // Start grace period
    const gracePeriodEndDate = new Date();
    gracePeriodEndDate.setDate(gracePeriodEndDate.getDate() + 7); // 7-day grace period
    
    await updateUserSubscription(userId, {
      subscriptionStatus: 'grace_period',
      expiredDate: new Date().toISOString(),
      gracePeriodEndDate: gracePeriodEndDate.toISOString(),
    });
    
    console.log(`⏰ User ${userId} subscription completed, grace period started`);
    
  } catch (error) {
    console.error('❌ Error in handleSubscriptionCompleted:', error);
  }
}

// Handle subscription cancellation
async function handleSubscriptionCancelled(event: any) {
  try {
    console.log('❌ Processing subscription.cancelled');
    
    const subscription = event.payload.subscription.entity;
    const userId = subscription.notes?.userId;
    
    if (!userId) {
      console.error('❌ No userId found in subscription.cancelled');
      return;
    }
    
    // Downgrade to free immediately
    await updateUserSubscription(userId, {
      subscriptionStatus: 'cancelled',
      planType: null,
      planTier: 'free',
      features: PLAN_FEATURES.free,
      cancelledDate: new Date().toISOString(),
      // Reset usage since they're now free
      usage: {
        autoApplyToday: 0,
        autoApplyThisMonth: 0,
        lastResetDate: new Date().toISOString().split('T')[0],
        lastMonthlyResetDate: new Date().toISOString().substring(0, 7),
        timezone: 'Asia/Kolkata'
      }
    });
    
    console.log(`❌ User ${userId} subscription cancelled, downgraded to free`);
    
  } catch (error) {
    console.error('❌ Error in handleSubscriptionCancelled:', error);
  }
}

// Handle subscription pause
async function handleSubscriptionPaused(event: any) {
  try {
    console.log('⏸️ Processing subscription.paused');
    
    const subscription = event.payload.subscription.entity;
    const userId = subscription.notes?.userId;
    
    if (!userId) {
      console.error('❌ No userId found in subscription.paused');
      return;
    }
    
    // Keep premium features but mark as paused
    await updateUserSubscription(userId, {
      subscriptionStatus: 'cancelled', // Treat paused as cancelled for now
      planTier: 'free', // Downgrade features
      features: PLAN_FEATURES.free,
    });
    
    console.log(`⏸️ User ${userId} subscription paused`);
    
  } catch (error) {
    console.error('❌ Error in handleSubscriptionPaused:', error);
  }
}
