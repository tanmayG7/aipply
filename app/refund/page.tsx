"use client";
import { useEffect } from "react";
import Header from "@/components/common/header/header";
import { ResponsivePageContainer } from "@/components/common/responsivePageContainer/responsivePageContainer";
import Footer from "@/components/common/footer/footer";
import ScrollToTopBtn from "@/components/common/scrollToTopBtn/scrollToTopBtn";
{/* Baads */}
export default function CancellationAndRefundPolicy() {
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
          <div className="absolute w-full h-[400px] top-[50px] left-1/2 transform -translate-x-1/2 bg-[#AE94FF] bg-opacity-30 backdrop-blur-[400px] rounded-full blur-[200px]"></div>
          
          <div className="relative px-[20px] custom-lg:px-[58px] pt-[100px] pb-[50px]">
            {/* Header Section */}
            <div className="flex flex-col gap-6 items-center justify-center mb-16">
              <h1 className="font-manrope text-[40px] custom-md:text-[60px] custom-md:leading-[72px] font-bold custom-md:font-semibold text-[#F5F5F6] text-center">
                Cancellation and Refund Policy
              </h1>
              <p className="font-manrope font-normal text-[18px] leading-[28px] text-[#CECFD2] text-center max-w-3xl">
                This policy outlines the terms and conditions for subscription cancellations and refunds for AiPply services.
              </p>
              <p className="font-manrope font-normal text-[14px] text-[#888] text-center">
                Last updated: July 01, 2025
              </p>
            </div>

            {/* Content Section */}
            <div className="max-w-4xl mx-auto">
              <div className="bg-[#111111] bg-opacity-50 backdrop-blur-sm rounded-xl border border-[#333741] p-8 custom-md:p-12">
                <div className="space-y-8 text-[#CECFD2]">
                  
                  {/* Overview */}
                  <section>
                    <h2 className="font-manrope text-[24px] font-semibold text-[#F5F5F6] mb-4">
                      Policy Overview
                    </h2>
                    <p className="font-manrope text-[16px] leading-[24px] mb-4">
                      At <strong className="text-[#F5F5F6]">AiPply</strong>, we provide an automatic job application service that applies to online job portals on your behalf. This policy explains how cancellations and refunds are handled for our monthly subscription service.
                    </p>
                    <div className="bg-[#1A1A1A] border border-[#AE94FF] rounded-lg p-4">
                      <p className="font-manrope text-[16px] leading-[24px] text-[#AE94FF]">
                        <strong>Service Note:</strong> Since our automated job application service provides immediate value by applying to jobs on your behalf, we have specific policies to ensure fair usage while protecting against service disruptions.
                      </p>
                    </div>
                  </section>

                  {/* Free Trial */}
                  <section>
                    <h2 className="font-manrope text-[24px] font-semibold text-[#F5F5F6] mb-4">
                      1. Free Trial Period
                    </h2>
                    <p className="font-manrope text-[16px] leading-[24px] mb-4">
                      We offer a <strong className="text-[#AE94FF]">30-day free trial</strong> to new users who register with AiPply.
                    </p>
                    <ul className="list-disc pl-6 space-y-2 mb-4">
                      <li>During the free trial, you can cancel at any time without any charges</li>
                      <li>Your account will not be charged during the trial period</li>
                      <li>The subscription will be suspended until you choose to upgrade to a paid version</li>
                      <li>You can cancel your trial by contacting us at <a href="mailto:tanmay@aipply.io" className="text-[#AE94FF] hover:underline">tanmay@aipply.io</a></li>
                    </ul>
                  </section>

                  {/* Subscription Cancellation */}
                  <section>
                    <h2 className="font-manrope text-[24px] font-semibold text-[#F5F5F6] mb-4">
                      2. Subscription Cancellation
                    </h2>
                    
                    <h3 className="font-manrope text-[18px] font-semibold text-[#F5F5F6] mb-3">
                      How to Cancel
                    </h3>
                    <p className="font-manrope text-[16px] leading-[24px] mb-4">
                      You can cancel your AiPply subscription at any time by:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 mb-4">
                      <li>Contacting our support team at <a href="mailto:tanmay@aipply.io" className="text-[#AE94FF] hover:underline">tanmay@aipply.io</a></li>
                      <li>Calling us at <a href="tel:9999852132" className="text-[#AE94FF] hover:underline">9999852132</a></li>
                      <li>Through your account dashboard (if available)</li>
                    </ul>

                    <h3 className="font-manrope text-[18px] font-semibold text-[#F5F5F6] mb-3">
                      Cancellation Timeline
                    </h3>
                    <p className="font-manrope text-[16px] leading-[24px] mb-4">
                      Your cancellation will take effect at the end of your current paid billing period. You will continue to have access to all premium features until that date.
                    </p>
                  </section>

                  {/* Refund Policy */}
                  <section>
                    <h2 className="font-manrope text-[24px] font-semibold text-[#F5F5F6] mb-4">
                      3. Refund Policy
                    </h2>
                    
                    <h3 className="font-manrope text-[18px] font-semibold text-[#F5F5F6] mb-3">
                      48-Hour Cancellation Window
                    </h3>
                    <div className="bg-[#1A1A1A] border border-[#AE94FF] rounded-lg p-4 mb-4">
                      <p className="font-manrope text-[16px] leading-[24px] text-[#AE94FF]">
                        <strong>New Subscriber Protection:</strong> You may request a full refund within 48 hours of your initial subscription purchase, provided our automated job application service has not yet been activated on your account.
                      </p>
                    </div>

                    <h3 className="font-manrope text-[18px] font-semibold text-[#F5F5F6] mb-3">
                      Service Disruption Refunds
                    </h3>
                    <p className="font-manrope text-[16px] leading-[24px] mb-4">
                      We understand that service reliability is crucial for job applications. You may be eligible for a partial or full refund if:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 mb-4">
                      <li><strong className="text-[#F5F5F6]">Major Service Outage:</strong> Our automated application service is unavailable for more than 72 consecutive hours</li>
                      <li><strong className="text-[#F5F5F6]">Application Failures:</strong> Systematic failures prevent job applications from being submitted for more than 5 consecutive days</li>
                      <li><strong className="text-[#F5F5F6]">Portal Integration Issues:</strong> Loss of connectivity to major job portals that affects more than 50% of available positions</li>
                      <li><strong className="text-[#F5F5F6]">Account Access Problems:</strong> Technical issues that prevent you from accessing your account or dashboard for extended periods</li>
                    </ul>
                    <p className="font-manrope text-[16px] leading-[24px] mb-4">
                      Refund amount will be calculated based on the duration of service disruption relative to your monthly billing cycle.
                    </p>

                    <h3 className="font-manrope text-[18px] font-semibold text-[#F5F5F6] mb-3">
                      Standard Policy
                    </h3>
                    <p className="font-manrope text-[16px] leading-[24px] mb-4">
                      Outside of the 48-hour window and service disruption cases, our standard policy applies:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 mb-4">
                      <li>Monthly subscriptions are generally non-refundable once services have been provided</li>
                      <li>Our automated system begins applying to jobs immediately upon activation</li>
                      <li>We provide a 30-day free trial to evaluate our service before any payment</li>
                    </ul>

                    <h3 className="font-manrope text-[18px] font-semibold text-[#F5F5F6] mb-3">
                      Additional Refund Considerations
                    </h3>
                    <p className="font-manrope text-[16px] leading-[24px] mb-4">
                      We may also consider refunds for:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 mb-4">
                      <li><strong className="text-[#F5F5F6]">Billing Errors:</strong> Incorrect charges due to system errors</li>
                      <li><strong className="text-[#F5F5F6]">Duplicate Charges:</strong> Multiple charges for the same billing period</li>
                      <li><strong className="text-[#F5F5F6]">Unauthorized Charges:</strong> Charges made without proper authorization</li>
                      <li><strong className="text-[#F5F5F6]">Service Mismatch:</strong> If our service cannot access job portals in your target industry/location</li>
                    </ul>
                    <p className="font-manrope text-[16px] leading-[24px]">
                      All refund requests must be submitted within <strong className="text-[#AE94FF]">30 days</strong> of the charge and will be reviewed within 5-7 business days.
                    </p>
                  </section>

                  {/* Account Credits */}
                  <section>
                    <h2 className="font-manrope text-[24px] font-semibold text-[#F5F5F6] mb-4">
                      4. Account Credits and Alternatives
                    </h2>
                    <p className="font-manrope text-[16px] leading-[24px] mb-4">
                      When a full refund is not applicable, we offer flexible alternatives to ensure you get value from your investment:
                    </p>
                    
                    <h3 className="font-manrope text-[18px] font-semibold text-[#F5F5F6] mb-3">
                      Account Credits
                    </h3>
                    <ul className="list-disc pl-6 space-y-2 mb-4">
                      <li><strong className="text-[#F5F5F6]">Service Credits:</strong> Applied to your account for future monthly billing cycles</li>
                      <li><strong className="text-[#F5F5F6]">Application Credits:</strong> Additional job applications beyond your plan limits</li>
                      <li><strong className="text-[#F5F5F6]">Feature Credits:</strong> Access to premium features like priority applications or advanced filtering</li>
                      <li><strong className="text-[#F5F5F6]">Portal Credits:</strong> Access to additional job portals not included in your current plan</li>
                    </ul>

                    <h3 className="font-manrope text-[18px] font-semibold text-[#F5F5F6] mb-3">
                      Service Adjustments
                    </h3>
                    <ul className="list-disc pl-6 space-y-2 mb-4">
                      <li><strong className="text-[#F5F5F6]">Plan Upgrade:</strong> Temporary upgrade to a higher-tier plan at no additional cost</li>
                      <li><strong className="text-[#F5F5F6]">Service Extension:</strong> Additional days added to your current monthly subscription</li>
                      <li><strong className="text-[#F5F5F6]">Custom Configuration:</strong> Personalized application settings to better match your needs</li>
                      <li><strong className="text-[#F5F5F6]">Priority Support:</strong> Direct access to our technical team for faster issue resolution</li>
                    </ul>

                    <h3 className="font-manrope text-[18px] font-semibold text-[#F5F5F6] mb-3">
                      Credit Terms
                    </h3>
                    <p className="font-manrope text-[16px] leading-[24px] mb-4">
                      Account credits issued as alternatives to refunds:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 mb-4">
                      <li>Are valid for 6 months from the date of issue</li>
                      <li>Can be applied to any AiPply service or subscription</li>
                      <li>Are non-transferable and cannot be exchanged for cash</li>
                      <li>Will be automatically applied to your next billing cycle</li>
                    </ul>
                    <p className="font-manrope text-[16px] leading-[24px]">
                      We determine the most appropriate alternative based on your specific situation and service usage history.
                    </p>
                  </section>

                  {/* Billing Cycle */}
                  <section>
                    <h2 className="font-manrope text-[24px] font-semibold text-[#F5F5F6] mb-4">
                      5. Monthly Billing and Auto-Renewal
                    </h2>
                    <p className="font-manrope text-[16px] leading-[24px] mb-4">
                      AiPply operates on a <strong className="text-[#AE94FF]">monthly billing cycle</strong> with the following terms:
                    </p>
                    
                    <h3 className="font-manrope text-[18px] font-semibold text-[#F5F5F6] mb-3">
                      Monthly Subscription Details
                    </h3>
                    <ul className="list-disc pl-6 space-y-2 mb-4">
                      <li>Your subscription renews automatically every 30 days from your initial sign-up date</li>
                      <li>You'll receive an email notification 3 days before each renewal</li>
                      <li>Charges are processed automatically using your saved payment method (UPI or Razorpay)</li>
                      <li>Your automated job application service continues uninterrupted with each renewal</li>
                    </ul>

                    <h3 className="font-manrope text-[18px] font-semibold text-[#F5F5F6] mb-3">
                      Avoiding Next Month's Charge
                    </h3>
                    <div className="bg-[#1A1A1A] border border-[#AE94FF] rounded-lg p-4 mb-4">
                      <p className="font-manrope text-[16px] leading-[24px] text-[#AE94FF]">
                        <strong>Important:</strong> To avoid being charged for the next month, you must cancel your subscription at least 24 hours before your next billing date. Once a monthly renewal charge is processed, it falls under our standard refund policy.
                      </p>
                    </div>

                    <h3 className="font-manrope text-[18px] font-semibold text-[#F5F5F6] mb-3">
                      Pro-rated Billing
                    </h3>
                    <p className="font-manrope text-[16px] leading-[24px] mb-4">
                      In cases of service disruption or account credits:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 mb-4">
                      <li>Refunds for service disruptions are calculated on a daily basis</li>
                      <li>Service extensions are added as additional days to your current cycle</li>
                      <li>Account credits are applied as dollar amounts to future billing</li>
                    </ul>
                  </section>

                  {/* Chargeback Protection */}
                  <section>
                    <h2 className="font-manrope text-[24px] font-semibold text-[#F5F5F6] mb-4">
                      6. Chargeback and Dispute Protection
                    </h2>
                    <p className="font-manrope text-[16px] leading-[24px] mb-4">
                      Before initiating a chargeback or payment dispute with your bank:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 mb-4">
                      <li>Please contact our support team first at <a href="mailto:tanmay@aipply.io" className="text-[#AE94FF] hover:underline">tanmay@aipply.io</a></li>
                      <li>We're committed to resolving issues directly and promptly</li>
                      <li>Chargebacks may result in immediate account suspension</li>
                      <li>We maintain detailed records of all transactions and service usage</li>
                    </ul>
                  </section>

                  {/* How to Request */}
                  <section>
                    <h2 className="font-manrope text-[24px] font-semibold text-[#F5F5F6] mb-4">
                      7. How to Request Cancellation or Refund
                    </h2>
                    <p className="font-manrope text-[16px] leading-[24px] mb-4">
                      To request a cancellation or discuss your specific situation:
                    </p>
                    <div className="bg-[#1A1A1A] border border-[#333741] rounded-lg p-6">
                      <div className="space-y-3">
                        <p className="font-manrope text-[16px] leading-[24px]">
                          <strong className="text-[#F5F5F6]">Email:</strong> <a href="mailto:tanmay@aipply.io" className="text-[#AE94FF] hover:underline">tanmay@aipply.io</a>
                        </p>
                        <p className="font-manrope text-[16px] leading-[24px]">
                          <strong className="text-[#F5F5F6]">Phone:</strong> <a href="tel:9999852132" className="text-[#AE94FF] hover:underline">9999852132</a>
                        </p>
                        <p className="font-manrope text-[16px] leading-[24px]">
                          <strong className="text-[#F5F5F6]">Response Time:</strong> We typically respond within 24-48 hours
                        </p>
                      </div>
                    </div>
                    
                    <h3 className="font-manrope text-[18px] font-semibold text-[#F5F5F6] mb-3 mt-6">
                      Information to Include
                    </h3>
                    <p className="font-manrope text-[16px] leading-[24px] mb-4">
                      When contacting us, please provide:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Your account email address</li>
                      <li>Reason for cancellation or refund request</li>
                      <li>Transaction details (if applicable)</li>
                      <li>Any relevant screenshots or documentation</li>
                    </ul>
                  </section>

                  {/* Policy Updates */}
                  <section>
                    <h2 className="font-manrope text-[24px] font-semibold text-[#F5F5F6] mb-4">
                      8. Policy Updates
                    </h2>
                    <p className="font-manrope text-[16px] leading-[24px] mb-4">
                      We reserve the right to update this Cancellation and Refund Policy at any time. Changes will be:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 mb-4">
                      <li>Posted on this page with an updated "Last modified" date</li>
                      <li>Communicated to active subscribers via email</li>
                      <li>Effective immediately for new subscriptions</li>
                      <li>Applied to existing subscriptions at the next renewal cycle</li>
                    </ul>
                  </section>

                  {/* Agreement */}
                  <section>
                    <h2 className="font-manrope text-[24px] font-semibold text-[#F5F5F6] mb-4">
                      9. Agreement
                    </h2>
                    <p className="font-manrope text-[16px] leading-[24px]">
                      By subscribing to AiPply, you acknowledge that you have read, understood, and agree to be bound by this Cancellation and Refund Policy, as well as our <a href="/terms" className="text-[#AE94FF] hover:underline">Terms and Conditions</a> and <a href="/privacy" className="text-[#AE94FF] hover:underline">Privacy Policy</a>.
                    </p>
                  </section>

                  {/* Contact Information */}
                  <section>
                    <h2 className="font-manrope text-[24px] font-semibold text-[#F5F5F6] mb-4">
                      10. Contact Information
                    </h2>
                    <p className="font-manrope text-[16px] leading-[24px] mb-4">
                      If you have any questions about this Cancellation and Refund Policy, please contact us:
                    </p>
                    <div className="bg-[#1A1A1A] border border-[#333741] rounded-lg p-6">
                      <p className="font-manrope text-[16px] leading-[24px] mb-2">
                        <strong className="text-[#F5F5F6]">Company:</strong> DINMAY JOBSEARCH TECH LLP
                      </p>
                      <p className="font-manrope text-[16px] leading-[24px] mb-2">
                        <strong className="text-[#F5F5F6]">Business Name:</strong> AiPply
                      </p>
                      <p className="font-manrope text-[16px] leading-[24px] mb-2">
                        <strong className="text-[#F5F5F6]">Address:</strong> B-301, Golden Palms, Sector 168, Gautam Buddha Nagar, UP 201305, India
                      </p>
                      <p className="font-manrope text-[16px] leading-[24px] mb-2">
                        <strong className="text-[#F5F5F6]">Phone:</strong> <a href="tel:9999852132" className="text-[#AE94FF] hover:underline">9999852132</a>
                      </p>
                      <p className="font-manrope text-[16px] leading-[24px] mb-2">
                        <strong className="text-[#F5F5F6]">Email:</strong> <a href="mailto:tanmay@aipply.io" className="text-[#AE94FF] hover:underline">tanmay@aipply.io</a>
                      </p>
                      <p className="font-manrope text-[16px] leading-[24px]">
                        <strong className="text-[#F5F5F6]">Website:</strong> <a href="http://www.aipply.io" className="text-[#AE94FF] hover:underline">www.aipply.io</a>
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
