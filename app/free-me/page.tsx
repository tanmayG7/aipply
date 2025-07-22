// app/free-me/page.tsx
"use client";
import Footer from "@/components/common/footer/footer";
import Header from "@/components/common/header/header";
import { ResponsivePageContainer } from "@/components/common/responsivePageContainer/responsivePageContainer";
import ScrollToTopBtn from "@/components/common/scrollToTopBtn/scrollToTopBtn";
import Link from "next/link";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import TestimonialsCard from "@/components/card/testimonialsCard/testimonialsCard";

const IndependenceDaySpecial = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 3,
    hours: 14,
    minutes: 27
  });

  useEffect(() => {
    const targetDate = new Date('2024-08-18T23:59:59').getTime();
    
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

  // Use testimonials matching your existing component structure
  const localTestimonials = [
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

  const painPoints = [
    {
      icon: "⏰",
      title: "Endless Hours Wasted",
      description: "Spending 3+ hours daily filling the same boring application forms instead of preparing for interviews"
    },
    {
      icon: "👻",
      title: "Getting Ghosted",
      description: "Companies ignoring your manually submitted applications, leaving you wondering what went wrong"
    },
    {
      icon: "🏃‍♂️",
      title: "Missing Opportunities",
      description: "Great jobs getting filled while you're still stuck filling out basic information forms"
    },
    {
      icon: "😵",
      title: "Complete Burnout",
      description: "Feeling drained from the repetitive, soul-crushing process of manual job applications"
    }
  ];

  const features = [
    {
      icon: "🤖",
      title: "Smart AI Agent",
      description: "Applies to 50+ relevant jobs daily while you sleep - no more manual form filling"
    },
    {
      icon: "📊",
      title: "Transparent Dashboard",
      description: "See exactly what our AI is doing - every application, every CAPTCHA solved, live updates"
    },
    {
      icon: "🎯",
      title: "Perfect Targeting",
      description: "Matches your skills to ideal roles automatically - quality over quantity"
    },
    {
      icon: "⚡",
      title: "Lightning Speed",
      description: "Apply to 100s of jobs in minutes, not weeks - be first in line"
    }
  ];

  const pricingFeatures = [
    "50+ job applications daily",
    "Live transparent dashboard",
    "CAPTCHA solving included",
    "Tailored applications",
    "24/7 AI agent working"
  ];

  const faqs = [
    {
      question: "How does the AI actually apply to jobs?",
      answer: "Our AI navigates job portals, fills forms using your profile data, solves CAPTCHAs, and submits applications. You can watch it work live on your dashboard!"
    },
    {
      question: "What happens after the first month?",
      answer: "After your ₹194.7 trial month, you can continue at our regular student price of ₹999/month or pause anytime. No long-term contracts!"
    },
    {
      question: "Can I really see what the AI is doing?",
      answer: "Absolutely! Our transparent dashboard shows every application, timestamp, company details, and even screenshots of submitted forms. Complete visibility!"
    },
    {
      question: "Will the applications be relevant to my profile?",
      answer: "Yes! Our AI analyzes your skills, experience, and preferences to target only relevant positions. Quality over quantity always!"
    }
  ];

  const FeatureCard = ({ icon, title, description, variant = "default" }: {
    icon: string;
    title: string;
    description: string;
    variant?: "default" | "pain" | "solution";
  }) => {
    const borderColor = variant === "pain" 
      ? "border-red-500 border-opacity-20" 
      : variant === "solution" 
      ? "border-green-500 border-opacity-20"
      : "border-white border-opacity-[7%]";

    const titleColor = variant === "pain"
      ? "text-red-400"
      : variant === "solution"
      ? "text-green-400"
      : "text-[#F5F5F6]";

    return (
      <div className={`bg-[#111111] bg-opacity-50 border ${borderColor} rounded-[20px] p-6 h-full transition-all duration-300 hover:border-opacity-30 hover:transform hover:-translate-y-1`}>
        <div className="flex items-start gap-4">
          <span className="text-2xl">{icon}</span>
          <div className="flex flex-col gap-2">
            <h3 className={`font-manrope text-[18px] font-semibold ${titleColor}`}>
              {title}
            </h3>
            <p className="font-manrope text-[14px] text-[#B0B0B0] leading-[150%]">
              {description}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const CountdownDigit = ({ value, label }: { value: number; label: string }) => (
    <div className="text-center">
      <div className="bg-gradient-to-r from-[#FF9933] to-[#138808] text-white rounded-[12px] p-4 font-manrope font-black text-[32px] min-w-[80px]">
        {String(value).padStart(2, '0')}
      </div>
      <p className="font-manrope text-sm text-[#B0B0B0] mt-2">{label}</p>
    </div>
  );

  const FAQ = ({ question, answer }: { question: string; answer: string }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div className="bg-[#111111] bg-opacity-50 border border-white border-opacity-[7%] rounded-[20px] p-6">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full text-left flex justify-between items-center"
        >
          <h3 className="font-manrope text-[18px] font-semibold text-[#20CEB6]">
            🤖 {question}
          </h3>
          <span className="text-[#20CEB6] ml-4 flex-shrink-0">
            {isOpen ? '−' : '+'}
          </span>
        </button>
        {isOpen && (
          <p className="font-manrope text-[14px] text-[#B0B0B0] mt-3 leading-[150%]">
            {answer}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="relative min-h-screen">
      {/* Fixed backdrop */}
      <div className="fixed inset-0 w-full h-full pointer-events-none z-0">
        <div className="absolute w-[800px] h-[800px] top-[200px] left-1/2 transform -translate-x-1/2 bg-[#AE94FF] bg-opacity-30 blur-[200px] rounded-full"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10">
        <div className="pt-7">
          <Header />
        </div>

        {/* Hero Section */}
        <ResponsivePageContainer>
          <div className="py-20 relative z-20">
            <div className="text-center mb-16">
              {/* Flag Animation */}
              <div className="text-8xl mb-6 animate-pulse">🇮🇳</div>
              
              {/* Main Headline */}
              <div className="mb-8">
                <div className="inline-block bg-gradient-to-r from-[#20CEB6] to-[#2E2ADC] text-white py-2 px-6 rounded-full font-manrope font-medium text-sm mb-6">
                  🇮🇳 Free-me Independence Special
                </div>
                <h1 className="font-manrope text-[40px] custom-md:text-[60px] custom-md:leading-[72px] font-bold text-[#F5F5F6] mb-6">
                  Free-me from<br />
                  <span className="bg-gradient-to-r from-[#20CEB6] to-[#2E2ADC] bg-clip-text text-transparent">
                    Job Application Hell!
                  </span>
                </h1>
                <p className="font-manrope font-normal text-[20px] text-[#CECFD2] max-w-3xl mx-auto mb-8">
                  This Independence Day, gain freedom from endless job rejections. Let our AI agent apply to 50+ jobs daily while you focus on interview prep and skill building.
                </p>
              </div>

              {/* Pricing Highlight */}
              <div className="bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] rounded-[20px] p-8 max-w-md mx-auto mb-12 relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="font-manrope text-2xl font-bold text-white mb-4">🇮🇳 Free-me Special</h3>
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <span className="font-manrope text-lg text-red-300 line-through">₹999</span>
                    <span className="font-manrope text-5xl font-black text-yellow-300">₹194.7</span>
                  </div>
                  <p className="font-manrope text-lg text-white mb-6">First Month Trial - 80% OFF!</p>
                  <Link href="/pricing">
                    <button className="w-full bg-gradient-to-r from-[#10B981] to-[#059669] text-white py-4 px-8 rounded-full font-manrope font-bold text-lg hover:scale-105 transition-all">
                      🚀 Free-me Now for ₹194.7
                    </button>
                  </Link>
                  <p className="font-manrope text-sm text-gray-300 mt-3">⏰ Offer expires August 18th</p>
                </div>
              </div>

              {/* Countdown Timer */}
              <div className="mb-12">
                <h3 className="font-manrope text-xl font-semibold text-[#F5F5F6] mb-4">⏰ Offer Ends In:</h3>
                <div className="flex justify-center gap-4">
                  <CountdownDigit value={timeLeft.days} label="Days" />
                  <CountdownDigit value={timeLeft.hours} label="Hours" />
                  <CountdownDigit value={timeLeft.minutes} label="Minutes" />
                </div>
              </div>
            </div>
          </div>
        </ResponsivePageContainer>

        {/* Pain Points Section */}
        <ResponsivePageContainer>
          <div className="py-20 relative z-20">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-manrope text-4xl font-bold text-center text-[#F5F5F6] mb-16">
                😤 <span className="bg-gradient-to-r from-[#20CEB6] to-[#2E2ADC] bg-clip-text text-transparent">
                  Tired of This Job Hunt Struggle?
                </span>
              </h2>
              
              <div className="grid custom-md:grid-cols-2 gap-8 mb-16">
                {painPoints.map((pain, index) => (
                  <FeatureCard
                    key={index}
                    icon={pain.icon}
                    title={pain.title}
                    description={pain.description}
                    variant="pain"
                  />
                ))}
              </div>
            </div>
          </div>
        </ResponsivePageContainer>

        {/* Solution Section */}
        <ResponsivePageContainer>
          <div className="py-20 relative z-20">
            <div className="max-w-6xl mx-auto">
              <h2 className="font-manrope text-4xl font-bold text-center text-[#F5F5F6] mb-16">
                🚀 <span className="bg-gradient-to-r from-[#20CEB6] to-[#2E2ADC] bg-clip-text text-transparent">
                  Your AI-Powered Freedom Fighter
                </span>
              </h2>
              
              <div className="grid custom-md:grid-cols-2 custom-lg:grid-cols-4 gap-8 mb-16">
                {features.map((feature, index) => (
                  <FeatureCard
                    key={index}
                    icon={feature.icon}
                    title={feature.title}
                    description={feature.description}
                    variant="solution"
                  />
                ))}
              </div>

              {/* What Makes Us Different */}
              <div className="bg-gradient-to-r from-[#20CEB6] bg-opacity-10 to-[#2E2ADC] bg-opacity-10 border border-white border-opacity-10 rounded-[30px] p-8 text-center">
                <h3 className="font-manrope text-2xl font-bold text-[#F5F5F6] mb-4">🔥 What Makes aipply.io Different?</h3>
                <p className="font-manrope text-lg text-[#CECFD2] max-w-4xl mx-auto">
                  While competitors offer "black box" automation, we provide <strong>complete transparency</strong>. 
                  See every action our AI takes, every application submitted, every CAPTCHA solved. 
                  Plus, we're <strong>student-friendly priced</strong> at just ₹194.7/month instead of the industry standard ₹3000+
                </p>
              </div>
            </div>
          </div>
        </ResponsivePageContainer>

        {/* Testimonials */}
        <ResponsivePageContainer>
          <div className="py-20 relative z-20">
            <h2 className="font-manrope text-4xl font-bold text-center text-[#F5F5F6] mb-16">
              💬 <span className="bg-gradient-to-r from-[#20CEB6] to-[#2E2ADC] bg-clip-text text-transparent">
                What Students Are Saying
              </span>
            </h2>
            
            <div className="grid custom-md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {localTestimonials.map((testimonial, index) => (
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

        {/* Pricing Section */}
        <ResponsivePageContainer>
          <div className="py-20 relative z-20">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="font-manrope text-4xl font-bold text-[#F5F5F6] mb-8">
                💰 <span className="bg-gradient-to-r from-[#20CEB6] to-[#2E2ADC] bg-clip-text text-transparent">
                  Student-Friendly Pricing
                </span>
              </h2>
              
              <p className="font-manrope text-xl text-[#CECFD2] mb-12">
                While competitors charge ₹3000+ per month, we believe in making job search automation accessible to every student
              </p>

              <div className="bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] rounded-[30px] p-12 mb-12 relative overflow-hidden">
                <div className="relative z-10">
                  <div className="text-6xl mb-4">🇮🇳</div>
                  <h3 className="font-manrope text-3xl font-bold text-white mb-6">Free-me Special</h3>
                  
                  <div className="flex items-center justify-center gap-6 mb-6">
                    <div className="text-center">
                      <p className="font-manrope text-lg text-red-300 line-through">Regular Price</p>
                      <p className="font-manrope text-2xl text-red-300 line-through">₹999/month</p>
                    </div>
                    <div className="text-8xl">→</div>
                    <div className="text-center">
                      <p className="font-manrope text-lg text-yellow-300">Special Price</p>
                      <p className="font-manrope text-6xl font-black text-yellow-300">₹194.7</p>
                      <p className="font-manrope text-lg text-white">First Month</p>
                    </div>
                  </div>

                  <div className="bg-white bg-opacity-20 rounded-[20px] p-6 mb-8">
                    <h4 className="font-manrope text-xl font-bold text-white mb-4">What You Get:</h4>
                    <ul className="text-left space-y-3 max-w-md mx-auto">
                      {pricingFeatures.map((feature, index) => (
                        <li key={index} className="font-manrope flex items-center gap-3 text-white">
                          <span className="text-green-400">✓</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link href="/pricing">
                    <button className="bg-gradient-to-r from-[#10B981] to-[#059669] text-white py-4 px-12 rounded-full font-manrope font-bold text-xl hover:scale-105 transition-all mb-4">
                      🚀 Free-me Trial - ₹194.7
                    </button>
                  </Link>
                  
                  <div className="bg-yellow-500 bg-opacity-20 border border-yellow-500 border-opacity-30 rounded-[20px] p-4">
                    <p className="font-manrope text-yellow-300 font-semibold">
                      ⏰ Limited Time: Offer expires August 18th, 2024
                    </p>
                    <p className="font-manrope text-sm text-yellow-200">
                      Only available for Independence Day weekend. Don't miss out!
                    </p>
                  </div>
                </div>
              </div>

              {/* Comparison */}
              <div className="bg-[#111111] bg-opacity-50 border border-white border-opacity-10 rounded-[30px] p-8">
                <h3 className="font-manrope text-2xl font-bold text-[#F5F5F6] mb-6">📊 How We Compare</h3>
                <div className="grid custom-md:grid-cols-3 gap-6 text-center">
                  <div>
                    <h4 className="font-manrope font-semibold text-red-400 mb-2">Other Platforms</h4>
                    <p className="font-manrope text-3xl font-bold text-red-400 mb-2">₹3000+</p>
                    <p className="font-manrope text-sm text-[#B0B0B0]">per month</p>
                    <p className="font-manrope text-xs text-red-300 mt-2">❌ No transparency</p>
                  </div>
                  <div className="border-l border-r border-white border-opacity-20">
                    <h4 className="font-manrope font-semibold text-yellow-400 mb-2">Manual Applications</h4>
                    <p className="font-manrope text-3xl font-bold text-yellow-400 mb-2">FREE</p>
                    <p className="font-manrope text-sm text-[#B0B0B0]">but 3+ hrs daily</p>
                    <p className="font-manrope text-xs text-yellow-300 mt-2">⚠️ Time = Money</p>
                  </div>
                  <div>
                    <h4 className="font-manrope font-semibold text-green-400 mb-2">aipply.io</h4>
                    <p className="font-manrope text-3xl font-bold text-green-400 mb-2">₹194.7</p>
                    <p className="font-manrope text-sm text-[#B0B0B0]">first month</p>
                    <p className="font-manrope text-xs text-green-300 mt-2">✅ Full transparency</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ResponsivePageContainer>

        {/* FAQ Section */}
        <ResponsivePageContainer>
          <div className="py-20 relative z-20">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-manrope text-4xl font-bold text-center text-[#F5F5F6] mb-16">
                ❓ <span className="bg-gradient-to-r from-[#20CEB6] to-[#2E2ADC] bg-clip-text text-transparent">
                  Frequently Asked Questions
                </span>
              </h2>
              
              <div className="space-y-6">
                {faqs.map((faq, index) => (
                  <FAQ key={index} question={faq.question} answer={faq.answer} />
                ))}
              </div>
            </div>
          </div>
        </ResponsivePageContainer>

        {/* Final CTA */}
        <ResponsivePageContainer>
          <div className="py-20 relative z-20">
            <div className="max-w-4xl mx-auto text-center">
              <div className="bg-gradient-to-r from-[#FF9933] via-[#FFFFFF] to-[#138808] p-1 rounded-[30px] mb-8">
                <div className="bg-black rounded-[30px] p-12">
                  <div className="text-6xl mb-6 animate-pulse">🇮🇳</div>
                  <h2 className="font-manrope text-4xl font-bold text-[#F5F5F6] mb-6">
                    This Independence Day, Free-me<br />
                    from <span className="text-red-400">Job Application Hell!</span>
                  </h2>
                  <p className="font-manrope text-xl text-[#CECFD2] mb-8">
                    Your dream job is waiting. Let our AI find it for you while you focus on what matters - preparing for interviews and building skills.
                  </p>
                  
                  <Link href="/pricing">
                    <button className="bg-gradient-to-r from-[#10B981] to-[#059669] text-white py-6 px-12 rounded-full font-manrope font-bold text-2xl hover:scale-105 transition-all mb-6">
                      🚀 Free-me for Just ₹194.7
                    </button>
                  </Link>
                  
                  <div className="flex justify-center gap-8 text-sm text-[#B0B0B0]">
                    <span>✓ No Setup Required</span>
                    <span>✓ Cancel Anytime</span>
                    <span>✓ Results in 7 Days</span>
                  </div>
                </div>
              </div>
              
              <p className="font-manrope text-[#B0B0B0]">
                Questions? WhatsApp us at <span className="text-[#20CEB6]">+91-XXXXX-XXXXX</span> or email <span className="text-[#20CEB6]">support@aipply.io</span>
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

export default IndependenceDaySpecial;
