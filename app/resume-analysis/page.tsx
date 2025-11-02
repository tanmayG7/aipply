"use client";
import React, { useState } from "react";
import Header from "@/components/common/header/header";
import { ResponsivePageContainer } from "@/components/common/responsivePageContainer/responsivePageContainer";
import Button from "@/components/common/button/button";
import ScrollToTopBtn from "@/components/common/scrollToTopBtn/scrollToTopBtn";
import Footer from "@/components/common/footer/footer";
import Image from "next/image";
import { CheckIcon, ClockIcon, DocumentTextIcon, SparklesIcon, UserGroupIcon, ChartBarIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import ResumeAnalysisForm from "@/components/ui/resume-analysis-form";

export default function ResumeAnalysis() {
  return (
    <div className="bg-[#000000] min-h-screen">
      <div className="pt-10">
        <Header />
      </div>

      {/* Hero Section */}
      <ResponsivePageContainer>
        <div className="relative">
          <div className="absolute w-full hero-blur-bg top-[134px] left-1/2 transform -translate-x-1/2 bg-[#AE94FF] bg-opacity-50 backdrop-blur-[400px] rounded-full blur-[300px]"></div>

          <div className="relative grid grid-cols-1 gap-16 px-container bg-gradient-to-b">
            {/* Hero Content */}
            <div className="flex flex-col gap-6 items-center pt-[137px]">
              <div className="flex justify-center">
                <Button text="AI Resume Analysis" />
              </div>

              <div className="flex flex-col gap-6 items-center justify-center max-w-4xl">
                <h1 className="font-manrope text-fluid-hero font-bold custom-md:font-semibold text-[#F5F5F6] text-center">
                  Get Your Resume Analyzed by AI in 60 Seconds
                </h1>
                <p className="font-manrope font-normal text-fluid-lead text-[#CECFD2] text-center max-w-3xl">
                  Upload your resume and get instant, actionable feedback powered by AI. Discover what recruiters see, identify improvement areas, and land more interviews.
                </p>
              </div>

              {/* Social Proof */}
              <div className="flex flex-col custom-md:flex-row items-center gap-4 mt-6">
                <div className="flex items-center gap-2">
                  <UserGroupIcon className="w-5 h-5 text-[#AE94FF]" />
                  <span className="text-[#CECFD2] text-sm">Join 500+ job seekers</span>
                </div>
                <div className="flex items-center gap-2">
                  <ClockIcon className="w-5 h-5 text-[#AE94FF]" />
                  <span className="text-[#CECFD2] text-sm">Analysis ready in 60 seconds</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckIcon className="w-5 h-5 text-[#AE94FF]" />
                  <span className="text-[#CECFD2] text-sm">100% Free Analysis</span>
                </div>
              </div>

            </div>

            {/* Resume Analysis Form */}
            <div className="flex justify-center">
              <ResumeAnalysisForm />
            </div>

            {/* Privacy Statement */}
            <div className="flex justify-center">
              <div className="bg-[#1a1a1a] border border-[#333741] rounded-lg p-4 max-w-2xl">
                <div className="flex items-center gap-2">
                  <CheckIcon className="w-4 h-4 text-green-400 flex-shrink-0" />
                  <p className="text-[#CECFD2] text-sm">
                    Your resume is secure and private. We never share your data and delete files after analysis.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ResponsivePageContainer>

      {/* Features/Benefits Section */}
      <div className="pt-[100px]">
        <ResponsivePageContainer>
          <div className="px-container">
            <div className="text-center mb-16">
              <h2 className="font-manrope text-fluid-section font-bold text-[#F5F5F6] mb-4">
                What you&apos;ll Get
              </h2>
              <p className="text-[#CECFD2] text-lg max-w-2xl mx-auto">
                Our AI analyzes your resume against industry standards and provides detailed insights
              </p>
            </div>

            <div className="grid grid-cols-1 custom-md:grid-cols-2 custom-lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] border border-[#333741] rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-[#AE94FF] bg-opacity-20 rounded-lg flex items-center justify-center">
                    <SparklesIcon className="w-6 h-6 text-[#AE94FF]" />
                  </div>
                  <h3 className="text-[#F5F5F6] text-xl font-semibold">ATS Compatibility Score</h3>
                </div>
                <p className="text-[#CECFD2] text-sm leading-relaxed">
                  Get a detailed score on how well your resume performs with Applicant Tracking Systems used by 90% of companies.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] border border-[#333741] rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-[#AE94FF] bg-opacity-20 rounded-lg flex items-center justify-center">
                    <DocumentTextIcon className="w-6 h-6 text-[#AE94FF]" />
                  </div>
                  <h3 className="text-[#F5F5F6] text-xl font-semibold">Content Analysis</h3>
                </div>
                <p className="text-[#CECFD2] text-sm leading-relaxed">
                  Receive specific feedback on your skills, experience descriptions, and achievements to make them more impactful.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] border border-[#333741] rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-[#AE94FF] bg-opacity-20 rounded-lg flex items-center justify-center">
                    <ChartBarIcon className="w-6 h-6 text-[#AE94FF]" />
                  </div>
                  <h3 className="text-[#F5F5F6] text-xl font-semibold">Industry Benchmarking</h3>
                </div>
                <p className="text-[#CECFD2] text-sm leading-relaxed">
                  Compare your resume against successful candidates in your target role and industry for competitive insights.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] border border-[#333741] rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-[#AE94FF] bg-opacity-20 rounded-lg flex items-center justify-center">
                    <CheckIcon className="w-6 h-6 text-[#AE94FF]" />
                  </div>
                  <h3 className="text-[#F5F5F6] text-xl font-semibold">Formatting Review</h3>
                </div>
                <p className="text-[#CECFD2] text-sm leading-relaxed">
                  Get recommendations on layout, fonts, spacing, and visual hierarchy to create a professional impression.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] border border-[#333741] rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-[#AE94FF] bg-opacity-20 rounded-lg flex items-center justify-center">
                    <MagnifyingGlassIcon className="w-6 h-6 text-[#AE94FF]" />
                  </div>
                  <h3 className="text-[#F5F5F6] text-xl font-semibold">Keyword Optimization</h3>
                </div>
                <p className="text-[#CECFD2] text-sm leading-relaxed">
                  Discover missing keywords and phrases that recruiters search for in your target role and industry.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] border border-[#333741] rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-[#AE94FF] bg-opacity-20 rounded-lg flex items-center justify-center">
                    <ClockIcon className="w-6 h-6 text-[#AE94FF]" />
                  </div>
                  <h3 className="text-[#F5F5F6] text-xl font-semibold">Actionable Recommendations</h3>
                </div>
                <p className="text-[#CECFD2] text-sm leading-relaxed">
                  Get step-by-step guidance on exactly what to change to improve your resume&apos;s effectiveness.
                </p>
              </div>
            </div>
          </div>
        </ResponsivePageContainer>
      </div>

      {/* FAQ Section */}
      <div className="pt-[100px]">
        <ResumeAnalysisFAQSection />
      </div>

      <Footer />
      <ScrollToTopBtn />
    </div>
  );
}

const resumeAnalysisFAQs = [
  {
    question: "How accurate is the AI resume analysis?",
    answer: "Our AI is trained on thousands of successful resumes and hiring patterns across industries. It provides highly accurate insights based on current recruiting standards and ATS requirements."
  },
  {
    question: "What file formats do you accept?",
    answer: "We currently accept PDF files up to 5MB in size. PDF format ensures your formatting is preserved during analysis."
  },
  {
    question: "How long does the analysis take?",
    answer: "Most analyses are completed within 60 seconds. Complex resumes with multiple pages may take slightly longer."
  },
  {
    question: "Is my resume data secure?",
    answer: "Absolutely. We use enterprise-grade security to protect your data. Your resume is automatically deleted after analysis, and we never share your information with third parties."
  },
  {
    question: "Can I analyze multiple versions of my resume?",
    answer: "Yes! You can analyze as many versions as you'd like. This is helpful for comparing different formats or tailoring your resume for specific roles."
  },
  {
    question: "Do you provide suggestions for different industries?",
    answer: "Yes, our AI provides industry-specific recommendations. You can specify your target industry during analysis for more relevant feedback."
  },
  {
    question: "What if I disagree with the AI's recommendations?",
    answer: "Our AI provides data-driven suggestions, but you should always use your judgment. Consider the recommendations as guidance while keeping your unique situation and career goals in mind."
  }
];

const ResumeAnalysisFAQSection: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <ResponsivePageContainer>
      <div className="grid grid-cols-1 gap-12 custom-lg:gap-16 w-full py-24">
        <h1 className="text-fluid-section font-semibold font-manrope text-[#F5F5F6] text-center">
          Frequently asked questions
        </h1>
        <div className="flex flex-col gap-8">
          {resumeAnalysisFAQs.map((faqItem, index) => (
            <div key={index}>
              <div
                className={`flex flex-col ${
                  activeIndex === index ? "bg-primary-25 " : ""
                }`}
              >
                <div
                  key={index}
                  className={`flex flex-row justify-between text-left items-start w-full gap-2 pt-6 ${
                    index !== 0 ? "border-t border-[#1F242F]" : ""
                  }`}
                  onClick={() => toggleFAQ(index)}
                >
                  <h2
                    className="text-[18px] font-[500px] text-[#F5F5F6] cursor-pointer font-manrope"
                    onClick={() => toggleFAQ(index)}
                  >
                    {faqItem.question}
                  </h2>
                  <button
                    className="items-start w-6 h-6 flex-shrink-0"
                    onClick={() => toggleFAQ(index)}
                  >
                    {activeIndex === index ? (
                      <Image
                        src="/static/icons/faqMinusBtn.svg"
                        alt="Collapse"
                        width={24}
                        height={24}
                      />
                    ) : (
                      <Image
                        src="/static/icons/faqPlusBtn.svg"
                        alt="Expand"
                        width={24}
                        height={24}
                      />
                    )}
                  </button>
                </div>
                <div>
                  {activeIndex === index && (
                    <div className="text-[16px] font-normal font-manrope text-[#94969C] mt-2 text-start">
                      {faqItem.answer}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ResponsivePageContainer>
  );
};