"use client";
import Image from "next/image";
import React from "react";

interface JobTrackerTableCardProps {
  companyName: string;
  jobTitle: string;
  jobPackage: string;
  workType: string;
  roleType: string;
  location: string;
}

const JobTrackerTableCard: React.FC<JobTrackerTableCardProps> = ({
  companyName,
  jobTitle,
  jobPackage,
  workType,
  roleType,
  location,
}) => {
  return (
        <tbody>
          <tr>
            <td className="flex flex-row items-center gap-3 text-text-sm-medium px-6 py-4">
              <Image
                src="/static/jobBoardImages/catalogLogo.jpeg"
                alt="Company Logo"
                width={40}
                height={40}
                className="rounded-full"
              />
              {companyName}
            </td>
            <td className="text-text-sm-regular text-[#94969c] px-6 py-4">
              {jobTitle}
            </td>
            <td className="text-text-sm-regular text-[#94969c] px-6 py-4">
              {workType}
            </td>
            <td className="text-text-sm-regular text-[#94969c] px-6 py-4">
              {roleType}
            </td>
            <td className="text-text-sm-regular text-[#94969c] px-6 py-4">
              {location}
            </td>
            <td className="text-text-sm-regular text-[#94969c] px-6 py-4">
              {jobPackage}
            </td>
          </tr>
        </tbody>
  );
};

export default JobTrackerTableCard;
