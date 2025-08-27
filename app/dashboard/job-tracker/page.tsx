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
  firestore,
} from "@/lib/firebaseConfig/firebaseConfig";
import { getJobsByIds } from "@/lib/mongo/mongo";
import { Job } from "@/lib/types";
import { onAuthStateChanged } from "firebase/auth";
import { JobTrackerShimmer } from "@/components/loaders/loader";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";

// Simple interface for auto-applied job data from Firebase
interface AutoAppliedJobData {
  id: string;
  jobId: string;
  title: string;
  company: string;
  location: string;
  experience: string;
  salary: string;
  platform: string;
  jobUrl: string;
  autoApplied: boolean;
  appliedDate: string;
  appliedAt: string;
  status: string;
  isActive: boolean;
  userId: string;
}

interface UserSubscription {
  subscriptionStatus: string;
}

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
  const [autoAppliedJobs, setAutoAppliedJobs] = useState<AutoAppliedJobData[]>([]);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [userId, setUserId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  // Function to get user subscription status
  const getUserSubscription = async (userId: string): Promise<UserSubscription | null> => {
    try {
      const subscriptionDoc = await getDoc(doc(firestore, "subscriptions", userId));
      if (subscriptionDoc.exists()) {
        return subscriptionDoc.data() as UserSubscription;
      }
      return null;
    } catch (error: any) {
      console.error('Error fetching subscription:', error);
      return null;
    }
  };

  // Function to get auto-applied jobs from Firebase
  const getAutoAppliedJobs = async (userId: string): Promise<AutoAppliedJobData[]> => {
    try {
      const appliedJobsRef = collection(firestore, "appliedJobs");
      const q = query(
        appliedJobsRef,
        where("userId", "==", userId),
        where("autoApplied", "==", true),
        where("isActive", "==", true)
      );
      
      const querySnapshot = await getDocs(q);
      const autoAppliedJobs: AutoAppliedJobData[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        autoAppliedJobs.push({
          id: doc.id,
          jobId: data.jobId,
          title: data.title,
          company: data.company,
          location: data.location || "Not specified",
          experience: data.experience || "Not specified",
          salary: data.salary || "Not specified",
          platform: data.platform,
          jobUrl: data.jobUrl,
          autoApplied: data.autoApplied,
          appliedDate: data.appliedDate,
          appliedAt: data.appliedAt,
          status: data.status,
          isActive: data.isActive,
          userId: data.userId,
        });
      });
      
      // Sort by most recent first
      return autoAppliedJobs.sort((a, b) => 
        new Date(b.appliedAt || b.appliedDate || '').getTime() - 
        new Date(a.appliedAt || a.appliedDate || '').getTime()
      );
    } catch (error) {
      console.error("Error fetching auto-applied jobs:", error);
      return [];
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setLoading(true);
        const currentUserId = user.uid;
        setUserId(currentUserId);
        
        try {
          // Check subscription status
          const subscription = await getUserSubscription(currentUserId);
          const userIsSubscribed = subscription?.subscriptionStatus === 'premium' || 
                                  subscription?.subscriptionStatus === 'active';
          setIsSubscribed(userIsSubscribed);

          // Fetch existing manual job tracker data
          const jobTrackerData = await getJobTrackerData(currentUserId);
          const jobIds = [
            ...jobTrackerData.appliedJobs.map((job: Job) => job.jobId),
            ...jobTrackerData.personalArchive.map((job: Job) => job.jobId),
            ...jobTrackerData.followUp.map((job: Job) => job.jobId),
            ...jobTrackerData.noReply.map((job: Job) => job.jobId),
          ];
          
          const jobs: Job[] = await getJobsByIds(jobIds);
          
          // Set manual job states (existing logic)
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

          // Fetch auto-applied jobs for subscribed users
          if (userIsSubscribed) {
            const autoApplied = await getAutoAppliedJobs(currentUserId);
            setAutoAppliedJobs(autoApplied);
          }
        } catch (error) {
          console.error("Error fetching job tracker data:", error);
        } finally {
          setLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const onStatusChange = async (
    jobId: string,
    newStatus: string,
    currentStatus: string
  ) => {
    await updateJobStatus(userId, jobId, newStatus, currentStatus);
    
    // Refresh manual job data (existing logic)
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

    // Refresh auto-applied jobs for subscribed users
    if (isSubscribed) {
      const autoApplied = await getAutoAppliedJobs(userId);
      setAutoAppliedJobs(autoApplied);
    }
  };

  const ref = useRef<HTMLDivElement>(
    null
  ) as React.MutableRefObject<HTMLInputElement>;
  const { events } = useDraggable(ref);

  const [columnHeight, setColumnHeight] = useState(800);

  useEffect(() => {
    const updateColumnHeight = () => {
      const newHeight = window.innerHeight - 140;
      setColumnHeight(newHeight);
    };

    updateColumnHeight();
    window.addEventListener("resize", updateColumnHeight);

    return () => window.removeEventListener("resize", updateColumnHeight);
  }, []);

  // Create columns array with both manual and auto-applied jobs
  const getColumns = () => {
    const columns = [
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
    ];

    // Add auto-applied jobs column for subscribed users
    if (isSubscribed && autoAppliedJobs.length > 0) {
      columns.unshift({
        columnId: "autoApplied",
        title: "Auto Applied",
        jobs: autoAppliedJobs,
        icon: "/static/icons/automation.svg", // You can use any suitable icon
      });
    }

    return columns.filter(({ jobs }) => jobs?.length > 0);
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
        <div className="flex flex-col w-full overflow-x-hidden overflow-y-hidden bg-[#020218] text-white">
          <MobileTrigger />
          {loading ? (
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
                      All your applied jobs will appear here for you to track every step.
                      {isSubscribed && " Auto-applied jobs are also tracked here."}
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
            ref={ref}
            className="flex h-full m-2 lg:m-4 overflow-x-auto scrollbar-hide"
          >
            <div className="flex flex-nowrap gap-3 sm:gap-4 lg:gap-6">
              {getColumns().map(({ title, jobs, icon, columnId }) => (
                <section
                  key={title}
                  className="flex flex-col p-2 sm:p-3 rounded-lg min-w-[280px] sm:min-w-[320px] lg:min-w-[360px] flex-shrink-0"
                  style={{ height: `${columnHeight}px` }}
                >
                  <div className="flex items-center gap-2 sm:gap-3 border-b border-[#454545] pb-2">
                    <Image src={icon} alt={title} width={20} height={20} className="sm:w-6 sm:h-6" />
                    <h2 className="text-[#ECECED] text-sm sm:text-text-md-semibold font-semibold truncate">
                      {title} ({jobs.length})
                      {columnId === "autoApplied" && (
                        <span className="ml-1 text-xs bg-green-600 px-1.5 py-0.5 rounded-full">
                          AUTO
                        </span>
                      )}
                    </h2>
                  </div>

                  <div className="overflow-y-auto scrollbar-hide mt-3 sm:mt-4">
                    <div className="space-y-3 sm:space-y-4">
                      {jobs.map((job: Job | AutoAppliedJobData) => (
                        <JobTrackerGridCard
                          key={job.id}
                          job={job as Job} // Type assertion since JobTrackerGridCard expects Job
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