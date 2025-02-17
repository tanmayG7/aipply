"use client";
import { Job } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { getRelativeTime } from "@/utils/dateUtils";
import { auth, hiddenJob } from "@/lib/firebaseConfig/firebaseConfig";

interface JobCardProps {
  job: Job;
}

const stripHtmlTags = (html: string) => {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || div.innerText || "";
};

const JobCard: React.FC<JobCardProps> = ({ job }) => {
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    const checkIfHidden = async () => {
      try {
        const userId = auth.currentUser?.uid;
        if (userId) {
          const hidden = await hiddenJob(userId, job.jobId);
          setIsHidden(hidden);
        }
      } catch (error) {
        console.error("Error checking if job is hidden:", error);
      }
    };

    checkIfHidden();
  }, [job.jobId]);

  const jobPlatformMap: { [key: string]: string } = {
    Naukri: "/static/images/naukriLogo.png",
    Shine: "/static/images/shineLogo.png",
    Hirist: "/static/images/hiristLogo.webp",
    TimesJob: "/static/images/timesJobLogo.png",
  };

  const handleHideJob = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (userId) {
        await hiddenJob(userId, job.jobId);
        setIsHidden(true);
      }
    } catch (error) {
      console.error("Error hiding job:", error);
    }
  };

  if (isHidden) {
    return null;
  }

  return (
    <div className="bg-[#0C111D] p-6 mb-4 flex flex-col gap-6 rounded-[10px] border border-image-[linear-gradient(to bottom, white 10%, #5C677E)] border-image-slice-[1] w-full">
      <div className="flex flex-col border-b-[1px] border-[#5C677E] pb-6 gap-4">
        <div className="grid grid-cols-1 gap-4 lg:gap-0 lg:grid-cols-5 justify-between items-start">
          <div className="flex flex-col gap-4 col-span-4">
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
          </div>

          <div className="flex flex-row items-center justify-center gap-3 col-span-1">
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

        <div className="flex flex-wrap gap-2 max-w-full lg:max-w-[70%]">
          <span className="py-1 rounded-md text-white text-xs text-justify">
            {stripHtmlTags(job.description)}
          </span>
        </div>
      </div>

      <div className="flex flex-row justify-between items-center lg:items-center gap-6">
        <div className="flex gap-4">
          <button
            className="flex items-center gap-1 text-gray-400 hover:text-white"
            onClick={handleHideJob}
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

        <div className="flex flex-row gap-4 items-center">
          <div>
            <div className="text-text-sm-semibold text-[#7E8895]">
              {getRelativeTime(job.postedDate)}
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="relative w-[55px] h-[16px] overflow-hidden">
              <Image
                src={jobPlatformMap[job.platform]}
                alt="Platform Logo"
                fill
                className="object-contain"
              />
            </div>
            <Link href={job.jobUrl ? job.jobUrl : "#"}>
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
