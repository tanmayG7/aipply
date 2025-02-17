"use client";
import { AppSidebar } from "@/components/app-sidebar";
import JobCard from "@/components/card/jobCard/jobCard";
import Header from "@/components/header/header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Job, UserDetails } from "@/lib/types";
import {
  getUserProfile,
  getUpdatedJobs,
  auth,
  getHiddenJobs,
  setHideJob,
} from "@/lib/firebaseConfig/firebaseConfig";

export default function Page() {
  const [filter, setFilter] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [hiddenJobs, setHiddenJobs] = useState<string[]>([]);

  useEffect(() => {
    const fetchHiddenJobs = async () => {
      try {
        const userId = auth.currentUser?.uid;
        if (userId) {
          const hideJobs = await getHiddenJobs(userId);
          setHiddenJobs(hideJobs);
        }
      } catch (error) {
        console.error("Error fetching hidden jobs:", error);
      }
    };

    fetchHiddenJobs();
  }, []);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const userProfile = (await getUserProfile()) as UserDetails;
        const userId = auth.currentUser?.uid;
        if (userId) {
          const updatedJobs = await getUpdatedJobs(userId, userProfile);
          setJobs(updatedJobs);
          const filterJobs = updatedJobs.filter(
            (job) => !hiddenJobs.includes(job.jobId)
          );
          setFilteredJobs(filterJobs);
        } else {
          console.error("User ID is undefined");
        }
      } catch (error) {
        console.error("Error fetching jobs:", error);
      }
    };

    fetchJobs();
  }, [hiddenJobs]);

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(event.target.value);
  };

  const handleFilterClick = () => {
    const filteredJob = jobs.filter((job) =>
      job.title.toLowerCase().includes(filter.toLowerCase())
    );
    setFilteredJobs(filteredJob);
  };

  const handleHideJob = async (jobId: string) => {
    try {
      const userId = auth.currentUser?.uid;
      if (userId) {
        await setHideJob(userId, jobId);
        setHiddenJobs([...hiddenJobs, jobId]);
      }
    } catch (error) {
      console.error("Error hiding job:", error);
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
              <div key={job.jobId}>
                <JobCard
                  job={job}
                  handleHideJob={() => handleHideJob(job.jobId)}
                />
              </div>
            ))}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
