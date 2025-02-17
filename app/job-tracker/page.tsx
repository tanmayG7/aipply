"use client";
import { AppSidebar } from "@/components/app-sidebar";
import JobTrackerGridCard from "@/components/card/jobTrackerCard/jobTrackerGridCard";
import Header from "@/components/header/header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { jobBoardData } from "@/lib/staticData";
// import type { Job } from "@/lib/types";

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
import Image from "next/image";
import React, { useState } from "react";

const JobTrackerPage: React.FC = () => {
  // const [view, setView] = useState<"grid" | "table">("grid");
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
    // Remove job from current status list
    setAppliedJobs(appliedJobs.filter((j) => j.id !== job.id));
    setArchivedJobs(archivedJobs.filter((j) => j.id !== job.id));
    setFollowUpRequiredJobs(
      followUpRequiredJobs.filter((j) => j.id !== job.id)
    );
    setNoReplyJobs(noReplyJobs.filter((j) => j.id !== job.id));

    // Add job to new status list
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

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "19rem",
        } as React.CSSProperties
      }
    >
      <AppSidebar />
      <SidebarInset>
        <Header />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-4 relative bg-[#020218] text-white w-full">
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
          {/* <div className="flex flex-row gap-2 w-full">
             <button
              className="flex flex-row bg-[#161B26] px-3 py-2 rounded-sm gap-2"
              onClick={() => setView("grid")}
            >
              {" "}
              <Image
                src={"/static/icons/gridView.svg"}
                width={24}
                height={24}
                alt="grid view icon"
              />
              Grid View
            </button> 
             <button
              onClick={() => setView("table")}
              className="flex flex-row bg-[#161B26] px-3 py-2 rounded-sm gap-2"
            >
              Table View{" "}
              <Image
                src={"/static/icons/tableView.svg"}
                width={24}
                height={24}
                alt="grid view icon"
              />
            </button> 
          </div> */}
          <div
            className={`flex flex-row gap-6 overflow-x-scroll w-full `}
          >
            <section className="flex flex-col gap-6">
              <div className="flex flex-row items-center gap-3">
                <Image
                  src="/static/icons/applied.svg"
                  alt="Applied"
                  width={24}
                  height={24}
                />
                <h2 className="text-text-md-semibold font-inter text-[#ECECED]">
                  Recently Applied{" "}
                  <span className="pl-1">({appliedJobs.length})</span>
                </h2>
              </div>
              <div
                className={`h-[1px]  bg-gradient-to-r from-[#282835] to-[#FFFFFF]`}
              ></div>
              <div>
                {/* {view === "grid" ? ( */}
                  <div className="grid-view flex flex-row flex-wrap gap-4">
                    {appliedJobs.map((job) => (
                      <JobTrackerGridCard
                        key={job.id}
                        {...job}
                        onStatusChange={(newStatus) =>
                          onStatusChange(job, newStatus)
                        }
                      />
                    ))}
                  </div>
                {/* ) : view === "table" ? (
                  <div className="flex flex-col flex-wrap">
                    <table className="w-full">
                      <thead className="bg-[#0C111D]">
                        <tr className="text-text-xs-medium text-[#94969C]">
                          <th className="text-start py-3 px-6">Company name</th>
                          <th className="text-start py-3 px-6">Job Title</th>
                          <th className="text-start py-3 px-6">Type</th>
                          <th className="text-start py-3 px-6">Mode</th>
                          <th className="text-start py-3 px-6">Location</th>
                          <th className="text-start py-3 px-6">Salary</th>
                        </tr>
                      </thead>
                      {appliedJobs.map((job) => (
                        <JobTrackerTableCard key={job.id} {...job} />
                      ))}
                    </table>
                  </div>
                ) : null} */}
              </div>
            </section>

            <section className="flex flex-col gap-6">
              <div className="flex flex-row items-center gap-3">
                <Image
                  src="/static/icons/interviewing.svg"
                  alt="Archived"
                  width={24}
                  height={24}
                />
                <h2 className="text-text-md-semibold font-inter text-[#ECECED]">
                  Archived <span className="pl-1">({archivedJobs.length})</span>
                </h2>
              </div>
              <div
                className={`h-[1px]  bg-gradient-to-r from-[#282835] to-[#FFFFFF]`}
              ></div>
              {/* {view === "grid" ? ( */}
                <div className="grid-view flex flex-row flex-wrap gap-4">
                  {archivedJobs.map((job) => (
                    <JobTrackerGridCard
                      key={job.id}
                      {...job}
                      onStatusChange={(newStatus) =>
                        onStatusChange(job, newStatus)
                      }
                    />
                  ))}
                </div>
              {/* ) : view === "table" ? (
                <div className="flex flex-col flex-wrap">
                  <table className="w-full">
                    <thead className="bg-[#0C111D]">
                      <tr className="text-text-xs-medium text-[#94969C]">
                        <th className="text-start py-3 px-6">Company name</th>
                        <th className="text-start py-3 px-6">Job Title</th>
                        <th className="text-start py-3 px-6">Type</th>
                        <th className="text-start py-3 px-6">Mode</th>
                        <th className="text-start py-3 px-6">Location</th>
                        <th className="text-start py-3 px-6">Salary</th>
                      </tr>
                    </thead>
                    {archivedJobs.map((job) => (
                      <JobTrackerTableCard key={job.id} {...job} />
                    ))}
                  </table>
                </div>
              ) : null} */}
            </section>

            <section className="flex flex-col gap-6">
              <div className="flex flex-row items-center gap-3">
                <Image
                  src="/static/icons/briefcase.svg"
                  alt="Follow Up Required"
                  width={24}
                  height={24}
                />
                <h2 className="text-text-md-semibold font-inter text-[#ECECED]">
                  Follow Up Required{" "}
                  <span className="pl-1">({followUpRequiredJobs.length})</span>
                </h2>
              </div>
              <div
                className={`h-[1px]  bg-gradient-to-r from-[#282835] to-[#FFFFFF]`}
              ></div>
              {/* {view === "grid" ? ( */}
                <div className="grid-view flex flex-row flex-wrap gap-4">
                  {followUpRequiredJobs.map((job) => (
                    <JobTrackerGridCard
                      key={job.id}
                      {...job}
                      onStatusChange={(newStatus) =>
                        onStatusChange(job, newStatus)
                      }
                    />
                  ))}
                </div>
              {/* ) : view === "table" ? (
                <div className="flex flex-col flex-wrap">
                  <table className="w-full">
                    <thead className="bg-[#0C111D]">
                      <tr className="text-text-xs-medium text-[#94969C]">
                        <th className="text-start py-3 px-6">Company name</th>
                        <th className="text-start py-3 px-6">Job Title</th>
                        <th className="text-start py-3 px-6">Type</th>
                        <th className="text-start py-3 px-6">Mode</th>
                        <th className="text-start py-3 px-6">Location</th>
                        <th className="text-start py-3 px-6">Salary</th>
                      </tr>
                    </thead>
                    {followUpRequiredJobs.map((job) => (
                      <JobTrackerTableCard key={job.id} {...job} />
                    ))}
                  </table>
                </div>
              ) : null} */}
            </section>

            <section className="flex flex-col gap-6">
              <div className="flex flex-row items-center gap-3">
                <Image
                  src="/static/icons/offers.svg"
                  alt="No Reply"
                  width={24}
                  height={24}
                />
                <h2 className="text-text-md-semibold font-inter text-[#ECECED]">
                  No Reply <span className="pl-1">({noReplyJobs.length})</span>
                </h2>
              </div>
              <div
                className={`h-[1px]  bg-gradient-to-r from-[#282835] to-[#FFFFFF]`}
              ></div>
              {/* {view === "grid" ? ( */}
                <div className="grid-view flex flex-row flex-wrap gap-4">
                  {noReplyJobs.map((job) => (
                    <JobTrackerGridCard
                      key={job.id}
                      {...job}
                      onStatusChange={(newStatus) =>
                        onStatusChange(job, newStatus)
                      }
                    />
                  ))}
                </div>
              {/* ) : view === "table" ? (
                <div className="flex flex-col flex-wrap">
                  <table className="w-full">
                    <thead className="bg-[#0C111D]">
                      <tr className="text-text-xs-medium text-[#94969C]">
                        <th className="text-start py-3 px-6">Company name</th>
                        <th className="text-start py-3 px-6">Job Title</th>
                        <th className="text-start py-3 px-6">Type</th>
                        <th className="text-start py-3 px-6">Mode</th>
                        <th className="text-start py-3 px-6">Location</th>
                        <th className="text-start py-3 px-6">Salary</th>
                      </tr>
                    </thead>
                    {noReplyJobs.map((job) => (
                      <JobTrackerTableCard key={job.id} {...job} />
                    ))}
                  </table>
                </div>
              ) : null} */}
            </section>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default JobTrackerPage;
