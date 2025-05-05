"use client";

import { AppSidebar } from "@/components/app-sidebar";
import JobCard from "@/components/card/jobCard/jobCard";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import Image from "next/image";
import { useState, useEffect, useCallback, useRef } from "react";
import { Job, UserDetails } from "@/lib/types";
import {
  getUserProfile,
  getUpdatedJobs,
  auth,
  getHiddenJobs,
  setHideJob,
  setAppliedJob,
  updateDashboardOnJobApplied,
  getAppliedJobs,
} from "@/lib/firebaseConfig/firebaseConfig";
import FilterCard from "@/components/card/filterCard/filterCard";
import { mergeSalaryRanges } from "@/lib/utils";
import { ShimmerJobCard } from "@/components/loaders/loader";

export default function Page() {
  const [filter, setFilter] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [hiddenJobs, setHiddenJobs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilterCard, setShowFilterCard] = useState(false);
  const [salaryRange, setSalaryRange] = useState<[number, number][]>([]);
  const [experience, setExperience] = useState<[number, number][]>([]);
  const [jobType, setJobType] = useState<string[]>([]);
  const hasFetchedJobs = useRef(false); 

  const fetchJobs = useCallback(async () => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  }, [hiddenJobs]);

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
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user && !hasFetchedJobs.current) {
        fetchJobs();
        hasFetchedJobs.current = true;
      }
    });
    return () => unsubscribe();
  }, [fetchJobs]);

  const handleFilterClick = () => {
    setShowFilterCard(true);
  };

  const handleFilterCancel = () => {
    setShowFilterCard(false);
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

  const handleAppliedJob = async (jobId: string, job: Job) => {
    try {
      const userId = auth.currentUser?.uid;
      if (userId) {
        const appliedJobs = await getAppliedJobs(userId);
        if (
          !appliedJobs.some((appliedJob: Job) => appliedJob.jobId === jobId)
        ) {
          const appliedDate: string = new Date().toISOString();
          const mergedSalary = mergeSalaryRanges(job.salary);
          await updateDashboardOnJobApplied(
            userId,
            mergedSalary,
            job.location,
            job.experience
          );
          await setAppliedJob(userId, jobId, appliedDate);
        }
      }
    } catch (error) {
      console.error("Error applying for job:", error);
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
      {/* <ShimmerJobCard /> */}

      {loading ? (
        <ShimmerJobCard
          message={"Best things takes time! Fetching jobs for your profile..."}
        />
      ) : (
        <SidebarInset>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-4 relative">
            <div className="grid grid-cols-1 lg:grid-cols-2 items-center">
              <h1 className="text-inter font-bold text-[35px] lg:text-[40px] text-[#ECECED]">
                {filteredJobs.length > 0
                  ? `Job Board (${filteredJobs.length})`
                  : "Job Board"}
              </h1>
              <div className="flex flex-row gap-2 justify-start lg:justify-end">
                <input
                  type="text"
                  className="border border-[#454545] bg-[#020218] text-white w-[280px] py-1 px-4 text-start rounded-md h-11 min-w-[280px]"
                  value={filter}
                  onChange={(event) => setFilter(event.target.value)}
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
            {showFilterCard && (
              <div className="absolute inset-0 z-60 flex justify-center items-center opacity-100">
                <FilterCard
                  jobs={jobs}
                  setFilteredJobs={setFilteredJobs}
                  salaryRange={salaryRange}
                  setSalaryRange={setSalaryRange}
                  experience={experience}
                  setExperience={setExperience}
                  jobType={jobType}
                  setJobType={setJobType}
                  onClose={handleFilterCancel}
                />
              </div>
            )}
            <div
              className={`flex flex-col gap-4 cursor-pointer ${
                showFilterCard ? "opacity-20" : ""
              }`}
            >
              {filteredJobs.map((job: Job) => (
                <div key={job.jobId}>
                  <JobCard
                    job={job}
                    handleHideJob={() => handleHideJob(job.jobId)}
                    handleAppliedJob={() => handleAppliedJob(job.jobId, job)}
                  />
                </div>
              ))}
            </div>
          </div>
        </SidebarInset>
      )}
    </SidebarProvider>
  );
}
