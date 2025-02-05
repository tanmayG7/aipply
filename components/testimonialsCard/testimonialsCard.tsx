"use client";
import React from "react";

interface TestimonialProps {
  image: string;
  comment: string;
  name: string;
  position: string;
  stars: number;
  onLeftClick: () => void;
  onRightClick: () => void;
}

const TestimonialsCard: React.FC<TestimonialProps> = ({
  image,
  comment,
  name,
  position,
  stars,
  onLeftClick,
  onRightClick,
}) => {
  return (
    <div className="h-screen w-full  p-5 text-white">
      <div
        className="h-full flex flex-col justify-end rounded-2xl"
        style={{
          backgroundImage: `url(${image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="bg-black bg-opacity-50 p-5 rounded-b-2xl">
          <p className="text-display-sm-semibold font-inter text-white">
            {comment}
          </p>
          <div className="flex flex-col display">
            <h2>{name}</h2>
            <h4>{position}</h4>
          </div>
          <div>
            {"★".repeat(stars)}
            {"☆".repeat(5 - stars)}
          </div>
          <div className="flex justify-between mt-2">
            <button onClick={onLeftClick}>&lt;</button>
            <button onClick={onRightClick}>&gt;</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestimonialsCard;
