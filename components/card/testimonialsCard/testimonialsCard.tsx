import React from "react";
import Image from "next/image";

interface Testimonial {
  name: string;
  designation: string;
  review: string;
  image: string;
}

const TestimonialsCard: React.FC<Testimonial> = ({
  name,
  designation,
  review,
  image,
}) => {
  return (
    <div className="bg-[#000000] grid grid-cols-1 gap-8 p-4 rounded-[20px]">
      <p className="text-[18px] leading-[27px] text-center font-manrope font-[500] text-[#F5F5F6]">
        {review}
      </p>

      <div className="flex flex-col gap-4">
        <Image
          src={image}
          alt={name}
          width={64}
          height={64}
          className="rounded-full mx-auto"
        />
        <div className="flex flex-col gap-1">
          <h2 className="text-[18px] leading-[28px] text-center font-manrope font-semibold text-[#F5F5F6]">
            {name}
          </h2>
          <p className="text-[16px] leading-[24px] text-center font-manrope font-normal text-[#94969C]">
            {designation}
          </p>
        </div>
        <div className="flex justify-center">
          {[...Array(5)].map((_, index) => (
            <Image
              key={index}
              src="/static/icons/star.svg"
              alt="Star"
              width={20}
              height={20}
              className="text-yellow-500"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TestimonialsCard;
