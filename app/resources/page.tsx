import Footer from "@/components/common/footer/footer";
import FrequentlyAskedQuestionSection from "@/components/common/frequentlyAskedQuestionSection/frequentlyAskedQuestionSection";
import Header from "@/components/common/header/header";
import { ResponsivePageContainer } from "@/components/common/responsivePageContainer/responsivePageContainer";
import ScrollToTopBtn from "@/components/common/scrollToTopBtn/scrollToTopBtn";
import HeroSection from "@/components/sections/heroSection/heroSection";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const linkedInTipsData = [
  {
    imageUrl: "/static/linkedInIcons/profile.svg",
    title: "Professional Profile Photo",
    description: "Use a high-quality, professional headshot with a clean background and genuine smile"
  },
  {
    imageUrl: "/static/linkedInIcons/headline.svg",
    title: "Compelling Headline",
    description: "Craft a headline that goes beyond job title - showcase your value proposition"
  },
  {
    imageUrl: "/static/linkedInIcons/summary.svg",
    title: "Strategic Summary",
    description: "Write a compelling summary that tells your professional story and highlights achievements"
  },
  {
    imageUrl: "/static/linkedInIcons/experience.svg",
    title: "Detailed Experience",
    description: "Use bullet points, quantify achievements, and include relevant keywords"
  },
  {
    imageUrl: "/static/linkedInIcons/skills.svg",
    title: "Skills & Endorsements",
    description: "List relevant skills and seek endorsements from colleagues and connections"
  },
  {
    imageUrl: "/static/linkedInIcons/network.svg",
    title: "Build Your Network",
    description: "Connect with industry professionals, colleagues, and thought leaders"
  }
];

const profileOptimizationSteps = [
  {
    step: "01",
    title: "Optimize Your Profile Photo",
    description: "Upload a professional headshot that represents your industry and personality"
  },
  {
    step: "02", 
    title: "Craft Your Headline",
    description: "Write a compelling headline that includes keywords and your value proposition"
  },
  {
    step: "03",
    title: "Write Your About Section",
    description: "Tell your professional story with achievements, skills, and career goals"
  },
  {
    step: "04",
    title: "Update Your Experience",
    description: "Add detailed job descriptions with quantified achievements and key accomplishments"
  },
  {
    step: "05",
    title: "Showcase Your Skills",
    description: "List relevant skills and seek endorsements from your professional network"
  }
];

const keywordCategories = [
  {
    category: "Technical Skills",
    keywords: ["JavaScript", "Python", "React", "Node.js", "SQL", "AWS", "Machine Learning", "Data Analysis"]
  },
  {
    category: "Soft Skills", 
    keywords: ["Leadership", "Communication", "Problem Solving", "Team Management", "Strategic Planning", "Project Management"]
  },
  {
    category: "Industry Terms",
    keywords: ["Digital Transformation", "Agile", "DevOps", "Customer Experience", "Business Intelligence", "Growth Hacking"]
  }
];

const ProfileOptimizationStep = ({ step, title, description }: { step: string, title: string, description: string }) => {
  return (
    <div className="flex gap-6 items-start">
      <div className="bg-gradient-to-r from-[#20CEB6] to-[#2E2ADC] text-white w-12 h-12 rounded-full flex items-center justify-center font-manrope font-bold text-sm flex-shrink-0">
        {step}
      </div>
      <div className="flex flex-col gap-2">
        <h3 className="font-manrope text-[20px] font-semibold text-[#F5F5F6]">
          {title}
        </h3>
        <p className="font-manrope text-[16px] text-[#B0B0B0] leading-[150%]">
          {description}
        </p>
      </div>
    </div>
  );
};

const LinkedInOptimization = () => {
  return (
    <div>
      <div className="pt-7">
        <Header />
      </div>

      <div className="pt-[51px]">
        <div className="absolute w-full h-[1022px] top-[134px] left-1/2 transform -translate-x-1/2 bg-[#AE94FF] bg-opacity-50 blur-[300px] backdrop-blur-[400px] rounded-full"></div>
        <HeroSection
          image="/static/images/linkedin-optimization.jpeg"
          title="Master LinkedIn Optimization"
          subtitle="Transform your LinkedIn profile into a powerful career tool that attracts recruiters and opportunities."
          button={
            <Link href="/dashboard/linkedin-analyzer">
              <button className="flex bg-gradient-to-r from-[#20CEB6] to-[#2E2ADC] text-white py-3 px-5 font-manrope text-[20px] font-semibold rounded-[30px]">
                Analyze My Profile
              </button>
            </Link>
          }
        />
      </div>

      <ResponsivePageContainer>
        <div className="pt-[103px] z-50">
          <div className="grid grid-cols-1 custom-md:grid-cols-2 gap-10 customlg:gap-[140px] items-center">
            <div className="relative w-full h-[500px] border border-white border-opacity-[7%] bg-[#111111] bg-opacity-10 rounded-[10px] overflow-hidden">
              <Image
                src="/static/images/linkedin-profile-example.png"
                alt="LinkedIn Profile Example"
                fill={true}
                className="object-cover p-8"
              />
            </div>
            <div className="flex flex-col gap-10 relative">
              <h1 className="font-manrope text-[36px] leading-[44px] text-[#F5F5F6] font-semibold">
                5 Steps to LinkedIn Success
              </h1>
              <div className="flex flex-col gap-6">
                {profileOptimizationSteps.map((step, index) => (
                  <ProfileOptimizationStep
                    key={index}
                    step={step.step}
                    title={step.title}
                    description={step.description}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </ResponsivePageContainer>

      <ResponsivePageContainer>
        <div className="pt-[176px] flex flex-col gap-[76px] items-center">
          <h1 className="font-manrope text-[36px] leading-[44px] text-center text-[#F5F5F6]">
            LinkedIn Optimization Essentials
          </h1>
          <div className="grid grid-cols-1 custom-md:grid-cols-2 custom-lg:grid-cols-3 gap-12 custom-lg:gap-[80px]">
            {linkedInTipsData.map((tip, index) => (
              <div
                key={index}
                className="flex flex-col gap-5 w-[280px] items-center text-center"
              >
                <div className="bg-[#111111] p-[38px] rounded-[40px] w-fit flex">
                  <Image
                    src={tip.imageUrl}
                    alt={tip.title}
                    width={64}
                    height={64}
                  />
                </div>
                <h3 className="font-manrope text-[20px] text-white font-[700]">
                  {tip.title}
                </h3>
                <p className="font-manrope text-[16px] text-[#B0B0B0] leading-[140%]">
                  {tip.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </ResponsivePageContainer>

      <ResponsivePageContainer>
        <div className="pt-[176px] flex flex-col gap-[76px]">
          <div className="text-center">
            <h1 className="font-manrope text-[36px] leading-[44px] text-[#F5F5F6] font-semibold mb-4">
              Strategic Keyword Usage
            </h1>
            <p className="font-manrope text-[18px] text-[#B0B0B0] leading-[150%] max-w-[600px] mx-auto">
              Optimize your profile with industry-relevant keywords to improve discoverability by recruiters and hiring managers.
            </p>
          </div>
          
          <div className="grid grid-cols-1 custom-md:grid-cols-3 gap-8">
            {keywordCategories.map((category, index) => (
              <div key={index} className="bg-[#111111] bg-opacity-50 border border-white border-opacity-[7%] rounded-[20px] p-8">
                <h3 className="font-manrope text-[24px] font-semibold text-[#F5F5F6] mb-6">
                  {category.category}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {category.keywords.map((keyword, keywordIndex) => (
                    <span
                      key={keywordIndex}
                      className="bg-gradient-to-r from-[#20CEB6] to-[#2E2ADC] text-white px-3 py-1 rounded-full text-sm font-manrope"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </ResponsivePageContainer>

      <ResponsivePageContainer>
        <div className="pt-[176px] flex flex-col gap-[50px]">
          <div className="text-center">
            <h1 className="font-manrope text-[36px] leading-[44px] text-[#F5F5F6] font-semibold mb-4">
              Profile Checklist
            </h1>
            <p className="font-manrope text-[18px] text-[#B0B0B0] leading-[150%] max-w-[600px] mx-auto">
              Use this comprehensive checklist to ensure your LinkedIn profile is fully optimized for maximum visibility.
            </p>
          </div>

          <div className="bg-[#111111] bg-opacity-50 border border-white border-opacity-[7%] rounded-[20px] p-8 max-w-[800px] mx-auto w-full">
            <div className="grid grid-cols-1 custom-md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-[#20CEB6] rounded bg-[#20CEB6]"></div>
                  <span className="font-manrope text-[16px] text-[#F5F5F6]">Professional profile photo</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-[#20CEB6] rounded bg-[#20CEB6]"></div>
                  <span className="font-manrope text-[16px] text-[#F5F5F6]">Compelling headline with keywords</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-[#20CEB6] rounded bg-[#20CEB6]"></div>
                  <span className="font-manrope text-[16px] text-[#F5F5F6]">Detailed About section</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-[#20CEB6] rounded bg-[#20CEB6]"></div>
                  <span className="font-manrope text-[16px] text-[#F5F5F6]">Complete work experience</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-[#20CEB6] rounded bg-[#20CEB6]"></div>
                  <span className="font-manrope text-[16px] text-[#F5F5F6]">Education section filled</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-[#20CEB6] rounded bg-[#20CEB6]"></div>
                  <span className="font-manrope text-[16px] text-[#F5F5F6]">Skills section optimized</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-[#20CEB6] rounded bg-[#20CEB6]"></div>
                  <span className="font-manrope text-[16px] text-[#F5F5F6]">Recommendations requested</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-[#20CEB6] rounded bg-[#20CEB6]"></div>
                  <span className="font-manrope text-[16px] text-[#F5F5F6]">Custom LinkedIn URL</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-[#20CEB6] rounded bg-[#20CEB6]"></div>
                  <span className="font-manrope text-[16px] text-[#F5F5F6]">Contact information updated</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-[#20CEB6] rounded bg-[#20CEB6]"></div>
                  <span className="font-manrope text-[16px] text-[#F5F5F6]">Regular content posting</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ResponsivePageContainer>

      <div className="mt-[215px] bg-[#111111]">
        <FrequentlyAskedQuestionSection />
      </div>

      <Footer />

      <ScrollToTopBtn />
    </div>
  );
};

export default LinkedInOptimization;
