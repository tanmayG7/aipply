import { getWorkTypeImage } from "@/lib/staticData";
import Image from "next/image";
import React, { useState, useEffect, useRef } from "react";

interface JobTrackerGridCardProps {
  companyName: string;
  jobTitle: string;
  jobPackage: string;
  workType: string;
  experience: string;
  location: string;
  onStatusChange: (newStatus: string) => void;
}

const JobTrackerGridCard: React.FC<JobTrackerGridCardProps> = ({
  companyName,
  jobTitle,
  jobPackage,
  workType,
  experience,
  location,
  onStatusChange,
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
              {jobTitle}
            </h1>
            <div className="hidden xl:flex flex-row border border-gray-500 rounded-md px-2 gap-1">
              <Image
                src={getWorkTypeImage(workType)}
                alt="Dot"
                width={8}
                height={8}
              />
              <span className="text-white text-sm">{workType}</span>
            </div>
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

            <div className="flex flex-col lg:flex-row justify-between gap-3 md:gap-6">
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

        <div className="relative flex flex-row justify-between w-full">
          <div className="flex flex-row items-center justify-center gap-3">
            <Image
              src="/static/jobBoardImages/catalogLogo.jpeg"
              alt="Company Logo"
              width={40}
              height={40}
              className="rounded-full"
            />
            <div className="flex flex-col">
              <p className="text-white font-inter text-[14px] opacity-[70%] font-semibold">
                {companyName}
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
              <div ref={menuRef} className="absolute rounded right-0 mt-3 w-44 bg-[#050513] text-black shadow-lg z-10 border-[1px] border-[#333232]">
                <button onClick={() => onStatusChange("archived")} className="block px-4 py-2 text-text-md-regular w-full text-white text-start hover:bg-white hover:text-black rounded">
                  Archive
                </button>
                <button onClick={() => onStatusChange("applied")} className="block px-4 py-2 text-text-md-regular w-full text-white text-start hover:bg-white hover:text-black rounded">
                  Recently Applied
                </button>
                <button onClick={() => onStatusChange("followUpRequired")} className="block px-4 py-2 text-text-md-regular w-full text-white text-start hover:bg-white hover:text-black rounded">
                  Follow up required
                </button>
                <button onClick={() => onStatusChange("noReply")} className="block px-4 py-2 text-text-md-regular w-full text-white text-start hover:bg-white hover:text-black rounded">
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
