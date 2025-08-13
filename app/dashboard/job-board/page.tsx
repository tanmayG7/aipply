"use client";

import { AppSidebar } from "@/components/app-sidebar";
import JobCard from "@/components/card/jobCard/jobCard";
import { SidebarInset, SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
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

const JOBS_PER_PAGE = 20;
const MAX_TOTAL_JOBS = 100;

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

// Pagination component
const PaginationControls: React.FC<{
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  loading: boolean;
}> = ({ currentPage, totalPages, onPageChange, loading }) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      
      if (currentPage <= 3) {
        end = Math.min(totalPages - 1, 4);
      }
      if (currentPage >= totalPages - 2) {
        start = Math.max(2, totalPages - 3);
      }
      
      if (start > 2) {
        pages.push(-1);
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (end < totalPages - 1) {
        pages.push(-2);
      }
      
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div className="flex flex-wrap justify-center items-center gap-2 mt-8 mb-8 py-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1 || loading}
        className="px-3 sm:px-4 py-2 text-sm font-medium text-white bg-[#020218] border border-[#454545] rounded-md hover:bg-[#1a1a2e] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors h-11"
      >
        <span className="hidden sm:inline">Previous</span>
        <span className="sm:hidden">Prev</span>
      </button>

      {getPageNumbers().map((page, index) => {
        if (page === -1 || page === -2) {
          return (
            <span key={`ellipsis-${index}`} className="px-3 py-2 text-white font-medium">
              ...
            </span>
          );
        }

        return (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            disabled={loading}
            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors h-11 min-w-[44px] ${
              currentPage === page
                ? "bg-blue-600 text-white border border-blue-600 font-semibold"
                : "text-white bg-[#020218] border border-[#454545] hover:bg-[#1a1a2e] hover:text-white"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {page}
          </button>
        );
      })}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages || loading}
        className="px-3 sm:px-4 py-2 text-sm font-medium text-white bg-[#020218] border border-[#454545] rounded-md hover:bg-[#1a1a2e] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors h-11"
      >
        Next
      </button>

      <span className="text-sm text-white font-medium w-full sm:w-auto text-center sm:text-left mt-2 sm:mt-0 sm:ml-4">
        Page {currentPage} of {totalPages}
      </span>
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
  const [debugInfo, setDebugInfo] = useState<any>(null);

  // Count active filters for badge
  const getActiveFilterCount = () => {
    let count = 0;
    if (salaryRange.length > 0) count++;
    if (experience.length > 0) count++;
    if (jobType.length > 0) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalJobs, setTotalJobs] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  
  // Simplified state management
  const [isInitialized, setIsInitialized] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  
  // Handle search with debouncing
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Function to fetch jobs with pagination
  const fetchJobsWithPagination = useCallback(async (page: number, searchTerm: string = '') => {
    try {
      if (!userProfileValue?.jobTitle) {
        console.log("No job title found in user profile");
        return;
      }

      setPageLoading(true);
      setError(null);
      
      console.log(`Fetching jobs for page ${page}, search: "${searchTerm}"`);
      
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
        },
        MAX_TOTAL_JOBS
      );

      if (!result || typeof result !== 'object') {
        throw new Error('Invalid response from getUpdatedJobsPaginated');
      }

      setDebugInfo(result.debugInfo || null);
      setJobs(result.jobs || []);
      setCurrentPage(result.currentPage || page);
      setTotalPages(result.totalPages || 0);
      setTotalJobs(result.totalJobs || 0);
      setHasMore(result.hasMore || false);

      console.log(`Successfully fetched ${(result.jobs || []).length} jobs`);

    } catch (error: any) {
      console.error(`Error fetching jobs:`, error);
      setError(`Failed to fetch jobs: ${error.message}`);
      setJobs([]);
    } finally {
      setPageLoading(false);
    }
  }, [userProfileValue, salaryRange, experience, jobType]);

  // Simplified initial data fetch
  const fetchInitialData = useCallback(async () => {
    console.log('Starting initial data fetch...');
    setLoading(true);
    setError(null);
    
    try {
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        throw new Error('No authenticated user found');
      }

      console.log("Fetching user profile...");
      const userProfile = await getUserProfile(currentUser.uid) as UserDetails;
      
      if (!userProfile) {
        throw new Error('Failed to load user profile');
      }
      
      setUserProfileValue(userProfile);
      
      if (!userProfile?.jobTitle) {
        setError('Please complete your profile setup with a job title before viewing jobs.');
        setLoading(false);
        return;
      }

      console.log("Fetching hidden jobs...");
      const hideJobs = await getHiddenJobs(currentUser.uid);
      setHiddenJobs(hideJobs || []);
      
      setIsInitialized(true);
      
    } catch (error: any) {
      console.error(`Error in initial data fetch:`, error);
      setError(`Failed to load data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch jobs when user profile is loaded
  useEffect(() => {
    if (isInitialized && userProfileValue?.jobTitle && !pageLoading) {
      console.log('User profile loaded, fetching jobs...');
      fetchJobsWithPagination(1, filter);
    }
  }, [isInitialized, userProfileValue, fetchJobsWithPagination, filter]);

  // Force restart function
  const forceRestart = useCallback(() => {
    console.log('Force restarting job board...');
    
    // Reset all state
    setJobs([]);
    setUserProfileValue(null);
    setHiddenJobs([]);
    setCurrentPage(1);
    setTotalPages(0);
    setTotalJobs(0);
    setError(null);
    setIsInitialized(false);
    
    // Start fresh
    fetchInitialData();
  }, [fetchInitialData]);

  // Simplified auth state listener
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      console.log('Auth state changed:', !!user);
      setAuthChecked(true);
      
      if (user && !isInitialized) {
        fetchInitialData();
      } else if (!user) {
        console.log("No authenticated user, redirecting to login");
        window.location.href = '/dashboard/onboarding/login';
      }
    });
    
    return () => unsubscribe();
  }, [fetchInitialData, isInitialized]);

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || pageLoading) return;
    
    console.log(`Changing to page ${page}`);
    fetchJobsWithPagination(page, filter);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle search with debouncing
  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = event.target.value;
    setFilter(searchTerm);
    
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Debounce search
    searchTimeoutRef.current = setTimeout(() => {
      console.log(`Searching for: "${searchTerm}"`);
      setCurrentPage(1);
      fetchJobsWithPagination(1, searchTerm);
    }, 500);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleFilterClick = () => {
    setShowFilterCard(true);
  };

  const handleFilterCancel = () => {
    setShowFilterCard(false);
  };

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

  // Show loading screen while checking auth or loading initial data
  if (!authChecked || loading) {
    return <ShimmerJobCard message={"Loading your personalized job feed..."} />;
  }

  // Always render the sidebar layout structure
  return (
    <SidebarProvider style={{ "--sidebar-width": "19rem" } as React.CSSProperties}>
      <AppSidebar />
      <SidebarInset>
        <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6 pt-4 relative overflow-x-hidden bg-[#020218] text-white">
          <MobileTrigger />
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Show error with retry option */}
            {error && (
              <div className="text-center py-8">
                <div className="bg-yellow-900/20 border border-yellow-500 rounded-lg p-6 max-w-md mx-auto">
                  <h2 className="text-yellow-400 text-xl font-semibold mb-2">
                    Error Loading Jobs
                  </h2>
                  <p className="text-yellow-300 mb-4">
                    {error}
                  </p>
                  <div className="space-y-2 sm:space-y-0 sm:space-x-2 flex flex-col sm:flex-row">
                    <button 
                      onClick={forceRestart}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md font-semibold h-11"
                      disabled={loading || pageLoading}
                    >
                      🔄 Force Restart
                    </button>
                    <button 
                      onClick={() => window.location.href = '/dashboard/complete-profile'}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md h-11"
                    >
                      Complete Profile
                    </button>
                  </div>
                  <p className="text-xs text-yellow-400 mt-3">
                    If the page doesn't load initially, try "Force Restart" - this usually fixes the issue.
                  </p>
                </div>
              </div>
            )}

            {/* Show main content when no error */}
            {!error && (
              <>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h1 className="text-inter font-bold text-xl sm:text-2xl lg:text-[40px] text-[#ECECED]">
                      {totalJobs > 0 ? `Job Board (${totalJobs})` : "Job Board"}
                    </h1>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 w-full">
                    <input
                      type="text"
                      className="border border-[#454545] bg-[#020218] text-white w-full py-2 px-4 text-start rounded-md h-11 text-sm sm:text-base"
                      value={filter}
                      onChange={handleFilterChange}
                      placeholder="Search jobs (debounced)"
                    />
                    <div className="flex gap-2 sm:gap-3">
                      <button
                        type="button"
                        onClick={handleFilterClick}
                        className="relative flex bg-blue-500 text-white py-2 px-4 sm:px-6 rounded-md justify-center items-center gap-2 border border-[#454545] h-11 flex-1 sm:flex-initial min-w-[80px]"
                      >
                        <Image
                          src="/static/icons/filter.svg"
                          alt="Filter"
                          width={18}
                          height={18}
                          className="sm:w-5 sm:h-5"
                        />
                        <span className="text-sm sm:text-base">Filter</span>
                        {activeFilterCount > 0 && (
                          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                            {activeFilterCount}
                          </span>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={forceRestart}
                        className="flex bg-gray-600 text-white py-2 px-3 sm:px-4 rounded-md justify-center items-center border border-[#454545] h-11 w-11 flex-shrink-0"
                        title="Force restart if jobs don't load"
                        disabled={loading || pageLoading}
                      >
                        <span className="text-sm">🔄</span>
                      </button>
                    </div>
                  </div>
                </div>

              {/* Page info */}
              {totalJobs > 0 && (
                <div className="text-xs sm:text-sm text-white opacity-80">
                  Showing {Math.min((currentPage - 1) * JOBS_PER_PAGE + 1, totalJobs)} - {Math.min(currentPage * JOBS_PER_PAGE, totalJobs)} of {totalJobs} jobs
                </div>
              )}

                {showFilterCard && (
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
                )}

                <div className={`flex flex-col gap-4 cursor-pointer ${pageLoading ? "opacity-50 pointer-events-none" : ""}`}>
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
                  ) : !pageLoading && isInitialized ? (
                    <div className="text-center py-8 text-gray-400">
                      {filter ? "No jobs found matching your search." : 
                       !userProfileValue?.jobTitle ? "Please complete your profile to see jobs." : 
                       "No jobs available for your profile."}
                    </div>
                  ) : null}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="mt-8 mb-4">
                    <PaginationControls
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                      loading={pageLoading}
                    />
                  </div>
                )}
                
              </>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
