import Image from "next/image";
import React from "react";

interface Card {
  image: string;
  title: string;
  description: string;
}

const FeatureCard = ({ card }: { card: Card }) => {
  return (
    <div className="group relative h-[280px] overflow-hidden rounded-[16px] border border-[#2A2A2A] bg-[#0F0F0F] p-8 transition-all duration-500 hover:-translate-y-2 hover:border-[#20CEB6]/50 hover:shadow-[0_0_40px_rgba(32,206,182,0.15)]">
      <div className="flex flex-col h-full">
        <div className="w-fit rounded-xl bg-[#151515] p-5">
          <Image
            src={card.image}
            alt={card.title}
            width={40}
            height={40}
          />
        </div>

        <div className="mt-auto">
          <h3 className="font-manrope text-[24px] font-semibold text-[#F5F5F6] transition-all duration-500 group-hover:-translate-y-4">
            {card.title}
          </h3>

          <p className="mt-3 text-[16px] leading-6 text-[#CECFD2] opacity-0 translate-y-4 transition-all duration-500 group-hover:opacity-100 group-hover:translate-y-0">
            {card.description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FeatureCard;
