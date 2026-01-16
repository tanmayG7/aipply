"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Check, ArrowRight, Star, Briefcase, FileText, LayoutDashboard, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EnhancedInput } from "@/components/ui/enhanced-input";
import { EnhancedLabel } from "@/components/ui/enhanced-label";
import { PhoneInput } from "@/components/ui/phone-input";
import { formatPhoneNumber } from "@/lib/countryCodes";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { ButtonMovingBorder } from "@/components/ui/moving-border";

export default function OfferPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    countryCode: "+91",
    phoneNumber: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    // Phone validation
    const fullPhone = formatPhoneNumber(formData.countryCode, formData.phoneNumber);
    const validatePhoneNumber = (phone: string): boolean => {
      if (!phone.startsWith('+')) return false;
      const cleanPhone = phone.replace(/[\s\-().]/g, '');
      return cleanPhone.length >= 8 && cleanPhone.length <= 18 && /^\+\d+$/.test(cleanPhone);
    };

    if (!validatePhoneNumber(fullPhone)) {
      setError("Please enter a valid phone number.");
      return;
    }

    setLoading(true);

    try {
      // Save data to localStorage to pre-fill subsequent steps
      const promoData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        mobileNumber: fullPhone,
        timestamp: Date.now(),
        source: "offer_page_666",
      };

      localStorage.setItem("aipply_promo_data", JSON.stringify(promoData));

      const params = new URLSearchParams();
      if (formData.email) params.append("email", formData.email);

      router.push(`/dashboard/onboarding/login?${params.toString()}`);
    } catch (error) {
      console.error("Navigation error:", error);
      setLoading(false);
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#020218] text-white selection:bg-blue-500/30 relative overflow-hidden">
      {/* Premium Background */}
      <BackgroundBeams />

      {/* Decorative Blur Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Header / Logo */}
        <div className="flex justify-center mb-8 lg:mb-16">
          <div className="flex items-center gap-2">
            <Image
              src="/static/icons/aipplyLogo.svg"
              alt="Aipply Logo"
              width={140}
              height={40}
              className="w-32 lg:w-40"
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Content Column */}
          <div className="flex flex-col gap-8 text-center lg:text-left">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mx-auto lg:mx-0 backdrop-blur-md">
                <Star className="w-4 h-4 fill-blue-400" />
                <span>Premium Job Search Automation</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
                Stop Applying. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 animate-gradient">
                  Start Interviewing.
                </span>
              </h1>

              <p className="text-lg text-gray-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Automate your job search with AI. We apply to hundreds of relevant jobs for you, so you can focus on preparing for interviews.
              </p>
            </div>

            <div className="grid gap-4">
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl hover:border-blue-500/30 transition-all duration-300">
                <div className="flex items-baseline gap-2 justify-center lg:justify-start">
                  <span className="text-5xl font-bold">₹666</span>
                  <span className="text-xl text-gray-400">/month</span>
                </div>
                <p className="text-blue-300 mt-2 font-medium">Limited Time Offer</p>
                <div className="mt-6 space-y-3">
                  <BenefitRow text="700 Automated Job Applications" />
                  <BenefitRow text="Smart Job Tracker Dashboard" />
                  <BenefitRow text="Curated Job Board Access" />
                  <BenefitRow text="Free ATS Score Checker + Template" />
                  <BenefitRow text="Resume Services Add-ons" />
                </div>
              </div>
            </div>

            {/* Mobile Only Form Anchor */}
            <div className="lg:hidden">
              <ButtonMovingBorder
                borderRadius="0.75rem"
                className="bg-blue-600 dark:bg-blue-600 text-white dark:text-white border-neutral-200 dark:border-slate-800 text-lg font-bold"
                containerClassName="w-full h-14"
                onClick={() => document.getElementById('offer-form')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Get Started Now <ArrowRight className="ml-2 w-5 h-5" />
              </ButtonMovingBorder>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
              <div className="text-center group">
                <h3 className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors">4500+</h3>
                <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">Students</p>
              </div>
              <div className="text-center group">
                <h3 className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors">6.5L+</h3>
                <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">Monthly Jobs</p>
              </div>
              <div className="text-center group">
                <h3 className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors">Top 1%</h3>
                <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">Acceptance</p>
              </div>
            </div>
          </div>

          {/* Right Form Column */}
          <div className="relative">
            {/* Decorator */}
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-purple-600/20 rounded-3xl blur-3xl transform rotate-3 scale-105 opacity-40 pointer-events-none animate-pulse"></div>

            <Card id="offer-form" className="relative border-white/10 bg-[#0A0A20]/80 backdrop-blur-2xl shadow-2xl overflow-hidden ring-1 ring-white/5">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
              <CardContent className="p-6 sm:p-8">
                <div className="mb-8">
                  <h3 className="text-2xl font-bold mb-2">Claim Your Spot</h3>
                  <p className="text-gray-400 text-sm">Create your profile to unlock the automated job search engine.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <LabelInputContainer>
                      <EnhancedLabel htmlFor="firstName">First Name</EnhancedLabel>
                      <EnhancedInput
                        id="firstName"
                        name="firstName"
                        placeholder="John"
                        required
                        value={formData.firstName}
                        onChange={handleChange}
                      />
                    </LabelInputContainer>
                    <LabelInputContainer>
                      <EnhancedLabel htmlFor="lastName">Last Name</EnhancedLabel>
                      <EnhancedInput
                        id="lastName"
                        name="lastName"
                        placeholder="Doe"
                        required
                        value={formData.lastName}
                        onChange={handleChange}
                      />
                    </LabelInputContainer>
                  </div>

                  <LabelInputContainer>
                    <EnhancedLabel htmlFor="email">Email Address</EnhancedLabel>
                    <EnhancedInput
                      id="email"
                      name="email"
                      type="email"
                      placeholder="john@example.com"
                      required
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </LabelInputContainer>

                  <LabelInputContainer>
                    <EnhancedLabel htmlFor="mobileNumber">Phone Number</EnhancedLabel>
                    <PhoneInput
                      countryCode={formData.countryCode}
                      phoneNumber={formData.phoneNumber}
                      onCountryCodeChange={(code) => setFormData({ ...formData, countryCode: code })}
                      onPhoneNumberChange={(number) => setFormData({ ...formData, phoneNumber: number })}
                      required
                    />
                  </LabelInputContainer>

                  {error && (
                    <div className="text-red-400 text-sm bg-red-900/20 border border-red-500/50 p-3 rounded-lg flex items-center gap-2">
                      <span className="block w-2 h-2 rounded-full bg-red-500"></span>
                      {error}
                    </div>
                  )}

                  <ButtonMovingBorder
                    borderRadius="0.5rem"
                    containerClassName="w-full h-12"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold"
                    onClick={() => { }}
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? "Processing..." : "Continue to Dashboard"} <ArrowRight className="ml-2 w-4 h-4" />
                  </ButtonMovingBorder>

                  <p className="text-xs text-center text-gray-500 mt-4">
                    By continuing, you agree to our Terms of Service and Privacy Policy.
                  </p>
                </form>
              </CardContent>
            </Card>

            {/* Feature Highlights Grid (Below Form on Desktop) */}
            <div className="mt-8 grid grid-cols-2 gap-4">
              <FeatureCard icon={Briefcase} title="Auto-Apply" desc="20 applications/day" />
              <FeatureCard icon={LayoutDashboard} title="Job Tracker" desc="Manage all applications" />
              <FeatureCard icon={FileText} title="ATS Checker" desc="Optimize your resume" />
              <FeatureCard icon={ShieldCheck} title="Verified Jobs" desc="No fake listings" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BenefitRow({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 text-gray-300">
      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
        <Check className="w-3 h-3 text-green-400" />
      </div>
      <span>{text}</span>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/20 transition-all hover:bg-white/10 group">
      <Icon className="w-6 h-6 text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
      <h4 className="font-semibold text-white">{title}</h4>
      <p className="text-xs text-gray-400">{desc}</p>
    </div>
  )
}

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex w-full flex-col space-y-2", className)}>
      {children}
    </div>
  );
};
