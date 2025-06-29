import WhatsInsideCard from "@/components/card/whatsInsidecard/whatsInsidecard";
import Footer from "@/components/common/footer/footer";
import Header from "@/components/common/header/header";
import { ResponsivePageContainer } from "@/components/common/responsivePageContainer/responsivePageContainer";
import ScrollToTopBtn from "@/components/common/scrollToTopBtn/scrollToTopBtn";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const whatsInsideData = [
  {
    image: "/static/communityPage/jobtips.png",
    title: "Insider Job Tips & Hacks",
  },
  {
    image: "/static/communityPage/hiringupdates.png",
    title: "Exclusive Hiring Updates & Hidden Openings",
  },
  {
    image: "/static/communityPage/networking.png",
    title: "Networking with Peers",
  },
  {
    image: "/static/communityPage/interview.jpeg",
    title: "Resume & Interview Hacks",
  },
  {
    image: "/static/communityPage/webinars.png",
    title: "Live Q&As & Webinars",
  },
  {
    image: "/static/communityPage/newfeatures.png",
    title: "Early Access to New Features",
  },
  {
    image: "/static/communityPage/feedback.png",
    title: "Beta Testing & Prioritized Feedback",
  },
];

const whatsInsideSectionTwo = [
  {
    image: "/static/communityPage/jobtipsIcons.svg",
    text: "Insider Job Tips & Hacks",
  },
  {
    image: "/static/communityPage/hiringIcon.svg",
    text: "Exclusive Hiring Updates & Hidden Openings",
  },
  {
    image: "/static/communityPage/networkIcon.svg",
    text: "Networking with Peers",
  },
  {
    image: "/static/communityPage/resumeIcon.svg",
    text: "Resume & Interview Hacks",
  },
  {
    image: "/static/communityPage/QAIcon.svg",
    text: "Live Q&As & Webinars",
  },
  {
    image: "/static/communityPage/earlyAccess.svg",
    text: "Early Access to New Features",
  },
  {
    image: "/static/communityPage/feedbackIcon.svg",
    text: "Beta Testing & Prioritized Feedback",
  },
];

const CommunityPage = () => {
  return (
    <div>
      <div className="pt-7">
        <Header />
      </div>

      <ResponsivePageContainer>
        <div className="pt-[51px]">
          <div className="absolute w-full h-[924px] top-[135px] left-1/2 transform -translate-x-1/2 bg-[#AE94FF] bg-opacity-50 blur-[280px] backdrop-blur-[400px] rounded-full"></div>
          <div className="relative w-full h-[646px]">
            <Image
              src={"/static/images/community.png"}
              alt="hero image"
              fill={true}
              className="object-cover rounded-[40px]"
            />
            <div className="absolute top-[224px] flex items-center justify-center">
              <div className="px-4 custom-lg:px-[103px]">
                <p className="font-manrope font-semibold text-[40px] custom-md:text-[48px] leading-[120%] custom-md:leading-[160%] text-white">
                  Exclusive Community.
                  <br /> Exclusive Support.
                </p>
              </div>
            </div>
          </div>
        </div>
      </ResponsivePageContainer>
      
      <ResponsivePageContainer>
        <div className="flex justify-center pt-[50px]">
          <Link href="https://chat.whatsapp.com/your-whatsapp-community-link" target="_blank" rel="noopener noreferrer">
            <button className="font-manrope w-full custom-md:w-[460px] font-bold text-[15px] custom-sm:text-[20px] leading-[160%] border-[#5D29FF] text-white border rounded-full px-5 py-3 bg-gradient-to-r from-[#52A9FF] to-[#5D29FF]">
          Join the AiPply Community
            </button>
          </Link>
        </div>
      </ResponsivePageContainer>

      <ResponsivePageContainer>
        <div className="pt-[165px] flex flex-col gap-8 items-center relative">
          <div className="absolute z-0 w-full h-[818px] top-[405px] left-1/2 transform -translate-x-1/2 bg-[#AE94FF] bg-opacity-50 blur-[300px] backdrop-blur-[400px] rounded-full"></div>

          <h1 className="font-manrope text-[48px] font-semibold leading-[160%] text-white z-10">
            What’s Inside
          </h1>

          <div className="flex flex-col gap-[10px] z-10">
            <div className="grid grid-cols-1 custom-md:grid-cols-2 gap-[10px]">
              {whatsInsideData.slice(0, 2).map((data, index) => (
                <WhatsInsideCard
                  key={index}
                  image={data.image}
                  title={data.title}
                  index={index}
                />
              ))}
            </div>
            <div className="grid grid-cols-1 custom-md:grid-cols-3 gap-[10px]">
              {whatsInsideData.slice(2, 5).map((data, index) => (
                <WhatsInsideCard
                  key={index + 2}
                  image={data.image}
                  title={data.title}
                  index={index + 2}
                />
              ))}
            </div>
            <div className="grid grid-cols-1 custom-md:grid-cols-2 gap-[10px]">
              {whatsInsideData.slice(5, 7).map((data, index) => (
                <WhatsInsideCard
                  key={index + 5}
                  image={data.image}
                  title={data.title}
                  index={index + 5}
                />
              ))}
            </div>
          </div>
        </div>
      </ResponsivePageContainer>

      <ResponsivePageContainer>
        <div className="flex flex-col gap-[62px]">
          <div className="pt-[165px] flex flex-col gap-[42px] items-center relative">
            <h1 className="font-manrope text-center text-[48px] font-semibold leading-[160%] text-white z-10">
              What’s Inside
            </h1>

            <div className="flex flex-col gap-[70px]">
              <div className="flex flex-col custom-md:flex-row justify-evenly gap-12 items-center">
                {whatsInsideSectionTwo.slice(0, 3).map((data, index) => (
                  <div
                    key={index}
                    className="flex flex-col gap-5 w-[218px] items-center"
                  >
                    <div className="bg-[#111111] p-[38px] rounded-[40px] w-fit flex">
                      <Image
                        src={data.image}
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
              <div className="grid grid-cols-1 custom-md:grid-cols-3 custom-lg:grid-cols-4 items-center gap-12 custom-lg:gap-[108px]">
                {whatsInsideSectionTwo.slice(3, 7).map((data, index) => (
                  <div
                    key={index}
                    className="flex flex-col gap-5 w-[218px] items-center"
                  >
                    <div className="bg-[#111111] p-[38px] rounded-[40px] w-fit">
                      <Image
                        src={data.image}
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

          <div className="flex justify-center pb-[99px]">
            <Link href="https://www.tinyurl.com/aipplyjobcommunity" target="_blank" rel="noopener noreferrer">
              <button className="font-manrope w-full custom-md:w-[460px] font-bold text-[15px] custom-sm:text-[20px] leading-[160%] border-[#5D29FF] text-white border rounded-full px-5 py-3 bg-gradient-to-r from-[#52A9FF] to-[#5D29FF]">
                Join the AiPply Community
              </button>
            </Link>
          </div>
        </div>
      </ResponsivePageContainer>

      <Footer />

      <ScrollToTopBtn />
    </div>
  );
};

export default CommunityPage;
