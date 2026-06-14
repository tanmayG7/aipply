import Image from "next/image";
import React from "react";

interface Card {
  image: string;
  title: string;
  description: string;
}

const FeatureCard = ({ card }: { card: Card }) => {
  return (
    <div className="group flex flex-col w-full min-h-[260px] border border-[#404040] px-10 py-10 rounded-[10px] bg-[#0F0F0F] transition-all duration-300 hover:border-[#20CEB6] hover:-translate-y-1">
      <div className="p-5 bg-[#111111] rounded-[10px] w-fit">
        <Image
          src={card.image}
          alt={card.title}
          width={40}
          height={40}
        />
      </div>

      <div className="mt-6">
        <h1 className="font-manrope text-[24px] leading-[29px] font-semibold text-[#F5F5F6]">
          {card.title}
        </h1>

        <p className="mt-4 font-manrope text-[16px] leading-[24px] font-normal text-[#CECFD2] opacity-0 invisible transition-all duration-300 group-hover:opacity-100 group-hover:visible">
          {card.description}
        </p>
      </div>
    </div>
  );
};

export default FeatureCard;
