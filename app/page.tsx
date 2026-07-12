import dynamic from "next/dynamic";
import Link from "next/link";
import Header from "@/components/common/header/header";
import { ResponsivePageContainer } from "@/components/common/responsivePageContainer/responsivePageContainer";
import Button from "@/components/common/button/button";
import FeaturesSection from "@/components/sections/featuresSection/featuresSection";
import TestimonialSection from "@/components/sections/testimonialSection/testimonialSection";
import Footer from "@/components/common/footer/footer";
import Image from "next/image";

// Below-the-fold interactive sections: split into their own chunks so the
// initial bundle only carries the hero, navigation and CTAs.
const FrequentlyAskedQuestionSection = dynamic(
  () =>
    import(
      "@/components/common/frequentlyAskedQuestionSection/frequentlyAskedQuestionSection"
    ),
  {
    loading: () => <div className="min-h-[600px]" aria-hidden="true" />,
  }
);

const ScrollToTopBtn = dynamic(
  () => import("@/components/common/scrollToTopBtn/scrollToTopBtn")
);

export default function Home() {
  return (
    <div className="bg-[#000000]">
      <Header />

      <main className="pt-20 md:pt-24">
        <ResponsivePageContainer>
          <div className="relative">
            <div className="absolute w-full hero-blur-bg top-[134px] left-1/2 transform -translate-x-1/2 bg-[#AE94FF] bg-opacity-50 backdrop-blur-[400px] rounded-full blur-[300px]"></div>

            <div className="relative grid grid-cols-1 gap-24 px-container bg-gradient-to-b">
              <section id="hero" className="flex flex-col gap-4 items-center pt-[117px] scroll-mt-20 md:scroll-mt-24">
                <div className="flex justify-center">
                  <Button text="Welcome to AipPly" />
                </div>

                <div className="flex flex-col gap-6 items-center justify-center ">
                  <h1 className="font-manrope text-fluid-hero font-bold custom-md:font-semibold text-[#F5F5F6] text-center">
                    Find Jobs with the power of AI!
                  </h1>
                  <p className="font-manrope font-normal text-fluid-lead text-[#CECFD2] text-center px-4">
                    Automate your job search with customized jobs from top portals
                    that your AI agent can apply on your behalf.
                  </p>

                  <div className="flex justify-center mt-8">
                    <Link href="/dashboard/onboarding/login">
                      <Button text="Start Job Search" />
                    </Link>
                  </div>
                </div>
              </section>

              <div className="relative w-full h-[500px] custom-md:h-[682px] ">
                <Image
                  src="/static/images/HomePageImg.png"
                  alt="Description of image"
                  fill={true}
                  priority
                  className="object-cover object-left rounded-xl border-[6px] border-[#333741]"
                />
              </div>
            </div>
          </div>
        </ResponsivePageContainer>

        <section id="features" className="pt-[113px] scroll-mt-20 md:scroll-mt-24">
          <FeaturesSection />
        </section>

        <section id="testimonials" className="pt-[117px] scroll-mt-20 md:scroll-mt-24">
          <TestimonialSection />
        </section>

        <section id="faq" className="pt-[88px] scroll-mt-20 md:scroll-mt-24">
          <FrequentlyAskedQuestionSection />
        </section>
      </main>

      <Footer />

      <ScrollToTopBtn />
    </div>
  );
}
