"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/common/header/header";
import Footer from "@/components/common/footer/footer";
import { ResponsivePageContainer } from "@/components/common/responsivePageContainer/responsivePageContainer";
import {
  CheckCircle,
  Clock,
  Shield,
  Star,
  CreditCard,
  FileText,
  User,
  Send,
  ChevronDown,
  Sparkles,
  Award,
  Target,
  Zap,
  Loader2,
  X,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { auth } from "@/lib/firebaseConfig/firebaseConfig";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";

// Extend Window interface for Razorpay
declare global {
  interface Window {
    Razorpay: any;
  }
}

// Form validation error types
interface FormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
}

export default function CVServicesPage() {
  // Authentication state
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const router = useRouter();

  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
  });

  // UI state
  const [activeAccordion, setActiveAccordion] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [generalError, setGeneralError] = useState<string>("");

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      console.log('✅ Razorpay script loaded');
      setRazorpayLoaded(true);
    };
    script.onerror = () => {
      console.error('❌ Failed to load Razorpay script');
      setGeneralError('Failed to load payment system. Please refresh the page.');
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Check authentication status
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);

      // Pre-fill form if user is logged in
      if (currentUser) {
        setFormData(prev => ({
          ...prev,
          fullName: currentUser.displayName || "",
          email: currentUser.email || "",
        }));
      }
    });

    return () => unsubscribe();
  }, []);

  // Form validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^(\+91)?[6-9]\d{9}$/;
    const cleanPhone = phone.replace(/\s+/g, '');
    return phoneRegex.test(cleanPhone);
  };

  const validateFullName = (name: string): boolean => {
    const nameParts = name.trim().split(/\s+/);
    return nameParts.length >= 2 && name.length >= 3 && name.length <= 50;
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (!validateFullName(formData.fullName)) {
      newErrors.fullName = "Please enter your full name (first and last name)";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = "Please enter a valid Indian phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error for this field when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
    setGeneralError("");
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    // Analytics: Track payment initiation
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'begin_checkout', {
        currency: 'INR',
        value: 987,
        items: [{
          item_id: 'cv_writing_service',
          item_name: 'Professional CV Writing Service',
          price: 987,
          quantity: 1
        }]
      });
    }

    // Check authentication
    if (!user) {
      setGeneralError("Please log in to continue with payment");

      // Analytics: Track abandoned checkout (not logged in)
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'checkout_abandoned', {
          reason: 'not_logged_in'
        });
      }

      setTimeout(() => {
        router.push("/onboarding/login");
      }, 2000);
      return;
    }

    // Validate form
    if (!validateForm()) {
      setGeneralError("Please fix the errors above");

      // Analytics: Track validation error
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'form_validation_error', {
          form_name: 'cv_payment_form'
        });
      }

      return;
    }

    // Check if Razorpay is loaded
    if (!razorpayLoaded || !window.Razorpay) {
      setGeneralError("Payment system not loaded. Please refresh the page.");
      return;
    }

    setIsProcessing(true);
    setGeneralError("");

    try {
      // Create order
      console.log('📝 Creating order...');
      const orderResponse = await fetch('/api/cv-services/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          userId: user.uid
        })
      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(orderData.details || orderData.error || 'Failed to create order');
      }

      console.log('✅ Order created:', orderData.orderId);

      // Open Razorpay modal
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'AiPply CV Services',
        description: 'Professional CV Writing Service',
        order_id: orderData.orderId,
        prefill: {
          name: formData.fullName,
          email: formData.email,
          contact: formData.phone
        },
        theme: {
          color: '#5D29FF'
        },
        handler: async function (response: any) {
          console.log('💳 Payment successful, verifying...');
          await verifyPayment(response);
        },
        modal: {
          ondismiss: function() {
            console.log('⚠️ Payment modal closed by user');
            setIsProcessing(false);
            setGeneralError("Payment cancelled. You can try again when ready.");
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response: any){
        console.error('❌ Payment failed:', response.error);
        setIsProcessing(false);
        setGeneralError(response.error.description || 'Payment failed. Please try again.');
      });

      rzp.open();

    } catch (error: any) {
      console.error('❌ Payment error:', error);
      setGeneralError(error.message || 'Something went wrong. Please try again.');
      setIsProcessing(false);
    }
  };

  const verifyPayment = async (response: any) => {
    try {
      console.log('🔐 Verifying payment signature...');
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

      if (!verifyResponse.ok) {
        throw new Error(verifyData.details || 'Payment verification failed');
      }

      console.log('✅ Payment verified successfully');

      // Analytics: Track successful purchase
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'purchase', {
          transaction_id: response.razorpay_order_id,
          value: 987,
          currency: 'INR',
          items: [{
            item_id: 'cv_writing_service',
            item_name: 'Professional CV Writing Service',
            price: 987,
            quantity: 1
          }]
        });

        // Track conversion
        (window as any).gtag('event', 'conversion', {
          send_to: 'AW-CONVERSION_ID/CONVERSION_LABEL', // Replace with actual conversion ID
          value: 987,
          currency: 'INR',
          transaction_id: response.razorpay_order_id
        });
      }

      // Facebook Pixel tracking (if configured)
      if (typeof window !== 'undefined' && (window as any).fbq) {
        (window as any).fbq('track', 'Purchase', {
          value: 987,
          currency: 'INR',
          content_name: 'Professional CV Writing Service',
          content_type: 'service'
        });
      }

      setOrderDetails(verifyData.orderDetails);
      setShowSuccessModal(true);
      setIsProcessing(false);

    } catch (error: any) {
      console.error('❌ Verification error:', error);

      // Analytics: Track payment failure
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'payment_failed', {
          error_message: error.message
        });
      }

      setGeneralError('Payment verification failed. Please contact support with your payment details.');
      setIsProcessing(false);
    }
  };

  const services = [
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "AI-Powered Optimization",
      description: "Our expert team uses cutting-edge AI to craft CVs that pass ATS systems and impress recruiters."
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "48-Hour Delivery",
      description: "Get your professionally crafted CV delivered within 48 hours, ready to land your dream job."
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Industry Expertise",
      description: "Tailored CVs for your specific industry with insights from hiring managers and recruiters."
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "100% Satisfaction",
      description: "Unlimited revisions until you're completely satisfied with your professional CV."
    }
  ];

  const processSteps = [
    {
      icon: <CreditCard className="w-10 h-10" />,
      title: "Secure Payment",
      description: "Complete your payment securely through our encrypted payment gateway."
    },
    {
      icon: <FileText className="w-10 h-10" />,
      title: "Share Details",
      description: "Provide your career information and preferences via our simple form."
    },
    {
      icon: <User className="w-10 h-10" />,
      title: "Expert Crafting",
      description: "Our professional writers create your optimized CV with care."
    },
    {
      icon: <Send className="w-10 h-10" />,
      title: "Receive & Apply",
      description: "Get your polished CV and start applying to your dream jobs."
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Software Engineer",
      avatar: "https://i.pravatar.cc/150?img=5",
      rating: 5,
      text: "The CV they created helped me land interviews at 3 top tech companies. Absolutely worth every penny!"
    },
    {
      name: "Michael Chen",
      role: "Marketing Manager",
      avatar: "https://i.pravatar.cc/150?img=12",
      rating: 5,
      text: "Professional, fast, and exactly what I needed. My new CV stands out from the competition."
    },
    {
      name: "Emily Rodriguez",
      role: "Product Designer",
      avatar: "https://i.pravatar.cc/150?img=9",
      rating: 5,
      text: "I was skeptical at first, but the results speak for themselves. Got my dream job within 2 weeks!"
    }
  ];

  const faqs = [
    {
      question: "How long does it take to receive my CV?",
      answer: "We deliver your professionally crafted CV within 48 hours of receiving your information and payment confirmation."
    },
    {
      question: "What if I'm not satisfied with the CV?",
      answer: "We offer unlimited revisions until you're completely satisfied. Your success is our priority, and we'll work with you until your CV is perfect."
    },
    {
      question: "Is my payment information secure?",
      answer: "Absolutely. We use industry-standard encryption and secure payment processing. Your financial information is never stored on our servers."
    },
    {
      question: "What information do I need to provide?",
      answer: "After payment, you'll receive a detailed form to fill out with your work experience, education, skills, and career goals. The more details you provide, the better we can tailor your CV."
    },
    {
      question: "Do you offer refunds?",
      answer: "Yes, we offer a 100% money-back guarantee if you're not satisfied with our service. Please refer to our refund policy for complete details."
    }
  ];

  return (
    <div className="bg-[#000000] min-h-screen">
      <Header />
      
      <main className="pt-20 md:pt-24">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          {/* Gradient blur background - OPTIMIZED */}
          <div className="hidden lg:block absolute w-full h-[600px] top-[100px] left-1/2 transform -translate-x-1/2 bg-[#AE94FF] bg-opacity-40 rounded-full blur-[120px] z-0 will-change-transform motion-reduce:blur-none"></div>
          
          <ResponsivePageContainer>
            <div className="relative z-10 pt-20 pb-32">
              <div className="max-w-4xl mx-auto text-center">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#AE94FF]/30 bg-[#AE94FF]/10 backdrop-blur-sm mb-8">
                  <Zap className="w-4 h-4 text-[#AE94FF]" />
                  <span className="text-sm font-medium text-[#F5F5F6]">Professional CV Services</span>
                </div>

                {/* Main headline */}
                <h1 className="font-manrope text-fluid-hero font-bold text-[#F5F5F6] mb-6 text-balance">
                  Land Your Dream Job with a{" "}
                  <span className="bg-gradient-to-r from-[#52A9FF] to-[#AE94FF] bg-clip-text text-transparent">
                    Professionally Crafted CV
                  </span>
                </h1>

                {/* Subheadline */}
                <p className="font-manrope text-fluid-lead text-[#CECFD2] mb-12 max-w-2xl mx-auto">
                  Expert-written CVs that pass ATS systems and impress recruiters. Get hired faster with a CV that showcases your true potential.
                </p>

                {/* CTA Button */}
                <a href="#payment" className="inline-block">
                  <Button 
                    size="lg"
                    className="bg-gradient-to-r from-[#52A9FF] to-[#5D29FF] hover:from-[#4298E8] hover:to-[#4C1FE8] text-white font-semibold px-8 py-6 text-lg rounded-full shadow-lg shadow-[#5D29FF]/30 transition-all duration-300 hover:shadow-xl hover:shadow-[#5D29FF]/40 hover:scale-105"
                  >
                    Get Your Professional CV Now
                  </Button>
                </a>

                {/* Trust indicators */}
                <div className="flex items-center justify-center gap-8 mt-12 flex-wrap">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-[#10B981]" />
                    <span className="text-sm text-[#CECFD2]">48-Hour Delivery</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-[#10B981]" />
                    <span className="text-sm text-[#CECFD2]">Secure Payment</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-[#10B981]" />
                    <span className="text-sm text-[#CECFD2]">500+ Happy Clients</span>
                  </div>
                </div>
              </div>
            </div>
          </ResponsivePageContainer>

          {/* Hero Image - MOBILE OPTIMIZED */}
          <ResponsivePageContainer>
            <div className="relative z-10 -mt-16 mb-20">
              <div className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] rounded-2xl overflow-hidden border-2 sm:border-4 border-[#333741] shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1601485770245-9abd905abc7b?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHw2fHxsYXB0b3AlMjB3b3Jrc3BhY2UlMjBkb2N1bWVudHMlMjBwcm9mZXNzaW9uYWx8ZW58MHwwfHx8MTc2MTU5ODQ0NHww&ixlib=rb-4.1.0&q=85"
                  alt="Modern professional workspace - Bennett Frazier on Unsplash"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              </div>
            </div>
          </ResponsivePageContainer>
        </section>

        {/* Service Overview Section */}
        <section className="py-20 relative">
          <ResponsivePageContainer>
            <div className="text-center mb-16">
              <h2 className="font-manrope text-fluid-section font-bold text-[#F5F5F6] mb-4">
                Why Choose Our CV Services?
              </h2>
              <p className="text-[#CECFD2] text-lg max-w-2xl mx-auto">
                We combine expert writing with AI-powered optimization to create CVs that get results.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {services.map((service, index) => (
                <Card 
                  key={index}
                  className="bg-[#0F0F0F] border-[#333741] p-6 hover:border-[#AE94FF]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#AE94FF]/10 group"
                >
                  <div className="text-[#AE94FF] mb-4 group-hover:scale-110 transition-transform duration-300">
                    {service.icon}
                  </div>
                  <h3 className="font-manrope text-xl font-semibold text-[#F5F5F6] mb-3">
                    {service.title}
                  </h3>
                  <p className="text-[#CECFD2] text-sm leading-relaxed">
                    {service.description}
                  </p>
                </Card>
              ))}
            </div>
          </ResponsivePageContainer>
        </section>

        {/* Pricing & Payment Section */}
        <section id="payment" className="py-16 md:py-20 relative scroll-mt-24">
          <div className="hidden lg:block absolute w-[60%] h-[300px] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#5D29FF] bg-opacity-20 rounded-full blur-[100px] z-0 will-change-transform motion-reduce:blur-none"></div>
          
          <ResponsivePageContainer>
            <div className="relative z-10 max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="font-manrope text-fluid-section font-bold text-[#F5F5F6] mb-4">
                  Get Your Professional CV Today
                </h2>
                <p className="text-[#CECFD2] text-lg">
                  One-time payment. Unlimited revisions. Lifetime access to your CV.
                </p>
              </div>

              <div className="grid lg:grid-cols-2 gap-6 md:gap-8">
                {/* Pricing Card */}
                <Card className="bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] border-[#AE94FF]/30 p-8">
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#AE94FF]/10 border border-[#AE94FF]/30 mb-4">
                      <Star className="w-4 h-4 text-[#AE94FF]" />
                      <span className="text-sm font-medium text-[#F5F5F6]">Most Popular</span>
                    </div>
                    <h3 className="font-manrope text-3xl font-bold text-[#F5F5F6] mb-2">
                      Professional CV Package
                    </h3>
                    <div className="flex items-baseline justify-center gap-2 mb-6">
                      <span className="text-5xl font-bold text-[#F5F5F6]">₹987</span>
                      <span className="text-[#CECFD2] line-through">₹1,999</span>
                    </div>
                    <p className="text-[#10B981] font-medium">Save 50% - Limited Time Offer!</p>
                  </div>

                  <Separator className="bg-[#333741] mb-6" />

                  <div className="space-y-4 mb-8">
                    {[
                      "ATS-Optimized CV",
                      "Professional Formatting",
                      "Keyword Optimization",
                      "48-Hour Delivery",
                      "Unlimited Revisions",
                      "LinkedIn Profile Tips",
                      "Cover Letter Template",
                      "Lifetime Access"
                    ].map((feature, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-[#10B981] flex-shrink-0" />
                        <span className="text-[#CECFD2]">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-center gap-2 text-sm text-[#CECFD2]">
                    <Shield className="w-4 h-4 text-[#10B981]" />
                    <span>100% Money-Back Guarantee</span>
                  </div>
                </Card>

                {/* Payment Form - SECURE VERSION */}
                <Card className="bg-[#0F0F0F] border-[#333741] p-6 md:p-8">
                  <h3 className="font-manrope text-xl md:text-2xl font-bold text-[#F5F5F6] mb-6">
                    Secure Payment
                  </h3>

                  {/* Authentication Notice */}
                  {authLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 text-[#AE94FF] animate-spin" />
                    </div>
                  ) : !user ? (
                    <div className="mb-6 p-4 bg-[#5D29FF]/10 border border-[#5D29FF]/30 rounded-lg">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-[#AE94FF] flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[#F5F5F6] font-medium mb-2">Login Required</p>
                          <p className="text-sm text-[#CECFD2] mb-4">
                            Please log in to your account to purchase CV services
                          </p>
                          <Link href="/onboarding/login">
                            <Button
                              size="sm"
                              className="bg-gradient-to-r from-[#52A9FF] to-[#5D29FF] hover:from-[#4298E8] hover:to-[#4C1FE8] text-white"
                            >
                              Log In
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  <form onSubmit={handlePayment} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-[#F5F5F6] text-sm font-medium">
                        Full Name <span className="text-red-400">*</span>
                      </Label>
                      <Input
                        id="fullName"
                        name="fullName"
                        type="text"
                        placeholder="John Doe"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        disabled={!user || isProcessing}
                        autoFocus
                        className={`bg-[#1A1A1A] border-[#333741] text-[#F5F5F6] focus-visible:ring-2 focus-visible:ring-[#AE94FF] transition-all ${
                          errors.fullName ? 'border-red-500 focus-visible:ring-red-500' : ''
                        }`}
                      />
                      {errors.fullName && (
                        <p className="text-sm text-red-400 flex items-center gap-1 mt-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.fullName}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-[#F5F5F6] text-sm font-medium">
                        Email Address <span className="text-red-400">*</span>
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={!user || isProcessing}
                        className={`bg-[#1A1A1A] border-[#333741] text-[#F5F5F6] focus-visible:ring-2 focus-visible:ring-[#AE94FF] transition-all ${
                          errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''
                        }`}
                      />
                      {errors.email && (
                        <p className="text-sm text-red-400 flex items-center gap-1 mt-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.email}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-[#F5F5F6] text-sm font-medium">
                        Phone Number <span className="text-red-400">*</span>
                      </Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="+91 9999999999"
                        value={formData.phone}
                        onChange={handleInputChange}
                        disabled={!user || isProcessing}
                        className={`bg-[#1A1A1A] border-[#333741] text-[#F5F5F6] focus-visible:ring-2 focus-visible:ring-[#AE94FF] transition-all ${
                          errors.phone ? 'border-red-500 focus-visible:ring-red-500' : ''
                        }`}
                      />
                      {errors.phone && (
                        <p className="text-sm text-red-400 flex items-center gap-1 mt-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.phone}
                        </p>
                      )}
                      <p className="text-xs text-[#9CA3AF]">
                        Indian phone numbers starting with 6-9
                      </p>
                    </div>

                    {/* General Error */}
                    {generalError && (
                      <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                        <p className="text-sm text-red-400 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 flex-shrink-0" />
                          {generalError}
                        </p>
                      </div>
                    )}

                    <Separator className="bg-[#333741]" />

                    <div className="space-y-4">
                      <Button
                        type="submit"
                        disabled={!user || isProcessing || !razorpayLoaded}
                        className="w-full bg-gradient-to-r from-[#52A9FF] to-[#5D29FF] hover:from-[#4298E8] hover:to-[#4C1FE8] text-white font-semibold py-6 text-base md:text-lg rounded-lg shadow-lg shadow-[#5D29FF]/30 transition-all duration-300 hover:shadow-xl hover:shadow-[#5D29FF]/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg"
                      >
                        {isProcessing ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Processing...
                          </span>
                        ) : (
                          <>
                            <span className="hidden sm:inline">Complete Payment - </span>
                            <span className="sm:hidden">Pay </span>
                            ₹987
                          </>
                        )}
                      </Button>

                      <div className="space-y-2">
                        <div className="flex items-center justify-center gap-2 text-xs text-[#9CA3AF]">
                          <Shield className="w-4 h-4 text-[#10B981]" />
                          <span>Secured by Razorpay - 256-bit SSL encryption</span>
                        </div>
                        <p className="text-center text-xs text-[#9CA3AF]">
                          Your card details are never stored on our servers
                        </p>
                      </div>
                    </div>
                  </form>
                </Card>
              </div>
            </div>
          </ResponsivePageContainer>
        </section>

        {/* Process Steps Section */}
        <section className="py-20 relative">
          <ResponsivePageContainer>
            <div className="text-center mb-16">
              <h2 className="font-manrope text-fluid-section font-bold text-[#F5F5F6] mb-4">
                How It Works
              </h2>
              <p className="text-[#CECFD2] text-lg max-w-2xl mx-auto">
                From payment to delivery, we've streamlined the process to get you results fast.
              </p>
            </div>

            <div className="relative max-w-5xl mx-auto">
              {/* Connection line */}
              <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-[#AE94FF]/20 via-[#AE94FF]/50 to-[#AE94FF]/20 transform -translate-y-1/2"></div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
                {processSteps.map((step, index) => (
                  <div key={index} className="relative">
                    <Card className="bg-[#0F0F0F] border-[#333741] p-6 text-center hover:border-[#AE94FF]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#AE94FF]/10 group">
                      {/* Step number */}
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full bg-gradient-to-r from-[#52A9FF] to-[#5D29FF] flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>

                      <div className="text-[#AE94FF] mb-4 flex justify-center group-hover:scale-110 transition-transform duration-300">
                        {step.icon}
                      </div>
                      <h3 className="font-manrope text-lg font-semibold text-[#F5F5F6] mb-3">
                        {step.title}
                      </h3>
                      <p className="text-[#CECFD2] text-sm">
                        {step.description}
                      </p>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          </ResponsivePageContainer>
        </section>

        {/* Testimonials Section */}
        <section className="py-16 md:py-20 relative">
          <div className="hidden lg:block absolute w-[50%] h-[200px] top-1/2 left-1/4 transform -translate-x-1/2 -translate-y-1/2 bg-[#AE94FF] bg-opacity-15 rounded-full blur-[100px] z-0 will-change-transform motion-reduce:blur-none"></div>
          
          <ResponsivePageContainer>
            <div className="relative z-10">
              <div className="text-center mb-16">
                <h2 className="font-manrope text-fluid-section font-bold text-[#F5F5F6] mb-4">
                  Success Stories
                </h2>
                <p className="text-[#CECFD2] text-lg max-w-2xl mx-auto">
                  Join hundreds of professionals who landed their dream jobs with our CV services.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {testimonials.map((testimonial, index) => (
                  <Card 
                    key={index}
                    className="bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] border-[#333741] p-6 hover:border-[#AE94FF]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#AE94FF]/10"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <Image
                        src={testimonial.avatar}
                        alt={`${testimonial.name} avatar`}
                        width={48}
                        height={48}
                        className="rounded-full"
                      />
                      <div>
                        <h4 className="font-manrope font-semibold text-[#F5F5F6]">
                          {testimonial.name}
                        </h4>
                        <p className="text-sm text-[#9CA3AF]">{testimonial.role}</p>
                      </div>
                    </div>

                    <div className="flex gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-[#FFA500] text-[#FFA500]" />
                      ))}
                    </div>

                    <p className="text-[#CECFD2] text-sm leading-relaxed">
                      "{testimonial.text}"
                    </p>
                  </Card>
                ))}
              </div>
            </div>
          </ResponsivePageContainer>
        </section>

        {/* FAQ Section */}
        <section className="py-20 relative">
          <ResponsivePageContainer>
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="font-manrope text-fluid-section font-bold text-[#F5F5F6] mb-4">
                  Frequently Asked Questions
                </h2>
                <p className="text-[#CECFD2] text-lg">
                  Everything you need to know about our CV services.
                </p>
              </div>

              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <Card
                    key={index}
                    className="bg-[#0F0F0F] border-[#333741] overflow-hidden"
                  >
                    <button
                      onClick={() => setActiveAccordion(activeAccordion === index ? null : index)}
                      className="w-full p-6 text-left flex items-center justify-between hover:bg-[#1A1A1A] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#AE94FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F0F0F]"
                      aria-expanded={activeAccordion === index}
                      aria-controls={`faq-answer-${index}`}
                      id={`faq-question-${index}`}
                    >
                      <h3 className="font-manrope font-semibold text-[#F5F5F6] pr-4">
                        {faq.question}
                      </h3>
                      <ChevronDown
                        className={`w-5 h-5 text-[#AE94FF] flex-shrink-0 transition-transform duration-300 ${
                          activeAccordion === index ? 'rotate-180' : ''
                        }`}
                        aria-hidden="true"
                      />
                    </button>

                    <div
                      id={`faq-answer-${index}`}
                      role="region"
                      aria-labelledby={`faq-question-${index}`}
                      className={`overflow-hidden transition-all duration-300 ${
                        activeAccordion === index ? 'max-h-96' : 'max-h-0'
                      }`}
                    >
                      <div className="px-6 pb-6">
                        <Separator className="bg-[#333741] mb-4" />
                        <p className="text-[#E5E7EB] leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </ResponsivePageContainer>
        </section>

        {/* Final CTA Section */}
        <section className="py-16 md:py-20 relative overflow-hidden">
          <div className="hidden lg:block absolute w-full h-full top-0 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-[#5D29FF]/20 via-[#AE94FF]/30 to-[#52A9FF]/20 blur-[100px] z-0 will-change-transform motion-reduce:blur-none"></div>
          
          <ResponsivePageContainer>
            <div className="relative z-10 max-w-4xl mx-auto text-center">
              <h2 className="font-manrope text-fluid-section font-bold text-[#F5F5F6] mb-6">
                Ready to Transform Your Career?
              </h2>
              <p className="text-[#CECFD2] text-lg mb-8 max-w-2xl mx-auto">
                Don't let a poorly written CV hold you back. Invest in your future today and get the professional CV you deserve.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 mb-8">
                <a href="#payment" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-gradient-to-r from-[#52A9FF] to-[#5D29FF] hover:from-[#4298E8] hover:to-[#4C1FE8] text-white font-semibold px-8 py-6 text-base md:text-lg rounded-full shadow-lg shadow-[#5D29FF]/30 transition-all duration-300 hover:shadow-xl hover:shadow-[#5D29FF]/40 hover:scale-105"
                  >
                    Get Started Now
                  </Button>
                </a>
                <Link href="/contact-us" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto border-[#AE94FF] text-[#AE94FF] hover:bg-[#AE94FF]/10 px-8 py-6 text-base md:text-lg rounded-full"
                  >
                    Contact Us
                  </Button>
                </Link>
              </div>

              <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#10B981]/10 border border-[#10B981]/30">
                <Clock className="w-5 h-5 text-[#10B981]" />
                <span className="text-[#F5F5F6] font-medium">Limited spots available this month!</span>
              </div>
            </div>
          </ResponsivePageContainer>
        </section>
      </main>

      {/* Success Modal */}
      {showSuccessModal && orderDetails && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <Card className="bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] border-[#10B981]/30 p-8 max-w-md w-full relative animate-in zoom-in duration-300">
            <button
              onClick={() => setShowSuccessModal(false)}
              className="absolute top-4 right-4 text-[#9CA3AF] hover:text-[#F5F5F6] transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center">
              {/* Success Icon */}
              <div className="mx-auto w-16 h-16 bg-[#10B981]/20 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-500">
                <CheckCircle className="w-10 h-10 text-[#10B981]" />
              </div>

              {/* Success Message */}
              <h3 className="font-manrope text-2xl font-bold text-[#F5F5F6] mb-3">
                Payment Successful!
              </h3>
              <p className="text-[#CECFD2] mb-6">
                Your order has been confirmed. We'll start working on your professional CV right away.
              </p>

              {/* Order Details */}
              <div className="bg-[#0F0F0F] border border-[#333741] rounded-lg p-4 mb-6 text-left">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#9CA3AF]">Service:</span>
                    <span className="text-[#F5F5F6] font-medium">CV Writing</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#9CA3AF]">Amount Paid:</span>
                    <span className="text-[#F5F5F6] font-medium">₹{orderDetails.amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#9CA3AF]">Delivery:</span>
                    <span className="text-[#F5F5F6] font-medium">{orderDetails.deliveryDays} hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#9CA3AF]">Email:</span>
                    <span className="text-[#F5F5F6] font-medium text-xs">{orderDetails.customerEmail}</span>
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              <div className="bg-[#5D29FF]/10 border border-[#5D29FF]/30 rounded-lg p-4 mb-6 text-left">
                <h4 className="font-semibold text-[#F5F5F6] mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#AE94FF]" />
                  Next Steps
                </h4>
                <ul className="space-y-2 text-sm text-[#CECFD2]">
                  <li className="flex items-start gap-2">
                    <span className="text-[#AE94FF] mt-1">•</span>
                    <span>Check your email for order confirmation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#AE94FF] mt-1">•</span>
                    <span>We'll send you a form to collect your CV details</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#AE94FF] mt-1">•</span>
                    <span>Receive your professionally crafted CV within 48 hours</span>
                  </li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => router.push("/dashboard/home")}
                  className="flex-1 bg-gradient-to-r from-[#52A9FF] to-[#5D29FF] hover:from-[#4298E8] hover:to-[#4C1FE8] text-white"
                >
                  Go to Dashboard
                </Button>
                <Button
                  onClick={() => setShowSuccessModal(false)}
                  variant="outline"
                  className="flex-1 border-[#AE94FF] text-[#AE94FF] hover:bg-[#AE94FF]/10"
                >
                  Close
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      <Footer />
    </div>
  );
}