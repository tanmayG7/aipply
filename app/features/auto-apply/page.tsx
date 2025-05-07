import Footer from "@/components/common/footer/footer";
import FrequentlyAskedQuestionSection from "@/components/common/frequentlyAskedQuestionSection/frequentlyAskedQuestionSection";
import Header from "@/components/common/header/header";
import { ResponsivePageContainer } from "@/components/common/responsivePageContainer/responsivePageContainer";
import ScrollToTopBtn from "@/components/common/scrollToTopBtn/scrollToTopBtn";
import HeroSection from "@/components/sections/heroSection/heroSection";
import HowAutoApplyWorks from "@/components/sections/howAutoApplyWorks/howAutoApplyWorks";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const whyAutomateData = [
  {
    imageUrl: "/static/whyAutomateIcons/clock.svg",
    text: "Save time by skipping manual searches and applications",
  },
  {
    imageUrl: "/static/whyAutomateIcons/twentyFourSeven.svg",
    text: "Never miss opportunities with 24/7 job scanning",
  },
  {
    imageUrl: "/static/whyAutomateIcons/oneplace.svg",
    text: "Apply faster to stay ahead of the competition",
  },
  {
    imageUrl: "/static/whyAutomateIcons/arrowahead.svg",
    text: "Stay organized with all applications in one place",
  },
  {
    imageUrl: "/static/whyAutomateIcons/timer.svg",
    text: "Effortless job hunting with a one-time setup",
  },
];

const AutoApply = () => {
  return (
    <div>
      <div className="pt-7">
        <Header />
      </div>

      <div className="pt-[51px]">
        <div className="absolute w-full h-[1022px] top-[134px] left-1/2 transform -translate-x-1/2 bg-[#AE94FF] bg-opacity-50 blur-[300px] backdrop-blur-[400px] rounded-full"></div>
        <HeroSection
          image="/static/images/autoapply.jpeg"
          title="Auto-Apply to Jobs While You Sleep"
          subtitle="Let AiPply handle applications for you, relax and watch opportunities come to you."
          button={
            <Link href="/dashboard/onboarding/profile-setup">
              <button className="flex bg-gradient-to-r from-[#20CEB6] to-[#2E2ADC] text-white py-3 px-5 font-manrope text-[20px] font-semibold rounded-[30px]">
                Get Started
              </button>
            </Link>
          }
        />
      </div>

      <ResponsivePageContainer>
        <div className="pt-[103px] z-50">
          <div className="grid grid-cols-1 custom-md:grid-cols-2 gap-10 customlg:gap-[140px] items-center">
            <div className="relative w-full h-[500px] border border-white border-opacity-[7%] bg-[#111111] bg-opacity-10">
              {/* <Image
                src="/static/images/stepsImg.png"
                alt="Description"
                fill={true}
                className="object-cover rounded-[10px] p-16"
              /> */}
            </div>
            <div className="flex flex-col gap-10 relative">
              <h1 className="font-manrope text-[36px] leading-[44px] text-[#F5F5F6] font-semibold">
                How Auto-apply works
              </h1>
              <div className="flex flex-col gap-4">
                <HowAutoApplyWorks
                  imageUrl={"/static/icons/autoApply.svg"}
                  text="Set your preferences by choosing job titles, locations, keywords, and filters"
                />
                <HowAutoApplyWorks
                  imageUrl={"/static/icons/autoApply.svg"}
                  text="AiPply scans Job Portals across 10+ top career sites"
                />
                <HowAutoApplyWorks
                  imageUrl={"/static/icons/autoApply.svg"}
                  text="Matching jobs are collected and automatically saved in your Application Tracker"
                />
                <HowAutoApplyWorks
                  imageUrl={"/static/icons/autoApply.svg"}
                  text="Auto-Apply submits applications for relevant jobs"
                />
                <HowAutoApplyWorks
                  imageUrl={"/static/icons/autoApply.svg"}
                  text="Get daily email updates and real-time application tracking"
                />
              </div>
            </div>
          </div>
        </div>
      </ResponsivePageContainer>

      <ResponsivePageContainer>
        <div className="pt-[176px] flex flex-col gap-[76px] items-center">
          <h1 className="font-manrope text-[36px] leading-[44px] text-center text-[#F5F5F6]">
            Why Automate?
          </h1>
          <div className="flex flex-col gap-12">
            <div className="grid grid-cols-1 custom-md:grid-cols-2 custom-lg:grid-cols-3 gap-12 custom-lg:gap-[155px] ">
              {whyAutomateData.slice(0, 3).map((data, index) => (
                <div
                  key={index}
                  className="flex flex-col gap-5 w-[228px] items-center"
                >
                  <div className="bg-[#111111] p-[38px] rounded-[40px] w-fit flex">
                    <Image
                      src={data.imageUrl}
                      alt="icon"
                      width={64}
                      height={64}
                    />
                  </div>
                  <p className="font-manrope text-[18px] text-white leading-[140%] font-[700] text-center">
                    {data.text}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex flex-col custom-md:flex-row justify-evenly items-center gap-12 custom-lg:gap-[20px]">
              {whyAutomateData.slice(3, 5).map((data, index) => (
                <div
                  key={index}
                  className="flex flex-col gap-5 w-[228px] items-center"
                >
                  <div className="bg-[#111111] p-[38px] rounded-[40px] w-fit">
                    <Image
                      src={data.imageUrl}
                      alt="icon"
                      width={64}
                      height={64}
                    />
                  </div>
                  <p className="font-manrope text-[18px] text-white leading-[140%] font-[700] text-center">
                    {data.text}
                  </p>
                </div>
              ))}
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

export default AutoApply;
