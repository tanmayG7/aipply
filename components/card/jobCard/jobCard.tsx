"use client";
import { Job } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import React from "react";

interface JobCardProps {
  job: Job;
}

const truncateDescription = (description: string) => {
  const words = description.split(" ");
  return words.length > 15 ? words.slice(0, 20).join(" ") + "..." : description;
};

const JobCard: React.FC<JobCardProps> = ({ job }) => {
  return (
    <div className="bg-[#0C111D] p-6 mb-4 flex flex-col gap-6 rounded-lg border-[2px] border-white border-opacity-20 shadow-lg w-full h-full">
      <div className="flex flex-col-reverse gap-4 lg:gap-0 lg:flex-row justify-between items-start border-b-[1px] border-[#454545] pb-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-row gap-3 items-center">
            <h1 className="font-inter font-semibold text-[24px] text-white">
              {job.title}
            </h1>
          </div>

          <div className="flex flex-col lg:flex-row gap-6 text-white text-sm">
            <div className="flex flex-row justify-between gap-6">
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
                <span>{job.salary}</span>
              </div>
            </div>
            <div className="flex flex-row justify-between gap-6">
              <div className="flex items-center gap-2 max-w-[60%]">
                <Image
                  src="/static/icons/location.svg"
                  alt="Location"
                  width={20}
                  height={20}
                />
                <span>{job.location}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 max-w-full lg:max-w-[70%]">
            <span className="px-2 py-1 rounded-md text-white text-xs">
              {truncateDescription(job.description)}
            </span>
          </div>
        </div>

        <div className="flex flex-row items-center justify-center gap-3">
          <Image
            src="/static/jobBoardImages/catalogLogo.jpeg"
            alt="Company Logo"
            width={40}
            height={40}
            className="rounded-full"
          />
          <div className="flex flex-col">
            <p className="text-white font-semibold">{job.company}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-row justify-between items-center lg:items-center gap-6">
        <div className="flex gap-4">
          <button className="flex items-center gap-1 text-gray-400 hover:text-white">
            <Image
              src="/static/icons/hide.svg"
              alt="Hide"
              width={18}
              height={18}
            />
            <span className="text-sm text-[#CECFD2]">Hide</span>
          </button>
          <button className="flex items-center gap-1 text-gray-400 hover:text-white">
            <Image
              src="/static/icons/reportFlag.svg"
              alt="Report"
              width={18}
              height={18}
            />
            <span className="text-sm text-[#CECFD2]">Report</span>
          </button>
        </div>

        <div className="flex gap-4">
          <button className="flex items-center gap-1 border border-gray-600 rounded-md px-4 py-2 text-white hover:bg-gray-700 transition">
            <span className="text-sm ">Save</span>
            <Image
              src="/static/icons/bookmark.svg"
              alt="Save"
              width={16}
              height={16}
            />
          </button>
          <Link href={job.jobUrl ? job.jobUrl : "#"}>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 rounded-md text-white hover:bg-blue-600 transition bg-blue">
              <span className="text-sm">Apply</span>
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
  );
};

export default JobCard;
