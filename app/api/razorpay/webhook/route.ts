// app/api/razorpay/webhook/route.ts (STEP 3: Enable verification)
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  console.log('🔔 =================================');
  console.log('🔔 WEBHOOK WITH VERIFICATION');
  console.log('🔔 =================================');
  
  try {
    // Get the raw body and signature
    const body = await request.text();
    const signature = request.headers.get('x-razorpay-signature');
    
    console.log('📝 Body length:', body.length);
    console.log('🔐 Signature received:', signature || 'NULL');
    console.log('🔑 Webhook secret configured:', !!process.env.RAZORPAY_WEBHOOK_SECRET);
    
    if (!signature) {
      console.error('❌ Missing x-razorpay-signature header');
      return NextResponse.json({ 
        error: 'Missing signature header'
      }, { status: 400 });
    }
    
    if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
      console.error('❌ Webhook secret not configured');
      return NextResponse.json({ 
        error: 'Webhook secret not configured' 
      }, { status: 500 });
    }
    
    // Generate expected signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(body, 'utf8')
      .digest('hex');
    
    console.log('🔍 Expected signature:', expectedSignature);
    console.log('🔍 Received signature:', signature);
    console.log('🔍 Signatures match:', expectedSignature === signature);
    
    // Verify signature
    if (expectedSignature !== signature) {
      console.error('❌ Signature verification failed');
      return NextResponse.json({ 
        error: 'Invalid signature',
        debug: {
          expectedLength: expectedSignature.length,
          receivedLength: signature.length,
          expectedPreview: expectedSignature.substring(0, 10),
          receivedPreview: signature.substring(0, 10)
        }
      }, { status: 401 });
    }
    
    console.log('✅ Signature verified successfully');
    
    // Parse the event
    const event = JSON.parse(body);
    console.log('📧 Webhook event type:', event.event);
    
    if (event.payload?.subscription?.entity) {
      const sub = event.payload.subscription.entity;
      console.log('📧 Subscription ID:', sub.id);
      console.log('📧 Plan ID:', sub.plan_id);
      console.log('📧 User ID from notes:', sub.notes?.userId);
    }
    
    // For now, just log and return success
    console.log('✅ Webhook processed successfully');
    
    return NextResponse.json({ 
      status: 'success',
      event: event.event,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Webhook error:', error);
    return NextResponse.json({ 
      error: 'Webhook processing failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
