import Image from "next/image";
import React from "react";

interface JobTrackerGridCardProps {
  companyName: string;
  jobTitle: string;
  jobPackage: string;
  workType: string;
  experience: string;
  location: string;
}

const JobTrackerGridCard: React.FC<JobTrackerGridCardProps> = ({
  companyName,
  jobTitle,
  jobPackage,
  workType,
  experience,
  location,
}) => {
  return (
    <div className="bg-[#0C111D] p-6 mb-4 flex flex-col gap-6 rounded-lg border-[2px] border-white border-opacity-20 shadow-lg">
      <div className="flex flex-row justify-between items-start">
        <div className="flex flex-col gap-4">
          <div className="flex flex-row gap-3 items-center">
            <h1 className="font-inter font-semibold text-[24px] text-white">
              {jobTitle}
            </h1>
            <div className="flex flex-row border border-gray-500 rounded-md px-2 items-center gap-1">
              <Image
                src="/static/jobBoardImages/Dot.svg"
                alt="Dot"
                width={8}
                height={8}
              />
              <span className="text-white text-sm">{workType}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-6 text-white text-sm">
            <div className="flex flex-row gap-6">
              <div className="flex items-center gap-2">
                <Image
                  src="/static/icons/briefcase.svg"
                  alt="Experience"
                  width={20}
                  height={20}
                />
                <span>{experience}</span>
              </div>
              <div className="flex items-center gap-2">
                <Image
                  src="/static/icons/currencyRupee.svg"
                  alt="Salary"
                  width={20}
                  height={20}
                />
                <span>{jobPackage}</span>
              </div>
            </div>

            <div className="flex flex-row gap-6">
              <div className="flex items-center gap-2">
                <Image
                  src="/static/icons/location.svg"
                  alt="Location"
                  width={20}
                  height={20}
                />
                <span>{location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Image
                  src="/static/icons/jobType.svg"
                  alt="Role Type"
                  width={20}
                  height={20}
                />
                <span>{workType}</span>
              </div>
            </div>
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
            <p className="text-white font-semibold">{companyName}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobTrackerGridCard;
