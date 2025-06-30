"use client";
import Footer from "@/components/common/footer/footer";
import Header from "@/components/common/header/header";
import { ResponsivePageContainer } from "@/components/common/responsivePageContainer/responsivePageContainer";
import ScrollToTopBtn from "@/components/common/scrollToTopBtn/scrollToTopBtn";
import Link from "next/link";
import React, { useState } from "react";

const ContactUsPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    inquiryType: "general"
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus('success');
      // Reset form
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
        inquiryType: "general"
      });
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setSubmitStatus('idle');
      }, 5000);
    }, 2000);
  };

  return (
    <div className="bg-[#000000] relative overflow-hidden">
      <div className="pt-7">
        <Header />
      </div>

      {/* Hero Section */}
      <ResponsivePageContainer>
        <div className="pt-[51px] relative">
          {/* Background blur */}
          <div className="absolute w-full h-[600px] top-[50px] left-1/2 transform -translate-x-1/2 bg-[#AE94FF] bg-opacity-40 blur-[280px] backdrop-blur-[400px] rounded-full -z-10"></div>
          
          <div className="relative z-10">
            <div className="px-4 custom-lg:px-[103px] text-center pt-[100px] pb-[60px]">
              <h1 className="font-manrope font-bold text-[40px] custom-md:text-[60px] leading-[120%] custom-md:leading-[160%] text-white mb-6">
                Contact Us
              </h1>
              <h2 className="font-manrope font-semibold text-[28px] custom-md:text-[36px] leading-[120%] text-[#52A9FF] mb-4">
                Let's Connect & Build Together
              </h2>
              <p className="font-manrope font-normal text-[18px] custom-md:text-[20px] leading-[160%] text-[#CECFD2] max-w-3xl mx-auto">
                Got questions? Want to partner with us? Looking to join our mission? We'd love to hear from you.
              </p>
            </div>
          </div>
        </div>
      </ResponsivePageContainer>

      {/* Contact Options */}
      <ResponsivePageContainer>
        <div className="py-[60px] relative z-10">
          <div className="grid grid-cols-1 custom-md:grid-cols-2 custom-lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {/* Email */}
            <div className="bg-[#111111] p-8 rounded-[24px] border border-[#333741] text-center hover:border-[#52A9FF] transition-colors">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-[#52A9FF] to-[#5D29FF] rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-manrope text-[20px] font-bold text-white mb-3">Email Us</h3>
              <p className="font-manrope text-[16px] text-[#CECFD2] mb-4">
                Drop us a line anytime
              </p>
              <Link href="mailto:hello@aipply.io" className="font-manrope text-[16px] text-[#52A9FF] hover:text-[#AE94FF] transition-colors">
                hello@aipply.io
              </Link>
            </div>

            {/* WhatsApp Community */}
            <div className="bg-[#111111] p-8 rounded-[24px] border border-[#333741] text-center hover:border-[#25D366] transition-colors">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-[#25D366] to-[#128C7E] rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.485 3.087"/>
                </svg>
              </div>
              <h3 className="font-manrope text-[20px] font-bold text-white mb-3">Join Community</h3>
              <p className="font-manrope text-[16px] text-[#CECFD2] mb-4">
                Connect with job seekers
              </p>
              <Link href="https://tinyurl.com/aipplyjobcommunity" target="_blank" rel="noopener noreferrer" className="font-manrope text-[16px] text-[#25D366] hover:text-[#128C7E] transition-colors">
                WhatsApp Community
              </Link>
            </div>

            {/* Careers */}
            <div className="bg-[#111111] p-8 rounded-[24px] border border-[#333741] text-center hover:border-[#AE94FF] transition-colors">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-[#AE94FF] to-[#52A9FF] rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 01-2 2H10a2 2 0 01-2-2V6m8 0h2a2 2 0 012 2v6.5M6 20h12a2 2 0 002-2v-6.5a2 2 0 00-2-2H6a2 2 0 00-2 2V18a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-manrope text-[20px] font-bold text-white mb-3">Work With Us</h3>
              <p className="font-manrope text-[16px] text-[#CECFD2] mb-4">
                Join our remote team
              </p>
              <Link href="mailto:careers@aipply.io" className="font-manrope text-[16px] text-[#AE94FF] hover:text-[#52A9FF] transition-colors">
                careers@aipply.io
              </Link>
            </div>

            {/* Address */}
            <div className="bg-[#111111] p-8 rounded-[24px] border border-[#333741] text-center hover:border-[#FF6B6B] transition-colors">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-[#FF6B6B] to-[#FF5722] rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="font-manrope text-[20px] font-bold text-white mb-3">Visit Us</h3>
              <p className="font-manrope text-[16px] text-[#CECFD2] mb-4">
                Our office location
              </p>
              <div className="font-manrope text-[14px] text-[#FF6B6B] leading-[150%]">
                <p>B - 301, Golden Palms</p>
                <p>Sector - 168</p>
                <p>Gautam Buddh Nagar</p>
                <p>Uttar Pradesh, 201305</p>
              </div>
            </div>
          </div>
        </div>
      </ResponsivePageContainer>

      {/* Contact Form Section */}
      <ResponsivePageContainer>
        <div className="py-[80px] relative">
          <div className="absolute z-0 w-full h-[800px] top-[0px] left-1/2 transform -translate-x-1/2 bg-[#52A9FF] bg-opacity-20 blur-[300px] backdrop-blur-[400px] rounded-full -z-10"></div>
          
          <div className="relative z-10 max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-manrope text-[36px] custom-md:text-[48px] font-semibold leading-[160%] text-white mb-4">
                📝 Send Us a Message
              </h2>
              <p className="font-manrope text-[18px] text-[#CECFD2]">
                Fill out the form below and we'll get back to you within 24 hours.
              </p>
            </div>

            <div className="bg-[#111111] p-8 custom-md:p-12 rounded-[30px] border border-[#333741]">
              {submitStatus === 'success' && (
                <div className="mb-8 p-4 bg-gradient-to-r from-[#22C55E] to-[#16A34A] rounded-[12px] text-center">
                  <p className="font-manrope text-white font-semibold">
                    ✅ Message sent successfully! We'll get back to you soon.
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 custom-md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block font-manrope text-[16px] font-medium text-white mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-[#1A1A1A] border border-[#333741] rounded-[12px] text-white font-manrope text-[16px] focus:border-[#52A9FF] focus:outline-none transition-colors"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block font-manrope text-[16px] font-medium text-white mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-[#1A1A1A] border border-[#333741] rounded-[12px] text-white font-manrope text-[16px] focus:border-[#52A9FF] focus:outline-none transition-colors"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="inquiryType" className="block font-manrope text-[16px] font-medium text-white mb-2">
                    Inquiry Type
                  </label>
                  <select
                    id="inquiryType"
                    name="inquiryType"
                    value={formData.inquiryType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-[#1A1A1A] border border-[#333741] rounded-[12px] text-white font-manrope text-[16px] focus:border-[#52A9FF] focus:outline-none transition-colors"
                  >
                    <option value="general">General Inquiry</option>
                    <option value="support">Product Support</option>
                    <option value="partnership">Partnership</option>
                    <option value="careers">Careers</option>
                    <option value="press">Press & Media</option>
                    <option value="feedback">Feedback</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="subject" className="block font-manrope text-[16px] font-medium text-white mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-[#1A1A1A] border border-[#333741] rounded-[12px] text-white font-manrope text-[16px] focus:border-[#52A9FF] focus:outline-none transition-colors"
                    placeholder="Brief subject line"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block font-manrope text-[16px] font-medium text-white mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    value={formData.message}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-[#1A1A1A] border border-[#333741] rounded-[12px] text-white font-manrope text-[16px] focus:border-[#52A9FF] focus:outline-none transition-colors resize-none"
                    placeholder="Tell us more about your inquiry..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-[#52A9FF] to-[#5D29FF] px-8 py-4 rounded-[12px] font-manrope text-[16px] font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Sending Message...
                    </span>
                  ) : (
                    "Send Message"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </ResponsivePageContainer>

      {/* FAQ Section */}
      <ResponsivePageContainer>
        <div className="py-[80px] relative z-10">
          <div className="text-center mb-12">
            <h2 className="font-manrope text-[36px] custom-md:text-[48px] font-semibold leading-[160%] text-white mb-4">
              ❓ Frequently Asked Questions
            </h2>
            <p className="font-manrope text-[18px] text-[#CECFD2]">
              Quick answers to common questions
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-4">
            <div className="bg-[#111111] p-6 rounded-[20px] border border-[#333741]">
              <h3 className="font-manrope text-[18px] font-semibold text-white mb-3">
                🚀 How does AiPply work?
              </h3>
              <p className="font-manrope text-[16px] text-[#CECFD2] leading-[150%]">
                AiPply automates your job search by finding relevant positions, customizing your resume for each application, and applying on your behalf. You just need to set your preferences and let our AI handle the rest.
              </p>
            </div>

            <div className="bg-[#111111] p-6 rounded-[20px] border border-[#333741]">
              <h3 className="font-manrope text-[18px] font-semibold text-white mb-3">
                💰 What are your pricing plans?
              </h3>
              <p className="font-manrope text-[16px] text-[#CECFD2] leading-[150%]">
                We offer flexible pricing plans to suit different needs, from individual job seekers to enterprise solutions. Contact us at hello@aipply.io for detailed pricing information.
              </p>
            </div>

            <div className="bg-[#111111] p-6 rounded-[20px] border border-[#333741]">
              <h3 className="font-manrope text-[18px] font-semibold text-white mb-3">
                🌍 Do you support international job searches?
              </h3>
              <p className="font-manrope text-[16px] text-[#CECFD2] leading-[150%]">
                Yes! AiPply supports job searches globally. Our AI can adapt to different markets, job board formats, and application requirements across various countries.
              </p>
            </div>

            <div className="bg-[#111111] p-6 rounded-[20px] border border-[#333741]">
              <h3 className="font-manrope text-[18px] font-semibold text-white mb-3">
                🤝 Are you hiring?
              </h3>
              <p className="font-manrope text-[16px] text-[#CECFD2] leading-[150%]">
                Yes! We're always looking for talented individuals to join our remote-first team. Send your resume to careers@aipply.io or check our current openings.
              </p>
            </div>
          </div>
        </div>
      </ResponsivePageContainer>

      {/* Response Time */}
      <ResponsivePageContainer>
        <div className="py-[60px] relative z-10">
          <div className="bg-gradient-to-r from-[#52A9FF] to-[#5D29FF] p-8 rounded-[24px] text-center">
            <h3 className="font-manrope text-[24px] font-bold text-white mb-4">
              ⚡ Lightning Fast Response
            </h3>
            <p className="font-manrope text-[18px] text-white opacity-90">
              We typically respond within <strong>24 hours</strong> on weekdays and <strong>48 hours</strong> on weekends.
            </p>
          </div>
        </div>
      </ResponsivePageContainer>

      <Footer />
      <ScrollToTopBtn />
    </div>
  );
};

export default ContactUsPage;
