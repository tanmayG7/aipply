// app/api/create-subscription/route.ts (FIXED VERSION)
import { NextRequest, NextResponse } from 'next/server';

const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

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

    const auth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');
    let customerId;

    // First, try to find existing customer by email
    console.log('🔍 Checking for existing customer...');
    
    const existingCustomerResponse = await fetch(`https://api.razorpay.com/v1/customers?email=${encodeURIComponent(userEmail)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`
      }
    });

    if (existingCustomerResponse.ok) {
      const existingCustomerData = await existingCustomerResponse.json();
      
      if (existingCustomerData.items && existingCustomerData.items.length > 0) {
        // Customer exists, use the existing one
        customerId = existingCustomerData.items[0].id;
        console.log('✅ Found existing customer:', customerId);
      }
    }

    // If no existing customer found, create a new one
    if (!customerId) {
      console.log('👤 Creating new customer...');
      
      const customerData = {
        name: userName || userEmail,
        email: userEmail,
        notes: {
          userId: userId
        }
      };

      const customerResponse = await fetch('https://api.razorpay.com/v1/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${auth}`
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

      customerId = customer.id;
      console.log('✅ New customer created:', customerId);
    }

    // Create subscription
    console.log('📄 Creating subscription...');
    
    const subscriptionData = {
      plan_id: planId,
      customer_id: customerId,
      quantity: 1,
      total_count: 120, // 120 months = 10 years (effectively unlimited)
      notes: {
        userId: userId,
        planType: 'monthly'
      }
    };

    const subscriptionResponse = await fetch('https://api.razorpay.com/v1/subscriptions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`
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
      customerId: customerId,
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
