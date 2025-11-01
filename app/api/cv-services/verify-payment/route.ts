// app/api/cv-services/verify-payment/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { initializeApp, getApps, getApp } from 'firebase/app';
import CryptoJS from 'crypto-js';
import { sendCVOrderConfirmationEmail, sendCVOrderAdminNotification } from '@/lib/email/emailService';

const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

// Initialize Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const firestore = getFirestore(app);

export async function POST(request: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json();

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({
        error: 'Missing required payment parameters',
        details: 'Order ID, Payment ID, and Signature are required'
      }, { status: 400 });
    }

    if (!RAZORPAY_KEY_SECRET) {
      console.error('❌ Razorpay secret key not configured');
      return NextResponse.json({
        error: 'Payment verification not configured',
        details: 'Please contact support'
      }, { status: 500 });
    }

    console.log(`🔐 Verifying payment for order: ${razorpay_order_id}`);

    // Verify Razorpay signature
    const generatedSignature = CryptoJS.HmacSHA256(
      `${razorpay_order_id}|${razorpay_payment_id}`,
      RAZORPAY_KEY_SECRET
    ).toString(CryptoJS.enc.Hex);

    if (generatedSignature !== razorpay_signature) {
      console.error('❌ Payment signature verification failed');
      return NextResponse.json({
        error: 'Payment verification failed',
        details: 'Invalid payment signature'
      }, { status: 400 });
    }

    console.log(`✅ Payment signature verified successfully`);

    // Get order from Firebase
    const orderRef = doc(firestore, 'cv_orders', razorpay_order_id);
    const orderDoc = await getDoc(orderRef);

    if (!orderDoc.exists()) {
      console.error(`❌ Order not found in database: ${razorpay_order_id}`);
      return NextResponse.json({
        error: 'Order not found',
        details: 'The order does not exist in our system'
      }, { status: 404 });
    }

    const orderData = orderDoc.data();

    // Check if already processed
    if (orderData.status === 'paid') {
      console.log(`⚠️ Order ${razorpay_order_id} already marked as paid`);
      return NextResponse.json({
        success: true,
        message: 'Payment already processed',
        orderId: razorpay_order_id,
        status: 'paid'
      });
    }

    // Update order status in Firebase
    const currentTimestamp = new Date().toISOString();
    await updateDoc(orderRef, {
      'payment.razorpayPaymentId': razorpay_payment_id,
      'payment.status': 'completed',
      'status': 'paid',
      'paidAt': currentTimestamp,
      'updatedAt': currentTimestamp
    });

    console.log(`✅ Order ${razorpay_order_id} marked as paid`);

    // Send confirmation email to customer
    const emailData = {
      customerName: orderData.customerDetails.fullName,
      customerEmail: orderData.customerDetails.email,
      orderId: razorpay_order_id,
      amount: orderData.serviceDetails.price,
      deliveryDays: orderData.serviceDetails.deliveryDays
    };

    // Send emails (non-blocking - don't wait for completion)
    sendCVOrderConfirmationEmail(emailData).catch(err =>
      console.error('Email send error:', err)
    );

    sendCVOrderAdminNotification(emailData).catch(err =>
      console.error('Admin notification error:', err)
    );

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      orderId: razorpay_order_id,
      orderDetails: {
        service: orderData.serviceDetails.type,
        amount: orderData.payment.amount / 100,
        customerEmail: orderData.customerDetails.email,
        deliveryDays: orderData.serviceDetails.deliveryDays
      }
    });

  } catch (error) {
    console.error('❌ Payment verification error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
