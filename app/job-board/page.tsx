"use client";
import { AppSidebar } from "@/components/app-sidebar";
import JobCard from "@/components/card/jobCard/jobCard";
import JobDescription from "@/components/jobdescription/jobDescription";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { jobBoardData } from "@/lib/staticData";
import { XIcon } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

type Job = {
  id: string;
  jobTitle: string;
  companyName: string;
  package: string;
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
};

export default function Page() {
  const [filter, setFilter] = useState("");
  const [filteredJobs, setFilteredJobs] = useState(jobBoardData);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isJobDescriptionVisible, setIsJobDescriptionVisible] = useState(false);

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(event.target.value);
  };

  const handleFilterClick = () => {
    const filteredJobs = jobBoardData.filter((job) =>
      job.jobTitle.toLowerCase().includes(filter.toLowerCase())
    );
    setFilteredJobs(filteredJobs);
  };

  const handleJobClick = (job: Job) => {
    setSelectedJob(job);
    setIsJobDescriptionVisible(true);
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
        <div className="flex flex-1 flex-col gap-4 p-4 pt-4 relative">
          <div className="flex flex-row justify-between">
            <h1 className="text-inter font-bold text-[40px] text-[#ECECED]">
              Job Board
            </h1>
            <div className="flex gap-2 ">
              <input
                type="text"
                className="border bg-[#020218] text-white w-[280px] py-1 px-4 text-start rounded-md"
                value={filter}
                onChange={handleFilterChange}
                placeholder="Search jobs"
              />
              <button
                onClick={handleFilterClick}
                className="flex bg-blue-500 text-white py-1 px-8 rounded-md justify-center items-center gap-1 border"
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

          <div className="flex flex-col gap-4 cursor-pointer">
            {filteredJobs.map((job) => (
              <div key={job.id} onClick={() => handleJobClick(job)}>
                <JobCard job={job} />
              </div>
            ))}
          </div>

          {selectedJob && (
            <div
              className={`fixed inset-0 bg-[#0C111D] bg-opacity-70 flex justify-end z-50 overflow-y-scroll transition-transform duration-1000 ease-in-out ${
                isJobDescriptionVisible ? "translate-x-0" : "translate-x-full"
              }`}
            >
              <div className="w-[960px] p-8 border-l border-white border-opacity-[60%] rounded-l-2xl h-fit">
                <div className="flex flex-col gap-6">
                  <div className="flex justify-between items-center">
                    <h4 className="font-inter font-semibold text-white text-[18px]">
                      Job Description
                    </h4>
                    <button
                      onClick={() => {
                        setIsJobDescriptionVisible(false);
                        setSelectedJob(null);
                      }}
                      className="text-white"
                    >
                      <XIcon className="h-8 w-8" />
                    </button>
                  </div>
                  <JobCard job={selectedJob} />
                  <JobDescription job={selectedJob} isVisible={true} />
                </div>
              </div>
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
