import Footer from "@/components/common/footer/footer";
import FrequentlyAskedQuestionSection from "@/components/common/frequentlyAskedQuestionSection/frequentlyAskedQuestionSection";
import Header from "@/components/common/header/header";
import { ResponsivePageContainer } from "@/components/common/responsivePageContainer/responsivePageContainer";
import ScrollToTopBtn from "@/components/common/scrollToTopBtn/scrollToTopBtn";
import HeroSection from "@/components/sections/heroSection/heroSection";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const webinarHighlights = [
  {
    icon: "💼",
    title: "Your LinkedIn profile is your digital CV",
    description: "Optimize your banner, headline, about section, and featured projects to clearly communicate your value."
  },
  {
    icon: "📝",
    title: "Use the AIDA framework",
    description: "Apply Attention, Interest, Desire, Action in your About section to make it engaging and recruiter-friendly."
  },
  {
    icon: "🔍",
    title: "SEO matters!",
    description: "Optimize your LinkedIn profile with relevant keywords to rank higher in searches and attract the right opportunities."
  },
  {
    icon: "🎓",
    title: "Freshers should build their presence",
    description: "Share college projects, extracurriculars, and post consistently to gain visibility."
  },
  {
    icon: "🤝",
    title: "Networking is key!",
    description: "Connecting with decision-makers, messaging recruiters, and engaging with professionals increases your chances of getting hired."
  },
  {
    icon: "🚫",
    title: "Easy Apply alone won't work",
    description: "Direct outreach and referrals make a significant difference in standing out."
  },
  {
    icon: "⚡",
    title: "Personal branding is long-term",
    description: "Start today, stay consistent, and expect results in 4-5 months."
  },
  {
    icon: "📢",
    title: "Content matters!",
    description: "The LinkedIn algorithm favors visual content like videos and images, boosting engagement and reach."
  }
];

const linkedinTools = [
  {
    name: "ChatGPT",
    purpose: "Content Ideas",
    description: "Generate engaging LinkedIn post ideas and captions"
  },
  {
    name: "Expandi",
    purpose: "Networking Automation", 
    description: "Automate connection requests and follow-up messages"
  },
  {
    name: "AuthoredUp",
    purpose: "Content Creation",
    description: "Create professional LinkedIn posts with templates"
  },
  {
    name: "Kleo",
    purpose: "Inspiration",
    description: "Find trending content and engagement strategies"
  }
];

const aidaSteps = [
  {
    letter: "A",
    title: "Attention",
    description: "Start with a compelling hook that grabs the reader's attention immediately"
  },
  {
    letter: "I", 
    title: "Interest",
    description: "Share your unique story and what makes you different from others"
  },
  {
    letter: "D",
    title: "Desire",
    description: "Highlight your achievements and the value you bring to organizations"
  },
  {
    letter: "A",
    title: "Action",
    description: "End with a clear call-to-action for recruiters to connect with you"
  }
];

const profileOptimizationSections = [
  {
    title: "Banner Optimization",
    points: [
      "Use a professional background that reflects your industry",
      "Include your value proposition or key skills",
      "Ensure text is readable on mobile devices"
    ]
  },
  {
    title: "Headline Strategy",
    points: [
      "Go beyond just your job title",
      "Include relevant keywords for your target role", 
      "Show your unique value proposition"
    ]
  },
  {
    title: "About Section",
    points: [
      "Use the AIDA framework structure",
      "Include relevant keywords naturally",
      "Tell your professional story compellingly"
    ]
  },
  {
    title: "Featured Projects",
    points: [
      "Showcase your best work with visuals",
      "Include project outcomes and metrics",
      "Link to external portfolios or case studies"
    ]
  }
];

const HighlightCard = ({ icon, title, description }: { icon: string, title: string, description: string }) => {
  return (
    <div className="bg-[#111111] bg-opacity-50 border border-white border-opacity-[7%] rounded-[20px] p-6 h-full">
      <div className="flex items-start gap-4">
        <span className="text-2xl">{icon}</span>
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

const AidaStep = ({ letter, title, description }: { letter: string, title: string, description: string }) => {
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

const LinkedInOptimization = () => {
  return (
    <>
      <div className="pt-7">
        <Header />
      </>

      <div className="pt-[51px] relative">
        <div className="absolute w-full h-[600px] top-0 left-1/2 transform -translate-x-1/2 bg-[#AE94FF] bg-opacity-30 blur-[200px] backdrop-blur-[300px] rounded-full z-0"></div>
        <div className="relative z-10">
          <HeroSection
          image="/static/images/linkedin-optimization.jpeg"
          title="LinkedIn Optimization Resource"
          subtitle="Transform your LinkedIn profile into a powerful career tool. Your profile is your digital CV - make it count!"
          button={
            <div className="flex flex-col custom-md:flex-row gap-4">
              <Link href="https://your-webinar-recording-link.com" target="_blank">
                <button className="flex bg-gradient-to-r from-[#20CEB6] to-[#2E2ADC] text-white py-3 px-5 font-manrope text-[20px] font-semibold rounded-[30px]">
                  📹 Watch Webinar
                </button>
              </Link>
              <Link href="/dashboard/linkedin-analyzer">
                <button className="flex border-2 border-white border-opacity-20 text-white py-3 px-5 font-manrope text-[20px] font-semibold rounded-[30px] hover:bg-white hover:bg-opacity-10 transition-all">
                  Analyze Profile
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
              📌 Webinar Highlights
            </h1>
            <p className="font-manrope text-[18px] text-[#B0B0B0] leading-[150%] max-w-[600px] mx-auto">
              Key insights from our LinkedIn optimization webinar to help you build a standout professional presence.
            </p>
          </div>
          
          <div className="grid grid-cols-1 custom-md:grid-cols-2 gap-6">
            {webinarHighlights.map((highlight, index) => (
              <HighlightCard
                key={index}
                icon={highlight.icon}
                title={highlight.title}
                description={highlight.description}
              />
            ))}
          </div>
        </div>
      </ResponsivePageContainer>

      <ResponsivePageContainer>
        <div className="pt-[176px]">
          <div className="relative border border-white border-opacity-[7%] rounded-[30px] p-8 text-center overflow-hidden">
            {/* Background gradient layer */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#20CEB6]/10 to-[#2E2ADC]/10 rounded-[30px] -z-10"></div>
            
            {/* Content layer */}
            <div className="relative z-10">
              <h2 className="font-manrope text-[24px] font-semibold text-[#F5F5F6] mb-4">
                🔥 Key Takeaway
              </h2>
              <p className="font-manrope text-[18px] text-[#F5F5F6] leading-[150%] max-w-[800px] mx-auto">
                Your LinkedIn profile alone won't land you a job – networking, branding, and engagement are crucial to standing out. Start building your presence today!
              </p>
            </div>
          </div>
        </div>
      </ResponsivePageContainer>

      <ResponsivePageContainer>
        <div className="pt-[176px] flex flex-col gap-[76px]">
          <div className="text-center">
            <h1 className="font-manrope text-[36px] leading-[44px] text-[#F5F5F6] font-semibold mb-4">
              📖 AIDA Framework for About Section
            </h1>
            <p className="font-manrope text-[18px] text-[#B0B0B0] leading-[150%] max-w-[600px] mx-auto">
              Structure your About section using the proven AIDA framework to make it engaging and recruiter-friendly.
            </p>
          </div>
          
          <div className="grid grid-cols-1 custom-md:grid-cols-2 gap-8 custom-lg:gap-16">
            <div className="flex flex-col gap-8">
              {aidaSteps.map((step, index) => (
                <AidaStep
                  key={index}
                  letter={step.letter}
                  title={step.title}
                  description={step.description}
                />
              ))}
            </div>
            <div className="bg-[#111111] bg-opacity-50 border border-white border-opacity-[7%] rounded-[20px] p-8">
              <h3 className="font-manrope text-[24px] font-semibold text-[#F5F5F6] mb-6">
                📝 Profile Optimization Template
              </h3>
              <div className="space-y-6">
                {profileOptimizationSections.map((section, index) => (
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
        <div className="pt-[176px] flex flex-col gap-[76px]">
          <div className="text-center">
            <h1 className="font-manrope text-[36px] leading-[44px] text-[#F5F5F6] font-semibold mb-4">
              🛠 LinkedIn Optimization Tools
            </h1>
            <p className="font-manrope text-[18px] text-[#B0B0B0] leading-[150%] max-w-[600px] mx-auto">
              Leverage these powerful tools to optimize your LinkedIn presence and maximize your networking efforts.
            </p>
          </div>
          
          <div className="grid grid-cols-1 custom-md:grid-cols-2 custom-lg:grid-cols-4 gap-6">
            {linkedinTools.map((tool, index) => (
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
        <div className="pt-[176px] flex flex-col gap-[50px]">
          <div className="text-center">
            <h1 className="font-manrope text-[36px] leading-[44px] text-[#F5F5F6] font-semibold mb-4">
              📚 Further Reading & Resources
            </h1>
          </div>

          <div className="bg-[#111111] bg-opacity-50 border border-white border-opacity-[7%] rounded-[20px] p-8 max-w-[600px] mx-auto w-full text-center">
            <div className="space-y-6">
              <div>
                <h3 className="font-manrope text-[20px] font-semibold text-[#F5F5F6] mb-2">
                  📖 Recommended Reading
                </h3>
                <p className="font-manrope text-[16px] text-[#20CEB6]">
                  'SEO for LinkedIn Optimization' by Neil Patel
                </p>
              </div>
              
              <div className="border-t border-white border-opacity-10 pt-6">
                <h3 className="font-manrope text-[20px] font-semibold text-[#F5F5F6] mb-4">
                  👇 Join Our Community
                </h3>
                <p className="font-manrope text-[14px] text-[#B0B0B0] mb-4">
                  Get daily tips and connect with other job seekers
                </p>
                <Link href="http://www.tinyurl.com/AiPplyJobCommunity" target="_blank">
                  <button className="bg-gradient-to-r from-[#20CEB6] to-[#2E2ADC] text-white py-3 px-6 font-manrope text-[16px] font-semibold rounded-[25px] hover:opacity-90 transition-all">
                    💬 Join WhatsApp Community
                  </button>
                </Link>
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
