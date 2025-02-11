"use client";
import { AppSidebar } from "@/components/app-sidebar";
import JobCard from "@/components/card/jobCard/jobCard";
import Header from "@/components/header/header";
import JobDescription from "@/components/jobdescription/jobDescription";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { XIcon } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { getJobsByTitle } from "@/lib/mongo/mongo";
import { Job } from "@/lib/types";
import { getUserProfile } from "@/lib/firebaseConfig/firebaseConfig";

export default function Page() {
  const [filter, setFilter] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isJobDescriptionVisible, setIsJobDescriptionVisible] = useState(false);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const userProfile = await getUserProfile(); // Fetch user profile
        const fetchedJobs: Job[] = await getJobsByTitle(userProfile.aimingJobTitle); // Use aimingJobTitle from user profile
        setJobs(fetchedJobs);
        setFilteredJobs(fetchedJobs);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      }
    };

    fetchJobs();
  }, []);

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(event.target.value);
  };

  const handleFilterClick = () => {
    const filteredJob = jobs.filter((job) =>
      job.title.toLowerCase().includes(filter.toLowerCase())
    );
    setFilteredJobs(filteredJob);
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
        <Header />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-4 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center">
            <h1 className="text-inter font-bold text-[35px] lg:text-[40px] text-[#ECECED]">
              Job Board
            </h1>
            <div className="flex flex-row gap-2 justify-start lg:justify-end">
              <input
                type="text"
                className="border border-[#454545] bg-[#020218] text-white w-[280px] py-1 px-4 text-start rounded-md h-11 min-w-[280px]"
                value={filter}
                onChange={handleFilterChange}
                placeholder="Search jobs"
              />
              <button
                onClick={handleFilterClick}
                className="flex bg-blue-500 text-white py-1 px-8 rounded-md justify-center items-center gap-1 border border-[#454545] h-11 w-fit"
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
            {filteredJobs.map((job: Job) => (
              <div key={job.jobId} onClick={() => handleJobClick(job)}>
                <JobCard job={job} />
              </div>
            ))}
          </div>

          {selectedJob && (
            <div
              className={`fixed hidden inset-0 bg-[#0C111D] bg-opacity-70  justify-end z-50 overflow-y-scroll transition-transform duration-1000 ease-in-out ${
                isJobDescriptionVisible ? "translate-x-0" : "translate-x-full"
              }`}
            >
              <div className="w-[960px] p-8 border-l border-white border-opacity-[60%] rounded-l-2xl h-fit bg-[#0C111D]">
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
