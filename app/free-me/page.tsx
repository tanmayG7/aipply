// app/free-me/page.tsx
"use client";
import Footer from "@/components/common/footer/footer";
import Header from "@/components/common/header/header";
import { ResponsivePageContainer } from "@/components/common/responsivePageContainer/responsivePageContainer";
import ScrollToTopBtn from "@/components/common/scrollToTopBtn/scrollToTopBtn";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import TestimonialsCard from "@/components/card/testimonialsCard/testimonialsCard";
import { Icon } from "@/components/ui/Icon";
import type { RazorpayOptions, RazorpayResponse, RazorpayErrorResponse } from "@/types/razorpay";

const FreeMeSpecial = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 18,
    hours: 0,
    minutes: 0
  });
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    const targetDate = new Date('2025-08-15T23:59:59').getTime();
    
    const updateCountdown = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
        });
      }
    };

    const timer = setInterval(updateCountdown, 60000);
    updateCountdown();

    return () => clearInterval(timer);
  }, []);

useEffect(() => {
  // Listen for Razorpay payment success
  const handlePaymentSuccess = (event: MessageEvent) => {
    if (event.data && event.data.action === 'payment_success') {
      setPaymentSuccess(true);
    }
  };

  window.addEventListener('message', handlePaymentSuccess);

  return () => {
    window.removeEventListener('message', handlePaymentSuccess);
  };
}, []);

const openRazorpayPayment = () => {
  // Load Razorpay checkout script if not already loaded
  if (!window.Razorpay) {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => initializePayment();
    document.head.appendChild(script);
  } else {
    initializePayment();
  }
};

const initializePayment = () => {
  const options: RazorpayOptions = {
    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Your Razorpay key
    amount: 19470, // Amount in paisa (₹194.7)
    currency: 'INR',
    name: 'AiPply',
    description: 'Free-me Independence Special - 1 Month Trial',
    image: '/favicon.ico', // Your logo
    handler: function (response: RazorpayResponse) {
      console.log('✅ Payment successful:', response);
      setPaymentSuccess(true);
    },
    prefill: {
      name: '',
      email: '',
      contact: ''
    },
    theme: {
      color: '#20CEB6'
    },
    modal: {
      ondismiss: function() {
        console.log('❌ Payment cancelled by user');
      }
    }
  };

  const rzp = new window.Razorpay(options);
  rzp.on('payment.failed', function (response: RazorpayErrorResponse) {
    console.error('❌ Payment failed:', response.error);
    alert('Payment failed: ' + response.error.description);
  });

  rzp.open();
};
  const testimonials = [
    {
      name: "Sabya Sachi Mishra",
      designation: "Data Scientist, BEACON Consulting", 
      review: "AiPply.io made my job search effortless! The automated matches and tracking saved me hours, and I never missed an opportunity. Highly recommend!",
      image: "/static/images/testimonialsabya2.png"
    },
    {
      name: "Kartikeya Madnani",
      designation: "Sales Development Representative, CultureX",
      review: "AiPply.io took away my stress and manual effort. The tool is trustworthy and gives actual trackable results.",
      image: "/static/images/testimonialkartikeya2.png"
    },
    {
      name: "Kunal Gupta", 
      designation: "Sales Manager, InfoEdge",
      review: "Not only I landed a great company, but also in my choice of location and range. Thanks a ton!",
      image: "/static/images/testimonialkunal2.png"
    }
  ];

  const problems = [
    {
      iconName: "clock" as const,
      title: "Endless Hours Wasted",
      description: "Spending 3+ hours daily filling repetitive application forms instead of preparing for interviews"
    },
    {
      iconName: "ghost" as const,
      title: "Getting Ghosted",
      description: "Companies ignoring your applications, leaving you wondering what went wrong"
    },
    {
      iconName: "users" as const,
      title: "Missing Opportunities",
      description: "Great jobs getting filled while you're stuck with manual applications"
    },
    {
      iconName: "alert-triangle" as const,
      title: "Application Burnout",
      description: "Feeling drained from the soul-crushing, repetitive job application process"
    }
  ];

  const solutions = [
    {
      iconName: "bot" as const,
      title: "Smart AI Agent",
      description: "Applies to 50+ relevant jobs daily while you sleep"
    },
    {
      iconName: "bar-chart" as const,
      title: "Live Dashboard",
      description: "Watch your AI work - every application tracked in real-time"
    },
    {
      iconName: "target" as const,
      title: "Perfect Targeting",
      description: "AI matches your skills to ideal roles automatically"
    },
    {
      iconName: "zap" as const,
      title: "Lightning Speed",
      description: "Apply to 100s of jobs in minutes, be first in line"
    }
  ];

  const features = [
    "20+ daily job applications",
    "Live application tracking",
    "CAPTCHA solving included",
    "Skill-based job matching",
    "24/7 automated applying"
  ];

  const CountdownDigit = ({ value, label }: { value: number; label: string }) => (
    <div className="text-center">
      <div className="bg-gradient-to-r from-[#FF9933] via-[#FFFFFF] to-[#138808] p-1 rounded-[15px]">
        <div className="bg-black text-white rounded-[12px] p-4 font-manrope font-black text-[32px] min-w-[80px]">
          {String(value).padStart(2, '0')}
        </div>
      </div>
      <p className="font-manrope text-sm text-[#B0B0B0] mt-2">{label}</p>
    </div>
  );

  const FeatureCard = ({ iconName, title, description, variant }: {
    iconName: string;
    title: string;
    description: string;
    variant: "problem" | "solution";
  }) => (
    <div className={`bg-[#111111] bg-opacity-50 border ${variant === "problem" ? "border-red-500" : "border-green-500"} border-opacity-20 rounded-[20px] p-6 transition-all duration-300 hover:border-opacity-40 hover:transform hover:-translate-y-1`}>
      <div className="flex items-start gap-4">
        <Icon name={iconName} size={32} className={variant === "problem" ? "text-red-400" : "text-green-400"} ariaLabel={title} />
        <div className="flex flex-col gap-3">
          <h3 className={`font-manrope text-[20px] font-semibold ${variant === "problem" ? "text-red-400" : "text-green-400"}`}>
            {title}
          </h3>
          <p className="font-manrope text-[16px] text-[#B0B0B0] leading-[150%]">
            {description}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative min-h-screen">
      {/* Background */}
      <div className="fixed inset-0 w-full h-full pointer-events-none z-0">
        <div className="absolute w-[800px] h-[800px] top-[200px] left-1/2 transform -translate-x-1/2 bg-[#AE94FF] bg-opacity-30 blur-[200px] rounded-full"></div>
      </div>

      <div className="relative z-10">
        <div className="pt-7">
          <Header />
        </div>

        {/* Hero Section */}
        <ResponsivePageContainer>
          <div className="py-8 relative z-20">
            <div className="text-center">
              {/* Badge */}
              <div className="inline-block bg-gradient-to-r from-[#FF9933] via-[#FFFFFF] to-[#138808] p-1 rounded-full mb-6">
                <div className="bg-black text-white py-2 px-6 rounded-full font-manrope font-medium text-sm flex items-center gap-2">
                  <Icon name="sparkles" size={16} ariaLabel="Special offer" />
                  Free-me Independence Special
                </div>
              </div>

              {/* Main Headline */}
              <h1 className="font-manrope text-[48px] custom-md:text-[72px] font-bold text-[#F5F5F6] mb-4 leading-tight">
                <span className="bg-gradient-to-r from-[#20CEB6] to-[#2E2ADC] bg-clip-text text-transparent">
                  Free Me From Job Hunting
                </span>
              </h1>
              
              <p className="font-manrope text-[24px] text-[#CECFD2] max-w-4xl mx-auto mb-8 leading-relaxed">
                Save 2 hours daily. Apply to 600+ jobs monthly. Let recruiters call you.
              </p>

              {/* Pricing Card */}
              <div className="max-w-lg mx-auto mb-8">
                <div className="bg-gradient-to-r from-[#FF9933] via-[#FFFFFF] to-[#138808] p-1 rounded-[24px]">
                  <div className="bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] rounded-[20px] p-6 text-center">
                    <h3 className="font-manrope text-3xl font-bold text-white mb-4 flex items-center gap-3 justify-center">
                      <Icon name="target" size={28} ariaLabel="Target" />
                      Free-me Special
                    </h3>
                    
                    <div className="flex items-center justify-center gap-6 mb-4">
                      <div className="text-center">
                        <p className="font-manrope text-red-300 line-through text-lg">₹999</p>
                        <p className="font-manrope text-red-300 line-through text-xl">Regular</p>
                      </div>
                      <div className="text-6xl text-white">→</div>
                      <div className="text-center">
                        <p className="font-manrope text-6xl font-black text-yellow-300">₹194.7</p>
                        <p className="font-manrope text-white text-xl">First Month</p>
                      </div>
                    </div>

                    <div className="bg-white bg-opacity-20 rounded-[16px] p-4 mb-6 backdrop-blur-sm">
                      <h4 className="font-manrope text-xl font-bold text-white mb-3">What You Get:</h4>
                      <div className="grid grid-cols-1 gap-2 text-left">
                        {features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-3 text-white">
                            <Icon name="check" size={18} className="text-green-300" aria-hidden="true" />
                            <span className="font-manrope">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button onClick={() => openRazorpayPayment()} className="w-full bg-gradient-to-r from-[#20CEB6] to-[#2E2ADC] text-white py-4 px-8 rounded-full font-manrope font-bold text-xl hover:scale-105 transition-all shadow-lg">1 month Trial</button>
                    
                    {/* Payment Success Message */}
                    {paymentSuccess && (
                      <div className="mt-6 bg-green-600 bg-opacity-20 border border-green-500 border-opacity-40 rounded-[16px] p-6 text-center backdrop-blur-sm">
                        <div className="mb-3">
                          <Icon name="sparkles" size={32} ariaLabel="Celebration" />
                        </div>
                        <h4 className="font-manrope text-xl font-bold text-green-300 mb-3">
                          Payment Successful!
                        </h4>
                        <p className="font-manrope text-white mb-4 leading-relaxed">
                          Thank you for your purchase! Your payment receipt will be sent to your email shortly. 
                        </p>
                        <p className="font-manrope text-green-200 mb-4 text-sm flex items-center gap-2">
                          <Icon name="calendar-days" size={16} ariaLabel="Calendar" inline />
                          Your subscription will be active from <strong>August 16th, 2025</strong> for 1 month
                        </p>
                        <p className="font-manrope text-white mb-4">
                          Ready to get started? Register with the same email ID you used for payment.
                        </p>
                        <Link href="dashboard/onboarding/login">
                          <button className="bg-gradient-to-r from-[#10B981] to-[#059669] text-white py-3 px-8 rounded-full font-manrope font-bold text-lg hover:scale-105 transition-all shadow-lg">
                            Login / Register Now
                          </button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Countdown */}
              <div className="mb-12">
                <h3 className="font-manrope text-2xl font-semibold text-[#F5F5F6] mb-4 flex items-center gap-2 justify-center">
                  <Icon name="alarm-clock" size={24} ariaLabel="Timer" inline />
                  Offer Ends In:
                </h3>
                <div className="flex justify-center gap-6">
                  <CountdownDigit value={timeLeft.days} label="Days" />
                  <CountdownDigit value={timeLeft.hours} label="Hours" />
                  <CountdownDigit value={timeLeft.minutes} label="Minutes" />
                </div>
              </div>
            </div>
          </div>
        </ResponsivePageContainer>

        {/* Problems vs Solutions */}
        <ResponsivePageContainer>
          <div className="py-12 relative z-20">
            <div className="grid custom-lg:grid-cols-2 gap-12 max-w-7xl mx-auto">
              
              {/* Problems */}
              <div>
                <h2 className="font-manrope text-4xl font-bold text-red-400 mb-6 text-center flex items-center gap-3 justify-center">
                  <Icon name="alert-triangle" size={32} ariaLabel="Warning" />
                  Job Hunt Struggles
                </h2>
                <div className="space-y-4">
                  {problems.map((problem, index) => (
                    <FeatureCard
                      key={index}
                      iconName={problem.iconName}
                      title={problem.title}
                      description={problem.description}
                      variant="problem"
                    />
                  ))}
                </div>
              </div>

              {/* Solutions */}
              <div>
                <h2 className="font-manrope text-4xl font-bold text-green-400 mb-6 text-center flex items-center gap-3 justify-center">
                  <Icon name="rocket" size={32} ariaLabel="Rocket" />
                  AI-Powered Freedom
                </h2>
                <div className="space-y-4">
                  {solutions.map((solution, index) => (
                    <FeatureCard
                      key={index}
                      iconName={solution.iconName}
                      title={solution.title}
                      description={solution.description}
                      variant="solution"
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Why Choose AiPply */}
            <div className="mt-12">
              <div className="bg-gradient-to-r from-[#FF9933] via-[#FFFFFF] to-[#138808] p-1 rounded-[24px] max-w-6xl mx-auto">
               <div className="bg-gradient-to-br from-[#4C1D95] to-[#6B21A8] border border-white border-opacity-10 rounded-[20px] p-6">
                  <h3 className="font-manrope text-3xl font-bold text-white mb-6 text-center">Why Job Seekers Trust AiPply</h3>
                  <div className="grid custom-md:grid-cols-2 custom-lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                    <div className="text-center">
                      <div className="mb-3">
                        <Icon name="hourglass" size={32} ariaLabel="Time saved" />
                      </div>
                      <h4 className="font-manrope text-lg font-bold text-white mb-2">Saves 2+ hours every day</h4>
                      <p className="font-manrope text-white text-sm">No more manual job applying</p>
                    </div>
                    <div className="text-center">
                      <div className="mb-3">
                        <Icon name="file-text" size={32} ariaLabel="Job applications" />
                      </div>
                      <h4 className="font-manrope text-lg font-bold text-white mb-2">Applies to 600+ jobs/month</h4>
                      <p className="font-manrope text-white text-sm">Across top job boards</p>
                    </div>
                    <div className="text-center">
                      <div className="mb-3">
                        <Icon name="phone" size={32} ariaLabel="Phone calls" />
                      </div>
                      <h4 className="font-manrope text-lg font-bold text-white mb-2">Get recruiter calls directly</h4>
                      <p className="font-manrope text-white text-sm">With optimized resumes & smart targeting</p>
                    </div>
                    <div className="text-center">
                      <div className="mb-3">
                        <Icon name="target" size={32} ariaLabel="Targeting accuracy" />
                      </div>
                      <h4 className="font-manrope text-lg font-bold text-white mb-2">Higher interview chances</h4>
                      <p className="font-manrope text-white text-sm">ATS-optimized, role-relevant applications</p>
                    </div>
                    <div className="text-center">
                      <div className="mb-3">
                        <Icon name="lock" size={32} ariaLabel="Security" />
                      </div>
                      <h4 className="font-manrope text-lg font-bold text-white mb-2">Private & secure</h4>
                      <p className="font-manrope text-white text-sm">Your data, always encrypted</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ResponsivePageContainer>

        {/* Success Stories */}
        <ResponsivePageContainer>
          <div className="py-12 relative z-20">
            <h2 className="font-manrope text-4xl font-bold text-center text-[#F5F5F6] mb-10 flex items-center gap-3 justify-center">
              <Icon name="message-circle" size={32} ariaLabel="Testimonials" />
              <span className="bg-gradient-to-r from-[#20CEB6] to-[#2E2ADC] bg-clip-text text-transparent">
                Success Stories
              </span>
            </h2>
            
            <div className="grid custom-lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {testimonials.map((testimonial, index) => (
                <TestimonialsCard
                  key={index}
                  name={testimonial.name}
                  designation={testimonial.designation}
                  review={testimonial.review}
                  image={testimonial.image}
                />
              ))}
            </div>
          </div>
        </ResponsivePageContainer>

        {/* Pricing Comparison */}
        <ResponsivePageContainer>
          <div className="py-12 relative z-20">
            <div className="max-w-5xl mx-auto">
              <h2 className="font-manrope text-4xl font-bold text-center text-[#F5F5F6] mb-10 flex items-center gap-3 justify-center">
                <Icon name="heart" size={32} ariaLabel="Affordable pricing" />
                <span className="bg-gradient-to-r from-[#20CEB6] to-[#2E2ADC] bg-clip-text text-transparent">
                  Student-Friendly Pricing
                </span>
              </h2>

              <div className="bg-gradient-to-r from-[#FF9933] via-[#FFFFFF] to-[#138808] p-1 rounded-[24px]">
                <div className="bg-[#111111] rounded-[20px] p-6">
                  <div className="grid custom-md:grid-cols-3 gap-6 text-center">
                    <div className="p-4">
                      <h4 className="font-manrope font-bold text-red-400 mb-2 text-xl">Other Platforms</h4>
                      <p className="font-manrope text-4xl font-black text-red-400 mb-1">₹3000+</p>
                      <p className="font-manrope text-[#B0B0B0]">per month</p>
                      <p className="font-manrope text-red-300 mt-2 flex items-center gap-2">
                        <Icon name="x" size={16} ariaLabel="No" inline />
                        No transparency
                      </p>
                    </div>
                    
                    <div className="p-4 border-l border-r border-white border-opacity-20">
                      <h4 className="font-manrope font-bold text-yellow-400 mb-2 text-xl">Manual Process</h4>
                      <p className="font-manrope text-4xl font-black text-yellow-400 mb-1">FREE</p>
                      <p className="font-manrope text-[#B0B0B0]">but 3+ hrs daily</p>
                      <p className="font-manrope text-yellow-300 mt-2 flex items-center gap-2">
                        <Icon name="alert-triangle" size={16} ariaLabel="Warning" inline />
                        Time = Money
                      </p>
                    </div>
                    
                    <div className="p-4">
                      <h4 className="font-manrope font-bold text-green-400 mb-2 text-xl">aipply.io</h4>
                      <p className="font-manrope text-4xl font-black text-green-400 mb-1">₹194.7</p>
                      <p className="font-manrope text-[#B0B0B0]">first month</p>
                      <p className="font-manrope text-green-300 mt-2 flex items-center gap-2">
                        <Icon name="check-circle" size={16} ariaLabel="Yes" inline />
                        Full transparency
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ResponsivePageContainer>

        {/* Final CTA */}
        <ResponsivePageContainer>
          <div className="py-12 relative z-20">
            <div className="max-w-4xl mx-auto text-center">
              <div className="bg-gradient-to-r from-[#FF9933] via-[#FFFFFF] to-[#138808] p-2 rounded-[32px]">
                <div className="bg-black rounded-[28px] p-8">
                  <h2 className="font-manrope text-4xl font-bold text-[#F5F5F6] mb-6 leading-tight">
                    This Independence Day,<br />
                    <span className="bg-gradient-to-r from-[#FF9933] via-[#FFFFFF] to-[#138808] bg-clip-text text-transparent">
                      Free-me from Job Hunt Hell!
                    </span>
                  </h2>
                  <p className="font-manrope text-xl text-[#CECFD2] mb-8 leading-relaxed">
                    Your dream job is waiting. Let AI handle applications while you master interviews and build skills.
                  </p>
                  
                  <button onClick={() => openRazorpayPayment()} className="bg-gradient-to-r from-[#20CEB6] to-[#2E2ADC] text-white py-4 px-12 rounded-full font-manrope font-bold text-2xl hover:scale-105 transition-all shadow-lg mb-4"> 1 Month Trial </button>
                  
                  {/* Payment Success Message for Final CTA */}
                  {paymentSuccess && (
                    <div className="mt-6 bg-green-600 bg-opacity-20 border border-green-500 border-opacity-40 rounded-[16px] p-6 text-center backdrop-blur-sm">
                      <div className="mb-2">
                        <Icon name="sparkles" size={28} ariaLabel="Celebration" />
                      </div>
                      <h4 className="font-manrope text-lg font-bold text-green-300 mb-2">
                        Payment Successful!
                      </h4>
                      <p className="font-manrope text-white mb-3 text-sm leading-relaxed">
                        Thank you for your purchase! Check your email for the receipt.
                      </p>
                      <p className="font-manrope text-green-200 mb-3 text-xs flex items-center gap-1 justify-center">
                        <Icon name="calendar-days" size={14} ariaLabel="Calendar" inline />
                        Active from <strong>August 16th, 2025</strong> for 1 month
                      </p>
                      <Link href="dashboard/onboarding/login">
                        <button className="bg-gradient-to-r from-[#10B981] to-[#059669] text-white py-2 px-6 rounded-full font-manrope font-bold text-sm hover:scale-105 transition-all shadow-lg">
                          Login / Register Now
                        </button>
                      </Link>
                    </div>
                  )}
                  
                  <div className="flex justify-center gap-8 text-base text-[#B0B0B0] mt-6">
                    <span className="flex items-center gap-1">
                      <Icon name="check" size={16} ariaLabel="Checkmark" inline />
                      No Setup Required
                    </span>
                    <span className="flex items-center gap-1">
                      <Icon name="check" size={16} ariaLabel="Checkmark" inline />
                      Cancel Anytime
                    </span>
                    <span className="flex items-center gap-1">
                      <Icon name="check" size={16} ariaLabel="Checkmark" inline />
                      Money Back Guarantee
                    </span>
                  </div>
                </div>
              </div>
              
              <p className="font-manrope text-[#B0B0B0] mt-6 text-lg">
                Questions? Email <span className="text-[#20CEB6]">tanmay@aipply.io</span>
              </p>
            </div>
          </div>
        </ResponsivePageContainer>

        <div className="relative z-20">
          <Footer />
        </div>

        <div className="relative z-30">
          <ScrollToTopBtn />
        </div>
      </div>
    </div>
  );
};

export default FreeMeSpecial;
