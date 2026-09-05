import CheckPointscard from "@/components/common/checkPointscard/checkPointscard";
import Footer from "@/components/common/footer/footer";
import FrequentlyAskedQuestionSection from "@/components/common/frequentlyAskedQuestionSection/frequentlyAskedQuestionSection";
import Header from "@/components/common/header/header";
import { ResponsivePageContainer } from "@/components/common/responsivePageContainer/responsivePageContainer";
import ScrollToTopBtn from "@/components/common/scrollToTopBtn/scrollToTopBtn";
import HeroSection from "@/components/sections/heroSection/heroSection";
import React from "react";
import Image from "next/image";
import Link from "next/link";

const faqs = [
  {
    question: "How does AiPply research the company for my interview?",
    answer:
      "AiPply pulls public reviews, interview questions, and salary data for the company, then combines it with your resume and the job description to build a prep pack grounded in real, checkable information rather than generic advice.",
  },
  {
    question: "What if I don't have a job description yet?",
    answer:
      "You can generate a prep pack with just the company name and role — AiPply will still research the company and give you likely questions and talking points, and you can add the job description later for a more tailored pack.",
  },
  {
    question: "What's the mock interview feature?",
    answer:
      "It's a live, back-and-forth text interview — AiPply plays the interviewer, asks one question at a time, follows up on your answers, and gives you direct feedback with a readiness score when you're done.",
  },
  {
    question: "Is my prep pack saved for later?",
    answer:
      "Yes, every prep pack you generate is saved to your account so you can revisit it before the actual interview.",
  },
];

const InterviewPrepFeature = () => {
  return (
    <div>
      <div className="pt-7">
        <Header />
      </div>

      <div className="pt-[51px]">
        <div className="absolute w-full h-[1022px] top-[134px] left-1/2 transform -translate-x-1/2 bg-[#AE94FF] bg-opacity-[50%] blur-[300px] backdrop-blur-[400px] rounded-full"></div>
        <HeroSection
          image="/static/images/interview-preparation.jpeg"
          title="Walk Into Every Interview Prepared"
          subtitle="Company research, likely questions, and a live mock interview — built from your real resume."
          button={
            <Link href="/features/interview-prep/dashboard">
              <button className="flex bg-gradient-to-r from-[#20CEB6] to-[#2E2ADC] text-white py-3 px-5 font-manrope text-[20px] font-semibold rounded-[30px]">
                Get Started
              </button>
            </Link>
          }
        />
      </div>

      <ResponsivePageContainer>
        <div className="pt-[103px] z-50">
          <div className="grid grid-cols-1 custom-md:grid-cols-2 gap-[40px] custom-lg:gap-[140px]">
            <div className="relative w-full h-[500px] border border-white border-opacity-[7%] bg-[#111111] bg-opacity-10">
              <Image
                src="/static/images/ats-cv-interview-prep.jpeg"
                alt="Description"
                fill={true}
                className="object-cover object-left rounded-[10px] p-3 custom-lg:p-6"
              />
            </div>
            <div className="flex flex-col gap-10 relative">
              <h1 className="font-manrope text-[36px] leading-[44px] text-[#F5F5F6] font-semibold">
                Prep That&apos;s Actually Grounded
              </h1>
              <div className="flex flex-col gap-4">
                <CheckPointscard
                  imageUrl={"/static/icons/checkpoint.svg"}
                  text="Live company research pulled from public reviews, interview questions and salary data"
                />
                <CheckPointscard
                  imageUrl={"/static/icons/checkpoint.svg"}
                  text="A 60-second story and likely questions built from your real resume, not generic templates"
                />
                <CheckPointscard
                  imageUrl={"/static/icons/checkpoint.svg"}
                  text="Talking points and smart questions to ask, tailored to the role and company"
                />
                <CheckPointscard
                  imageUrl={"/static/icons/checkpoint.svg"}
                  text="A live, turn-by-turn mock interview that follows up on your answers like a real interviewer"
                />
                <CheckPointscard
                  imageUrl={"/static/icons/checkpoint.svg"}
                  text="Direct feedback and a readiness score when you're done practicing"
                />
              </div>
            </div>
          </div>
        </div>
      </ResponsivePageContainer>

      <div className="mt-[215px] bg-[#111111]">
        <FrequentlyAskedQuestionSection faqs={faqs} />
      </div>

      <Footer />

      <ScrollToTopBtn />
    </div>
  );
};

export default InterviewPrepFeature;
