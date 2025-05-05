import { ResponsivePageContainer } from "@/components/common/responsivePageContainer/responsivePageContainer";
import Image from "next/image";
import React from "react";

interface HeroSectionProps {
  image: string;
  title: string;
  subtitle: string;
  button: React.ReactNode;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  image,
  title,
  subtitle,
  button,
}) => {
  return (
    <ResponsivePageContainer>
      <div className="flex justify-center items-center h-full">
        <div className="relative w-full h-[85vh]">
          <div className="absolute rounded-[40px] inset-0 bg-gradient-to-t from-black to-transparent z-10"></div>
          <Image
            src={image}
            alt="hero image"
            fill={true}
            className="object-cover rounded-[40px]"
          />
          <div className="relative items-start custom-md:items-center justify-end bottom-[46px] w-full h-full z-40 px-8 text-start custom-md:text-center flex flex-col gap-[15px] custom-md:gap-[20px]">
            <div className="flex flex-col gap-[10px]">
              <h1 className="font-manrope text-[35px] custom-md:text-[48px] font-bold custom-md:font-semibold text-white leading-[44px] custom-md:leading-[64px] custom-lg:leading-[160%]">
                {title}
              </h1>
              <p className="font-manrope text-[20px] font-semibold leading-[160%] text-white">
                {subtitle}
              </p>
            </div>
            <div className="flex justify-center">{button}</div>
          </div>
        </div>
      </div>
    </ResponsivePageContainer>
  );
};

export default HeroSection;
