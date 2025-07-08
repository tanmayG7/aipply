// app/api/create-subscription/route.ts
import { NextRequest, NextResponse } from 'next/server';

const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET; // Add this to your .env.local

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Creating Razorpay subscription...');
    
    const { planId, userId, userEmail, userName } = await request.json();
    
    if (!planId || !userId || !userEmail) {
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      console.error('❌ Razorpay credentials not configured');
      return NextResponse.json({ 
        error: 'Payment system not configured' 
      }, { status: 500 });
    }

    // Create customer first
    const customerData = {
      name: userName,
      email: userEmail,
      notes: {
        userId: userId
      }
    };

    console.log('👤 Creating customer:', customerData);

    const customerResponse = await fetch('https://api.razorpay.com/v1/customers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64')}`
      },
      body: JSON.stringify(customerData)
    });

    const customer = await customerResponse.json();
    
    if (!customerResponse.ok) {
      console.error('❌ Customer creation failed:', customer);
      return NextResponse.json({ 
        error: 'Failed to create customer',
        details: customer
      }, { status: 400 });
    }

    console.log('✅ Customer created:', customer.id);

    // Create subscription
    const subscriptionData = {
      plan_id: planId,
      customer_id: customer.id,
      quantity: 1,
      notes: {
        userId: userId,
        planType: 'monthly'
      }
    };

    console.log('📄 Creating subscription:', subscriptionData);

    const subscriptionResponse = await fetch('https://api.razorpay.com/v1/subscriptions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64')}`
      },
      body: JSON.stringify(subscriptionData)
    });

    const subscription = await subscriptionResponse.json();
    
    if (!subscriptionResponse.ok) {
      console.error('❌ Subscription creation failed:', subscription);
      return NextResponse.json({ 
        error: 'Failed to create subscription',
        details: subscription
      }, { status: 400 });
    }

    console.log('✅ Subscription created:', subscription.id);

    return NextResponse.json({
      subscriptionId: subscription.id,
      customerId: customer.id,
      status: subscription.status
    });

  } catch (error) {
    console.error('❌ Subscription creation error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
