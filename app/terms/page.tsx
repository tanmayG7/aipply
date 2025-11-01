"use client";
import { useEffect } from "react";
import Header from "@/components/common/header/header";
import { ResponsivePageContainer } from "@/components/common/responsivePageContainer/responsivePageContainer";
import Footer from "@/components/common/footer/footer";
import ScrollToTopBtn from "@/components/common/scrollToTopBtn/scrollToTopBtn";

export default function TermsAndConditions() {
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
                Terms and Conditions
              </h1>
              <p className="font-manrope font-normal text-fluid-lead text-[#CECFD2] text-center max-w-3xl">
                Please read these terms and conditions carefully before using our services. By accessing Aipply, you agree to be bound by these terms.
              </p>
              <p className="font-manrope font-normal text-[14px] text-[#888] text-center">
                Last updated: May 11, 2025
              </p>
            </div>

            {/* Content Section */}
            <div className="max-w-4xl mx-auto">
              <div className="bg-[#111111] bg-opacity-50 backdrop-blur-sm rounded-xl border border-[#333741] p-8 custom-md:p-12">
                <div className="space-y-8 text-[#CECFD2]">
                  
                  {/* Agreement Section */}
                  <section>
                    <h2 className="font-manrope text-[24px] font-semibold text-[#F5F5F6] mb-4">
                      Agreement to Our Legal Terms
                    </h2>
                    <p className="font-manrope text-[16px] leading-[24px] mb-4">
                      We are <strong className="text-[#F5F5F6]">DINMAY JOBSEARCH TECH LLP</strong>, doing business as <strong className="text-[#F5F5F6]">AiPply</strong> (&quot;Company&quot;, &quot;we&quot;, &quot;us&quot;, &quot;our&quot;), a company registered in India at B-301, Golden Palms, Sector 168, Gautam Buddha Nagar, UP 201305.
                    </p>
                    <p className="font-manrope text-[16px] leading-[24px] mb-4">
                      We operate the website <strong className="text-[#F5F5F6]">http://www.aipply.io</strong> (the "Site"), as well as any other related products and services that refer or link to these legal terms (the "Legal Terms") (collectively, the "Services").
                    </p>
                    <p className="font-manrope text-[16px] leading-[24px] mb-4">
                      These Legal Terms constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you"), and DINMAY JOBSEARCH TECH LLP, concerning your access to and use of the Services.
                    </p>
                    <p className="font-manrope text-[16px] leading-[24px] text-[#FF6B6B]">
                      <strong>IF YOU DO NOT AGREE WITH ALL OF THESE LEGAL TERMS, THEN YOU ARE EXPRESSLY PROHIBITED FROM USING THE SERVICES AND YOU MUST DISCONTINUE USE IMMEDIATELY.</strong>
                    </p>
                  </section>

                  {/* Our Services */}
                  <section>
                    <h2 className="font-manrope text-[24px] font-semibold text-[#F5F5F6] mb-4">
                      1. Our Services
                    </h2>
                    <p className="font-manrope text-[16px] leading-[24px]">
                      The information provided when using the Services is not intended for distribution to or use by any person or entity in any jurisdiction or country where such distribution or use would be contrary to law or regulation or which would subject us to any registration requirement within such jurisdiction or country.
                    </p>
                  </section>

                  {/* Intellectual Property Rights */}
                  <section>
                    <h2 className="font-manrope text-[24px] font-semibold text-[#F5F5F6] mb-4">
                      2. Intellectual Property Rights
                    </h2>
                    
                    <h3 className="font-manrope text-[18px] font-semibold text-[#F5F5F6] mb-3">
                      Our Intellectual Property
                    </h3>
                    <p className="font-manrope text-[16px] leading-[24px] mb-4">
                      We are the owner or the licensee of all intellectual property rights in our Services, including all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics in the Services (collectively, the "Content"), as well as the trademarks, service marks, and logos contained therein (the "Marks").
                    </p>

                    <h3 className="font-manrope text-[18px] font-semibold text-[#F5F5F6] mb-3">
                      Your Use of Our Services
                    </h3>
                    <p className="font-manrope text-[16px] leading-[24px] mb-4">
                      Subject to your compliance with these Legal Terms, we grant you a non-exclusive, non-transferable, revocable license to:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 mb-4">
                      <li>Access the Services</li>
                      <li>Download or print a copy of any portion of the Content to which you have properly gained access</li>
                    </ul>
                    <p className="font-manrope text-[16px] leading-[24px]">
                      This license is solely for your personal, non-commercial use.
                    </p>
                  </section>

                  {/* User Representations */}
                  <section>
                    <h2 className="font-manrope text-[24px] font-semibold text-[#F5F5F6] mb-4">
                      3. User Representations
                    </h2>
                    <p className="font-manrope text-[16px] leading-[24px] mb-4">
                      By using the Services, you represent and warrant that:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>All registration information you submit will be true, accurate, current, and complete</li>
                      <li>You will maintain the accuracy of such information and promptly update registration information as necessary</li>
                      <li>You have the legal capacity and agree to comply with these Legal Terms</li>
                      <li>You are not a minor in the jurisdiction in which you reside</li>
                      <li>You will not access the Services through automated or non-human means</li>
                      <li>You will not use the Services for any illegal or unauthorized purpose</li>
                      <li>Your use of the Services will not violate any applicable law or regulation</li>
                    </ul>
                  </section>

                  {/* User Registration */}
                  <section>
                    <h2 className="font-manrope text-[24px] font-semibold text-[#F5F5F6] mb-4">
                      4. User Registration
                    </h2>
                    <p className="font-manrope text-[16px] leading-[24px]">
                      You may be required to register to use the Services. You agree to keep your password confidential and will be responsible for all use of your account and password. We reserve the right to remove, reclaim, or change a username you select if we determine, in our sole discretion, that such username is inappropriate, obscene, or otherwise objectionable.
                    </p>
                  </section>

                  {/* Purchases and Payment */}
                  <section>
                    <h2 className="font-manrope text-[24px] font-semibold text-[#F5F5F6] mb-4">
                      5. Purchases and Payment
                    </h2>
                    <p className="font-manrope text-[16px] leading-[24px] mb-4">
                      We accept the following forms of payment:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 mb-4">
                      <li>UPI</li>
                      <li>Razorpay</li>
                    </ul>
                    <p className="font-manrope text-[16px] leading-[24px] mb-4">
                      You agree to provide current, complete, and accurate purchase and account information for all purchases made via the Services. All payments shall be in INR.
                    </p>
                    <p className="font-manrope text-[16px] leading-[24px]">
                      We reserve the right to refuse any order placed through the Services and may limit or cancel quantities purchased per person, per household, or per order.
                    </p>
                  </section>

                  {/* Subscriptions */}
                  <section>
                    <h2 className="font-manrope text-[24px] font-semibold text-[#F5F5F6] mb-4">
                      6. Subscriptions
                    </h2>
                    
                    <h3 className="font-manrope text-[18px] font-semibold text-[#F5F5F6] mb-3">
                      Billing and Renewal
                    </h3>
                    <p className="font-manrope text-[16px] leading-[24px] mb-4">
                      Your subscription will continue and automatically renew unless canceled. You consent to our charging your payment method on a recurring basis without requiring your prior approval for each recurring charge.
                    </p>

                    <h3 className="font-manrope text-[18px] font-semibold text-[#F5F5F6] mb-3">
                      Free Trial
                    </h3>
                    <p className="font-manrope text-[16px] leading-[24px] mb-4">
                      We offer a 30-day free trial to new users who register with the Services. The account will not be charged and the subscription will be suspended until upgraded to a paid version at the end of the free trial.
                    </p>

                    <h3 className="font-manrope text-[18px] font-semibold text-[#F5F5F6] mb-3">
                      Cancellation
                    </h3>
                    <p className="font-manrope text-[16px] leading-[24px]">
                      All purchases are non-refundable. You can cancel your subscription at any time by contacting us. Your cancellation will take effect at the end of the current paid term.
                    </p>
                  </section>

                  {/* Prohibited Activities */}
                  <section>
                    <h2 className="font-manrope text-[24px] font-semibold text-[#F5F5F6] mb-4">
                      7. Prohibited Activities
                    </h2>
                    <p className="font-manrope text-[16px] leading-[24px] mb-4">
                      You may not access or use the Services for any purpose other than that for which we make the Services available. As a user of the Services, you agree not to:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Systematically retrieve data or other content from the Services to create or compile a collection, compilation, database, or directory without written permission</li>
                      <li>Trick, defraud, or mislead us and other users, especially in any attempt to learn sensitive account information</li>
                      <li>Circumvent, disable, or otherwise interfere with security-related features of the Services</li>
                      <li>Use any information obtained from the Services to harass, abuse, or harm another person</li>
                      <li>Use the Services in a manner inconsistent with any applicable laws or regulations</li>
                      <li>Upload or transmit viruses, Trojan horses, or other material that interferes with the Services</li>
                      <li>Engage in any automated use of the system, such as using scripts or data mining tools</li>
                      <li>Attempt to impersonate another user or person</li>
                      <li>Interfere with, disrupt, or create an undue burden on the Services</li>
                    </ul>
                  </section>

                  {/* Privacy Policy */}
                  <section>
                    <h2 className="font-manrope text-[24px] font-semibold text-[#F5F5F6] mb-4">
                      8. Privacy Policy
                    </h2>
                    <p className="font-manrope text-[16px] leading-[24px]">
                      We care about data privacy and security. Please review our Privacy Policy: <a href="http://www.aipply.io/privacy" className="text-[#AE94FF] hover:underline">http://www.aipply.io/privacy</a>. By using the Services, you agree to be bound by our Privacy Policy, which is incorporated into these Legal Terms.
                    </p>
                  </section>

                  {/* Term and Termination */}
                  <section>
                    <h2 className="font-manrope text-[24px] font-semibold text-[#F5F5F6] mb-4">
                      9. Term and Termination
                    </h2>
                    <p className="font-manrope text-[16px] leading-[24px] mb-4">
                      These Legal Terms shall remain in full force and effect while you use the Services. We reserve the right to, in our sole discretion and without notice or liability, deny access to and use of the Services to any person for any reason or for no reason.
                    </p>
                    <p className="font-manrope text-[16px] leading-[24px]">
                      We may terminate your use or participation in the Services or delete your account and any content or information that you posted at any time, without warning, in our sole discretion.
                    </p>
                  </section>

                  {/* Governing Law */}
                  <section>
                    <h2 className="font-manrope text-[24px] font-semibold text-[#F5F5F6] mb-4">
                      10. Governing Law
                    </h2>
                    <p className="font-manrope text-[16px] leading-[24px]">
                      These Legal Terms shall be governed by and defined following the laws of India. DINMAY JOBSEARCH TECH LLP and yourself irrevocably consent that the courts of India shall have exclusive jurisdiction to resolve any dispute which may arise in connection with these Legal Terms.
                    </p>
                  </section>

                  {/* Dispute Resolution */}
                  <section>
                    <h2 className="font-manrope text-[24px] font-semibold text-[#F5F5F6] mb-4">
                      11. Dispute Resolution
                    </h2>
                    
                    <h3 className="font-manrope text-[18px] font-semibold text-[#F5F5F6] mb-3">
                      Informal Negotiations
                    </h3>
                    <p className="font-manrope text-[16px] leading-[24px] mb-4">
                      To expedite resolution and control the cost of any dispute, the Parties agree to first attempt to negotiate any Dispute informally for at least thirty (30) days before initiating arbitration.
                    </p>

                    <h3 className="font-manrope text-[18px] font-semibold text-[#F5F5F6] mb-3">
                      Binding Arbitration
                    </h3>
                    <p className="font-manrope text-[16px] leading-[24px]">
                      Any dispute arising out of or in connection with these Legal Terms shall be referred to and finally resolved by arbitration. The seat of arbitration shall be Gautam Buddha Nagar, India, and the language of the proceedings shall be English.
                    </p>
                  </section>

                  {/* Disclaimer */}
                  <section>
                    <h2 className="font-manrope text-[24px] font-semibold text-[#F5F5F6] mb-4">
                      12. Disclaimer
                    </h2>
                    <p className="font-manrope text-[16px] leading-[24px] text-[#FF6B6B]">
                      <strong>THE SERVICES ARE PROVIDED ON AN AS-IS AND AS-AVAILABLE BASIS. YOU AGREE THAT YOUR USE OF THE SERVICES WILL BE AT YOUR SOLE RISK. TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, IN CONNECTION WITH THE SERVICES AND YOUR USE THEREOF.</strong>
                    </p>
                  </section>

                  {/* Limitations of Liability */}
                  <section>
                    <h2 className="font-manrope text-[24px] font-semibold text-[#F5F5F6] mb-4">
                      13. Limitations of Liability
                    </h2>
                    <p className="font-manrope text-[16px] leading-[24px]">
                      In no event will we or our directors, employees, or agents be liable to you or any third party for any direct, indirect, consequential, exemplary, incidental, special, or punitive damages, including lost profit, lost revenue, loss of data, or other damages arising from your use of the Services.
                    </p>
                  </section>

                  {/* Contact */}
                  <section>
                    <h2 className="font-manrope text-[24px] font-semibold text-[#F5F5F6] mb-4">
                      14. Contact Us
                    </h2>
                    <p className="font-manrope text-[16px] leading-[24px] mb-4">
                      In order to resolve a complaint regarding the Services or to receive further information regarding use of the Services, please contact us:
                    </p>
                    <div className="bg-[#1A1A1A] border border-[#333741] rounded-lg p-6">
                      <p className="font-manrope text-[16px] leading-[24px] mb-2">
                        <strong className="text-[#F5F5F6]">Company:</strong> DINMAY JOBSEARCH TECH LLP
                      </p>
                      <p className="font-manrope text-[16px] leading-[24px] mb-2">
                        <strong className="text-[#F5F5F6]">Address:</strong> B-301, Golden Palms, Sector 168, Gautam Buddha Nagar, UP 201305, India
                      </p>
                      <p className="font-manrope text-[16px] leading-[24px] mb-2">
                        <strong className="text-[#F5F5F6]">Phone:</strong> 9999852132
                      </p>
                      <p className="font-manrope text-[16px] leading-[24px]">
                        <strong className="text-[#F5F5F6]">Email:</strong> tanmay@aipply.io
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
