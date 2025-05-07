"use client";
import React from "react";
import Image from "next/image";

interface HowAutoApplyWorksProps {
  imageUrl: string;
  text: string;
  checkPointHeading?: string;
  heading?: string;
}

const HowAutoApplyWorks: React.FC<HowAutoApplyWorksProps> = ({
  imageUrl,
  text,
}) => {
  return (
    <div>
      <div className="absolute left-2 my-6 top-24 bottom-0 z-0 w-[1px] bg-white"></div>
      <div className="relative flex flex-row gap-6 z-10 items-center">
        <Image
          src={imageUrl}
          alt="checkpoints"
          width={16}
          height={16}
          className={`w-4 h-4`}
        />

        <div>
          <p
            className={`font-manrope text-[18px] leading-[160%] font-[500] text-white opacity-70 text-start`}
          >
            {text}
          </p>
        </div>
      </div>
    </div>
  );
};

export default HowAutoApplyWorks;
