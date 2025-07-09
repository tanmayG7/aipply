// app/api/create-subscription/route.ts (UPDATED WITH TEST PLAN)
import { NextRequest, NextResponse } from 'next/server';

const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

export async function POST(request: NextRequest) {
  try {
    const { planId, userId, userEmail, userName } = await request.json();
    
    if (!planId || !userId || !userEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      return NextResponse.json({ error: 'Payment system not configured' }, { status: 500 });
    }

    const auth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');
    let customerId;

    // Check for existing customer
    const existingCustomerResponse = await fetch(`https://api.razorpay.com/v1/customers?email=${encodeURIComponent(userEmail)}`, {
      method: 'GET',
      headers: { 'Authorization': `Basic ${auth}` }
    });

    if (existingCustomerResponse.ok) {
      const existingCustomerData = await existingCustomerResponse.json();
      
      if (existingCustomerData.items && existingCustomerData.items.length > 0) {
        const matchingCustomer = existingCustomerData.items.find(
          (customer: any) => customer.email === userEmail
        );
        
        if (matchingCustomer) {
          customerId = matchingCustomer.id;
        }
      }
    }

    // Create new customer if needed
    if (!customerId) {
      const customerData = {
        name: userName || userEmail,
        email: userEmail,
        notes: { userId: userId }
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
        return NextResponse.json({ error: 'Failed to create customer', details: customer }, { status: 400 });
      }

      customerId = customer.id;
    }

    // Set total_count based on exact plan ID match
    let totalCount = 50;
    let planType = 'monthly';
    
    // TEST Plan ID (₹1)
    if (planId === 'plan_Qqp7I7yW23U7jJ') {
      totalCount = 50;
      planType = 'monthly';
    } 
    // LIVE Plan IDs
    else if (planId === 'plan_Qpq8Ccn726wjfX') {
      totalCount = 50;
      planType = 'monthly';
    } else if (planId === 'plan_Qpq96uaFwtJnrF') {
      totalCount = 16;
      planType = 'quarterly';
    } else if (planId === 'plan_QpqBIEeMGX2B2C') {
      totalCount = 5;
      planType = 'yearly';
    } else {
      return NextResponse.json({ error: 'Invalid plan ID' }, { status: 400 });
    }
    
    console.log(`✅ Creating subscription for plan ${planId} (${planType}) with ${totalCount} cycles`);
    
    const subscriptionData = {
      plan_id: planId,
      customer_id: customerId,
      quantity: 1,
      total_count: totalCount,
      notes: {
        userId: userId,
        planType: planType
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
      return NextResponse.json({ error: 'Failed to create subscription', details: subscription }, { status: 400 });
    }

    console.log(`✅ Created subscription ${subscription.id} for user ${userId}`);

    return NextResponse.json({
      subscriptionId: subscription.id,
      customerId: customerId,
      status: subscription.status,
      planType: planType
    });

  } catch (error) {
    console.error('❌ Subscription creation error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
