"use client";
import { Job,UserDetails } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { getRelativeTime } from "@/utils/dateUtils";
import {
  auth,
  getUserProfile,
} from "@/lib/firebaseConfig/firebaseConfig";

import {
  determineJobLocation,
  determineJobType,
  mergeSalaryRanges,
} from "@/lib/utils";

const JobCard =  ({
  job,
  handleHideJob,
  handleAppliedJob,
  userProfile
}: {
  job: Job;
  handleHideJob: () => Promise<void>;
  handleAppliedJob: () => Promise<void>;
  userProfile: UserDetails
}) => {
  const [showPopup, setShowPopup] = useState(false);
  const [imageError, setImageError] = useState(false);





  const confirmHideJob = async () => {
    setShowPopup(false);
    await handleHideJob();
  };

  const jobPlatformMap: { [key: string]: string } = {
    Naukri: "/static/images/naukriLogo.svg",
    Shine: "/static/images/shineLogo.png",
    Hirist: "/static/images/hiristLogo.webp",
    TimesJob: "/static/images/timesJobLogo.png",
  };

  const platformKey = Object.keys(jobPlatformMap).find(
    (key) => key.toLowerCase() === job.platform.toLowerCase()
  );

  // Use job.tags if available, otherwise extract from the description.
  // const jobTags =
  //   job.tags && job.tags.length > 0
  //     ? job.tags
  //     : getKeywordsFromDescription(stripHtmlTags(job.description));
  const jobTags = job.tags;

  // Display salary using mergeSalaryRanges for consistent formatting
  const displaySalary = job.salary && job.salary.length > 0
    ? mergeSalaryRanges(job.salary)
    : "Not Disclosed";

  return (
    <div
      key={job.jobId}
      className="relative bg-[#0C111D] p-3 sm:p-6 mb-4 flex flex-col gap-4 sm:gap-6 rounded-[10px] border border-[#1F242F] w-full"
    >
      <div className="absolute hidden custom-md:flex top-0 m-auto left-0 right-0 w-[70%] h-[1px] ">
        <Image
          src={"/static/icons/gradientLine.svg"}
          fill
          alt="gradient line"
        />
      </div>
      <div className="flex flex-col border-b-[1px] border-[#5C677E] pb-4 sm:pb-6 gap-4 sm:gap-8">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-0">
          <div className="flex flex-col gap-2 sm:gap-4 flex-1">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-start sm:items-center">
              <h1 className="font-inter font-semibold text-lg sm:text-[24px] text-white leading-tight">
                {job.title}
              </h1>
              <span className="flex gap-2 items-center py-1 px-2 rounded-sm text-[#CECFD2] font-inter text-xs border border-[#333741] self-start">
                <div
                  style={{
                    backgroundColor: determineJobLocation(job.location).color,
                  }}
                  className={`h-[6px] w-[6px] rounded-full`}
                ></div>
                {determineJobLocation(job.location).type}
              </span>
            </div>
          </div>

          <div className="flex flex-row items-center gap-2 sm:gap-3 self-start sm:self-center">
            <Image
              src={
                imageError || !job.logoUrl
                  ? "/static/icons/building.svg"
                  : job.logoUrl
              }
              alt="Company Logo"
              width={32}
              height={32}
              className="rounded-full sm:w-10 sm:h-10"
              onError={() => setImageError(true)}
            />
            <div className="flex flex-col">
              <p className="text-white font-semibold text-sm sm:text-base truncate max-w-[120px] sm:max-w-none">{job.company}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-white opacity-80 text-sm sm:text-[16px] font-inter">
          <div className="flex items-center gap-2">
            <Image
              src="/static/icons/briefcase.svg"
              alt="Experience"
              width={16}
              height={16}
              className="sm:w-5 sm:h-5"
            />
            <span className="truncate">{job.experience}</span>
          </div>
          <div className="flex items-center gap-2">
            <Image
              src="/static/icons/currencyRupee.svg"
              alt="Salary"
              width={16}
              height={16}
              className="sm:w-5 sm:h-5"
            />
            <span className="truncate">{displaySalary}</span>
          </div>
          <div className="flex items-center gap-2">
            <Image
              src="/static/icons/location.svg"
              alt="Location"
              width={16}
              height={16}
              className="sm:w-5 sm:h-5"
            />
            <span className="truncate">{job.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Image
              src="/static/icons/jobType.svg"
              alt="Job Type"
              width={16}
              height={16}
              className="sm:w-5 sm:h-5"
            />
            <span className="truncate">{determineJobType(job.description)}</span>
          </div>
        </div>

    

        {jobTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 sm:gap-2 max-w-full">
            {jobTags.slice(0, 8).map((tag, index) => (
                <span
                  key={index}
                  style={{background: userProfile.skills?.includes(tag)? 'green': 'none'}}
                  className={`py-0.5 sm:py-1 px-1.5 sm:px-2 rounded text-xs sm:text-sm bg-gray-700 text-white font-inter border border-[#1F242F] border-gray-500 ${index >= 4 ? 'hidden sm:inline-block' : ''}`}
                  title={tag}
                >
                  {tag}
                </span>
              ))}
            {jobTags.length > 8 && (
              <span className="py-0.5 sm:py-1 px-1.5 sm:px-2 rounded text-xs sm:text-sm bg-gray-600 text-gray-300 font-inter border border-[#1F242F]">
                +{jobTags.length - 8} more
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-row items-end justify-end mr-4 sm:mr-8 mb-[-12px] sm:mb-[-16px]">
        <div className="relative w-[45px] sm:w-[55px] h-[12px] sm:h-[16px] overflow-hidden">
          <Image
            src={
              platformKey
                ? jobPlatformMap[platformKey]
                : "/static/images/defaultLogo.png"
            }
            alt="Platform Logo"
            fill
            className="object-contain"
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
        <div className="flex gap-4 order-2 sm:order-1">
          <button
            className="flex items-center gap-1 text-gray-400 hover:text-white"
            onClick={() => setShowPopup(true)}
          >
            <Image
              src="/static/icons/hide.svg"
              alt="Hide"
              width={16}
              height={16}
              className="sm:w-[18px] sm:h-[18px]"
            />
            <span className="text-xs sm:text-sm text-[#CECFD2]">Hide</span>
          </button>
        </div>

        {showPopup && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
            <div className="bg-blue p-10 rounded-md gap-6 flex flex-col">
              <p className="text-text-xl-regular text-white">
                Are you sure you want to hide this job?
              </p>
              <div className="flex gap-4">
                <button
                  className="bg-white text-gray w-full py-2 rounded-md text-text-xl-regular"
                  onClick={confirmHideJob}
                >
                  Yes
                </button>
                <button
                  className="bg-white text-black w-full py-2 rounded-md text-text-xl-regular"
                  onClick={() => setShowPopup(false)}
                >
                  No
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-start sm:items-center order-1 sm:order-2">
          <div className="text-xs sm:text-sm text-[#7E8895] order-2 sm:order-1">
            {getRelativeTime(job.postedDate)}
          </div>
          <div className="flex flex-col items-start sm:items-center gap-2 order-1 sm:order-2">
            <Link
              rel="noopener noreferrer"
              target="_blank"
              href={job.jobUrl}
              onClick={handleAppliedJob}
            >
              <button className="border w-full sm:w-[125px] min-w-[100px] border-white flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-blue-500 rounded-md text-white hover:bg-blue-600 transition bg-gradient-to-b from-blue from-60% to-[#A061F1]">
                <span className="text-xs sm:text-sm font-semibold">AiPply</span>
                <Image
                  src="/static/icons/arrowIcon.svg"
                  alt="Apply"
                  width={14}
                  height={14}
                  className="sm:w-4 sm:h-4"
                />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobCard;
