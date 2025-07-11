import Image from "next/image";
import React from "react";

interface PricingCardProps {
  image: string;
  planName: string;
  subtitle: string;
  price: string;
  checkpoints: React.ReactNode;
  button: React.ReactNode;
  earlyBirdButton?: React.ReactNode;
  crossText?: string;
  discount?: string;
  timeline?: string; // New prop for dynamic timeline
}

const PricingCard: React.FC<PricingCardProps> = ({
  image,
  planName,
  subtitle,
  price,
  checkpoints,
  button,
  earlyBirdButton,
  crossText,
  discount,
  timeline = "/month", // Default to "/month"
}) => {
  return (
    <div className="bg-[#2E2E2E] rounded-[20px] px-5 custom-sm:px-10 pt-10 w-full h-[736px]">
      <div className="flex flex-row justify-between">
        <Image src={image} alt="Picture of the author" width={44} height={44} />
        <div>{earlyBirdButton}</div>
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="font-manrope font-[700] text-[29px] custom-sm:text-[32px] leading-[160%] text-white">
            {planName}
          </h1>
          <p className="font-manrope font-[500] text-[16px] leading-[160%] text-white opacity-70">
            {subtitle}
          </p>
        </div>
        <div className="flex flex-col gap-6">
          <h1 className="font-manrope text-[44px] custom-lg:text-[64px] leading-[100%] font-[800] text-white">
            ₹{price}
            <span className="font-manrope text-[18px] leading-[160%] font-[500] text-white opacity-70 custom-sm:pl-2">
              {crossText && <span className="line-through">₹{crossText}</span>}{timeline}
              {discount && <span>({discount})</span>}
            </span>
          </h1>

          <div className="w-full">{button}</div>
        </div>
      </div>
      <div className="flex flex-col gap-4 pt-6">
        <p className="font-manrope text-[18px] font-[500] leading-[160%] text-white">
          Features
        </p>
        <div>{checkpoints}</div>
      </div>
    </div>
  );
};

export default PricingCard;
