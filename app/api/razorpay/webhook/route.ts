// app/api/razorpay/webhook/route.ts
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

async function logWebhookEvent(
  eventType: string,
  userId: string | null,
  success: boolean,
  errorMessage?: string,
  additionalData?: Record<string, unknown>
) {
  try {
    const firestore = getFirestore();
    if (!firestore) return; // Guard: don't crash if Firestore unavailable
    const webhookLogsRef = collection(firestore, 'webhook_logs');
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
    console.error('❌ Failed to log webhook event:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔔 Razorpay webhook received');

    const body = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    if (!signature || !RAZORPAY_WEBHOOK_SECRET) {
      console.error('❌ Missing signature or webhook secret');
      await logWebhookEvent('unknown', null, false, 'Missing signature or webhook secret');
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
      .update(body)
      .digest('hex');

    if (signature !== expectedSignature) {
      console.error('❌ Invalid webhook signature');
      await logWebhookEvent('unknown', null, false, 'Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    console.log('✅ Webhook signature verified');

    const event = JSON.parse(body);
    console.log('📧 Webhook event type:', event.event);

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleSubscriptionActivated(event: any) {
  try {
    const subscription = event.payload.subscription.entity;
    const userId = subscription.notes?.userId;
    if (!userId) {
      const error = 'No userId found in subscription notes';
      await logWebhookEvent(event.event, null, false, error, { subscriptionId: subscription.id });
      throw new Error(error);
    }

    const planDetails = getPlanDetails(subscription.plan_id);
    if (!planDetails) {
      const error = `Unknown plan ID: ${subscription.plan_id}`;
      await logWebhookEvent(event.event, userId, false, error);
      throw new Error(error);
    }

    const now = new Date();
    const renewalDate = new Date(now);
    renewalDate.setDate(renewalDate.getDate() + planDetails.durationDays);

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
      cancelledDate: null,
      expiredDate: null,
      gracePeriodEndDate: null,
    };

    let retryCount = 0;
    const maxRetries = 3;
    let lastError;
    while (retryCount < maxRetries) {
      try {
        await updateUserSubscription(userId, subscriptionUpdate);
        break;
      } catch (updateError) {
        if (retryCount === 0) {
          try { await createUserSubscription(userId); } catch (e) { console.error('❌ Error creating subscription:', e); }
        }
        lastError = updateError;
        retryCount++;
        if (retryCount < maxRetries) await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
      }
    }
    if (retryCount === maxRetries) throw new Error(`Failed to update subscription after ${maxRetries} attempts: ${lastError}`);

    const updatedSub = await getUserSubscription(userId);
    if (!updatedSub || updatedSub.subscriptionStatus !== 'premium') throw new Error('Subscription update verification failed');

    await logWebhookEvent(event.event, userId, true, undefined, { subscriptionId: subscription.id, planType: planDetails.type, renewalDate: renewalDate.toISOString() });
  } catch (error) {
    console.error('❌ Error in handleSubscriptionActivated:', error);
    throw error;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleSubscriptionCharged(event: any) {
  try {
    const subscription = event.payload.subscription.entity;
    const payment = event.payload.payment.entity;
    const userId = subscription.notes?.userId;
    if (!userId) { console.error('❌ No userId found in subscription.charged'); return; }

    const planDetails = getPlanDetails(subscription.plan_id);
    if (planDetails) {
      const renewalDate = new Date();
      renewalDate.setDate(renewalDate.getDate() + planDetails.durationDays);
      await updateUserSubscription(userId, {
        subscriptionStatus: 'premium' as const,
        lastPaymentDate: new Date().toISOString(),
        renewalDate: renewalDate.toISOString(),
        nextBillingDate: subscription.current_end ? new Date(subscription.current_end * 1000).toISOString() : renewalDate.toISOString(),
        cancelledDate: null, expiredDate: null, gracePeriodEndDate: null,
      });
      console.log(`✅ Subscription renewed for user ${userId}, payment ${payment.id}`);
    }
  } catch (error) {
    console.error('❌ Error in handleSubscriptionCharged:', error);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleSubscriptionCancelled(event: any) {
  try {
    const subscription = event.payload.subscription.entity;
    const userId = subscription.notes?.userId;
    if (!userId) { console.error('❌ No userId found in subscription.cancelled'); return; }

    const firestore = getFirestore();
    if (!firestore) { console.error('❌ Firestore not initialized'); return; }
    const subscriptionDoc = await getDoc(doc(firestore, "subscriptions", userId));
    if (!subscriptionDoc.exists()) { console.error('❌ No subscription document found'); return; }

    const currentSubscription = subscriptionDoc.data();
    const now = new Date();
    const renewalDate = currentSubscription.renewalDate ? new Date(currentSubscription.renewalDate) : now;

    if (renewalDate > now) {
      await updateUserSubscription(userId, { subscriptionStatus: 'premium' as const, cancelledDate: now.toISOString() });
    } else {
      await updateUserSubscription(userId, {
        subscriptionStatus: 'cancelled' as const, planTier: 'free' as const,
        features: { autoApply: false, unlimitedJobListings: false, aiResumeBuilder: false, aiMockInterviews: false, prioritySupport: false, maxAutoApplyPerDay: 0, maxAutoApplyPerMonth: 0, hasManualApply: true },
        cancelledDate: now.toISOString(),
        usage: { autoApplyToday: 0, autoApplyThisMonth: 0, lastResetDate: now.toISOString().split('T')[0], lastMonthlyResetDate: now.toISOString().substring(0, 7), timezone: 'Asia/Kolkata' }
      });
    }
  } catch (error) {
    console.error('❌ Error in handleSubscriptionCancelled:', error);
  }
}

async function handleSubscriptionExpired(event: RazorpayWebhookEvent) {
  try {
    if (!event.payload.subscription) { console.error('❌ No subscription data in event'); return; }
    const subscription = event.payload.subscription.entity;
    const userId = subscription.notes?.userId;
    if (!userId) { console.error('❌ No userId found in subscription expiry event'); return; }
    const gracePeriodEnd = new Date();
    gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 7);
    await updateUserSubscription(userId, { subscriptionStatus: 'grace_period' as const, expiredDate: new Date().toISOString(), gracePeriodEndDate: gracePeriodEnd.toISOString() });
  } catch (error) {
    console.error('❌ Error in handleSubscriptionExpired:', error);
  }
}

function getPlanDetails(planId: string): PlanDetails | null {
  const planMap: Record<string, PlanDetails> = {
    'plan_Qpq8Ccn726wjfX': { name: 'Monthly Premium', type: 'monthly', price: 666, durationDays: 30, features: { autoApply: true, unlimitedJobListings: true, aiResumeBuilder: true, aiMockInterviews: true, prioritySupport: true, maxAutoApplyPerDay: 5, maxAutoApplyPerMonth: 100, hasManualApply: true } },
    'plan_Qpq96uaFwtJnrF': { name: 'Quarterly Premium', type: 'quarterly', price: 1497, durationDays: 90, features: { autoApply: true, unlimitedJobListings: true, aiResumeBuilder: true, aiMockInterviews: true, prioritySupport: true, maxAutoApplyPerDay: 5, maxAutoApplyPerMonth: 100, hasManualApply: true } },
    'plan_QpqBIEeMGX2B2C': { name: 'Yearly Premium', type: 'yearly', price: 4188, durationDays: 365, features: { autoApply: true, unlimitedJobListings: true, aiResumeBuilder: true, aiMockInterviews: true, prioritySupport: true, maxAutoApplyPerDay: 5, maxAutoApplyPerMonth: 100, hasManualApply: true } },
    'plan_QqrdMIMXarYxg0': { name: 'Monthly Premium (Test)', type: 'monthly', price: 10, durationDays: 30, features: { autoApply: true, unlimitedJobListings: true, aiResumeBuilder: true, aiMockInterviews: true, prioritySupport: true, maxAutoApplyPerDay: 5, maxAutoApplyPerMonth: 100, hasManualApply: true } },
  };
  return planMap[planId] || null;
}

async function handlePaymentCaptured(event: RazorpayWebhookEvent) {
  try {
    if (!event.payload.payment) { console.error('❌ No payment data in event'); return; }
    const payment = event.payload.payment.entity;
    const orderId = payment.order_id;
    if (!orderId) { console.error('❌ No order_id found in payment.captured'); return; }

    const firestore = getFirestore();
    if (!firestore) { console.error('❌ Firestore not initialized'); return; }
    const orderRef = doc(firestore, 'cv_orders', orderId);
    const orderDoc = await getDoc(orderRef);
    if (!orderDoc.exists()) { console.log(`ℹ️ Order ${orderId} not found in cv_orders`); return; }

    const orderData = orderDoc.data();
    if (orderData.status === 'paid') { console.log(`⚠️ Order ${orderId} already marked as paid`); return; }
    if (orderData.payment?.razorpayPaymentId === payment.id) { console.log(`⚠️ Payment ${payment.id} already processed`); return; }

    const currentTimestamp = new Date().toISOString();
    const { updateDoc } = await import('firebase/firestore');
    await updateDoc(orderRef, { 'payment.razorpayPaymentId': payment.id, 'payment.status': 'completed', 'status': 'paid', 'paidAt': currentTimestamp, 'updatedAt': currentTimestamp });

    const emailData = { customerName: orderData.customerDetails.fullName, customerEmail: orderData.customerDetails.email, orderId, amount: orderData.serviceDetails.price, deliveryDays: orderData.serviceDetails.deliveryDays };
    sendCVOrderConfirmationEmail(emailData).catch(err => console.error('Email error:', err));
    sendCVOrderAdminNotification(emailData).catch(err => console.error('Admin notification error:', err));
  } catch (error) {
    console.error('❌ Error in handlePaymentCaptured:', error);
  }
}

async function handlePaymentFailed(event: RazorpayWebhookEvent) {
  try {
    if (!event.payload.payment) { console.error('❌ No payment data in event'); return; }
    const payment = event.payload.payment.entity;
    const orderId = payment.order_id;
    if (!orderId) { console.error('❌ No order_id found in payment.failed'); return; }

    const firestore = getFirestore();
    if (!firestore) { console.error('❌ Firestore not initialized'); return; }
    const orderRef = doc(firestore, 'cv_orders', orderId);
    const orderDoc = await getDoc(orderRef);
    if (!orderDoc.exists()) { console.log(`ℹ️ Order ${orderId} not found in cv_orders`); return; }

    const currentTimestamp = new Date().toISOString();
    const { updateDoc } = await import('firebase/firestore');
    await updateDoc(orderRef, { 'payment.status': 'failed', 'payment.failureReason': payment.error_description || 'Payment failed', 'status': 'payment_failed', 'updatedAt': currentTimestamp });

    const orderData = orderDoc.data();
    const { sendCVOrderFailureEmail } = await import('@/lib/email/emailService');
    await sendCVOrderFailureEmail({ customerName: orderData.customerDetails.fullName, customerEmail: orderData.customerDetails.email, orderId, amount: orderData.amount, failureReason: payment.error_description });
  } catch (error) {
    console.error('❌ Error in handlePaymentFailed:', error);
  }
}
