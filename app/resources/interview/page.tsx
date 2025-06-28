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
    icon: "🎯",
    title: "Great Interviews Are Structured, Not Perfect",
    description: "Don't chase the perfect answer. Use frameworks like STAR (Situation–Task–Action–Result) to showcase how you think and solve problems."
  },
  {
    icon: "🧠",
    title: "Think, Then Speak",
    description: "Pausing is powerful. Don't be afraid to take a few seconds before answering—clarity matters more than speed."
  },
  {
    icon: "🙋🏻‍♀️",
    title: "Confidence Comes From Clarity",
    description: "Prepare a crisp 2-minute personal pitch that communicates your story, strengths, and aspirations clearly and calmly."
  },
  {
    icon: "📁",
    title: "Portfolios Need Context, Not Just Design",
    description: "For every project, explain the problem, your approach, and the outcome. Show your impact, not just deliverables."
  },
  {
    icon: "❓",
    title: "Ask Smart Questions",
    description: "Interviews are two-way. Ask about the team, culture, or role expectations—it signals maturity, interest, and confidence."
  },
  {
    icon: "🤷‍♀️",
    title: "It's Okay to Not Know Everything",
    description: "If stuck, be honest—and then share how you'd find the answer or approach the problem."
  },
  {
    icon: "🗣",
    title: "Body Language Speaks Louder Than Words",
    description: "Maintain eye contact, smile, sit straight, and avoid fidgeting or overusing filler words like 'umm' or 'like.'"
  }
];

const starFrameworkSteps = [
  {
    letter: "S",
    title: "Situation",
    description: "Set the context by describing the background and circumstances of your example"
  },
  {
    letter: "T", 
    title: "Task",
    description: "Explain the specific task or challenge you needed to address or accomplish"
  },
  {
    letter: "A",
    title: "Action",
    description: "Detail the specific actions you took to address the task or challenge"
  },
  {
    letter: "R",
    title: "Result",
    description: "Share the outcomes and results of your actions, including lessons learned"
  }
];

const interviewDos = [
  "Dress appropriately for the role, even virtually",
  "Smile—especially during intros and goodbyes",
  "Maintain good posture",
  "Look into the camera, not just the screen",
  "Keep a glass of water nearby to ease nerves"
];

const interviewDonts = [
  "Slouch, fidget, or spin in your chair",
  "Touch your face or hair frequently",
  "Use excessive filler words",
  "Speak too quickly or too softly",
  "Avoid eye contact or look distracted"
];

const interviewPreparationSections = [
  {
    title: "Personal Pitch Preparation",
    points: [
      "Craft a compelling 2-minute introduction",
      "Include your background, key strengths, and career goals",
      "Practice delivering it naturally and confidently"
    ]
  },
  {
    title: "Portfolio Presentation",
    points: [
      "Prepare context for each project you showcase",
      "Focus on problem-solving approach and outcomes", 
      "Quantify your impact with specific metrics"
    ]
  },
  {
    title: "Question Preparation",
    points: [
      "Research the company culture and values",
      "Prepare thoughtful questions about the role and team",
      "Practice common behavioral interview questions"
    ]
  },
  {
    title: "Technical Setup",
    points: [
      "Test your audio and video quality beforehand",
      "Ensure stable internet connection",
      "Have backup communication methods ready"
    ]
  }
];

const smartQuestions = [
  "What does success look like in this role after 6 months?",
  "How does this team collaborate on projects?",
  "What are the biggest challenges facing the team right now?",
  "What opportunities are there for growth and learning?",
  "How would you describe the company culture?"
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

const InterviewPreparation = () => {
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
            image="/static/images/interview-preparation.jpeg"
            title="Ace Your Interview Resource"
            subtitle="Master the art of interviewing with proven strategies. Your job isn't to answer everything perfectly—it's to show how you think!"
            button={
              <div className="flex flex-col custom-md:flex-row gap-4">
                <Link href="https://youtu.be/Tm0Gd7GILwc" target="_blank">
                  <button className="flex bg-gradient-to-r from-[#20CEB6] to-[#2E2ADC] text-white py-3 px-5 font-manrope text-[20px] font-semibold rounded-[30px]">
                    📹 Watch Webinar
                  </button>
                </Link>
                <Link href="/dashboard/interview-prep">
                  <button className="flex border-2 border-white border-opacity-20 text-white py-3 px-5 font-manrope text-[20px] font-semibold rounded-[30px] hover:bg-white hover:bg-opacity-10 transition-all">
                    Start Prep
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
                Key insights from Gurleen Baruah's interview mastery webinar to help you ace your next interview.
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
          <div className="pt-[176px] relative z-20">
            <div className="bg-gradient-to-r from-[#20CEB6] bg-opacity-10 to-[#2E2ADC] bg-opacity-10 border border-white border-opacity-[7%] rounded-[30px] p-8 text-center">
              <h2 className="font-manrope text-[24px] font-semibold text-[#F5F5F6] mb-4">
                🔥 Key Takeaway
              </h2>
              <p className="font-manrope text-[18px] text-[#F5F5F6] leading-[150%] max-w-[800px] mx-auto">
                "Your job isn't to answer everything perfectly—it's to show how you think." Focus on demonstrating your problem-solving approach and thought process.
              </p>
            </div>
          </div>
        </ResponsivePageContainer>

        <ResponsivePageContainer>
          <div className="pt-[176px] flex flex-col gap-[76px] relative z-20">
            <div className="text-center">
              <h1 className="font-manrope text-[36px] leading-[44px] text-[#F5F5F6] font-semibold mb-4">
                ⭐ STAR Framework for Behavioral Questions
              </h1>
              <p className="font-manrope text-[18px] text-[#B0B0B0] leading-[150%] max-w-[600px] mx-auto">
                Use the STAR method to structure your responses and showcase your problem-solving abilities effectively.
              </p>
            </div>
            
            <div className="grid grid-cols-1 custom-md:grid-cols-2 gap-8 custom-lg:gap-16">
              <div className="flex flex-col gap-8">
                {starFrameworkSteps.map((step, index) => (
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
                  📝 Interview Preparation Checklist
                </h3>
                <div className="space-y-6">
                  {interviewPreparationSections.map((section, index) => (
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
                🎯 Interview Appearance: Do's & Don'ts
              </h1>
              <p className="font-manrope text-[18px] text-[#B0B0B0] leading-[150%] max-w-[600px] mx-auto">
                Professional appearance and body language can make or break your interview. Here's what to focus on.
              </p>
            </div>
            
            <div className="grid grid-cols-1 custom-md:grid-cols-2 gap-8">
              {/* Do's */}
              <div className="bg-[#111111] bg-opacity-50 border border-green-500 border-opacity-20 rounded-[20px] p-8">
                <h3 className="font-manrope text-[24px] font-semibold text-green-400 mb-6 flex items-center gap-2">
                  ✅ Do's
                </h3>
                <ul className="space-y-4">
                  {interviewDos.map((item, index) => (
                    <li key={index} className="font-manrope text-[16px] text-[#B0B0B0] leading-[150%] flex items-start gap-3">
                      <span className="text-green-400 mt-1 flex-shrink-0">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Don'ts */}
              <div className="bg-[#111111] bg-opacity-50 border border-red-500 border-opacity-20 rounded-[20px] p-8">
                <h3 className="font-manrope text-[24px] font-semibold text-red-400 mb-6 flex items-center gap-2">
                  ❌ Don'ts
                </h3>
                <ul className="space-y-4">
                  {interviewDonts.map((item, index) => (
                    <li key={index} className="font-manrope text-[16px] text-[#B0B0B0] leading-[150%] flex items-start gap-3">
                      <span className="text-red-400 mt-1 flex-shrink-0">✗</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </ResponsivePageContainer>

        <ResponsivePageContainer>
          <div className="pt-[176px] flex flex-col gap-[76px] relative z-20">
            <div className="text-center">
              <h1 className="font-manrope text-[36px] leading-[44px] text-[#F5F5F6] font-semibold mb-4">
                💡 Smart Questions to Ask Interviewers
              </h1>
              <p className="font-manrope text-[18px] text-[#B0B0B0] leading-[150%] max-w-[600px] mx-auto">
                Asking thoughtful questions shows maturity, interest, and confidence. Here are some great examples.
              </p>
            </div>
            
            <div className="bg-[#111111] bg-opacity-50 border border-white border-opacity-[7%] rounded-[20px] p-8 max-w-[800px] mx-auto w-full">
              <div className="space-y-4">
                {smartQuestions.map((question, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 bg-gradient-to-r from-[#20CEB6] bg-opacity-5 to-[#2E2ADC] bg-opacity-5 rounded-[15px]">
                    <span className="text-[#20CEB6] text-lg mt-1 flex-shrink-0">❓</span>
                    <p className="font-manrope text-[16px] text-[#F5F5F6] leading-[150%]">
                      {question}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ResponsivePageContainer>

        <ResponsivePageContainer>
          <div className="pt-[176px] flex flex-col gap-[50px] relative z-20">
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
                    'Give and Take' by Adam Grant
                  </p>
                </div>

                <div className="border-t border-white border-opacity-10 pt-6">
                  <h3 className="font-manrope text-[20px] font-semibold text-[#F5F5F6] mb-2">
                    🎥 TED Talk
                  </h3>
                  <Link href="https://youtu.be/YyXRYgjQXX0?feature=shared" target="_blank">
                    <p className="font-manrope text-[16px] text-[#20CEB6] hover:underline">
                      Future Proof Skills by World Economic Forum
                    </p>
                  </Link>
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

export default InterviewPreparation;
