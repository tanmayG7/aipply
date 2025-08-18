import Footer from "@/components/common/footer/footer";
import FrequentlyAskedQuestionSection from "@/components/common/frequentlyAskedQuestionSection/frequentlyAskedQuestionSection";
import Header from "@/components/common/header/header";
import { ResponsivePageContainer } from "@/components/common/responsivePageContainer/responsivePageContainer";
import ScrollToTopBtn from "@/components/common/scrollToTopBtn/scrollToTopBtn";
import HeroSection from "@/components/sections/heroSection/heroSection";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Icon } from "@/components/ui/Icon";

const webinarHighlights = [
  {
    iconName: "file-text" as const,
    title: "Your Resume Must Pass the ATS First",
    description: "Use clear formatting, standard section headings, and keywords from the job description to increase visibility."
  },
  {
    iconName: "circle-slash" as const,
    title: "Avoid Common Resume Mistakes",
    description: "No generic templates, excessive text, or irrelevant experience—focus on impact-driven content."
  },
  {
    iconName: "lightbulb" as const,
    title: "Your Cover Letter Should Tell a Story",
    description: "Structure it using who you are, why you're a fit, and what you bring to the table instead of rehashing your resume."
  },
  {
    iconName: "mic" as const,
    title: "Acing Interviews is About Preparation",
    description: "Use the STAR method (Situation, Task, Action, Result) to answer behavioral questions confidently and concisely."
  },
  {
    iconName: "handshake" as const,
    title: "Networking Gives You an Edge",
    description: "Engaging with hiring managers, recruiters, and employees can increase your chances of landing a job far beyond Easy Apply."
  },
  {
    iconName: "megaphone" as const,
    title: "Personal Branding Can Set You Apart",
    description: "Showcase your expertise on LinkedIn through content, projects, and recommendations to attract opportunities."
  },
  {
    iconName: "heart" as const,
    title: "Salary Negotiation is a Must",
    description: "Always research market salaries, express enthusiasm first, and justify your ask with industry benchmarks and your skillset."
  },
  {
    iconName: "settings" as const,
    title: "Use AI & Tools to Optimize Your Job Search",
    description: "Platforms like ChatGPT (resume tweaks), Jobscan (ATS analysis), and LinkedIn (networking) can streamline your approach."
  }
];

const jobSearchTools = [
  {
    name: "ChatGPT",
    purpose: "Resume Optimization",
    description: "Generate compelling bullet points and tailor content to job descriptions"
  },
  {
    name: "Jobscan",
    purpose: "ATS Analysis", 
    description: "Analyze your resume against job descriptions for ATS compatibility"
  },
  {
    name: "LinkedIn",
    purpose: "Networking & Research",
    description: "Connect with professionals and research companies and roles"
  },
  {
    name: "Glassdoor",
    purpose: "Salary Research",
    description: "Research market salaries and company reviews for negotiation prep"
  }
];

const starSteps = [
  {
    letter: "S",
    title: "Situation",
    description: "Set the context by describing the background and circumstances of your example"
  },
  {
    letter: "T", 
    title: "Task",
    description: "Explain the specific challenge, problem, or goal you needed to address"
  },
  {
    letter: "A",
    title: "Action",
    description: "Detail the specific steps you took to address the situation or complete the task"
  },
  {
    letter: "R",
    title: "Result",
    description: "Share the outcomes of your actions, including quantifiable results when possible"
  }
];

const atsOptimizationSections = [
  {
    title: "Formatting Best Practices",
    points: [
      "Use standard fonts like Arial, Calibri, or Times New Roman",
      "Stick to simple formatting with clear section headers",
      "Avoid tables, text boxes, and complex graphics"
    ]
  },
  {
    title: "Keyword Strategy",
    points: [
      "Mirror keywords from the job description naturally", 
      "Include both hard and soft skills mentioned in the posting",
      "Use industry-specific terminology and acronyms"
    ]
  },
  {
    title: "Content Structure",
    points: [
      "Lead with a strong professional summary",
      "Use action verbs and quantify achievements",
      "Focus on relevant experience and accomplishments"
    ]
  },
  {
    title: "ATS-Friendly Sections",
    points: [
      "Use standard headings: Experience, Education, Skills",
      "List skills in a dedicated section with relevant keywords",
      "Include certifications and relevant coursework"
    ]
  }
];

const interviewPrepSections = [
  {
    title: "Research Phase",
    points: [
      "Study the company's mission, values, and recent news",
      "Research the interviewer's background on LinkedIn",
      "Understand the role requirements and team structure"
    ]
  },
  {
    title: "Common Questions Prep",
    points: [
      "Prepare STAR examples for behavioral questions",
      "Practice explaining your career transitions and gaps",
      "Prepare thoughtful questions about the role and company"
    ]
  },
  {
    title: "Technical Preparation",
    points: [
      "Review technical skills mentioned in job description",
      "Prepare to discuss relevant projects and achievements",
      "Practice explaining complex concepts in simple terms"
    ]
  },
  {
    title: "Day-of Tips",
    points: [
      "Test your tech setup for virtual interviews",
      "Prepare professional attire and arrive early",
      "Bring copies of your resume and questions to ask"
    ]
  }
];

const HighlightCard = ({ iconName, title, description }: { iconName: string, title: string, description: string }) => {
  return (
    <div className="bg-[#111111] bg-opacity-50 border border-white border-opacity-[7%] rounded-[20px] p-6 h-full">
      <div className="flex items-start gap-4">
        <Icon name={iconName} size={24} className="text-[#20CEB6] mt-1" aria-hidden="true" />
        <div className="flex flex-col gap-2">
          <h3 className="font-manrope text-[18px] font-semibold text-[#F5F5F6]">
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

const StarStep = ({ letter, title, description }: { letter: string, title: string, description: string }) => {
  return (
    <div className="flex gap-4 items-start">
      <div className="bg-gradient-to-r from-[#20CEB6] to-[#2E2ADC] text-white w-12 h-12 rounded-full flex items-center justify-center font-manrope font-bold text-lg flex-shrink-0">
        {letter}
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

const ATSCVInterviewPrep = () => {
  return (
    <div className="relative min-h-screen">
      {/* Fixed backdrop - positioned properly to avoid overlapping */}
      <div className="fixed inset-0 w-full h-full pointer-events-none z-0">
        <div className="absolute w-[800px] h-[800px] top-[200px] left-1/2 transform -translate-x-1/2 bg-[#AE94FF] bg-opacity-30 blur-[200px] rounded-full"></div>
      </div>

      {/* Main content with proper z-index */}
      <div className="relative z-10">
        <div className="pt-7">
          <Header />
        </div>

        <div className="pt-[51px] relative">
          <HeroSection
            image="/static/images/ats-cv-interview-prep.jpeg"
            title="ATS CV + Interview Prep Resource"
            subtitle="Master the art of getting past ATS systems and acing interviews. Your complete guide to landing your dream job!"
            button={
              <div className="flex flex-col custom-md:flex-row gap-4">
                <Link href="https://youtu.be/b-w9NzV8FM0" target="_blank">
                  <button className="flex bg-gradient-to-r from-[#20CEB6] to-[#2E2ADC] text-white py-3 px-5 font-manrope text-[20px] font-semibold rounded-[30px]">
                    <Icon name="video" size={20} className="text-white" inline aria-hidden="true" /> Access Webinar Recording
                  </button>
                </Link>
                <Link href="https://www.canva.com/design/DAGcoiLfWAc/FhPyWx9Z7kXP0BsWShTHhA/edit?utm_content=DAGcoiLfWAc&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton" target="_blank">
                  <button className="flex border-2 border-white border-opacity-20 text-white py-3 px-5 font-manrope text-[20px] font-semibold rounded-[30px] hover:bg-white hover:bg-opacity-10 transition-all">
                    <Icon name="file-text" size={20} className="text-white" inline aria-hidden="true" /> Get CV Template
                  </button>
                </Link>
              </div>
            }
          />
        </div>

        <ResponsivePageContainer>
          <div className="pt-[103px] relative z-20">
            <div className="text-center mb-12">
              <h1 className="font-manrope text-[36px] leading-[44px] text-[#F5F5F6] font-semibold mb-4">
                <Icon name="target" size={32} className="text-[#20CEB6]" inline aria-hidden="true" /> Webinar Highlights
              </h1>
              <p className="font-manrope text-[18px] text-[#B0B0B0] leading-[150%] max-w-[600px] mx-auto">
                Essential strategies from our ATS optimization and interview preparation webinar to boost your job search success.
              </p>
            </div>
            
            <div className="grid grid-cols-1 custom-md:grid-cols-2 gap-6">
              {webinarHighlights.map((highlight, index) => (
                <HighlightCard
                  key={index}
                  iconName={highlight.iconName}
                  title={highlight.title}
                  description={highlight.description}
                />
              ))}
            </div>
          </div>
        </ResponsivePageContainer>

        <ResponsivePageContainer>
          <div className="pt-[176px] relative z-20">
            <div className="bg-gradient-to-r from-[#20CEB6] bg-opacity-10 to-[#2E2ADC] bg-opacity-10 border border-white border-opacity-[7%] rounded-[30px] p-8 text-center">
              <h2 className="font-manrope text-[24px] font-semibold text-[#F5F5F6] mb-4">
                <Icon name="target" size={24} className="text-[#20CEB6]" inline aria-hidden="true" /> Key Success Formula
              </h2>
              <p className="font-manrope text-[18px] text-[#F5F5F6] leading-[150%] max-w-[800px] mx-auto">
                ATS-Optimized Resume + Strategic Networking + Interview Preparation = Job Offer Success. Focus on all three pillars for maximum impact!
              </p>
            </div>
          </div>
        </ResponsivePageContainer>

        <ResponsivePageContainer>
          <div className="pt-[176px] flex flex-col gap-[76px] relative z-20">
            <div className="text-center">
              <h1 className="font-manrope text-[36px] leading-[44px] text-[#F5F5F6] font-semibold mb-4">
                <Icon name="star" size={32} className="text-[#20CEB6]" inline aria-hidden="true" /> STAR Method for Interview Success
              </h1>
              <p className="font-manrope text-[18px] text-[#B0B0B0] leading-[150%] max-w-[600px] mx-auto">
                Structure your behavioral interview answers using the proven STAR method to showcase your achievements effectively.
              </p>
            </div>
            
            <div className="grid grid-cols-1 custom-md:grid-cols-2 gap-8 custom-lg:gap-16">
              <div className="flex flex-col gap-8">
                {starSteps.map((step, index) => (
                  <StarStep
                    key={index}
                    letter={step.letter}
                    title={step.title}
                    description={step.description}
                  />
                ))}
              </div>
              <div className="bg-[#111111] bg-opacity-50 border border-white border-opacity-[7%] rounded-[20px] p-8">
                <h3 className="font-manrope text-[24px] font-semibold text-[#F5F5F6] mb-6">
                  <Icon name="check-circle" size={24} className="text-[#20CEB6]" inline aria-hidden="true" /> ATS Optimization Checklist
                </h3>
                <div className="space-y-6">
                  {atsOptimizationSections.map((section, index) => (
                    <div key={index}>
                      <h4 className="font-manrope text-[18px] font-semibold text-[#20CEB6] mb-3">
                        {section.title}
                      </h4>
                      <ul className="space-y-2">
                        {section.points.map((point, pointIndex) => (
                          <li key={pointIndex} className="font-manrope text-[14px] text-[#B0B0B0] leading-[150%] flex items-start gap-2">
                            <span className="text-[#20CEB6] mt-1">•</span>
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </ResponsivePageContainer>

        <ResponsivePageContainer>
          <div className="pt-[176px] flex flex-col gap-[76px] relative z-20">
            <div className="text-center">
              <h1 className="font-manrope text-[36px] leading-[44px] text-[#F5F5F6] font-semibold mb-4">
                <Icon name="target" size={32} className="text-[#20CEB6]" inline aria-hidden="true" /> Interview Preparation Guide
              </h1>
              <p className="font-manrope text-[18px] text-[#B0B0B0] leading-[150%] max-w-[600px] mx-auto">
                Comprehensive preparation steps to ensure you're ready to impress in any interview situation.
              </p>
            </div>
            
            <div className="grid grid-cols-1 custom-md:grid-cols-2 gap-8">
              {interviewPrepSections.map((section, index) => (
                <div key={index} className="bg-[#111111] bg-opacity-50 border border-white border-opacity-[7%] rounded-[20px] p-6">
                  <h3 className="font-manrope text-[20px] font-semibold text-[#F5F5F6] mb-4">
                    {section.title}
                  </h3>
                  <ul className="space-y-3">
                    {section.points.map((point, pointIndex) => (
                      <li key={pointIndex} className="font-manrope text-[14px] text-[#B0B0B0] leading-[150%] flex items-start gap-2">
                        <span className="text-[#20CEB6] mt-1">•</span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </ResponsivePageContainer>

        <ResponsivePageContainer>
          <div className="pt-[176px] flex flex-col gap-[76px] relative z-20">
            <div className="text-center">
              <h1 className="font-manrope text-[36px] leading-[44px] text-[#F5F5F6] font-semibold mb-4">
                <Icon name="settings" size={32} className="text-[#20CEB6]" inline aria-hidden="true" /> Essential Job Search Tools
              </h1>
              <p className="font-manrope text-[18px] text-[#B0B0B0] leading-[150%] max-w-[600px] mx-auto">
                Leverage these powerful tools to optimize your resume, prepare for interviews, and accelerate your job search.
              </p>
            </div>
            
            <div className="grid grid-cols-1 custom-md:grid-cols-2 custom-lg:grid-cols-4 gap-6">
              {jobSearchTools.map((tool, index) => (
                <div key={index} className="bg-[#111111] bg-opacity-50 border border-white border-opacity-[7%] rounded-[20px] p-6 text-center">
                  <h3 className="font-manrope text-[20px] font-semibold text-[#F5F5F6] mb-2">
                    {tool.name}
                  </h3>
                  <p className="font-manrope text-[14px] text-[#20CEB6] font-semibold mb-3">
                    {tool.purpose}
                  </p>
                  <p className="font-manrope text-[12px] text-[#B0B0B0] leading-[150%]">
                    {tool.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </ResponsivePageContainer>

        <ResponsivePageContainer>
          <div className="pt-[176px] flex flex-col gap-[50px] relative z-20">
            <div className="text-center">
              <h1 className="font-manrope text-[36px] leading-[44px] text-[#F5F5F6] font-semibold mb-4">
                <Icon name="book-open" size={32} className="text-[#20CEB6]" inline aria-hidden="true" /> Resources & Templates
              </h1>
            </div>

            <div className="bg-[#111111] bg-opacity-50 border border-white border-opacity-[7%] rounded-[20px] p-8 max-w-[600px] mx-auto w-full text-center">
              <div className="space-y-6">
                <div>
                  <h3 className="font-manrope text-[20px] font-semibold text-[#F5F5F6] mb-4">
                    <Icon name="file-text" size={20} className="text-[#20CEB6]" inline aria-hidden="true" /> Free ATS CV Template
                  </h3>
                  <Link href="https://www.canva.com/design/DAGcoiLfWAc/FhPyWx9Z7kXP0BsWShTHhA/edit?utm_content=DAGcoiLfWAc&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton" target="_blank">
                    <button className="bg-gradient-to-r from-[#20CEB6] to-[#2E2ADC] text-white py-3 px-6 font-manrope text-[16px] font-semibold rounded-[25px] hover:opacity-90 transition-all mb-4">
                      Access Canva Template
                    </button>
                  </Link>
                </div>
                
                <div className="border-t border-white border-opacity-10 pt-6">
                  <h3 className="font-manrope text-[20px] font-semibold text-[#F5F5F6] mb-2">
                    <Icon name="phone" size={20} className="text-[#20CEB6]" inline aria-hidden="true" /> Connect with Surbhi
                  </h3>
                  <p className="font-manrope text-[14px] text-[#20CEB6] mb-4">
                    hr@redef9skills.in
                  </p>
                </div>

                <div className="border-t border-white border-opacity-10 pt-6">
                  <h3 className="font-manrope text-[20px] font-semibold text-[#F5F5F6] mb-4">
                    <Icon name="users" size={20} className="text-[#20CEB6]" inline aria-hidden="true" /> Join Our Community
                  </h3>
                  <p className="font-manrope text-[14px] text-[#B0B0B0] mb-4">
                    Get daily job search tips and connect with other professionals
                  </p>
                  <Link href="http://www.tinyurl.com/AiPplyJobCommunity" target="_blank">
                    <button className="bg-gradient-to-r from-[#20CEB6] to-[#2E2ADC] text-white py-3 px-6 font-manrope text-[16px] font-semibold rounded-[25px] hover:opacity-90 transition-all">
                      <Icon name="message-circle" size={16} className="text-white" inline aria-hidden="true" /> Join WhatsApp Community
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </ResponsivePageContainer>

        <div className="mt-[215px] bg-[#111111] relative z-20">
          <FrequentlyAskedQuestionSection />
        </div>

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

export default ATSCVInterviewPrep;
