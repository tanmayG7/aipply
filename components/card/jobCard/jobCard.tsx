"use client";
import { Job } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { getRelativeTime } from "@/utils/dateUtils";
import {
  determineJobLocation,
  determineJobType,
  mergeSalaryRanges,
} from "@/lib/utils";

const JobCard = ({
  job,
  handleHideJob,
  handleAppliedJob,
}: {
  job: Job;
  handleHideJob: () => Promise<void>;
  handleAppliedJob: () => Promise<void>;
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

  const mergedSalary = mergeSalaryRanges(job.salary);

  return (
    <div
      key={job.jobId}
      className="relative bg-[#0C111D] p-6 mb-4 flex flex-col gap-6 rounded-[10px] border border-[#1F242F] w-full"
    >
      <div className="absolute hidden custom-md:flex top-0 m-auto left-0 right-0 w-[70%] h-[1px] ">
        <Image
          src={"/static/icons/gradientLine.svg"}
          fill
          alt="gradient line"
        />
      </div>
      <div className="flex flex-col border-b-[1px] border-[#5C677E] pb-6 gap-8">
        <div className="flex flex-row justify-between items-start">
          <div className="flex flex-col gap-4 col-span-4 max-w-[75%]">
            <div className="flex flex-row gap-3 items-center">
              <h1 className="font-inter font-semibold text-[24px] text-white">
                {job.title}
              </h1>
              <span className="flex gap-2 items-center py-1 px-2 rounded-sm text-[#CECFD2] font-inter text-text-xs-medium border border-[#333741]">
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

          <div className="flex flex-row items-center justify-center gap-3 max-w-[25%]">
            <Image
              src={
                imageError || !job.logoUrl
                  ? "/static/icons/building.svg"
                  : job.logoUrl
              }
              alt="Company Logo"
              width={40}
              height={40}
              className="rounded-full"
              onError={() => setImageError(true)}
            />
            <div className="flex flex-col">
              <p className="text-white font-semibold">{job.company}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-row text-white opacity-80 text-[16px] font-inter gap-6 ">
          <div className="flex items-center gap-2">
            <Image
              src="/static/icons/briefcase.svg"
              alt="Experience"
              width={20}
              height={20}
            />
            <span>{job.experience}</span>
          </div>
          <div className="flex items-center gap-2">
            <Image
              src="/static/icons/currencyRupee.svg"
              alt="Salary"
              width={20}
              height={20}
            />
            <span>{mergedSalary}</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Image
                src="/static/icons/location.svg"
                alt="Location"
                width={20}
                height={20}
              />
              <span>{job.location}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Image
                src="/static/icons/location.svg"
                alt="Location"
                width={20}
                height={20}
              />
              <span> {determineJobType(job.description)}</span>
            </div>
          </div>
        </div>

        {jobTags.length > 0 && (
          <div className="flex flex-wrap gap-2 max-w-full">
            {job.platform.toLowerCase() !== "hirist" &&
              jobTags.map((tag, index) => (
                <span
                  key={index}
                  className="py-1 px-2 rounded-md bg-gray-700 text-white text-text-sm-medium font-inter border border-[#1F242F] border-gray-500"
                >
                  {tag}
                </span>
              ))}
          </div>
        )}
      </div>

      <div className="flex flex-row items-end justify-end mr-8 mb-[-16px]">
        <div className="relative w-[55px] h-[16px] overflow-hidden">
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

      <div className="flex flex-row justify-between items-center lg:items-center">
        <div className="flex gap-4">
          <button
            className="flex items-center gap-1 text-gray-400 hover:text-white"
            onClick={() => setShowPopup(true)}
          >
            <Image
              src="/static/icons/hide.svg"
              alt="Hide"
              width={18}
              height={18}
            />
            <span className="text-sm text-[#CECFD2]">Hide</span>
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

        <div className="flex flex-row gap-4 items-center">
          <div className="text-text-sm-semibold text-[#7E8895]">
            {getRelativeTime(job.postedDate)}
          </div>
          <div className="flex flex-col items-center gap-2">
            <Link
              rel="noopener noreferrer"
              target="_blank"
              href={job.jobUrl}
              onClick={handleAppliedJob}
            >
              <button className="border w-[125px] border-white flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 rounded-md text-white hover:bg-blue-600 transition bg-gradient-to-b from-blue from-60% to-[#A061F1]">
                <span className="text-text-sm-semibold">AiPply</span>
                <Image
                  src="/static/icons/arrowIcon.svg"
                  alt="Apply"
                  width={16}
                  height={16}
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
