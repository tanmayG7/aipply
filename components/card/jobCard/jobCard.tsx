import { getWorkTypeImage } from "@/lib/staticData";
import Image from "next/image";
import Link from "next/link";
import React from "react";

interface Job {
  id: string;
  jobTitle: string;
  companyName: string;
  jobPackage: string;
  workType: string;
  experience: string;
  location: string;
  roleType: string;
  skills: string[];
  applyLink: string;
}

interface JobCardProps {
  job: Job;
}

const JobCard: React.FC<JobCardProps> = ({ job }) => {
  return (
    <div className="bg-[#0C111D] p-6 mb-4 flex flex-col gap-6 rounded-lg border-[2px] border-white border-opacity-20 shadow-lg w-full h-full">
      <div className="flex flex-col-reverse gap-4 lg:gap-0 lg:flex-row justify-between items-start border-b-[1px] border-[#454545] pb-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-row gap-3 items-center">
            <h1 className="font-inter font-semibold text-[24px] text-white">
              {job.jobTitle}
            </h1>
            <div className="flex flex-row border border-gray-500 rounded-md px-2 items-center gap-1">
              <Image
                src={getWorkTypeImage(job.workType)}
                alt="Dot"
                width={8}
                height={8}
              />
              <span className="text-white text-sm">{job.workType}</span>
            </div>
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
                <span>{job.jobPackage}</span>
              </div>
            </div>
            <div className="flex flex-row justify-between gap-6">
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
                <span>{job.roleType}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {job.skills.map((skill, index) => (
              <span
                key={index}
                className="border border-gray-500 px-2 py-1 rounded-md text-white text-xs"
              >
                {skill}
              </span>
            ))}
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
            <p className="text-white font-semibold">{job.companyName}</p>
            {/* <Link href={job.applyLink} className="text-blue text-sm">
              {job.applyLink}
            </Link> */}
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
          <Link href={job.applyLink}>
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
