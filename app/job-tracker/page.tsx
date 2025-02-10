"use client";
import { AppSidebar } from "@/components/app-sidebar";
import JobTrackerGridCard from "@/components/card/jobTrackerCard/jobTrackerGridCard";
import JobTrackerTableCard from "@/components/card/jobTrackerCard/jobTrackerTableCard";
import Header from "@/components/header/header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { jobBoardData } from "@/lib/staticData";
import Image from "next/image";
import React, { useState } from "react";

const JobTrackerPage: React.FC = () => {
  const [view, setView] = useState<"grid" | "table">("grid");

  const appliedJobs = jobBoardData.filter((job) => job.status === "applied");
  const interviewingJobs = jobBoardData.filter(
    (job) => job.status === "interviewing"
  );
  const offerJobs = jobBoardData.filter((job) => job.status === "offer");

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
        <div className="flex flex-1 flex-col gap-4 p-4 pt-4 relative bg-[#020218] text-white ">
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
          <div className="flex flex-row gap-2">
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
          </div>
          <div
            className={`grid gap-6 ${
              view === "grid" ? "grid-cols-3" : "grid-cols-1"
            }`}
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
                  Applied Jobs{" "}
                  <span className="pl-1">({appliedJobs.length})</span>
                </h2>
              </div>
              <div
                className={`h-[1px] ${
                  view === "grid" ? "w-[50%]" : "w-[12%]"
                } bg-gradient-to-r from-[#282835] to-[#FFFFFF]`}
              ></div>
              <div>
                {view === "grid" ? (
                  <div className="grid-view flex flex-row flex-wrap gap-4">
                    {appliedJobs.map((job) => (
                      <JobTrackerGridCard key={job.id} {...job} />
                    ))}
                  </div>
                ) : view === "table" ? (
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
                ) : null}
              </div>
            </section>

            <section className="flex flex-col gap-6">
              <div className="flex flex-row items-center gap-3">
                <Image
                  src="/static/icons/interviewing.svg"
                  alt="Applied"
                  width={24}
                  height={24}
                />
                <h2 className="text-text-md-semibold font-inter text-[#ECECED]">
                  Interviewing{" "}
                  <span className="pl-1">({interviewingJobs.length})</span>
                </h2>
              </div>
              <div
                className={`h-[1px] ${
                  view === "grid" ? "w-[50%]" : "w-[12%]"
                } bg-gradient-to-r from-[#282835] to-[#FFFFFF]`}
              ></div>
              {view === "grid" ? (
                <div className="grid-view flex flex-row flex-wrap gap-4">
                  {interviewingJobs.map((job) => (
                    <JobTrackerGridCard key={job.id} {...job} />
                  ))}
                </div>
              ) : view === "table" ? (
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
                    {interviewingJobs.map((job) => (
                      <JobTrackerTableCard key={job.id} {...job} />
                    ))}
                  </table>
                </div>
              ) : null}
            </section>

            <section className="flex flex-col gap-6">
              <div className="flex flex-row items-center gap-3">
                <Image
                  src="/static/icons/offers.svg"
                  alt="Applied"
                  width={24}
                  height={24}
                />
                <h2 className="text-text-md-semibold font-inter text-[#ECECED]">
                  Offers <span className="pl-1">({offerJobs.length})</span>
                </h2>
              </div>
              <div
                className={`h-[0.5px] ${
                  view === "grid" ? "w-[50%]" : "w-[9%]"
                } bg-gradient-to-r from-[#282835] to-[#FFFFFF]`}
              ></div>
              {view === "grid" ? (
                <div className="grid-view flex flex-row flex-wrap gap-4">
                  {offerJobs.map((job) => (
                    <JobTrackerGridCard key={job.id} {...job} />
                  ))}
                </div>
              ) : view === "table" ? (
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
                    {offerJobs.map((job) => (
                      <JobTrackerTableCard key={job.id} {...job} />
                    ))}
                  </table>
                </div>
              ) : null}
            </section>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default JobTrackerPage;
