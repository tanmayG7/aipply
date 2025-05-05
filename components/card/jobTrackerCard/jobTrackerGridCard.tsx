"use client";
import { mergeSalaryRanges, determineJobLocation } from "@/lib/utils";
import Image from "next/image";
import React, { useState, useEffect, useRef } from "react";
import { Job } from "@/lib/types";

interface JobTrackerGridCardProps {
  job: Job;
  onStatusChange: (
    jobId: string,
    newStatus: string,
    currentStatus: string
  ) => void;
  currentStatus: string;
}

const JobTrackerGridCard: React.FC<JobTrackerGridCardProps> = ({
  job,
  onStatusChange,
  currentStatus,
}) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

  return (
    <div className="bg-[#0C111D] min-w-[450px] p-6 mb-4 flex flex-col gap-6 rounded-lg border-[2px] border-white border-opacity-20 shadow-lg">
      <div className="flex gap-4 flex-col-reverse justify-between items-start h-full w-full">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between">
            <h1 className="font-inter font-semibold text-[20px] lg:text-[24px] text-white">
              {job.title}
            </h1>
          </div>

          <div className="grid grid-rows-2 gap-6 text-white text-sm ">
            <div className="flex flex-col lg:flex-row justify-between gap-3 lg:gap-6">
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
                <span>{mergeSalaryRanges(job.salary)}</span>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row justify-between gap-3 md:gap-6">
              <div className="flex items-center gap-2">
                <Image
                  src="/static/icons/location.svg"
                  alt="Location"
                  width={20}
                  height={20}
                />
                <span>{job.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Image
                  src="/static/icons/jobType.svg"
                  alt="Role Type"
                  width={20}
                  height={20}
                />
                <span>{determineJobLocation(job.location).type}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative flex flex-row justify-between w-full">
          <div className="flex flex-row items-center justify-center gap-3">
            <Image
              src={job.logoUrl || "/static/icons/building.svg"}
              alt="Company Logo"
              width={40}
              height={40}
              className="rounded-full"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "/static/icons/building.svg";
              }}
            />
            <div className="flex flex-col">
              <p className="text-white font-inter text-[14px] opacity-[70%] font-semibold">
                {job.company}
              </p>
            </div>
          </div>

          <div className="relative">
            <Image
              src={"/static/icons/three-dot.svg"}
              width={24}
              height={24}
              alt="options"
              onClick={() => setMenuVisible(!menuVisible)}
              className="cursor-pointer"
            />
            {menuVisible && (
              <div
                ref={menuRef}
                className="absolute rounded right-0 mt-3 w-44 bg-[#050513] text-black shadow-lg z-10 border-[1px] border-[#333232]"
              >
                <button
                  onClick={() =>
                    onStatusChange(job.id, "personalArchive", currentStatus)
                  }
                  className="block px-4 py-2 text-text-md-regular w-full text-white text-start hover:bg-white hover:text-black rounded"
                >
                  Archive
                </button>
                <button
                  onClick={() =>
                    onStatusChange(job.id, "appliedJobs", currentStatus)
                  }
                  className="block px-4 py-2 text-text-md-regular w-full text-white text-start hover:bg-white hover:text-black rounded"
                >
                  Recently Applied
                </button>
                <button
                  onClick={() =>
                    onStatusChange(job.id, "followUp", currentStatus)
                  }
                  className="block px-4 py-2 text-text-md-regular w-full text-white text-start hover:bg-white hover:text-black rounded"
                >
                  Follow up required
                </button>
                <button
                  onClick={() =>
                    onStatusChange(job.id, "noReply", currentStatus)
                  }
                  className="block px-4 py-2 text-text-md-regular w-full text-white text-start hover:bg-white hover:text-black rounded"
                >
                  No Reply
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobTrackerGridCard;
