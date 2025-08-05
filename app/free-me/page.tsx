// Load Razorpay payment button script
  useEffect(() => {
    // Remove any existing Razorpay forms first
    const existingForms = document.querySelectorAll('form[data-razorpay="true"]');
    existingForms.forEach(form => form.remove());

    // Function to create payment button
    const createPaymentButton = (containerId: string) => {
      const container = document.getElementById(containerId);
      if (container) {
        // Clear container
        container.innerHTML = '';
        
        // Create form element
        const form = document.createElement('form');
        form.setAttribute('data-razorpay', 'true');
        form.className = containerId === 'razorpay-container-1' ? 'w-full' : 'mb-8';
        
        // Create script element
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/payment-button.js';
        script.setAttribute('data-payment_button_id', 'pl_R1GlgQGQ7K8z2R');
        script.async = true;
        
        // Append script to form, then form to container
        form.appendChild(script);
        container.appendChild(form);
      }
    };

    // Create both payment buttons
    createPaymentButton('razorpay-container-1');
    createPaymentButton('razorpay-container-2');

    // Cleanup function
    return () => {
      const forms = document.querySelectorAll('form[data-razorpay="true"]');
      forms.forEach(form => form.remove());
    };
  }, []);// app/free-me/page.tsx
"use client";
import Footer from "@/components/common/footer/footer";
import Header from "@/components/common/header/header";
import { ResponsivePageContainer } from "@/components/common/responsivePageContainer/responsivePageContainer";
import ScrollToTopBtn from "@/components/common/scrollToTopBtn/scrollToTopBtn";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import TestimonialsCard from "@/components/card/testimonialsCard/testimonialsCard";

const FreeMeSpecial = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 18,
    hours: 0,
    minutes: 0
  });

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
      icon: "⏰",
      title: "Endless Hours Wasted",
      description: "Spending 3+ hours daily filling repetitive application forms instead of preparing for interviews"
    },
    {
      icon: "👻",
      title: "Getting Ghosted",
      description: "Companies ignoring your applications, leaving you wondering what went wrong"
    },
    {
      icon: "🏃‍♂️",
      title: "Missing Opportunities",
      description: "Great jobs getting filled while you're stuck with manual applications"
    },
    {
      icon: "😵",
      title: "Application Burnout",
      description: "Feeling drained from the soul-crushing, repetitive job application process"
    }
  ];

  const solutions = [
    {
      icon: "🤖",
      title: "Smart AI Agent",
      description: "Applies to 50+ relevant jobs daily while you sleep"
    },
    {
      icon: "📊",
      title: "Live Dashboard",
      description: "Watch your AI work - every application tracked in real-time"
    },
    {
      icon: "🎯",
      title: "Perfect Targeting",
      description: "AI matches your skills to ideal roles automatically"
    },
    {
      icon: "⚡",
      title: "Lightning Speed",
      description: "Apply to 100s of jobs in minutes, be first in line"
    }
  ];

  const features = [
    "50+ daily job applications",
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

  const FeatureCard = ({ icon, title, description, variant }: {
    icon: string;
    title: string;
    description: string;
    variant: "problem" | "solution";
  }) => (
    <div className={`bg-[#111111] bg-opacity-50 border ${variant === "problem" ? "border-red-500" : "border-green-500"} border-opacity-20 rounded-[20px] p-6 transition-all duration-300 hover:border-opacity-40 hover:transform hover:-translate-y-1`}>
      <div className="flex items-start gap-4">
        <span className="text-3xl">{icon}</span>
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
          <div className="py-16 relative z-20">
            <div className="text-center">
              {/* Flag */}
              <div className="text-8xl mb-8 animate-pulse">🇮🇳</div>
              
              {/* Badge */}
              <div className="inline-block bg-gradient-to-r from-[#FF9933] via-[#FFFFFF] to-[#138808] p-1 rounded-full mb-8">
                <div className="bg-black text-white py-2 px-6 rounded-full font-manrope font-medium text-sm">
                  ✨ Free-me Independence Special
                </div>
              </div>

              {/* Main Headline */}
              <h1 className="font-manrope text-[48px] custom-md:text-[72px] font-bold text-[#F5F5F6] mb-6 leading-tight">
                Free-me from<br />
                <span className="bg-gradient-to-r from-[#20CEB6] to-[#2E2ADC] bg-clip-text text-transparent">
                  Job Application Hell!
                </span>
              </h1>
              
              <p className="font-manrope text-[24px] text-[#CECFD2] max-w-4xl mx-auto mb-12 leading-relaxed">
                This Independence Day, break free from endless job rejections. Our AI applies to 50+ jobs daily while you focus on what matters - interview prep and skill building.
              </p>

              {/* Pricing Card */}
              <div className="max-w-lg mx-auto mb-12">
                <div className="bg-gradient-to-r from-[#FF9933] via-[#FFFFFF] to-[#138808] p-1 rounded-[24px]">
                  <div className="bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] rounded-[20px] p-8 text-center">
                    <h3 className="font-manrope text-3xl font-bold text-white mb-6">🎯 Free-me Special</h3>
                    
                    <div className="flex items-center justify-center gap-6 mb-6">
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

                    <div className="bg-white bg-opacity-20 rounded-[16px] p-6 mb-8 backdrop-blur-sm">
                      <h4 className="font-manrope text-xl font-bold text-white mb-4">What You Get:</h4>
                      <div className="grid grid-cols-1 gap-3 text-left">
                        {features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-3 text-white">
                            <span className="text-green-300 text-lg">✓</span>
                            <span className="font-manrope">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div id="razorpay-container-1" className="w-full"></div>
                  </div>
                </div>
              </div>

              {/* Countdown */}
              <div className="mb-16">
                <h3 className="font-manrope text-2xl font-semibold text-[#F5F5F6] mb-6">⏰ Offer Ends In:</h3>
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
          <div className="py-20 relative z-20">
            <div className="grid custom-lg:grid-cols-2 gap-16 max-w-7xl mx-auto">
              
              {/* Problems */}
              <div>
                <h2 className="font-manrope text-4xl font-bold text-red-400 mb-8 text-center">
                  😤 Job Hunt Struggles
                </h2>
                <div className="space-y-6">
                  {problems.map((problem, index) => (
                    <FeatureCard
                      key={index}
                      icon={problem.icon}
                      title={problem.title}
                      description={problem.description}
                      variant="problem"
                    />
                  ))}
                </div>
              </div>

              {/* Solutions */}
              <div>
                <h2 className="font-manrope text-4xl font-bold text-green-400 mb-8 text-center">
                  🚀 AI-Powered Freedom
                </h2>
                <div className="space-y-6">
                  {solutions.map((solution, index) => (
                    <FeatureCard
                      key={index}
                      icon={solution.icon}
                      title={solution.title}
                      description={solution.description}
                      variant="solution"
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Differentiator */}
            <div className="mt-20">
              <div className="bg-gradient-to-r from-[#FF9933] via-[#FFFFFF] to-[#138808] p-1 rounded-[24px] max-w-5xl mx-auto">
                <div className="bg-gradient-to-r from-[#20CEB6] bg-opacity-10 to-[#2E2ADC] bg-opacity-10 border border-white border-opacity-10 rounded-[20px] p-8 text-center">
                  <h3 className="font-manrope text-3xl font-bold text-[#F5F5F6] mb-4">🔥 Why Choose aipply.io?</h3>
                  <p className="font-manrope text-xl text-[#CECFD2] max-w-4xl mx-auto leading-relaxed">
                    While competitors offer "black box" automation, we provide <strong className="text-[#20CEB6]">complete transparency</strong>. 
                    Watch every action, every application, every success. Plus, we're priced for students at ₹194.7/month instead of ₹3000+.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ResponsivePageContainer>

        {/* Success Stories */}
        <ResponsivePageContainer>
          <div className="py-20 relative z-20">
            <h2 className="font-manrope text-4xl font-bold text-center text-[#F5F5F6] mb-16">
              💬 <span className="bg-gradient-to-r from-[#20CEB6] to-[#2E2ADC] bg-clip-text text-transparent">
                Success Stories
              </span>
            </h2>
            
            <div className="grid custom-lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
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
          <div className="py-20 relative z-20">
            <div className="max-w-5xl mx-auto">
              <h2 className="font-manrope text-4xl font-bold text-center text-[#F5F5F6] mb-16">
                💰 <span className="bg-gradient-to-r from-[#20CEB6] to-[#2E2ADC] bg-clip-text text-transparent">
                  Student-Friendly Pricing
                </span>
              </h2>

              <div className="bg-gradient-to-r from-[#FF9933] via-[#FFFFFF] to-[#138808] p-1 rounded-[24px]">
                <div className="bg-[#111111] rounded-[20px] p-8">
                  <div className="grid custom-md:grid-cols-3 gap-8 text-center">
                    <div className="p-6">
                      <h4 className="font-manrope font-bold text-red-400 mb-3 text-xl">Other Platforms</h4>
                      <p className="font-manrope text-4xl font-black text-red-400 mb-2">₹3000+</p>
                      <p className="font-manrope text-[#B0B0B0]">per month</p>
                      <p className="font-manrope text-red-300 mt-3">❌ No transparency</p>
                    </div>
                    
                    <div className="p-6 border-l border-r border-white border-opacity-20">
                      <h4 className="font-manrope font-bold text-yellow-400 mb-3 text-xl">Manual Process</h4>
                      <p className="font-manrope text-4xl font-black text-yellow-400 mb-2">FREE</p>
                      <p className="font-manrope text-[#B0B0B0]">but 3+ hrs daily</p>
                      <p className="font-manrope text-yellow-300 mt-3">⚠️ Time = Money</p>
                    </div>
                    
                    <div className="p-6">
                      <h4 className="font-manrope font-bold text-green-400 mb-3 text-xl">aipply.io</h4>
                      <p className="font-manrope text-4xl font-black text-green-400 mb-2">₹194.7</p>
                      <p className="font-manrope text-[#B0B0B0]">first month</p>
                      <p className="font-manrope text-green-300 mt-3">✅ Full transparency</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ResponsivePageContainer>

        {/* Final CTA */}
        <ResponsivePageContainer>
          <div className="py-20 relative z-20">
            <div className="max-w-4xl mx-auto text-center">
              <div className="bg-gradient-to-r from-[#FF9933] via-[#FFFFFF] to-[#138808] p-2 rounded-[32px]">
                <div className="bg-black rounded-[28px] p-12">
                  <div className="text-8xl mb-8 animate-pulse">🇮🇳</div>
                  <h2 className="font-manrope text-5xl font-bold text-[#F5F5F6] mb-8 leading-tight">
                    This Independence Day,<br />
                    <span className="bg-gradient-to-r from-[#FF9933] via-[#FFFFFF] to-[#138808] bg-clip-text text-transparent">
                      Free-me from Job Hunt Hell!
                    </span>
                  </h2>
                  <p className="font-manrope text-2xl text-[#CECFD2] mb-12 leading-relaxed">
                    Your dream job is waiting. Let AI handle applications while you master interviews and build skills.
                  </p>
                  
                  <div id="razorpay-container-2"></div>
                  
                  <div className="flex justify-center gap-12 text-lg text-[#B0B0B0]">
                    <span>✓ No Setup Required</span>
                    <span>✓ Cancel Anytime</span>
                    <span>✓ Results in 7 Days</span>
                  </div>
                </div>
              </div>
              
              <p className="font-manrope text-[#B0B0B0] mt-8 text-lg">
                Questions? Email <span className="text-[#20CEB6]">support@aipply.io</span>
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
