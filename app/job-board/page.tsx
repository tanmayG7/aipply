"use client";
import { AppSidebar } from "@/components/app-sidebar";
import JobCard from "@/components/card/jobCard/jobCard";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { jobBoardData } from "@/lib/staticData";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Page() {
  const [filter, setFilter] = useState("");
  const [filteredJobs, setFilteredJobs] = useState(jobBoardData);

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(event.target.value);
  };

  const handleFilterClick = () => {
    const filteredJobs = jobBoardData.filter((job) =>
      job.jobTitle.toLowerCase().includes(filter.toLowerCase())
    );
    setFilteredJobs(filteredJobs);
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
        <div className="flex flex-1 flex-col gap-4 p-4 pt-4 bg-[#050513]">
          <div className="flex flex-row justify-between">
            <h1 className="text-inter font-bold text-[40px] text-[#ECECED]">
              Job Board
            </h1>
            <div className="flex gap-2 ">
              <input
                type="text"
                className="border bg-[#020218] text-white w-[280px] py-1 px-3 text-start rounded-md"
                value={filter}
                onChange={handleFilterChange}
                placeholder="Search jobs"
              />
              <button
                onClick={handleFilterClick}
                className="flex bg-blue-500 text-white py-1 px-3 rounded-md justify-center items-center gap-1 border"
              >
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

          {filteredJobs.map((job) => (
            <Link href={`/job-board/${job.id}`} key={job.id}>
              <JobCard key={job.id} job={job} />
            </Link>
          ))}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
