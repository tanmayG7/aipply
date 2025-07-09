// components/sections/pricing/monthlyComponent/monthlyComponent.tsx (UPDATED WITH TEST PLAN)
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
  const [isCreatingSubscription, setIsCreatingSubscription] = useState(false);
  const [subscriptionCreated, setSubscriptionCreated] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

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
    if (paymentSuccess) {
      alert("You already have an active subscription!");
      return;
    }
    setShowRazorpay(true);
    setMinimizeFeatures(true);
  };

  const handleMaximize = () => {
    if (!isCreatingSubscription && !subscriptionCreated) {
      setShowRazorpay(false);
      setMinimizeFeatures(false);
    }
  };

  const handleRazorpayPayment = async () => {
    if (!razorpayLoaded || !user || isCreatingSubscription || subscriptionCreated) {
      return;
    }

    setIsCreatingSubscription(true);

    try {
      console.log('🚀 Initiating Razorpay subscription...');
      console.log('👤 User:', user.email);

      if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
        throw new Error('Payment system not configured');
      }

      // Create subscription on backend
      const subscriptionResponse = await fetch('/api/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: 'plan_QqrdMIMXarYxg0', // TEST Plan ID (₹10)
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
      setSubscriptionCreated(true);

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        subscription_id: subscriptionData.subscriptionId,
        name: 'AiPply Premium',
        description: 'Monthly Premium Subscription (Test) - ₹10',
        
        handler: function (response: any) {
          console.log('✅ Payment successful:', response);
          setPaymentSuccess(true);
          
          // Show success message
          alert('🎉 Payment successful! Your premium subscription is now active. Welcome to AiPply Premium!');
          
          // Optionally redirect to dashboard
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 2000);
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
            setIsCreatingSubscription(false);
            // Don't reset subscriptionCreated here - subscription still exists
          }
        }
      };

      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', function (response: any) {
        console.error('❌ Payment failed - Full response:', response);
        console.error('❌ Error object:', response.error);
        console.error('❌ Error description:', response.error?.description);
        console.error('❌ Error code:', response.error?.code);
        console.error('❌ Error reason:', response.error?.reason);
        
        const errorMsg = response.error?.description || response.error?.reason || 'Payment failed';
        alert('Payment failed: ' + errorMsg);
        setIsCreatingSubscription(false);
      });

      rzp.open();

    } catch (error) {
      console.error('❌ Subscription creation failed:', error);
      alert('Failed to create subscription. Please try again.');
      setIsCreatingSubscription(false);
      setSubscriptionCreated(false);
    }
  };

  const getButtonContent = () => {
    if (paymentSuccess) {
      return {
        text: "✅ Subscription Active",
        disabled: true,
        className: "font-manrope w-full font-bold text-[20px] leading-[160%] border-green-500 text-white border rounded-full px-5 py-3 bg-green-600 cursor-not-allowed"
      };
    }
    
    if (isCreatingSubscription) {
      return {
        text: "Creating Subscription...",
        disabled: true,
        className: "font-manrope w-full font-bold text-[20px] leading-[160%] border-[#5D29FF] text-white border rounded-full px-5 py-3 bg-gradient-to-r from-[#52A9FF] to-[#5D29FF] opacity-50 cursor-not-allowed"
      };
    }
    
    if (subscriptionCreated) {
      return {
        text: "Complete Payment ⏳",
        disabled: true,
        className: "font-manrope w-full font-bold text-[20px] leading-[160%] border-orange-500 text-white border rounded-full px-5 py-3 bg-orange-600 cursor-not-allowed"
      };
    }
    
    return {
      text: user ? 'Subscribe Now (Test ₹10)' : 'Login to Subscribe',
      disabled: false,
      className: "font-manrope w-full font-bold text-[20px] leading-[160%] border-[#5D29FF] text-white border rounded-full px-5 py-3 bg-gradient-to-r from-[#52A9FF] to-[#5D29FF] hover:transform hover:translate-y-[-2px] hover:shadow-lg transition-all duration-300"
    };
  };

  const buttonContent = getButtonContent();

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
          planName="Premium Plan (Test)"
          subtitle="Save 85% of your time and land interviews faster"
          price="10"
          button={
            <div className="w-full">
              <div className={showRazorpay ? 'hidden' : 'block'}>
                <button 
                  onClick={handleSubscribeClick}
                  disabled={buttonContent.disabled}
                  className={buttonContent.className}
                >
                  {buttonContent.text}
                </button>
              </div>
              
              <div className={showRazorpay ? 'block space-y-3' : 'hidden'}>
                <button
                  onClick={handleRazorpayPayment}
                  disabled={!razorpayLoaded || isCreatingSubscription || subscriptionCreated || paymentSuccess}
                  className="font-manrope w-full font-bold text-[20px] leading-[160%] border-[#5D29FF] text-white border rounded-full px-5 py-3 bg-gradient-to-r from-[#52A9FF] to-[#5D29FF] hover:transform hover:translate-y-[-2px] hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreatingSubscription ? 'Creating...' : 
                   subscriptionCreated ? 'Processing...' :
                   paymentSuccess ? '✅ Completed' :
                   razorpayLoaded ? 'Pay ₹10 (Test)' : 'Loading...'}
                </button>
                
                <div className="text-xs text-white text-opacity-50 text-center">
                  Subscribing as: {user?.email}
                </div>
                
                {!isCreatingSubscription && !subscriptionCreated && (
                  <button
                    onClick={handleMaximize}
                    className="font-manrope w-full font-medium text-[16px] leading-[160%] text-white text-opacity-70 hover:text-opacity-100 transition-all duration-300 underline"
                  >
                    ← Back to details
                  </button>
                )}
                
                {subscriptionCreated && !paymentSuccess && (
                  <div className="text-sm text-orange-300 text-center">
                    Subscription created! Complete payment in the popup.
                  </div>
                )}
                
                {paymentSuccess && (
                  <div className="text-sm text-green-300 text-center">
                    🎉 Welcome to AiPply Premium! Redirecting to dashboard...
                  </div>
                )}
              </div>
            </div>
          }
          earlyBirdButton={
            <button className="font-manrope font-[800] text-[16px] leading-[100%] text-white  border rounded-[30px] px-6 py-[10px]">
              Test Mode - ₹10
            </button>
          }
          checkpoints={
            <div className="flex flex-col gap-4">
              {minimizeFeatures && (
                <button
                  onClick={handleMaximize}
                  disabled={isCreatingSubscription || subscriptionCreated}
                  className="font-manrope text-[14px] text-white text-opacity-70 hover:text-opacity-100 transition-all duration-300 text-left disabled:opacity-30"
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
