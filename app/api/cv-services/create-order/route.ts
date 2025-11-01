// app/api/cv-services/create-order/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { initializeApp, getApps, getApp } from 'firebase/app';

const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

// Initialize Firebase (reuse existing app if available)
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
    const { fullName, email, phone, userId } = await request.json();

    // Validate required fields
    if (!fullName || !email || !phone) {
      return NextResponse.json({
        error: 'Missing required fields',
        details: 'Full name, email, and phone are required'
      }, { status: 400 });
    }

    // Validate user is authenticated
    if (!userId) {
      return NextResponse.json({
        error: 'Authentication required',
        details: 'You must be logged in to purchase CV services'
      }, { status: 401 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({
        error: 'Invalid email format',
        details: 'Please provide a valid email address'
      }, { status: 400 });
    }

    // Validate phone format (Indian format)
    const phoneRegex = /^(\+91)?[6-9]\d{9}$/;
    const cleanPhone = phone.replace(/\s+/g, '');
    if (!phoneRegex.test(cleanPhone)) {
      return NextResponse.json({
        error: 'Invalid phone number',
        details: 'Please provide a valid Indian phone number'
      }, { status: 400 });
    }

    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      console.error('❌ Razorpay credentials not configured');
      return NextResponse.json({
        error: 'Payment system not configured',
        details: 'Please contact support'
      }, { status: 500 });
    }

    const auth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');

    // CV Service price in paisa (₹987 = 98700 paisa)
    const amount = 98700;
    const currency = 'INR';

    // Create Razorpay Order
    // Receipt ID must be <= 40 chars (Razorpay limit)
    // Using timestamp + last 8 chars of userId for uniqueness
    const timestamp = Date.now();
    const shortUserId = userId.slice(-8);
    const receiptId = `cv_${timestamp}_${shortUserId}`; // Max 25 chars

    const orderData = {
      amount: amount,
      currency: currency,
      receipt: receiptId,
      notes: {
        userId: userId, // Full userId stored in notes
        service: 'cv-writing',
        customerName: fullName,
        customerEmail: email,
        customerPhone: phone
      }
    };

    console.log(`📝 Creating Razorpay order for user ${userId}, amount: ₹${amount / 100}`);

    const orderResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`
      },
      body: JSON.stringify(orderData)
    });

    const order = await orderResponse.json();

    if (!orderResponse.ok) {
      console.error('❌ Razorpay order creation failed:', order);
      return NextResponse.json({
        error: 'Failed to create payment order',
        details: order.error?.description || 'Unknown error'
      }, { status: 400 });
    }

    console.log(`✅ Razorpay order created: ${order.id}`);

    // Store order in Firebase
    const currentTimestamp = new Date().toISOString();
    const orderDocument = {
      orderId: order.id,
      userId: userId,
      customerDetails: {
        fullName: fullName,
        email: email,
        phone: phone
      },
      payment: {
        razorpayOrderId: order.id,
        razorpayPaymentId: null,
        amount: amount,
        currency: currency,
        status: 'pending'
      },
      serviceDetails: {
        type: 'cv-writing',
        price: 987,
        deliveryDays: 48,
        features: [
          'ATS-Optimized CV',
          'Professional Formatting',
          'Keyword Optimization',
          '48-Hour Delivery',
          'Unlimited Revisions',
          'LinkedIn Profile Tips',
          'Cover Letter Template',
          'Lifetime Access'
        ]
      },
      status: 'payment_pending',
      createdAt: currentTimestamp,
      updatedAt: currentTimestamp
    };

    await setDoc(doc(firestore, 'cv_orders', order.id), orderDocument);
    console.log(`✅ Order saved to Firebase: ${order.id}`);

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: amount,
      currency: currency,
      key: RAZORPAY_KEY_ID
    });

  } catch (error) {
    console.error('❌ CV service order creation error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
