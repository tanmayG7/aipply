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

const JobTracker = () => {
  return (
    <div>
      <div className="pt-7">
        <Header />
      </div>

      <div className="pt-[51px]">
        <div className="absolute w-full h-[1022px] top-[134px] left-1/2 transform -translate-x-1/2 bg-[#AE94FF] bg-opacity-[50%] blur-[300px] backdrop-blur-[400px] rounded-full"></div>
        <HeroSection
          image="/static/images/jobTracker.jpeg"
          title="Track Your Job Applications in One Place"
          subtitle="Keep all your saved and applied jobs in one dashboard."
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
          <div className="grid grid-cols-1 custom-md:grid-cols-2 gap-[40px] custom-lg:gap-[140px]">
            <div className="relative w-full h-[500px] border border-white border-opacity-[7%] bg-[#111111] bg-opacity-10">
              <Image
                src="/static/images/jobtracker.png"
                alt="Description"
                fill={true}
                className="object-cover object-left rounded-[10px] p-3 custom-lg:p-6"
              />
            </div>
            <div className="flex flex-col gap-10 relative">
              <h1 className="font-manrope text-[36px] leading-[44px] text-[#F5F5F6] font-semibold">
                Effortless Job Tracking
              </h1>
              <div className="flex flex-col gap-4">
                <CheckPointscard
                  imageUrl={"/static/icons/checkpoint.svg"}
                  text="All applications in one place with no spreadsheets and no lost emails"
                />
                <CheckPointscard
                  imageUrl={"/static/icons/checkpoint.svg"}
                  text="Real-time status updates so you can see pending in review or shortlisted jobs"
                />
                <CheckPointscard
                  imageUrl={"/static/icons/checkpoint.svg"}
                  text="Auto-progress tracking to keep you updated without manual effort"
                />
                <CheckPointscard
                  imageUrl={"/static/icons/checkpoint.svg"}
                  text="Easy follow-ups so you never miss deadlines or recruiter responses"
                />
                <CheckPointscard
                  imageUrl={"/static/icons/checkpoint.svg"}
                  text="Stay organized and manage your job search effortlessly"
                />
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

export default JobTracker;
