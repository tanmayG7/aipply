"use client";
import { useEffect } from "react";
import Header from "@/components/common/header/header";
import { ResponsivePageContainer } from "@/components/common/responsivePageContainer/responsivePageContainer";
import Footer from "@/components/common/footer/footer";
import ScrollToTopBtn from "@/components/common/scrollToTopBtn/scrollToTopBtn";

export default function PrivacyPolicy() {
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-[#000000] min-h-screen">
      <div className="pt-10">
        <Header />
      </div>

      <ResponsivePageContainer>
        <div className="relative">
          {/* Background blur effect */}
          <div className="absolute w-full hero-blur-bg top-[50px] left-1/2 transform -translate-x-1/2 bg-[#AE94FF] bg-opacity-30 backdrop-blur-[400px] rounded-full blur-[200px]"></div>
          
          <div className="relative px-container pt-[100px] pb-[50px]">
            {/* Header Section */}
            <div className="flex flex-col gap-6 items-center justify-center mb-16">
              <h1 className="font-manrope text-fluid-hero font-bold custom-md:font-semibold text-[#F5F5F6] text-center">
                Privacy Policy
              </h1>
              <p className="font-manrope font-normal text-fluid-lead text-[#CECFD2] text-center max-w-3xl">
                Your privacy is important to us. This policy explains how Aipply collects, uses, and protects your personal information.
              </p>
              <p className="font-manrope font-normal text-[14px] text-[#888] text-center">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>

            {/* Content Section */}
            <div className="max-w-4xl mx-auto">
              <div className="bg-[#111111] bg-opacity-50 backdrop-blur-sm rounded-xl border border-[#333741] p-8 custom-md:p-12">
                <div className="space-y-8 text-[#CECFD2]">
                  
                  {/* Introduction */}
                  <section>
                    <h2 className="font-manrope text-[24px] font-semibold text-[#F5F5F6] mb-4">
                      1. Introduction
                    </h2>
                    <p className="font-manrope text-[16px] leading-[24px] mb-4">
                      Welcome to Aipply ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our job application platform and services.
                    </p>
                    <p className="font-manrope text-[16px] leading-[24px]">
                      By using our services, you agree to the collection and use of information in accordance with this policy.
                    </p>
                  </section>

                  {/* Information We Collect */}
                  <section>
                    <h2 className="font-manrope text-[24px] font-semibold text-[#F5F5F6] mb-4">
                      2. Information We Collect
                    </h2>
                    
                    <h3 className="font-manrope text-[18px] font-semibold text-[#F5F5F6] mb-3">
                      2.1 Personal Information
                    </h3>
                    <p className="font-manrope text-[16px] leading-[24px] mb-4">
                      We collect personal information that you provide to us, including:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 mb-6">
                      <li>Full name, email address, phone number</li>
                      <li>Resume, CV, and professional documents</li>
                      <li>Work history, education, and qualifications</li>
                      <li>Job preferences and career objectives</li>
                      <li>LinkedIn profile and social media links</li>
                      <li>Payment information for premium services</li>
                    </ul>

                    <h3 className="font-manrope text-[18px] font-semibold text-[#F5F5F6] mb-3">
                      2.2 Automatically Collected Information
                    </h3>
                    <ul className="list-disc pl-6 space-y-2 mb-6">
                      <li>IP address and device information</li>
                      <li>Browser type and version</li>
                      <li>Usage data and platform interactions</li>
                      <li>Cookies and tracking technologies</li>
                      <li>Log files and analytics data</li>
                    </ul>

                    <h3 className="font-manrope text-[18px] font-semibold text-[#F5F5F6] mb-3">
                      2.3 Third-Party Information
                    </h3>
                    <p className="font-manrope text-[16px] leading-[24px]">
                      We may receive information about you from job boards, professional networks, and other third-party sources to enhance our job matching services.
                    </p>
                  </section>

                  {/* How We Use Your Information */}
                  <section>
                    <h2 className="font-manrope text-[24px] font-semibold text-[#F5F5F6] mb-4">
                      3. How We Use Your Information
                    </h2>
                    <p className="font-manrope text-[16px] leading-[24px] mb-4">
                      We use your information to:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Provide and maintain our job application services</li>
                      <li>Apply to jobs on your behalf using our AI agent</li>
                      <li>Match you with relevant job opportunities</li>
                      <li>Process payments and manage your account</li>
                      <li>Communicate with you about our services</li>
                      <li>Improve our platform and user experience</li>
                      <li>Comply with legal obligations</li>
                      <li>Prevent fraud and ensure platform security</li>
                    </ul>
                  </section>

                  {/* Information Sharing */}
                  <section>
                    <h2 className="font-manrope text-[24px] font-semibold text-[#F5F5F6] mb-4">
                      4. Information Sharing and Disclosure
                    </h2>
                    
                    <h3 className="font-manrope text-[18px] font-semibold text-[#F5F5F6] mb-3">
                      4.1 With Employers
                    </h3>
                    <p className="font-manrope text-[16px] leading-[24px] mb-4">
                      We share your profile information, resume, and application materials with potential employers when applying to jobs on your behalf.
                    </p>

                    <h3 className="font-manrope text-[18px] font-semibold text-[#F5F5F6] mb-3">
                      4.2 Service Providers
                    </h3>
                    <p className="font-manrope text-[16px] leading-[24px] mb-4">
                      We work with third-party service providers for payment processing, analytics, cloud storage, and other business functions.
                    </p>

                    <h3 className="font-manrope text-[18px] font-semibold text-[#F5F5F6] mb-3">
                      4.3 Legal Requirements
                    </h3>
                    <p className="font-manrope text-[16px] leading-[24px]">
                      We may disclose your information if required by law, court order, or to protect our rights and safety.
                    </p>
                  </section>

                  {/* Data Security */}
                  <section>
                    <h2 className="font-manrope text-[24px] font-semibold text-[#F5F5F6] mb-4">
                      5. Data Security
                    </h2>
                    <p className="font-manrope text-[16px] leading-[24px] mb-4">
                      We implement appropriate technical and organizational security measures to protect your personal information, including:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Encryption of data in transit and at rest</li>
                      <li>Regular security assessments and updates</li>
                      <li>Access controls and authentication measures</li>
                      <li>Secure data storage and backup systems</li>
                      <li>Employee training on data protection</li>
                    </ul>
                  </section>

                  {/* Your Rights */}
                  <section>
                    <h2 className="font-manrope text-[24px] font-semibold text-[#F5F5F6] mb-4">
                      6. Your Privacy Rights
                    </h2>
                    <p className="font-manrope text-[16px] leading-[24px] mb-4">
                      Depending on your location, you may have the following rights:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li><strong>Access:</strong> Request copies of your personal data</li>
                      <li><strong>Rectification:</strong> Correct inaccurate or incomplete data</li>
                      <li><strong>Erasure:</strong> Request deletion of your personal data</li>
                      <li><strong>Portability:</strong> Transfer your data to another service</li>
                      <li><strong>Restriction:</strong> Limit how we process your data</li>
                      <li><strong>Opt-out:</strong> Withdraw consent for data processing</li>
                    </ul>
                  </section>

                  {/* Cookies */}
                  <section>
                    <h2 className="font-manrope text-[24px] font-semibold text-[#F5F5F6] mb-4">
                      7. Cookies and Tracking
                    </h2>
                    <p className="font-manrope text-[16px] leading-[24px] mb-4">
                      We use cookies and similar tracking technologies to improve your experience. You can control cookie settings through your browser preferences.
                    </p>
                    <p className="font-manrope text-[16px] leading-[24px]">
                      Our cookies help us analyze usage patterns, remember your preferences, and provide personalized job recommendations.
                    </p>
                  </section>

                  {/* Data Retention */}
                  <section>
                    <h2 className="font-manrope text-[24px] font-semibold text-[#F5F5F6] mb-4">
                      8. Data Retention
                    </h2>
                    <p className="font-manrope text-[16px] leading-[24px]">
                      We retain your personal information for as long as necessary to provide our services, comply with legal obligations, and resolve disputes. You can request deletion of your account and associated data at any time.
                    </p>
                  </section>

                  {/* International Transfers */}
                  <section>
                    <h2 className="font-manrope text-[24px] font-semibold text-[#F5F5F6] mb-4">
                      9. International Data Transfers
                    </h2>
                    <p className="font-manrope text-[16px] leading-[24px]">
                      Your information may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place to protect your data during international transfers.
                    </p>
                  </section>

                  {/* Children's Privacy */}
                  <section>
                    <h2 className="font-manrope text-[24px] font-semibold text-[#F5F5F6] mb-4">
                      10. Children's Privacy
                    </h2>
                    <p className="font-manrope text-[16px] leading-[24px]">
                      Our services are not intended for individuals under 18 years of age. We do not knowingly collect personal information from children under 18.
                    </p>
                  </section>

                  {/* California Privacy Rights */}
                  <section>
                    <h2 className="font-manrope text-[24px] font-semibold text-[#F5F5F6] mb-4">
                      11. California Privacy Rights (CCPA)
                    </h2>
                    <p className="font-manrope text-[16px] leading-[24px] mb-4">
                      If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA):
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Right to know what personal information is collected</li>
                      <li>Right to delete personal information</li>
                      <li>Right to opt-out of the sale of personal information</li>
                      <li>Right to non-discrimination for exercising CCPA rights</li>
                    </ul>
                  </section>

                  {/* Updates */}
                  <section>
                    <h2 className="font-manrope text-[24px] font-semibold text-[#F5F5F6] mb-4">
                      12. Policy Updates
                    </h2>
                    <p className="font-manrope text-[16px] leading-[24px]">
                      We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
                    </p>
                  </section>

                  {/* Contact */}
                  <section>
                    <h2 className="font-manrope text-[24px] font-semibold text-[#F5F5F6] mb-4">
                      13. Contact Us
                    </h2>
                    <p className="font-manrope text-[16px] leading-[24px] mb-4">
                      If you have any questions about this Privacy Policy or wish to exercise your privacy rights, please contact us:
                    </p>
                    <div className="bg-[#1A1A1A] border border-[#333741] rounded-lg p-6">
                      <p className="font-manrope text-[16px] leading-[24px] mb-2">
                        <strong className="text-[#F5F5F6]">Email:</strong> info@aipply.com
                      </p>
                      <p className="font-manrope text-[16px] leading-[24px] mb-2">
                        <strong className="text-[#F5F5F6]">Address:</strong> B 301, Golden Palms, Noida
                      </p>
                      <p className="font-manrope text-[16px] leading-[24px]">
                        <strong className="text-[#F5F5F6]">Phone:</strong> 9999852132
                      </p>
                    </div>
                  </section>

                </div>
              </div>
            </div>
          </div>
        </div>
      </ResponsivePageContainer>

      <Footer />
      <ScrollToTopBtn />
    </div>
  );
}
