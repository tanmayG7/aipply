// components/sections/pricing/monthlyComponent/monthlyComponent.tsx (FIXED)
import PricingCard from "@/components/card/pricingCard/pricingCard";
import CheckPointscard from "@/components/common/checkPointscard/checkPointscard";
import React, { useEffect, useState } from "react";
import { auth } from "@/lib/firebaseConfig/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";

// Declare Razorpay for TypeScript
declare global {
  interface Window {
    Razorpay: any;
  }
}

const MonthlyComponent = () => {
  const [showRazorpay, setShowRazorpay] = useState(false);
  const [minimizeFeatures, setMinimizeFeatures] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  // Listen for auth changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => setRazorpayLoaded(true);
    script.onerror = () => console.error('Failed to load Razorpay');
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleSubscribeClick = () => {
    if (!user) {
      alert("Please login first to subscribe");
      return;
    }
    setShowRazorpay(true);
    setMinimizeFeatures(true);
  };

  const handleMaximize = () => {
    setShowRazorpay(false);
    setMinimizeFeatures(false);
  };

  const handleRazorpayPayment = async () => {
    if (!razorpayLoaded || !user) {
      alert('Payment system not ready or user not logged in');
      return;
    }

    console.log('🚀 Initiating Razorpay subscription...');
    console.log('👤 User:', user.email);
    console.log('📋 Plan ID: pl_QqIH3ysYHYPnEP');

    // Check if key is available
    if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
      console.error('❌ Razorpay key not configured');
      alert('Payment system not configured. Please contact support.');
      return;
    }

    try {
      // Create subscription on your backend first
      const subscriptionResponse = await fetch('/api/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: 'pl_QqIH3ysYHYPnEP',
          userId: user.uid,
          userEmail: user.email,
          userName: user.displayName || user.email
        }),
      });

      const subscriptionData = await subscriptionResponse.json();
      
      if (!subscriptionResponse.ok) {
        throw new Error(subscriptionData.error || 'Failed to create subscription');
      }

      console.log('📄 Subscription created:', subscriptionData.subscriptionId);

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        subscription_id: subscriptionData.subscriptionId, // Use the created subscription ID
        name: 'AiPply Premium',
        description: 'Monthly Premium Subscription - ₹666',
        
        handler: function (response: any) {
          console.log('✅ Payment successful:', response);
          alert('Payment successful! Your subscription is now active.');
          
          // Optionally refresh the page or redirect
          window.location.reload();
        },
        
        prefill: {
          name: user.displayName || user.email,
          email: user.email,
        },
        
        theme: {
          color: '#5D29FF'
        },
        
        modal: {
          ondismiss: function() {
            console.log('❌ Payment modal closed by user');
          }
        }
      };

      console.log('🔧 Razorpay options:', options);

      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', function (response: any) {
        console.error('❌ Payment failed:', response.error);
        alert('Payment failed: ' + response.error.description);
      });

      rzp.open();

    } catch (error) {
      console.error('❌ Subscription creation failed:', error);
      alert('Failed to create subscription. Please try again.');
    }
  };

  return (
    <div className="relative grid grid-cols-1 custom-lg:grid-cols-2 gap-[60px] ">
      <div>
        <PricingCard
          image="/static/pricingIcons/freeplan.svg"
          planName="Free Plan"
          subtitle="Kickstart your job search now!"
          price="0"
          button={
            <button className="font-manrope w-full font-bold text-[20px] leading-[160%] border-[#5D29FF] text-white border rounded-full px-5 py-3">
              Continue for free
            </button>
          }
          checkpoints={
            <div className="flex flex-col gap-4">
              <CheckPointscard
                imageUrl={"/static/icons/checkpoint.svg"}
                text="Custom Job Listings"
                opacity={true}
              />
              <CheckPointscard
                imageUrl={"/static/icons/checkpoint.svg"}
                text="Cover Letter Templates"
                opacity={true}
              />
              <CheckPointscard
                imageUrl={"/static/icons/checkpoint.svg"}
                text="ATS-Friendly CV Templates"
                opacity={true}
              />
              <CheckPointscard
                imageUrl={"/static/icons/checkpoint.svg"}
                text="Job Tracker"
                opacity={true}
              />
            </div>
          }
        />
      </div>

      <div className="border-2 border-[#FFFFFF4D] rounded-[20px] relative">
        <PricingCard
          image="/static/pricingIcons/premiumplan.svg"
          planName="Premium Plan"
          subtitle="Save 85% of your time and land interviews faster"
          price="666"
          button={
            <div className="w-full">
              <div className={showRazorpay ? 'hidden' : 'block'}>
                <button 
                  onClick={handleSubscribeClick}
                  className="font-manrope w-full font-bold text-[20px] leading-[160%] border-[#5D29FF] text-white border rounded-full px-5 py-3 bg-gradient-to-r from-[#52A9FF] to-[#5D29FF] hover:transform hover:translate-y-[-2px] hover:shadow-lg transition-all duration-300"
                >
                  {user ? 'Subscribe Now' : 'Login to Subscribe'}
                </button>
              </div>
              
              <div className={showRazorpay ? 'block space-y-3' : 'hidden'}>
                <button
                  onClick={handleRazorpayPayment}
                  disabled={!razorpayLoaded}
                  className="font-manrope w-full font-bold text-[20px] leading-[160%] border-[#5D29FF] text-white border rounded-full px-5 py-3 bg-gradient-to-r from-[#52A9FF] to-[#5D29FF] hover:transform hover:translate-y-[-2px] hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                >
                  {razorpayLoaded ? 'Pay ₹666' : 'Loading...'}
                </button>
                
                <div className="text-xs text-white text-opacity-50 text-center">
                  Subscribing as: {user?.email}
                </div>
                
                <button
                  onClick={handleMaximize}
                  className="font-manrope w-full font-medium text-[16px] leading-[160%] text-white text-opacity-70 hover:text-opacity-100 transition-all duration-300 underline"
                >
                  ← Back to details
                </button>
              </div>
            </div>
          }
          earlyBirdButton={
            <button className="font-manrope font-[800] text-[16px] leading-[100%] text-white  border rounded-[30px] px-6 py-[10px]">
              Early-bird price
            </button>
          }
          checkpoints={
            <div className="flex flex-col gap-4">
              {minimizeFeatures && (
                <button
                  onClick={handleMaximize}
                  className="font-manrope text-[14px] text-white text-opacity-70 hover:text-opacity-100 transition-all duration-300 text-left"
                >
                  Show all ↓
                </button>
              )}
              <div className={`overflow-hidden ${
                minimizeFeatures ? 'max-h-0 opacity-0' : 'max-h-[500px] opacity-100'
              }`}>
                <div className="flex flex-col gap-4">
                  <CheckPointscard
                    imageUrl={"/static/icons/checkpoint.svg"}
                    text="Everything in Free"
                    opacity={true}
                  />
                  <CheckPointscard
                    imageUrl={"/static/icons/checkpoint.svg"}
                    text="Unlimited Job Listings"
                    opacity={true}
                  />
                  <CheckPointscard
                    imageUrl={"/static/icons/checkpoint.svg"}
                    text="Auto Apply (100 jobs/month)"
                    opacity={true}
                  />
                  <CheckPointscard
                    imageUrl={"/static/icons/checkpoint.svg"}
                    text="AI Resume Builder"
                    opacity={true}
                  />
                  <CheckPointscard
                    imageUrl={"/static/icons/checkpoint.svg"}
                    text="AI Mock Interviews"
                    opacity={true}
                  />
                </div>
              </div>
            </div>
          }
        />
      </div>
    </div>
  );
};

export default MonthlyComponent;
