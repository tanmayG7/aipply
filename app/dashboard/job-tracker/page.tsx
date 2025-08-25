"use client";
import { AppSidebar } from "@/components/app-sidebar";
import JobTrackerGridCard from "@/components/card/jobTrackerCard/jobTrackerGridCard";
import { SidebarProvider, SidebarInset, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import Image from "next/image";
import React, { useRef, useState, useEffect } from "react";
import { useDraggable } from "react-use-draggable-scroll";
import {
  auth,
  getJobTrackerData,
  updateJobStatus,
} from "@/lib/firebaseConfig/firebaseConfig";
import { getJobsByIds } from "@/lib/mongo/mongo";
import { Job } from "@/lib/types";
import { onAuthStateChanged } from "firebase/auth"; // Import onAuthStateChanged
import { JobTrackerShimmer } from "@/components/loaders/loader";

const MobileTrigger = () => {
  const { openMobile } = useSidebar();
  
  if (openMobile) return null; // Hide when mobile sidebar is open
  
  return (
    <div className="lg:hidden fixed top-6 right-4 z-50">
      <div className="bg-black/80 p-1.5 rounded-md shadow-md border border-gray-600/50 backdrop-blur-sm">
        <SidebarTrigger className="text-white hover:text-gray-200 h-6 w-6" />
      </div>
    </div>
  );
};

const JobTrackerPage: React.FC = () => {
  const [appliedJobs, setAppliedJobs] = useState<Job[]>([]);
  const [archivedJobs, setArchivedJobs] = useState<Job[]>([]);
  const [followUpRequiredJobs, setFollowUpRequiredJobs] = useState<Job[]>([]);
  const [noReplyJobs, setNoReplyJobs] = useState<Job[]>([]);
  const [userId, setUserId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true); // Add loading state

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setLoading(true); // Set loading to true when fetching starts
        const userId = user.uid;
        setUserId(userId);
        const jobTrackerData = await getJobTrackerData(userId);
        console.log("🔍 Job Tracker Data:", jobTrackerData);
        const jobIds = [
          ...jobTrackerData.appliedJobs.map((job: Job) => job.jobId),
          ...jobTrackerData.personalArchive.map((job: Job) => job.jobId),
          ...jobTrackerData.followUp.map((job: Job) => job.jobId),
          ...jobTrackerData.noReply.map((job: Job) => job.jobId),
        ];
        console.log("📋 Job IDs to fetch:", jobIds);
        const jobs: Job[] = await getJobsByIds(jobIds);
        console.log("💾 Jobs fetched from MongoDB:", jobs.length, jobs);
        console.log("🔍 Applied Jobs from Firestore:", jobTrackerData.appliedJobs.map((j: Job) => j.jobId));
        console.log("🔍 MongoDB Job IDs:", jobs.map((j: Job) => j.jobId));
        console.log("🔍 MongoDB IDs:", jobs.map((j: Job) => j.id));
        const appliedJobsFiltered = jobs.filter((job) =>
          jobTrackerData.appliedJobs.some((j: Job) => j.jobId === job.id)
        );
        console.log("✅ Applied Jobs Filtered:", appliedJobsFiltered.length, appliedJobsFiltered);
        setAppliedJobs(appliedJobsFiltered);
        setArchivedJobs(
          jobs.filter((job) =>
            jobTrackerData.personalArchive.some((j: Job) => j.jobId === job.id)
          )
        );
        setFollowUpRequiredJobs(
          jobs.filter((job) =>
            jobTrackerData.followUp.some((j: Job) => j.jobId === job.id)
          )
        );
        setNoReplyJobs(
          jobs.filter((job) =>
            jobTrackerData.noReply.some((j: Job) => j.jobId === job.id)
          )
        );
        setLoading(false); // Set loading to false when fetching is complete
      }
    });

    return () => unsubscribe(); // Cleanup the listener on unmount
  }, []);

  const onStatusChange = async (
    jobId: string,
    newStatus: string,
    currentStatus: string
  ) => {
    await updateJobStatus(userId, jobId, newStatus, currentStatus);
    const jobTrackerData = await getJobTrackerData(userId);
    const jobIds = [
      ...jobTrackerData.appliedJobs.map((job: Job) => job.jobId),
      ...jobTrackerData.personalArchive.map((job: Job) => job.jobId),
      ...jobTrackerData.followUp.map((job: Job) => job.jobId),
      ...jobTrackerData.noReply.map((job: Job) => job.jobId),
    ];
    const jobs: Job[] = await getJobsByIds(jobIds);
    setAppliedJobs(
      jobs.filter((job) =>
        jobTrackerData.appliedJobs.some((j: Job) => j.jobId === job.id)
      )
    );
    setArchivedJobs(
      jobs.filter((job) =>
        jobTrackerData.personalArchive.some((j: Job) => j.jobId === job.id)
      )
    );
    setFollowUpRequiredJobs(
      jobs.filter((job) =>
        jobTrackerData.followUp.some((j: Job) => j.jobId === job.id)
      )
    );
    setNoReplyJobs(
      jobs.filter((job) =>
        jobTrackerData.noReply.some((j: Job) => j.jobId === job.id)
      )
    );
  };

  const ref = useRef<HTMLDivElement>(
    null
  ) as React.MutableRefObject<HTMLInputElement>;
  const { events } = useDraggable(ref);

  const [columnHeight, setColumnHeight] = useState(800);

  useEffect(() => {
    const updateColumnHeight = () => {
      const newHeight = window.innerHeight - 140; // Adjust 200 as needed
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
      <SidebarInset>
        <div className="flex flex-col w-full overflow-x-hidden overflow-y-hidden bg-[#020218] text-white">
          <MobileTrigger />
        {loading ? ( // Conditionally render loading message
          <JobTrackerShimmer />
        ) : (
          <div className="flex flex-1 flex-col gap-4 p-4 lg:pl-6 lg:pr-14 lg:pt-4 relative">
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4 lg:gap-0 items-start lg:items-center">
                <div className="gap-2">
                  <h1 className="font-inter text-[#ECECED] font-bold text-2xl sm:text-3xl lg:text-[40px]">
                    Tracker
                  </h1>
                  <p className="font-inter text-[#ECECED] text-[14px] font-normal text-text-sm-semibold">
                    All your applied jobs will appear here for you to track every
                    step.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 justify-start lg:justify-end w-full lg:w-auto">
                  <input
                    type="text"
                    className="border border-[#454545] bg-[#020218] text-white w-full sm:w-[280px] py-1 px-4 text-start rounded-md h-11 min-w-0 sm:min-w-[280px]"
                    placeholder="Search jobs"
                  />
                  <button className="flex bg-blue-500 text-white py-1 px-6 sm:px-8 rounded-md justify-center items-center gap-1 border border-[#454545] h-11 w-fit flex-shrink-0">
                    <Image
                      src="/static/icons/filter.svg"
                      alt="Search"
                      width={20}
                      height={20}
                    />
                    <span className="hidden sm:inline">Filter</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        <div
          {...events}
          ref={ref} // add reference and events to the wrapping div
          className="flex h-full m-2 lg:m-4 overflow-x-auto scrollbar-hide"
        >
          <div className="flex flex-nowrap gap-3 sm:gap-4 lg:gap-6">
            {[
              {
                columnId: "personalArchive",
                title: "Archived",
                jobs: archivedJobs,
                icon: "/static/icons/interviewing.svg",
              },
              {
                columnId: "noReply",
                title: "No Reply",
                jobs: noReplyJobs,
                icon: "/static/icons/offers.svg",
              },
              {
                columnId: "appliedJobs",
                title: "Recently Applied",
                jobs: appliedJobs,
                icon: "/static/icons/applied.svg",
              },
              {
                columnId: "followUp",
                title: "Follow Up Required",
                jobs: followUpRequiredJobs,
                icon: "/static/icons/briefcase.svg",
              },
            ]
              .filter(({ jobs }) => jobs?.length > 0) // Filter out columns with no jobs
              .map(({ title, jobs, icon, columnId }) => (
                <section
                  key={title}
                  className="flex flex-col p-2 sm:p-3 rounded-lg min-w-[280px] sm:min-w-[320px] lg:min-w-[360px] flex-shrink-0"
                  style={{ height: `${columnHeight}px` }}
                >
                  <div className="flex items-center gap-2 sm:gap-3 border-b border-[#454545] pb-2">
                    <Image src={icon} alt={title} width={20} height={20} className="sm:w-6 sm:h-6" />
                    <h2 className="text-[#ECECED] text-sm sm:text-text-md-semibold font-semibold truncate">
                      {title} ({jobs.length})
                    </h2>
                  </div>

                  <div className="overflow-y-auto scrollbar-hide mt-3 sm:mt-4">
                    <div className="space-y-3 sm:space-y-4">
                      {jobs.map((job: Job) => (
                        <JobTrackerGridCard
                          key={job.id}
                          job={job}
                          onStatusChange={onStatusChange}
                          currentStatus={columnId}
                        />
                      ))}
                    </div>
                  </div>
                </section>
              ))}
          </div>
        </div>
      </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default JobTrackerPage;
