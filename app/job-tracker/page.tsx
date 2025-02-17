"use client";
import { AppSidebar } from "@/components/app-sidebar";
import JobTrackerGridCard from "@/components/card/jobTrackerCard/jobTrackerGridCard";
import { SidebarProvider } from "@/components/ui/sidebar";
import { jobBoardData } from "@/lib/staticData";
import Image from "next/image";
import React, { useRef, useState, useEffect } from "react";
import { useDraggable } from "react-use-draggable-scroll";

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
  jobDescription: string;
  keyResponsibilities: string[];
  requiredSkillsExperienceQualifications: string[];
  aboutCompany: string[];
  status: string;
}

const JobTrackerPage: React.FC = () => {
  const [appliedJobs, setAppliedJobs] = useState(
    jobBoardData.filter((job) => job.status === "applied")
  );
  const [archivedJobs, setArchivedJobs] = useState(
    jobBoardData.filter((job) => job.status === "archieved")
  );
  const [followUpRequiredJobs, setFollowUpRequiredJobs] = useState(
    jobBoardData.filter((job) => job.status === "followUpRequired")
  );
  const [noReplyJobs, setNoReplyJobs] = useState(
    jobBoardData.filter((job) => job.status === "noReply")
  );

  const onStatusChange = (job: Job, newStatus: string) => {
    setAppliedJobs(appliedJobs.filter((j) => j.id !== job.id));
    setArchivedJobs(archivedJobs.filter((j) => j.id !== job.id));
    setFollowUpRequiredJobs(
      followUpRequiredJobs.filter((j) => j.id !== job.id)
    );
    setNoReplyJobs(noReplyJobs.filter((j) => j.id !== job.id));

    switch (newStatus) {
      case "applied":
        setAppliedJobs([...appliedJobs, job]);
        break;
      case "archived":
        setArchivedJobs([...archivedJobs, job]);
        break;
      case "followUpRequired":
        setFollowUpRequiredJobs([...followUpRequiredJobs, job]);
        break;
      case "noReply":
        setNoReplyJobs([...noReplyJobs, job]);
        break;
    }
  };

  const ref = useRef<HTMLDivElement>(
    null
  ) as React.MutableRefObject<HTMLInputElement>;
  const { events } = useDraggable(ref);

  const [columnHeight, setColumnHeight] = useState(800);

  useEffect(() => {
    const updateColumnHeight = () => {
      const newHeight = window.innerHeight - 230; // Adjust 200 as needed
      setColumnHeight(newHeight);
    };

    updateColumnHeight();
    window.addEventListener("resize", updateColumnHeight);

    return () => window.removeEventListener("resize", updateColumnHeight);
  }, []);

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "19rem",
        } as React.CSSProperties
      }
    >
      <AppSidebar />
      <div className="flex flex-col w-full overflow-x-hidden overflow-y-hidden">
        <div className="flex flex-1 flex-col gap-4 pl-6 pr-14 pt-4 relative text-white">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-4">
            <div className="gap-2">
              <h1 className="font-inter text-[#ECECED] font-bold text-[40px]">
                Tracker
              </h1>
              <p className="font-inter text-[#ECECED] text-[14px] font-normal text-text-sm-semibold">
                All your applied jobs will appear here for you to track every
                step.
              </p>
            </div>

            <div className="flex flex-row gap-2 justify-start lg:justify-end">
              <input
                type="text"
                className="border border-[#454545] bg-[#020218] text-white w-[280px] py-1 px-4 text-start rounded-md h-11 min-w-[280px]"
                placeholder="Search jobs"
              />
              <button className="flex bg-blue-500 text-white py-1 px-8 rounded-md justify-center items-center gap-1 border border-[#454545] h-11 w-fit">
                <Image
                  src="/static/icons/filter.svg"
                  alt="Search"
                  width={20}
                  height={20}
                />
                Filter
              </button>
            </div>
          </div>
        </div>

        <div
          {...events}
          ref={ref} // add reference and events to the wrapping div
          className="flex h-full m-4 overflow-x-scroll scrollbar-hide"
        >
          <div className="flex flex-nowrap gap-6">
            {[
              {
                title: "Archived",
                jobs: archivedJobs,
                icon: "/static/icons/interviewing.svg",
              },
              {
                title: "No Reply",
                jobs: noReplyJobs,
                icon: "/static/icons/offers.svg",
              },
              {
                title: "Recently Applied",
                jobs: appliedJobs,
                icon: "/static/icons/applied.svg",
              },
              {
                title: "Follow Up Required",
                jobs: followUpRequiredJobs,
                icon: "/static/icons/briefcase.svg",
              },
            ]
              .filter(({ jobs }) => jobs.length > 0) // Filter out columns with no jobs
              .map(({ title, jobs, icon }) => (
                <section
                  key={title}
                  className="flex flex-col p-3 rounded-lg"
                  style={{ height: `${columnHeight}px` }}
                >
                  <div className="flex items-center gap-3 border-b border-[#454545] pb-2">
                    <Image src={icon} alt={title} width={24} height={24} />
                    <h2 className="text-[#ECECED] text-text-md-semibold ">
                      {title} ({jobs.length})
                    </h2>
                  </div>

                  <div className="overflow-y-auto scrollbar-hide mt-4">
                    <div className=" space-y-4">
                      {jobs.map((job) => (
                        <JobTrackerGridCard
                          key={job.id}
                          {...job}
                          onStatusChange={(newStatus) =>
                            onStatusChange(job, newStatus)
                          }
                        />
                      ))}
                    </div>
                  </div>
                </section>
              ))}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default JobTrackerPage;
