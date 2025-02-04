import Image from "next/image";
import Link from "next/link";
import React from "react";
import { jobBoardData } from "@/lib/staticData";

const JobCard = () => {
  return (
    <div className="flex flex-col">
      <div>
        {jobBoardData.map((job, index) => (
          <div key={index} className="bg-[#0C111D] px-6 py-6 mb-4 flex flex-col gap-12 rounded-lg">
            <div className="flex flex-row  justify-between">
              <div className="flex flex-col gap-4">
                <div className="flex flex-row gap-3">
                  <h1 className="font-inter font-semibold text-[24px] text-white">
                    {job.jobTitle}
                  </h1>
                  <div className="flex flex-row border-[1px] rounded items-center justify-center px-2 gap-1">
                    <Image
                      src="/static/jobBoardImages/Dot.svg"
                      alt="placeholder"
                      width={8}
                      height={8}
                    />
                    <span className="text-white">{job.workType}</span>
                  </div>
                </div>

                <div className="flex flex-row gap-6">
                  <div className="flex flex-row items-center justify-center">
                    <Image
                      src="/static/icons/briefcase.svg"
                      alt="placeholder"
                      width={24}
                      height={24}
                    />
                    <span className="text-white">{job.experience}</span>
                  </div>
                  <div className="flex flex-row items-center justify-center">
                    <Image
                      src="/static/icons/currencyRupee.svg"
                      alt="placeholder"
                      width={24}
                      height={24}
                    />
                    <span className="text-white">{job.package}</span>
                  </div>
                  <div className="flex flex-row items-center justify-center">
                    <Image
                      src="/static/icons/location.svg"
                      alt="location"
                      width={24}
                      height={24}
                    />
                    <span className="text-white">{job.location}</span>
                  </div>
                  <div className="flex flex-row items-center justify-center">
                    <Image
                      src="/static/icons/jobType.svg"
                      alt="placeholder"
                      width={24}
                      height={24}
                    />
                    <span className="text-white">{job.roleType}</span>
                  </div>
                </div>

                <div>
                  <div className="">
                    <div className="flex flex-row text-white gap-4 ">
                      {job.skills.map((skill, skillIndex) => (
                        <p
                          key={skillIndex}
                          className="border rounded px-2 py-2"
                        >
                          {skill}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div>
                  <Image
                    src="/static/jobBoardImages/catalogLogo.jpeg"
                    alt="Company Logo"
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                </div>
                <div>
                  <p className="text-white">{job.companyName}</p>
                  <Link href={job.applyLink}>catalogapp.io</Link>
                </div>
              </div>
            </div>

            <div className="flex flex-row gap-4 ">
              <div className="flex flex-row items-center justify-center">
                <Image
                  src="/static/icons/reportFlag.svg"
                  alt="placeholder"
                  width={24}
                  height={24}
                />
                <span className="text-white">Report</span>
              </div>


              <button className="flex flex-row items-center rounded border px-2">
                <Image
                  src="/static/icons/bookmark.svg"
                  alt="Save"
                  width={16}
                  height={16}
                />
                <span className="ml-2 text-white ">Save</span>
              </button>
              <button className=" text-white px-4 py-2 rounded border">
                Apply
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JobCard;
