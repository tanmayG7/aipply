import React from "react";
import Image from "next/image";

interface CheckpointsProps {
  imageUrl: string;
  text: string;
  opacity?: boolean;
}

const CheckPointscard: React.FC<CheckpointsProps> = ({ imageUrl, text, opacity }) => {
  return (
    <div className={`flex flex-row gap-4`}>
      <Image
        src={imageUrl}
        alt="checkpoints"
        width={32}
        height={32}
        className={`w-8 h-8`}
      />

      <div>
        <p
          className={`font-manrope text-[18px] leading-[160%] font-[500] text-white text-start ${
            opacity ? "opacity-70" : ""
          }`}
        >
          {text}
        </p>
      </div>
    </div>
  );
};

export default CheckPointscard;
