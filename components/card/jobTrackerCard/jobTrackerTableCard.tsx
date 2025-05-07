"use client";
import { getWorkTypeImage } from "@/lib/staticData";
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
        <td className="text-text-sm-regular text-[#94969c]">
          <div className="flex flex-row border border-gray-500 rounded-md items-center gap-2 w-fit px-3 py-1">
            <Image
              src={getWorkTypeImage(workType)}
              alt="Dot"
              width={8}
              height={8}
            />
            <span className="text-white text-sm">{workType}</span>
          </div>
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
