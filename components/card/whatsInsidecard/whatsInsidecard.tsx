import React from "react";
import Image from "next/image";

interface WhatsInsideCardProps {
  image: string;
  title: string;
  index: number; 
}

const WhatsInsideCard: React.FC<WhatsInsideCardProps> = ({ image, title, index }) => {
  return (
    <div className="rounded-[20px] bg-[#302948] px-[30px] py-[30px] flex flex-col gap-[18px]">
      <div className="relative w-full h-[192px]">
        <Image src={image} alt={title} fill={true} className={`object-cover rounded-2xl ${index == 0 ? "scale-x-[-1]" : ""}`} />
      </div>
      <h2 className="font-manrope font-[700] text-[24px] leading-[160%] text-white">
        {title}
      </h2>
    </div>
  );
};

export default WhatsInsideCard;
