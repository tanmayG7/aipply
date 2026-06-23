// app/api/razorpay/webhook/route.ts (FIXED IMPORTS)
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import {
  updateUserSubscription,
  createUserSubscription,
  getUserSubscription
} from '@/lib/firebaseConfig/firebaseConfig';
import { getFirestore, doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { sendCVOrderConfirmationEmail, sendCVOrderAdminNotification } from '@/lib/email/emailService';

interface RazorpayWebhookEvent {
  event: string;
  payload: {
    subscription?: {
      entity: {
        id: string;
        plan_id: string;
        customer_id: string;
        status: string;
        notes?: Record<string, string>;
      };
    };
    payment?: {
      entity: {
        id: string;
        order_id: string;
        amount: number;
        status: string;
        error_code?: string;
        error_description?: string;
        error_reason?: string;
      };
    };
  };
}

interface PlanDetails {
  name: string;
  type: 'monthly' | 'quarterly' | 'yearly';
  price: number;
  durationDays: number;
  features: {
    autoApply: boolean;
    unlimitedJobListings: boolean;
    aiResumeBuilder: boolean;
    aiMockInterviews: boolean;
    prioritySupport: boolean;
    maxAutoApplyPerDay: number;
    maxAutoApplyPerMonth: number;
    hasManualApply: boolean;
  };
}

const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;

// Helper function to log webhook events to Firestore for auditing
async function logWebhookEvent(
  eventType: string,
  userId: string | null,
  success: boolean,
  errorMessage?: string,
  additionalData?: Record<string, unknown>
) {
  try {
    const firestore = getFirestore();
    const webhookLogsRef = collection(firestore!, 'webhook_logs');

    await addDoc(webhookLogsRef, {
      eventType,
      userId,
      success,
      errorMessage: errorMessage || null,
      additionalData: additionalData || null,
      timestamp: serverTimestamp(),
      createdAt: new Date().toISOString()
    });

    console.log(`📝 Logged webhook event: ${eventType} (${success ? 'SUCCESS' : 'FAILURE'})`);
  } catch (error) {
    // Don't throw - logging failure shouldn't break webhook processing
    console.error('❌ Failed to log webhook event:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔔 Razorpay webhook received');
    console.log('📋 Headers:', {
      'x-razorpay-signature': request.headers.get('x-razorpay-signature') ? 'Present' : 'Missing',
      'content-type': request.headers.get('content-type'),
      'user-agent': request.headers.get('user-agent')
    });
    console.log('🔑 Environment check:', {
      'RAZORPAY_WEBHOOK_SECRET': RAZORPAY_WEBHOOK_SECRET ? 'Present' : 'MISSING!',
      'RAZORPAY_KEY_SECRET': process.env.RAZORPAY_KEY_SECRET ? 'Present' : 'Missing'
    });

    const body = await request.text();
    console.log('📦 Webhook body length:', body.length, 'bytes');

    const signature = request.headers.get('x-razorpay-signature');

    if (!signature || !RAZORPAY_WEBHOOK_SECRET) {
      console.error('❌ Missing signature or webhook secret');
      await logWebhookEvent('unknown', null, false, 'Missing signature or webhook secret');
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }
    
    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
      .update(body)
      .digest('hex');

    if (signature !== expectedSignature) {
      console.error('❌ Invalid webhook signature');
      console.error('Expected:', expectedSignature.substring(0, 10) + '...');
      console.error('Received:', signature.substring(0, 10) + '...');
      await logWebhookEvent('unknown', null, false, 'Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    console.log('✅ Webhook signature verified');

    const event = JSON.parse(body);
    console.log('📧 Webhook event type:', event.event);
    console.log('📦 Event payload keys:', Object.keys(event.payload || {}));
    
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

      // CV Service one-time payment events
      case 'payment.captured':
        await handlePaymentCaptured(event);
        break;

      case 'payment.failed':
        await handlePaymentFailed(event);
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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleSubscriptionActivated(event: any) {
  try {
    console.log('🎉 Processing subscription activation');

    const subscription = event.payload.subscription.entity;
    const userId = subscription.notes?.userId;

    if (!userId) {
      const error = 'No userId found in subscription notes';
      console.error(`❌ ${error}`);
      console.error('📋 Subscription notes:', JSON.stringify(subscription.notes));
      await logWebhookEvent(event.event, null, false, error, {
        subscriptionId: subscription.id,
        planId: subscription.plan_id,
        notes: subscription.notes
      });
      throw new Error(error); // Don't return silently
    }

    console.log(`👤 Activating subscription for user: ${userId}`);
    console.log(`📋 Plan ID: ${subscription.plan_id}`);
    console.log(`💰 Subscription ID: ${subscription.id}`);

    // Determine plan details based on plan_id
    const planDetails = getPlanDetails(subscription.plan_id);

    if (!planDetails) {
      const error = `Unknown plan ID: ${subscription.plan_id}`;
      console.error(`❌ ${error}`);
      await logWebhookEvent(event.event, userId, false, error, {
        subscriptionId: subscription.id,
        planId: subscription.plan_id
      });
      throw new Error(error); // Don't return silently
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
    
    // Update or create user subscription with retry logic
    let retryCount = 0;
    const maxRetries = 3;
    let lastError;

    while (retryCount < maxRetries) {
      try {
        await updateUserSubscription(userId, subscriptionUpdate);
        console.log(`✅ Successfully activated premium subscription for user ${userId} (attempt ${retryCount + 1})`);
        console.log(`📅 Renewal date: ${renewalDate.toISOString()}`);
        console.log(`💎 Plan: ${planDetails.name} (${planDetails.type})`);
        break; // Success - exit retry loop
      } catch (updateError) {
        if (retryCount === 0) {
          // First failure - might need to create subscription first
          console.log('🔄 User subscription not found, creating new one...');
          try {
            await createUserSubscription(userId);
            console.log('✅ Created new subscription document');
          } catch (createError) {
            console.error('❌ Error creating subscription:', createError);
          }
        }
        lastError = updateError;
        retryCount++;
        if (retryCount < maxRetries) {
          const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
          console.log(`⏳ Retrying in ${delay}ms... (attempt ${retryCount + 1}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    if (retryCount === maxRetries) {
      const error = `Failed to update subscription after ${maxRetries} attempts`;
      console.error(`❌ ${error}`, lastError);
      await logWebhookEvent(event.event, userId, false, error, {
        subscriptionId: subscription.id,
        planId: subscription.plan_id,
        lastError: lastError instanceof Error ? lastError.message : String(lastError)
      });
      throw new Error(error);
    }

    // Verify subscription was updated correctly
    console.log('🔍 Verifying subscription update...');
    const updatedSub = await getUserSubscription(userId);

    if (!updatedSub || updatedSub.subscriptionStatus !== 'premium') {
      const error = 'Subscription update verification failed';
      console.error(`❌ ${error}`, {
        expected: 'premium',
        actual: updatedSub?.subscriptionStatus || 'null'
      });
      await logWebhookEvent(event.event, userId, false, error, {
        subscriptionId: subscription.id,
        planId: subscription.plan_id,
        actualStatus: updatedSub?.subscriptionStatus
      });
      throw new Error(error);
    }

    if (!updatedSub.features.autoApply) {
      console.warn('⚠️ Warning: autoApply feature not enabled after subscription activation');
    }

    console.log('✅ Subscription verification passed');
    console.log(`📊 Status: ${updatedSub.subscriptionStatus}, Features: autoApply=${updatedSub.features.autoApply}`);

    // Log successful activation to Firestore
    await logWebhookEvent(event.event, userId, true, undefined, {
      subscriptionId: subscription.id,
      planId: subscription.plan_id,
      planType: planDetails.type,
      subscriptionStatus: updatedSub.subscriptionStatus,
      autoApplyEnabled: updatedSub.features.autoApply,
      renewalDate: renewalDate.toISOString()
    });

    console.log(`🎊 Subscription activation complete for user ${userId}`);

  } catch (error) {
    console.error('❌ Error in handleSubscriptionActivated:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    throw error; // Re-throw to be caught by main handler
  }
}

// Handle successful subscription charges (renewals)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    const firestore = getFirestore();
    const subscriptionDoc = await getDoc(doc(firestore, "subscriptions", userId));
    
    if (!subscriptionDoc.exists()) {
      console.error('❌ No subscription document found for user');
      return;
    }
    
    const currentSubscription = subscriptionDoc.data();
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
async function handleSubscriptionExpired(event: RazorpayWebhookEvent) {
  try {
    console.log('⏰ Processing subscription expiry');

    if (!event.payload.subscription) {
      console.error('❌ No subscription data in event');
      return;
    }

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
function getPlanDetails(planId: string): PlanDetails | null {
  const planMap: Record<string, PlanDetails> = {
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
    },
    // TEST Plan ID (₹10) - Keep for future testing
    'plan_QqrdMIMXarYxg0': {
      name: 'Monthly Premium (Test)',
      type: 'monthly',
      price: 10,
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
    }
  };
  
  return planMap[planId] || null;
}

// Handle successful one-time payment (CV Services)
async function handlePaymentCaptured(event: RazorpayWebhookEvent) {
  try {
    console.log('💳 Processing one-time payment capture');

    if (!event.payload.payment) {
      console.error('❌ No payment data in event');
      return;
    }

    const payment = event.payload.payment.entity;
    const orderId = payment.order_id;
    const paymentId = payment.id;

    if (!orderId) {
      console.error('❌ No order_id found in payment.captured event');
      return;
    }

    console.log(`💳 Payment captured for order: ${orderId}`);
    console.log(`💰 Payment ID: ${paymentId}`);
    console.log(`💵 Amount: ₹${payment.amount / 100}`);

    // Check if this is a CV service order
    const firestore = getFirestore();
    const orderRef = doc(firestore, 'cv_orders', orderId);
    const orderDoc = await getDoc(orderRef);

    if (!orderDoc.exists()) {
      console.log(`ℹ️ Order ${orderId} not found in cv_orders - might be a different service`);
      return;
    }

    const orderData = orderDoc.data();

    // Idempotency check: verify payment hasn't been processed already
    if (orderData.status === 'paid') {
      console.log(`⚠️ Order ${orderId} already marked as paid`);
      return;
    }

    // Additional idempotency check: verify payment ID hasn't been processed
    if (orderData.payment?.razorpayPaymentId === paymentId) {
      console.log(`⚠️ Payment ${paymentId} already processed for order ${orderId}`);
      return;
    }

    // Update order status
    const currentTimestamp = new Date().toISOString();
    const { updateDoc } = await import('firebase/firestore');

    await updateDoc(orderRef, {
      'payment.razorpayPaymentId': paymentId,
      'payment.status': 'completed',
      'status': 'paid',
      'paidAt': currentTimestamp,
      'updatedAt': currentTimestamp
    });

    console.log(`✅ CV service order ${orderId} marked as paid via webhook`);
    console.log(`📧 Customer: ${orderData.customerDetails.email}`);

    // Send confirmation email to customer
    const emailData = {
      customerName: orderData.customerDetails.fullName,
      customerEmail: orderData.customerDetails.email,
      orderId: orderId,
      amount: orderData.serviceDetails.price,
      deliveryDays: orderData.serviceDetails.deliveryDays
    };

    // Send emails (non-blocking)
    sendCVOrderConfirmationEmail(emailData).catch(err =>
      console.error('Webhook email send error:', err)
    );

    sendCVOrderAdminNotification(emailData).catch(err =>
      console.error('Webhook admin notification error:', err)
    );

  } catch (error) {
    console.error('❌ Error in handlePaymentCaptured:', error);
  }
}

// Handle failed one-time payment (CV Services)
async function handlePaymentFailed(event: RazorpayWebhookEvent) {
  try {
    console.log('❌ Processing payment failure');

    if (!event.payload.payment) {
      console.error('❌ No payment data in event');
      return;
    }

    const payment = event.payload.payment.entity;
    const orderId = payment.order_id;

    if (!orderId) {
      console.error('❌ No order_id found in payment.failed event');
      return;
    }

    console.log(`❌ Payment failed for order: ${orderId}`);
    console.log(`💰 Payment ID: ${payment.id}`);
    console.log(`⚠️ Error: ${payment.error_description || 'Unknown error'}`);

    // Check if this is a CV service order
    const firestore = getFirestore();
    const orderRef = doc(firestore, 'cv_orders', orderId);
    const orderDoc = await getDoc(orderRef);

    if (!orderDoc.exists()) {
      console.log(`ℹ️ Order ${orderId} not found in cv_orders - might be a different service`);
      return;
    }

    // Update order status
    const currentTimestamp = new Date().toISOString();
    const { updateDoc } = await import('firebase/firestore');

    await updateDoc(orderRef, {
      'payment.status': 'failed',
      'payment.failureReason': payment.error_description || 'Payment failed',
      'status': 'payment_failed',
      'updatedAt': currentTimestamp
    });

    console.log(`❌ CV service order ${orderId} marked as failed`);

    // Send payment failure notification to customer
    const orderData = orderDoc.data();
    const { sendCVOrderFailureEmail } = await import('@/lib/email/emailService');

    await sendCVOrderFailureEmail({
      customerName: orderData.customerDetails.fullName,
      customerEmail: orderData.customerDetails.email,
      orderId: orderId,
      amount: orderData.amount,
      failureReason: payment.error_description
    });

    console.log(`📧 Payment failure notification sent to ${orderData.customerDetails.email}`);

  } catch (error) {
    console.error('❌ Error in handlePaymentFailed:', error);
  }
}
