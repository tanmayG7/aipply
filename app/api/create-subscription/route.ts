// app/api/create-subscription/route.ts (DEBUG VERSION)
import { NextRequest, NextResponse } from 'next/server';

const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 =================================');
    console.log('🔄 CREATE SUBSCRIPTION API CALLED');
    console.log('🔄 =================================');
    
    const body = await request.json();
    console.log('📝 Request body:', body);
    
    const { planId, userId, userEmail, userName } = body;
    
    console.log('📋 Extracted data:');
    console.log('  Plan ID:', planId);
    console.log('  User ID:', userId);
    console.log('  User Email:', userEmail);
    console.log('  User Name:', userName);
    
    console.log('🔑 Environment check:');
    console.log('  RAZORPAY_KEY_ID configured:', !!RAZORPAY_KEY_ID);
    console.log('  RAZORPAY_KEY_SECRET configured:', !!RAZORPAY_KEY_SECRET);
    console.log('  KEY_ID length:', RAZORPAY_KEY_ID?.length || 0);
    console.log('  KEY_SECRET length:', RAZORPAY_KEY_SECRET?.length || 0);
    
    if (!planId || !userId || !userEmail) {
      console.error('❌ Missing required fields');
      return NextResponse.json({ 
        error: 'Missing required fields',
        received: { planId: !!planId, userId: !!userId, userEmail: !!userEmail }
      }, { status: 400 });
    }

    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      console.error('❌ Razorpay credentials not configured');
      return NextResponse.json({ 
        error: 'Payment system not configured',
        debug: {
          hasKeyId: !!RAZORPAY_KEY_ID,
          hasKeySecret: !!RAZORPAY_KEY_SECRET
        }
      }, { status: 500 });
    }

    // Create customer first
    const customerData = {
      name: userName || userEmail,
      email: userEmail,
      notes: {
        userId: userId
      }
    };

    console.log('👤 Creating customer with data:', customerData);

    const auth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');
    console.log('🔐 Auth header length:', auth.length);

    const customerResponse = await fetch('https://api.razorpay.com/v1/customers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`
      },
      body: JSON.stringify(customerData)
    });

    console.log('👤 Customer response status:', customerResponse.status);
    
    const customer = await customerResponse.json();
    console.log('👤 Customer response:', customer);
    
    if (!customerResponse.ok) {
      console.error('❌ Customer creation failed');
      return NextResponse.json({ 
        error: 'Failed to create customer',
        details: customer,
        status: customerResponse.status
      }, { status: 400 });
    }

    console.log('✅ Customer created successfully:', customer.id);

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

    console.log('📄 Creating subscription with data:', subscriptionData);

    const subscriptionResponse = await fetch('https://api.razorpay.com/v1/subscriptions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`
      },
      body: JSON.stringify(subscriptionData)
    });

    console.log('📄 Subscription response status:', subscriptionResponse.status);
    
    const subscription = await subscriptionResponse.json();
    console.log('📄 Subscription response:', subscription);
    
    if (!subscriptionResponse.ok) {
      console.error('❌ Subscription creation failed');
      return NextResponse.json({ 
        error: 'Failed to create subscription',
        details: subscription,
        status: subscriptionResponse.status
      }, { status: 400 });
    }

    console.log('✅ Subscription created successfully:', subscription.id);

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
