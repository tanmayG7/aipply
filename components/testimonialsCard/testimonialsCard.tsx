"use client";
import Image from "next/image";
import Link from "next/link";
import React from "react";

interface TestimonialProps {
  image: string;
  comment: string;
  name: string;
  position: string;
  stars: number;
  onLeftClick: () => void;
  onRightClick: () => void;
  linkedinProfileUrl: string;
}

const TestimonialsCard: React.FC<TestimonialProps> = ({
  image,
  comment,
  name,
  position,
  stars,
  linkedinProfileUrl,
  onLeftClick,
  onRightClick,
}) => {
  return (
    <div className="h-screen w-full  p-8 text-white">
      <div
        className="h-full flex flex-col justify-end rounded-2xl transition-x-[100%] duration-1000 ease-in-out"
        style={{
          backgroundImage: `url(${image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="bg-white bg-opacity-[30%] p-5 rounded-b-2xl flex flex-col gap-8 backdrop-blur-lg">
          <p className="text-display-sm-semibold font-inter text-white" style={{fontSize:"15px",lineHeight:'20px'}}>
            {comment}
          </p>
          <div className="flex flex-col justify-between gap-3">
            <div className="flex flex-row justify-between ">
              <div className="flex flex-row gap-4 items-center">
                <h2 className="text-display-md-semibold font-inter" style={{fontSize:'16px',lineHeight:'0px'}}>{name}</h2>
                <Link href={linkedinProfileUrl} target="_blank">
                  <Image
                    src="/static/icons/linkedIn.svg"
                    alt="Quote"
                    width={18}
                    height={18}
                  />
                </Link>
              </div>
              {"★".repeat(stars)}
              {"☆".repeat(5 - stars)}
            </div>
            <div className="flex flex-row justify-between">
              <h4 className="text-text-lg-semibold font-inter text-white" style={{fontSize:'16px',lineHeight:'0px'}}>
                {position}
              </h4>
              <div className="flex gap-8 ">
                <button
                  onClick={onLeftClick}
                  className="rounded-full border p-4"
                  style={{padding:'5px'}}
                >
                  <Image
                    src="/static/icons/arrow-left.svg"
                    alt="Left arrow"
                    width={12}
                    height={12}
                  />
                </button>
                <button
                  onClick={onRightClick}
                  className="rounded-full border p-4"
                  style={{padding:'5px'}}
                >
                  <Image
                    src="/static/icons/arrow-right.svg"
                    alt="Left arrow"
                    width={12}
                    height={12}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestimonialsCard;
