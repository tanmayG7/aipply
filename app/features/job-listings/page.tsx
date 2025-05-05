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

const JobListing = () => {
  return (
    <div>
      <div className="pt-7">
        <Header />
      </div>

      <div className="pt-[51px] z-10">
        <div className="absolute w-full h-[1022px] top-[134px] left-1/2 transform -translate-x-1/2 bg-[#AE94FF] bg-opacity-50 blur-[300px] backdrop-blur-[400px] rounded-full"></div>
        <HeroSection
          image="/static/images/joblisting.png"
          title="Custom Job Listings"
          subtitle="Stop wasting hours on job hunting, Let AiPply automate it for you."
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
          <div className="grid grid-cols-1 custom-md:grid-cols-2 gap-[40px] custom-lg:gap-[140px] items-center">
            <div className="relative rounded-[10px] w-full h-[500px] border border-white border-opacity-[7%] bg-[#111111] bg-opacity-10">
              <Image
                src="/static/images/stepsImg.png"
                alt="Description"
                fill={true}
                className="object-cover rounded-[20px] p-4 custom-md:p-6 custom-lg:p-8"
              />
            </div>
            <div className="flex flex-col gap-10 relative">
              <h1 className="font-manrope text-[36px] leading-[44px] text-[#F5F5F6] font-semibold">
                Quick & Easy Setup
              </h1>
              <div className="flex flex-col gap-4">
                <CheckPointscard
                  imageUrl={"/static/icons/checkpoint.svg"}
                  text="Select job titles you’re interested in."
                />
                <CheckPointscard
                  imageUrl={"/static/icons/checkpoint.svg"}
                  text="Select job titles you’re interested in."
                />
                <CheckPointscard
                  imageUrl={"/static/icons/checkpoint.svg"}
                  text="Select job titles you’re interested in."
                />
                <CheckPointscard
                  imageUrl={"/static/icons/checkpoint.svg"}
                  text="Select job titles you’re interested in."
                />
              </div>
            </div>
          </div>
        </div>
      </ResponsivePageContainer>

      <ResponsivePageContainer>
        <div className="pt-[145px] z-50">
          <div className="grid grid-cols-1 custom-md:grid-cols-2 gap-[40px] custom-lg:gap-[140px] items-center">
            <div className="flex flex-col gap-10 relative">
              <h1 className="font-manrope text-[36px] leading-[44px] text-[#F5F5F6] font-semibold">
                Auto Job Search
              </h1>
              <div className="flex flex-col gap-4">
                <CheckPointscard
                  imageUrl={"/static/icons/checkpoint.svg"}
                  text="Scans 10+ top job portals."
                />
                <CheckPointscard
                  imageUrl={"/static/icons/checkpoint.svg"}
                  text="Saves matching jobs in your tracker."
                />
                <CheckPointscard
                  imageUrl={"/static/icons/checkpoint.svg"}
                  text="Auto-applies (if accessed) to relevant jobs."
                />
                <CheckPointscard
                  imageUrl={"/static/icons/checkpoint.svg"}
                  text="Daily job alerts with new opportunities."
                />
              </div>
            </div>
            <div className="relative w-full h-[500px] border border-white border-opacity-[7%] bg-[#111111] bg-opacity-10">
              {/* <Image
                src="/static/images/stepsImg.png"
                alt="Description"
                fill={true}
                className="object-cover rounded-[10px] p-16"
              /> */}
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

export default JobListing;
