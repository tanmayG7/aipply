import React from "react";

const Loader = () => {
  return (
    <div className="loader flex m-auto items-center w-[40%] rounded-full justify-center h-[70vh]"></div>
  );
};

export default Loader;

export const ShimmerJobCard = ({ message }: { message: string }) => {
  return (
    <div className="relative w-full gap-6 flex flex-col">
      <h1 className="absolute top-[53px] text-[#bdc2cb] font-inter font-[700] text-[30px]">
        {message}
      </h1>
      {/* <div className="relative border border-[#5C677E] rounded-2xl top-[125px] animate-pulse w-full h-[265px] bg-[#0C111D]">
        <div className="relative top-[55px] w-[20%] h-10 border border-[#5C677E] rounded-lg"></div>
        <div className="relative top-[85px] w-[50%] h-10 border border-[#5C677E] rounded-lg"></div>
        <div className="flex flex-row gap-6 relative top-[107px]">
          <div className="py-1 px-2 rounded-md bg-gray-700 text-white text-text-sm-medium font-inter border border-[#5C677E] border-gray-500 w-20 h-10"></div>
          <div className="py-1 px-2 rounded-md bg-gray-700 text-white text-text-sm-medium font-inter border border-[#5C677E] border-gray-500 w-20 h-10"></div>
          <div className="py-1 px-2 rounded-md bg-gray-700 text-white text-text-sm-medium font-inter border border-[#5C677E] border-gray-500 w-20 h-10"></div>
          <div className="py-1 px-2 rounded-md bg-gray-700 text-white text-text-sm-medium font-inter border border-[#5C677E] border-gray-500 w-20 h-10"></div>
        </div>
        <div className="relative top-[102px] flex flex-col border-b-[1px] border-[#5C677E] pb-6 gap-8"></div>
      </div> */}

      <div className="relative border border-[#373d4b] rounded-2xl top-[125px] animate-pulse w-full h-[265px] bg-[#0C111D]" />
      <div className="relative border border-[#373d4b] rounded-2xl top-[125px] animate-pulse w-full h-[265px] bg-[#0C111D]" />

      <div className="relative border border-[#373d4b] rounded-2xl top-[125px] animate-pulse w-full h-[265px] bg-[#0C111D]" />

      <div className="relative border border-[#373d4b] rounded-2xl top-[125px] animate-pulse w-full h-[265px] bg-[#0C111D]" />
      <div className="relative border border-[#373d4b] rounded-2xl top-[125px] animate-pulse w-full h-[265px] bg-[#0C111D]" />

      <div className="relative border border-[#373d4b] rounded-2xl top-[125px] animate-pulse w-full h-[265px] bg-[#0C111D]" />
    </div>
  );
};

export const HomeShimmer = () => {
  return (
    <div>
      <div className="relative top-[62px] gap-3">
        <h1 className="font-inter text-[#ECECED] font-bold text-[40px]">
          Home
        </h1>
        <p className="font-inter text-[#F5F5F6] text-text-sm-semibold">
          Today we have curated 20 jobs for you.
        </p>
      </div>
      <div className="w-full custom-md:w-[536px] h-[370px] relative rounded-lg top-[110px] bg-[#0C111D] border border-[#1F242F] animate-pulse"></div>
      <div className="flex flex-col gap-6">
        <div className="relative top-[150px] flex flex-row flex-wrap gap-4">
          <div className=" rounded-lg w-[270px] h-[115px] bg-[#0C111D] border border-[#1F242F]" />
          <div className="rounded-lg w-[270px] h-[115px] bg-[#0C111D] border border-[#1F242F]" />
          <div className=" rounded-lg w-[270px] h-[115px] bg-[#0C111D] border border-[#1F242F]" />
          <div className=" rounded-lg w-[270px] h-[115px] bg-[#0C111D] border border-[#1F242F]" />
        </div>
        <div className="relative top-[150px] flex flex-row flex-wrap gap-4">
          <div className=" rounded-lg w-[270px] h-[115px] bg-[#0C111D] border border-[#1F242F]" />
          <div className="rounded-lg w-[270px] h-[115px] bg-[#0C111D] border border-[#1F242F]" />
          <div className=" rounded-lg w-[270px] h-[115px] bg-[#0C111D] border border-[#1F242F]" />
          <div className=" rounded-lg w-[270px] h-[115px] bg-[#0C111D] border border-[#1F242F]" />
        </div>
      </div>
    </div>
  );
};

export const JobTrackerShimmer = () => {
  return (
    <div className="flex flex-row flex-wrap gap-6">
      <div className="flex flex-col gap-6">
        <div className="w-full custom-md:w-[536px] h-[370px] relative rounded-lg top-[110px] bg-[#0C111D] border border-[#1F242F] animate-pulse"></div>
        <div className="w-full custom-md:w-[536px] h-[370px] relative rounded-lg top-[110px] bg-[#0C111D] border border-[#1F242F] animate-pulse"></div>
        <div className="w-full custom-md:w-[536px] h-[370px] relative rounded-lg top-[110px] bg-[#0C111D] border border-[#1F242F] animate-pulse"></div>
        <div className="w-full custom-md:w-[536px] h-[370px] relative rounded-lg top-[110px] bg-[#0C111D] border border-[#1F242F] animate-pulse"></div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="w-full custom-md:w-[536px] h-[370px] relative rounded-lg top-[110px] bg-[#0C111D] border border-[#1F242F] animate-pulse"></div>
        <div className="w-full custom-md:w-[536px] h-[370px] relative rounded-lg top-[110px] bg-[#0C111D] border border-[#1F242F] animate-pulse"></div>
        <div className="w-full custom-md:w-[536px] h-[370px] relative rounded-lg top-[110px] bg-[#0C111D] border border-[#1F242F] animate-pulse"></div>
        <div className="w-full custom-md:w-[536px] h-[370px] relative rounded-lg top-[110px] bg-[#0C111D] border border-[#1F242F] animate-pulse"></div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="w-full custom-md:w-[536px] h-[370px] relative rounded-lg top-[110px] bg-[#0C111D] border border-[#1F242F] animate-pulse"></div>
        <div className="w-full custom-md:w-[536px] h-[370px] relative rounded-lg top-[110px] bg-[#0C111D] border border-[#1F242F] animate-pulse"></div>
        <div className="w-full custom-md:w-[536px] h-[370px] relative rounded-lg top-[110px] bg-[#0C111D] border border-[#1F242F] animate-pulse"></div>
        <div className="w-full custom-md:w-[536px] h-[370px] relative rounded-lg top-[110px] bg-[#0C111D] border border-[#1F242F] animate-pulse"></div>
      </div>
    </div>
  );
};
