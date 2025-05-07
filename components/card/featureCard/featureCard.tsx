import Image from "next/image";
import React from "react";

interface Card {
  image: string;
  title: string;
  description: string;
}

const FeatureCard = ({ card }: { card: Card }) => {
  return (
    <div className="flex flex-col w-full gap-4 border border-[#404040] px-10 pt-10 pb-[67px] rounded-[10px] items-start">
      <div className="p-5 bg-[#111111] rounded-[10px]">
        <Image src={card.image} alt={card.title} width="40" height={"40"} />
      </div>
      <div className="flex flex-col gap-[10px]">
        <h1 className="font-manrope text-[24px] leading-[29px] font-semibold text-[#F5F5F6] text-start">
          {card.title}
        </h1>
        <p className="font-manrope text-[16px] leading-[24px] font-normal text-[#CECFD2] text-start">
          {card.description}
        </p>
      </div>
    </div>
  );
};

export default FeatureCard;
