import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ResponsivePageContainer } from "@/components/common/responsivePageContainer/responsivePageContainer";

const ErrorPage = () => {
  return (
    <ResponsivePageContainer>
      <div>
        <div className="absolute w-full h-[500px] top-[100px] left-1/2 transform -translate-x-1/2 bg-[#AE94FF] bg-opacity-50 blur-[280px] backdrop-blur-[400px] rounded-full"></div>

        <div className="relative mt-[201px] w-[546] h-[316px] items-center">
          <Image
            src="/static/images/404img.svg"
            alt="4"
            fill={true}
            className=""
          />
        </div>
        <div className="items-center flex flex-col gap-8 custom-md:gap-[58px]">
          <p className="font-manrope text-[20px] leading-[160%] text-white text-center">
            The page you’re looking for doesn’t exist or has moved.
          </p>

          <div className="flex flex-col items-center justify-center gap-5">
            <div className="flex flex-col custom-md:flex-row gap-6 justify-center">
              <Link href="/">
                <button className="font-manrope font-bold uppercase text-[14px] leading-[20px] border-[#5D29FF] text-white border rounded-full px-5 py-3">
                  Go back to the homepage
                </button>
              </Link>

              <Link href="/">
                <button className="font-manrope w-full font-bold uppercase text-[14px] leading-[20px] border-[#5D29FF] text-white border rounded-full px-5 py-3">
                  Explore our features
                </button>
              </Link>
            </div>

            <Link href="/contact">
              <p className="font-manrope w-fit text-[16px] font-semibold border-b text-white">
                Contact us if you need help.
              </p>
            </Link>
          </div>
        </div>
      </div>
    </ResponsivePageContainer>
  );
};

export default ErrorPage;
