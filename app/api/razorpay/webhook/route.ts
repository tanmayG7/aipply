// app/api/create-subscription/route.ts (WITH DETAILED LOGGING)
import { NextRequest, NextResponse } from 'next/server';

const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 =================================');
    console.log('🔄 CREATE SUBSCRIPTION API CALLED');
    console.log('🔄 =================================');
    
    const { planId, userId, userEmail, userName } = await request.json();
    
    console.log('📝 Request body received:');
    console.log('  Plan ID:', planId);
    console.log('  User ID:', userId);
    console.log('  User Email:', userEmail);
    console.log('  User Name:', userName);
    
    if (!planId || !userId || !userEmail) {
      console.error('❌ Missing required fields');
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
    console.log('🔍 Searching for existing customer with email:', userEmail);
    
    const searchUrl = `https://api.razorpay.com/v1/customers?email=${encodeURIComponent(userEmail)}`;
    console.log('🔍 Search URL:', searchUrl);
    
    const existingCustomerResponse = await fetch(searchUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`
      }
    });

    console.log('🔍 Customer search response status:', existingCustomerResponse.status);

    if (existingCustomerResponse.ok) {
      const existingCustomerData = await existingCustomerResponse.json();
      console.log('🔍 Customer search result:', JSON.stringify(existingCustomerData, null, 2));
      
      if (existingCustomerData.items && existingCustomerData.items.length > 0) {
        // Customer exists, use the existing one
        customerId = existingCustomerData.items[0].id;
        console.log('✅ Found existing customer:', customerId);
        console.log('✅ Customer email from Razorpay:', existingCustomerData.items[0].email);
        console.log('✅ Customer name from Razorpay:', existingCustomerData.items[0].name);
      } else {
        console.log('📝 No existing customer found for email:', userEmail);
      }
    } else {
      console.error('❌ Failed to search for existing customer:', existingCustomerResponse.status);
    }

    // If no existing customer found, create a new one
    if (!customerId) {
      console.log('👤 Creating new customer for email:', userEmail);
      
      const customerData = {
        name: userName || userEmail,
        email: userEmail,
        notes: {
          userId: userId
        }
      };

      console.log('👤 Customer data to create:', JSON.stringify(customerData, null, 2));

      const customerResponse = await fetch('https://api.razorpay.com/v1/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${auth}`
        },
        body: JSON.stringify(customerData)
      });

      console.log('👤 Customer creation response status:', customerResponse.status);
      
      const customer = await customerResponse.json();
      console.log('👤 Customer creation result:', JSON.stringify(customer, null, 2));
      
      if (!customerResponse.ok) {
        console.error('❌ Customer creation failed');
        return NextResponse.json({ 
          error: 'Failed to create customer',
          details: customer
        }, { status: 400 });
      }

      customerId = customer.id;
      console.log('✅ New customer created with ID:', customerId);
    }

    // Create subscription
    console.log('📄 Creating subscription for customer:', customerId);
    
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

    console.log('📄 Subscription data:', JSON.stringify(subscriptionData, null, 2));

    const subscriptionResponse = await fetch('https://api.razorpay.com/v1/subscriptions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`
      },
      body: JSON.stringify(subscriptionData)
    });

    console.log('📄 Subscription creation response status:', subscriptionResponse.status);
    
    const subscription = await subscriptionResponse.json();
    console.log('📄 Subscription creation result:', JSON.stringify(subscription, null, 2));
    
    if (!subscriptionResponse.ok) {
      console.error('❌ Subscription creation failed');
      return NextResponse.json({ 
        error: 'Failed to create subscription',
        details: subscription
      }, { status: 400 });
    }

    console.log('✅ Subscription created successfully:', subscription.id);
    console.log('✅ Final customer ID used:', customerId);

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
