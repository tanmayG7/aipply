"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  Shield,
  Sparkles,
  Loader2,
  ExternalLink,
  X,
  CheckCircle2
} from "lucide-react";
import { auth, getUserProfile } from "@/lib/firebaseConfig/firebaseConfig";
import CVOrdersCard from "@/components/dashboard/CVOrdersCard";
import type { RazorpayResponse } from "@/types/razorpay";
import type React from "react";

interface UserData {
  userId: string;
  fullName: string;
  email: string;
  phone: string;
}

export default function DashboardCVServices() {
  const router = useRouter();

  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [orderDetails, setOrderDetails] = useState<{
    orderId: string;
    amount: number;
    deliveryDays: number;
  } | null>(null);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    script.onerror = () => console.error('❌ Failed to load Razorpay script');
    document.body.appendChild(script);
    return () => { if (document.body.contains(script)) document.body.removeChild(script); };
  }, []);

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Guard: auth must be initialized
        if (!auth) {
          router.push('/dashboard/onboarding/login?redirect=/dashboard/cv-services');
          return;
        }

        const user = auth?.currentUser;

        if (!user) {
          console.log('No user logged in, redirecting to login');
          router.push('/dashboard/onboarding/login?redirect=/dashboard/cv-services');
          return;
        }

        const profile = await getUserProfile(user.uid);
        const fullName = `${profile.firstName || ''} ${profile.lastName || ''}`.trim();

        setUserData({
          userId: user.uid,
          fullName: fullName || user.displayName || '',
          email: profile.email || user.email || '',
          phone: profile.phone || ''
        });
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [router]);

  const verifyPayment = async (response: RazorpayResponse) => {
    try {
      const verifyResponse = await fetch('/api/cv-services/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature
        })
      });

      const verifyData = await verifyResponse.json();

      if (verifyResponse.ok && verifyData.success) {
        setOrderDetails({
          orderId: verifyData.orderId,
          amount: verifyData.orderDetails?.amount || 987,
          deliveryDays: verifyData.orderDetails?.deliveryDays || 48
        });
        setShowSuccessModal(true);

        if (typeof window !== 'undefined' && window.fbq) {
          window.fbq('track', 'Purchase', {
            value: 987,
            currency: 'INR',
            content_type: 'product',
            content_name: 'CV Services'
          });
        }
      } else {
        throw new Error(verifyData.error || 'Payment verification failed');
      }
    } catch (error) {
      console.error('❌ Payment verification error:', error);
      alert('Payment verification failed. Please contact support with your payment details.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayment = async () => {
    if (!userData || !razorpayLoaded) return;
    setIsProcessing(true);
    try {
      const orderResponse = await fetch('/api/cv-services/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(errorData.error || 'Failed to create order');
      }

      const orderData = await orderResponse.json();

      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        order_id: orderData.orderId,
        name: 'AiPply',
        description: 'Professional CV Writing Service',
        image: '/static/icons/logo.svg',
        prefill: { name: userData.fullName, email: userData.email, contact: userData.phone },
        theme: { color: '#5D29FF' },
        handler: async function (response: RazorpayResponse) { await verifyPayment(response); },
        modal: { ondismiss: function() { setIsProcessing(false); } }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('❌ Payment error:', error);
      alert(error instanceof Error ? error.message : 'Payment failed. Please try again.');
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <SidebarProvider style={{ "--sidebar-width": "19rem" } as React.CSSProperties}>
        <AppSidebar />
        <SidebarInset>
          <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6 relative bg-[#020218] text-white overflow-x-hidden min-h-screen">
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 text-[#AE94FF] animate-spin" />
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider style={{ "--sidebar-width": "19rem" } as React.CSSProperties}>
      <AppSidebar />
      <SidebarInset>
        <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6 relative bg-[#020218] text-white overflow-x-hidden min-h-screen">

          <div className="mb-6">
            <h1 className="font-manrope text-3xl font-bold text-[#F5F5F6] mb-2">CV Services</h1>
            <p className="text-[#CECFD2]">Get your professionally crafted, ATS-optimized CV in 48 hours</p>
          </div>

          <Card className="bg-[#0F0F0F] border-[#333741] p-8 max-w-2xl">
            <div className="flex items-center justify-center mb-6">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#52A9FF]/20 to-[#5D29FF]/20 border border-[#5D29FF]/30 px-4 py-2 rounded-full">
                <Sparkles className="w-4 h-4 text-[#AE94FF]" />
                <span className="text-sm font-semibold text-[#AE94FF]">Most Popular</span>
              </div>
            </div>

            <h3 className="text-center text-2xl font-bold text-[#F5F5F6] mb-4">Professional CV Package</h3>

            <div className="text-center mb-2">
              <div className="flex items-center justify-center gap-3 mb-2">
                <span className="text-5xl font-bold text-[#F5F5F6]">₹987</span>
                <span className="text-[#CECFD2] line-through text-xl">₹1,999</span>
              </div>
              <p className="text-[#10B981] font-medium">Save 50% - Limited Time Offer!</p>
            </div>

            <Separator className="bg-[#333741] my-6" />

            <div className="space-y-4 mb-8">
              {["ATS-Optimized CV","Professional Formatting","Keyword Optimization","48-Hour Delivery","Unlimited Revisions","LinkedIn Profile Tips","Cover Letter Template","Lifetime Access"].map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-[#10B981] flex-shrink-0" />
                  <span className="text-[#CECFD2]">{feature}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-2 text-sm text-[#CECFD2] mb-6">
              <Shield className="w-4 h-4 text-[#10B981]" />
              <span>100% Money-Back Guarantee</span>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handlePayment}
                disabled={isProcessing || !razorpayLoaded}
                className="w-full bg-gradient-to-r from-[#52A9FF] to-[#5D29FF] hover:from-[#4298E8] hover:to-[#4C1FE8] text-white font-semibold py-6 text-lg shadow-lg shadow-[#5D29FF]/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2"><Loader2 className="w-5 h-5 animate-spin" />Processing...</div>
                ) : !razorpayLoaded ? (
                  <div className="flex items-center gap-2"><Loader2 className="w-5 h-5 animate-spin" />Loading Payment System...</div>
                ) : (
                  'Get Professional CV - ₹987'
                )}
              </Button>

              <Button onClick={() => router.push('/cv-services')} variant="outline" className="w-full border-[#AE94FF] text-[#AE94FF] hover:bg-[#AE94FF]/10 py-6 text-base">
                <ExternalLink className="w-4 h-4 mr-2" />Learn More About CV Services
              </Button>
            </div>
          </Card>

          <div className="mt-8 max-w-2xl">
            <CVOrdersCard />
          </div>

          {showSuccessModal && orderDetails && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
              <Card className="bg-[#0F0F0F] border-[#333741] p-8 max-w-md w-full relative">
                <button onClick={() => setShowSuccessModal(false)} className="absolute top-4 right-4 text-[#9CA3AF] hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-[#10B981]/20 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-[#10B981]" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-center text-[#F5F5F6] mb-4">Payment Successful!</h2>
                <div className="space-y-4 text-center mb-6">
                  <p className="text-[#CECFD2]">Your CV service order has been confirmed. We&apos;ll deliver your professionally crafted CV within {orderDetails.deliveryDays} hours.</p>
                  <p className="text-sm text-[#9CA3AF]">Order ID: <span className="text-[#AE94FF] font-mono">{orderDetails.orderId}</span></p>
                </div>
                <div className="bg-[#5D29FF]/10 border border-[#5D29FF]/30 rounded-lg p-4 mb-6">
                  <p className="text-sm text-[#CECFD2]">
                    <strong className="text-[#AE94FF]">Next Steps:</strong><br />
                    1. Check your email for the information collection form<br />
                    2. Fill in your career details and preferences<br />
                    3. Our experts will craft your CV<br />
                    4. Receive your professional CV via email
                  </p>
                </div>
                <Button onClick={() => setShowSuccessModal(false)} className="w-full bg-gradient-to-r from-[#52A9FF] to-[#5D29FF] hover:from-[#4298E8] hover:to-[#4C1FE8] text-white font-semibold">
                  Got it!
                </Button>
              </Card>
            </div>
          )}

        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
