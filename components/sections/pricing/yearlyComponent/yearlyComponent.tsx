import PricingCard from '@/components/card/pricingCard/pricingCard';
import CheckPointscard from '@/components/common/checkPointscard/checkPointscard';
import React, { useEffect, useState } from 'react'
import { auth } from "@/lib/firebaseConfig/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";

const YearlyComponent = () => {
  const [showRazorpay, setShowRazorpay] = useState(false);
  const [minimizeFeatures, setMinimizeFeatures] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Listen for auth changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
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

  useEffect(() => {
    // Load Razorpay script once when component mounts - exactly like monthly
    const form = document.getElementById('razorpay-subscription-form-yearly');
    if (form && form.children.length === 0 && user) {
      const script = document.createElement('script');
      script.src = 'https://cdn.razorpay.com/static/widget/subscription-button.js';
      script.setAttribute('data-subscription_button_id', 'pl_QqCnmIE8a89Pst'); // Keep original for now
      script.setAttribute('data-button_theme', 'brand-color');
      
      // Add user data
      script.setAttribute('data-subscription_prefill_name', user.displayName || user.email);
      script.setAttribute('data-subscription_prefill_email', user.email);
      script.setAttribute('data-subscription_notes_userId', user.uid);
      
      script.async = true;
      form.appendChild(script);
    }
  }, [user]); // Only depend on user

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
          price="349"
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
                {user ? (
                  <>
                    <form id="razorpay-subscription-form-yearly">
                      {/* Razorpay script will be injected here by useEffect */}
                    </form>
                    <div className="text-xs text-white text-opacity-50 text-center">
                      Subscribing as: {user.email}
                    </div>
                  </>
                ) : (
                  <div className="text-center text-white text-opacity-70">
                    Please login first
                  </div>
                )}
                <button
                  onClick={handleMaximize}
                  className="font-manrope w-full font-medium text-[16px] leading-[160%] text-white text-opacity-70 hover:text-opacity-100 transition-all duration-300 underline"
                >
                  ← Back to details
                </button>
              </div>
              
              <style jsx>{`
                form#razorpay-subscription-form-yearly button {
                  font-family: inherit !important;
                  width: 100% !important;
                  font-weight: 700 !important;
                  font-size: 20px !important;
                  line-height: 160% !important;
                  border: 1px solid #5D29FF !important;
                  color: white !important;
                  border-radius: 9999px !important;
                  padding: 12px 20px !important;
                  background: linear-gradient(to right, #52A9FF, #5D29FF) !important;
                  transition: all 0.3s ease !important;
                }
                form#razorpay-subscription-form-yearly button:hover {
                  transform: translateY(-2px) !important;
                  box-shadow: 0 4px 15px rgba(93, 41, 255, 0.4) !important;
                }
              `}</style>
            </div>
          }
          earlyBirdButton={
            <button className="font-manrope font-[800] text-[16px] leading-[100%] text-white  border rounded-[30px] px-6 py-[10px]">
              Early-bird price
            </button>
          }
          crossText="1998"
          discount="25% Saved"
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

export default YearlyComponent;
