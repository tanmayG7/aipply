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
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { auth } from "@/lib/firebaseConfig/firebaseConfig";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";

export default function CVServicesPage() {
  // Authentication state
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const router = useRouter();

  // UI state
  const [activeAccordion, setActiveAccordion] = useState<number | null>(null);

  // Check authentication status
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

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
      description: "Unlimited revisions until you&apos;re completely satisfied with your professional CV."
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
      question: "What if I&apos;m not satisfied with the CV?",
      answer: "We offer unlimited revisions until you&apos;re completely satisfied. Your success is our priority, and we&apos;ll work with you until your CV is perfect."
    },
    {
      question: "Is my payment information secure?",
      answer: "Absolutely. We use industry-standard encryption and secure payment processing. Your financial information is never stored on our servers."
    },
    {
      question: "What information do I need to provide?",
      answer: "After payment, you&apos;ll receive a detailed form to fill out with your work experience, education, skills, and career goals. The more details you provide, the better we can tailor your CV."
    },
    {
      question: "Do you offer refunds?",
      answer: "Yes, we offer a 100% money-back guarantee if you&apos;re not satisfied with our service. Please refer to our refund policy for complete details."
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

                {/* CTA Card */}
                <Card className="bg-[#0F0F0F] border-[#333741] p-6 md:p-8">
                  <h3 className="font-manrope text-xl md:text-2xl font-bold text-[#F5F5F6] mb-4 text-center">
                    Ready to Get Started?
                  </h3>

                  <p className="text-[#CECFD2] text-center mb-6">
                    Login to your dashboard to complete your order and get your professionally crafted CV
                  </p>

                  <div className="space-y-4">
                    {authLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-8 h-8 text-[#AE94FF] animate-spin" />
                      </div>
                    ) : (
                      <Button
                        onClick={() => {
                          if (user) {
                            router.push('/dashboard/cv-services');
                          } else {
                            router.push('/dashboard/onboarding/login?redirect=/dashboard/cv-services');
                          }
                        }}
                        className="w-full bg-gradient-to-r from-[#52A9FF] to-[#5D29FF] hover:from-[#4298E8] hover:to-[#4C1FE8] text-white font-semibold py-6 text-base md:text-lg rounded-lg shadow-lg shadow-[#5D29FF]/30 transition-all duration-300 hover:shadow-xl hover:shadow-[#5D29FF]/40"
                      >
                        {user ? 'Go to Dashboard - ₹987' : 'Login to Get Started - ₹987'}
                      </Button>
                    )}

                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-2 text-xs text-[#9CA3AF]">
                        <Shield className="w-4 h-4 text-[#10B981]" />
                        <span>Secured by Razorpay - 256-bit SSL encryption</span>
                      </div>
                      <p className="text-center text-xs text-[#9CA3AF]">
                        100% secure payment processing
                      </p>
                    </div>
                  </div>
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
                From payment to delivery, we&apos;ve streamlined the process to get you results fast.
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
                      &quot;{testimonial.text}&quot;
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
                Don&apos;t let a poorly written CV hold you back. Invest in your future today and get the professional CV you deserve.
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

      <Footer />
    </div>
  );
}