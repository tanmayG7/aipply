"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/common/header/header";
import { ResponsivePageContainer } from "@/components/common/responsivePageContainer/responsivePageContainer";
import Button from "@/components/common/button/button";
import FrequentlyAskedQuestionSection from "@/components/common/frequentlyAskedQuestionSection/frequentlyAskedQuestionSection";
import FeaturesSection from "@/components/sections/featuresSection/featuresSection";
import TestimonialSection from "@/components/sections/testimonialSection/testimonialSection";
import ScrollToTopBtn from "@/components/common/scrollToTopBtn/scrollToTopBtn";
import Footer from "@/components/common/footer/footer";
import Image from "next/image";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // checkAuthToken((path: string) => {
    //   router.push(path);
    // });
  }, [router]);

  return (
    <div className="bg-[#000000]">
      <div className="pt-10">
        <Header />
      </div>

      <ResponsivePageContainer>
        <div className="relative">
          <div className="absolute w-full h-[822px] top-[134px] left-1/2 transform -translate-x-1/2 bg-[#AE94FF] bg-opacity-50 backdrop-blur-[400px] rounded-full blur-[300px]"></div>

          <div className="relative grid grid-cols-1 gap-24 px-[20px] custom-lg:px-[58px] bg-gradient-to-b">
            <div className="flex flex-col gap-4 items-center pt-[137px]">
              <div className="flex justify-center">
                <Button text="Welcome to AipPly" />
              </div>

              <div className="flex flex-col gap-6 items-center justify-center ">
                <h1 className="font-manrope text-[40px] custom-md:text-[60px] custom-md:leading-[72px] font-bold custom-md:font-semibold text-[#F5F5F6] text-center">
                  Find Jobs with the power of AI!
                </h1>
                <p className="font-manrope font-normal text-[20px] laeding[30px] text-[#CECFD2] text-center">
                  Automate your job search with customized jobs from top portals
                  that your AI agent can apply on your behalf.
                </p>
              </div>
            </div>

            <div className="relative w-full h-[500px] custom-md:h-[682px] ">
              <Image
                src="/static/images/HomePageImg.png"
                alt="Description of image"
                fill={true}
                className="object-cover object-left rounded-xl border-[6px] border-[#333741]"
              />
            </div>
          </div>
        </div>
      </ResponsivePageContainer>

      <div className="pt-[113px]">
        <FeaturesSection />
      </div>

      <div className="pt-[117px]">
        <TestimonialSection />
      </div>

      <div className="pt-[88px]">
        <FrequentlyAskedQuestionSection />
      </div>

      <Footer />

      <ScrollToTopBtn />
    </div>
  );
}
