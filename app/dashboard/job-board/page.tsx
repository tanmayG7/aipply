"use client";

import { AppSidebar } from "@/components/app-sidebar";
import JobCard from "@/components/card/jobCard/jobCard";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import Image from "next/image";
import { useState, useEffect, useCallback, useRef } from "react";
import { Job, UserDetails } from "@/lib/types";
import {
  getUserProfile,
  getUpdatedJobsPaginated,
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
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { User } from "firebase/auth";

// Pagination constants
const JOBS_PER_PAGE = 20;

// Add debug logging
const DEBUG = process.env.NODE_ENV === 'development';

const debugLog = (message: string, data?: any) => {
  if (DEBUG) {
    console.log(`🔍 JobBoard: ${message}`, data || '');
  }
};

// Pagination component (unchanged)
const PaginationControls: React.FC<{
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  loading: boolean;
}> = ({ currentPage, totalPages, onPageChange, loading }) => {
  // ... existing pagination code
  return (
    <div className="flex justify-center items-center space-x-2 mt-8 mb-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1 || loading}
        className="px-3 py-2 text-sm font-medium text-gray-300 bg-[#020218] border border-[#454545] rounded-md hover:bg-[#1a1a2e] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Previous
      </button>

      <span className="px-3 py-2 text-sm text-gray-400">
        Page {currentPage} of {totalPages}
      </span>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages || loading}
        className="px-3 py-2 text-sm font-medium text-gray-300 bg-[#020218] border border-[#454545] rounded-md hover:bg-[#1a1a2e] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Next
      </button>
    </div>
  );
};

export default function Page() {
  const MySwal = withReactContent(Swal);
  const [filter, setFilter] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [userProfileValue, setUserProfileValue] = useState<UserDetails | null>(null);
  const [hiddenJobs, setHiddenJobs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);
  const [showFilterCard, setShowFilterCard] = useState(false);
  const [salaryRange, setSalaryRange] = useState<[number, number][]>([]);
  const [experience, setExperience] = useState<[number, number][]>([]);
  const [jobType, setJobType] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalJobs, setTotalJobs] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  
  const hasFetchedJobs = useRef(false);

  debugLog('Component mounted');

  // Enhanced function to fetch jobs with better error handling
  const fetchJobsWithPagination = useCallback(async (page: number, searchTerm: string = '') => {
    try {
      debugLog('Fetching jobs', { page, searchTerm, userProfile: !!userProfileValue });
      
      if (!userProfileValue?.jobTitle) {
        debugLog('No job title in user profile', userProfileValue);
        return;
      }

      setPageLoading(true);
      setError(null);
      
      const result = await getUpdatedJobsPaginated(
        auth.currentUser?.uid || '',
        userProfileValue,
        page,
        JOBS_PER_PAGE,
        searchTerm,
        {
          salaryRange,
          experience,
          jobType
        }
      );

      debugLog('Jobs fetched successfully', {
        jobCount: result.jobs?.length || 0,
        totalJobs: result.totalJobs,
        currentPage: result.currentPage
      });

      setJobs(result.jobs || []);
      setCurrentPage(result.currentPage || 1);
      setTotalPages(result.totalPages || 0);
      setTotalJobs(result.totalJobs || 0);
      setHasMore(result.hasMore || false);

    } catch (error: any) {
      console.error("Error fetching jobs:", error);
      debugLog('Error fetching jobs', error);
      setError(`Failed to fetch jobs: ${error.message}`);
      setJobs([]);
    } finally {
      setPageLoading(false);
    }
  }, [userProfileValue, salaryRange, experience, jobType]);

  // Enhanced initial data fetch
  const fetchInitialData = useCallback(async () => {
    debugLog('Fetching initial data');
    setLoading(true);
    setError(null);
    
    try {
      const currentUser = auth.currentUser;
      debugLog('Current user', { uid: currentUser?.uid, email: currentUser?.email });
      
      if (!currentUser) {
        throw new Error('No authenticated user found');
      }

      debugLog('Fetching user profile');
      const userProfile = await getUserProfile(currentUser.uid) as UserDetails;
      debugLog('User profile fetched', { 
        hasJobTitle: !!userProfile?.jobTitle,
        jobTitle: userProfile?.jobTitle,
        hasSkills: !!userProfile?.skills?.length
      });
      
      setUserProfileValue(userProfile);
      
      if (!userProfile?.jobTitle) {
        setError('Please complete your profile setup with a job title before viewing jobs.');
        return;
      }

      debugLog('Fetching hidden jobs');
      const hideJobs = await getHiddenJobs(currentUser.uid);
      setHiddenJobs(hideJobs || []);
      debugLog('Hidden jobs fetched', { count: hideJobs?.length || 0 });
      
      // Fetch first page of jobs
      await fetchJobsWithPagination(1, filter);
      
    } catch (error: any) {
      console.error("Error fetching initial data:", error);
      debugLog('Error in fetchInitialData', error);
      setError(`Failed to load data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [fetchJobsWithPagination, filter]);

  // Enhanced auth state listener
  useEffect(() => {
    debugLog('Setting up auth listener');
    
    const unsubscribe = auth.onAuthStateChanged((user) => {
      debugLog('Auth state changed', { 
        hasUser: !!user, 
        uid: user?.uid,
        hasFetched: hasFetchedJobs.current 
      });
      
      if (user && !hasFetchedJobs.current) {
        hasFetchedJobs.current = true;
        fetchInitialData();
      } else if (!user) {
        debugLog('No user - redirecting to login');
        window.location.href = '/dashboard/onboarding/login';
      }
    });
    
    return () => {
      debugLog('Cleaning up auth listener');
      unsubscribe();
    };
  }, [fetchInitialData]);

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || pageLoading) return;
    
    debugLog('Page change', { from: currentPage, to: page });
    fetchJobsWithPagination(page, filter);
    
    // Scroll to top of job list
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle search
  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = event.target.value;
    setFilter(searchTerm);
    
    debugLog('Filter change', { searchTerm });
    
    // Reset to first page when searching
    setCurrentPage(1);
    fetchJobsWithPagination(1, searchTerm);
  };

  const handleFilterClick = () => {
    setShowFilterCard(true);
  };

  const handleFilterCancel = () => {
    setShowFilterCard(false);
  };

  // Handle filter application
  const handleFilterApplied = () => {
    setCurrentPage(1);
    fetchJobsWithPagination(1, filter);
    setShowFilterCard(false);
  };

  const handleHideJob = async (jobId: string) => {
    try {
      const userId = auth.currentUser?.uid;
      if (userId) {
        await setHideJob(userId, jobId);
        setHiddenJobs([...hiddenJobs, jobId]);
        
        // Refresh current page
        fetchJobsWithPagination(currentPage, filter);
      }
    } catch (error: any) {
      console.error("Error hiding job:", error);
      setError(`Failed to hide job: ${error.message}`);
    }
  };

  const handleAppliedJob = async (jobId: string, job: Job) => {
    try {
      const userId = auth.currentUser?.uid;
      if (userId) {
        const appliedJobs = await getAppliedJobs(userId);
        MySwal.fire({
          title: "Did you apply for this job?",
          showDenyButton: true,
          confirmButtonText: "Yes",
          denyButtonText: "No"
        }).then(async (result) => {
          if (result.isConfirmed) {
            if (!appliedJobs.some((appliedJob: Job) => appliedJob.jobId === jobId)) {
              const appliedDate: string = new Date().toISOString();
              const mergedSalary = mergeSalaryRanges(job.salary);
              
              // Convert location to string if it's an array
              const locationString = Array.isArray(job.location) 
                ? job.location.join(", ") 
                : job.location;
              
              await updateDashboardOnJobApplied(
                userId,
                mergedSalary,
                locationString,
                job.experience
              );
              await setAppliedJob(userId, jobId, appliedDate);
            }
            Swal.fire("Job Saved!", "", "success");
          } else if (result.isDenied) {
            Swal.fire("Try another job", "", "info");
          }
        });
      }
    } catch (error: any) {
      console.error("Error applying for job:", error);
      setError(`Failed to apply for job: ${error.message}`);
    }
  };

  // Error display component
  if (error) {
    return (
      <SidebarProvider style={{ "--sidebar-width": "19rem" } as React.CSSProperties}>
        <AppSidebar />
        <SidebarInset>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-4 relative">
            <div className="text-center py-8">
              <div className="bg-red-900/20 border border-red-500 rounded-lg p-6 max-w-md mx-auto">
                <h2 className="text-red-400 text-xl font-semibold mb-2">Error Loading Jobs</h2>
                <p className="text-red-300 mb-4">{error}</p>
                <button 
                  onClick={() => {
                    setError(null);
                    fetchInitialData();
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider style={{ "--sidebar-width": "19rem" } as React.CSSProperties}>
      <AppSidebar />

      {loading ? (
        <ShimmerJobCard message={"Loading your personalized job feed..."} />
      ) : (
        <SidebarInset>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-4 relative">
            <div className="grid grid-cols-1 lg:grid-cols-2 items-center">
              <h1 className="text-inter font-bold text-[35px] lg:text-[40px] text-[#ECECED]">
                {totalJobs > 0 ? `Job Board (${totalJobs})` : "Job Board"}
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

            {/* Debug info in development */}
            {DEBUG && (
              <div className="bg-gray-800 p-2 rounded text-xs text-gray-300">
                Debug: User: {userProfileValue?.firstName} | Jobs: {jobs.length} | Loading: {pageLoading.toString()}
              </div>
            )}

            {/* Page info */}
            {totalJobs > 0 && (
              <div className="text-sm text-gray-400">
                Showing {Math.min((currentPage - 1) * JOBS_PER_PAGE + 1, totalJobs)} - {Math.min(currentPage * JOBS_PER_PAGE, totalJobs)} of {totalJobs} jobs
              </div>
            )}

            {showFilterCard && (
              <div className="absolute inset-0 z-60 flex justify-center items-center opacity-100">
                <FilterCard
                  jobs={jobs}
                  setFilteredJobs={handleFilterApplied}
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

            <div className={`flex flex-col gap-4 cursor-pointer ${showFilterCard ? "opacity-20" : ""} ${pageLoading ? "opacity-50 pointer-events-none" : ""}`}>
              {pageLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <span className="ml-3 text-gray-400">Loading jobs...</span>
                </div>
              ) : jobs.length > 0 ? (
                jobs.map((job: Job) => (
                  <div key={job.jobId}>
                    <JobCard
                      job={job}
                      userProfile={userProfileValue || {} as UserDetails}
                      handleHideJob={() => handleHideJob(job.jobId)}
                      handleAppliedJob={() => handleAppliedJob(job.jobId, job)}
                    />
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  {filter ? "No jobs found matching your search." : userProfileValue?.jobTitle ? "No jobs available for your profile." : "Please complete your profile to see jobs."}
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                loading={pageLoading}
              />
            )}
          </div>
        </SidebarInset>
      )}
    </SidebarProvider>
  );
}
