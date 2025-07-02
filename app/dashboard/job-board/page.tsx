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

const JOBS_PER_PAGE = 20;

// Enhanced debug logging
const debugLog = (step: string, data?: any) => {
  console.log(`🔍 JobBoard-${step}:`, data || '');
  
  // Also show on screen in development
  if (process.env.NODE_ENV === 'development') {
    const debugElement = document.getElementById('debug-info');
    if (debugElement) {
      debugElement.innerHTML += `<div>[${new Date().toLocaleTimeString()}] ${step}: ${JSON.stringify(data || {})}</div>`;
      debugElement.scrollTop = debugElement.scrollHeight;
    }
  }
};

const PaginationControls: React.FC<{
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  loading: boolean;
}> = ({ currentPage, totalPages, onPageChange, loading }) => {
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
  const [debugSteps, setDebugSteps] = useState<string[]>([]);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalJobs, setTotalJobs] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  
  const hasFetchedJobs = useRef(false);

  // Add debug step
  const addDebugStep = (step: string, data?: any) => {
    debugLog(step, data);
    setDebugSteps(prev => [...prev, `${step}: ${JSON.stringify(data || {})}`]);
  };

  // Enhanced function to fetch jobs with detailed logging
  const fetchJobsWithPagination = useCallback(async (page: number, searchTerm: string = '') => {
    try {
      addDebugStep('FETCH_JOBS_START', { page, searchTerm, hasUserProfile: !!userProfileValue });
      
      if (!userProfileValue) {
        addDebugStep('FETCH_JOBS_NO_PROFILE');
        return;
      }

      if (!userProfileValue.jobTitle) {
        addDebugStep('FETCH_JOBS_NO_JOB_TITLE', { userProfile: userProfileValue });
        setError('Please set a job title in your profile to see job recommendations.');
        return;
      }

      setPageLoading(true);
      setError(null);
      
      addDebugStep('FETCH_JOBS_CALLING_API', {
        userId: auth.currentUser?.uid,
        jobTitle: userProfileValue.jobTitle,
        page,
        pageSize: JOBS_PER_PAGE
      });
      
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

      addDebugStep('FETCH_JOBS_RESULT', {
        hasResult: !!result,
        jobsLength: result?.jobs?.length || 0,
        totalJobs: result?.totalJobs || 0,
        currentPage: result?.currentPage || 0,
        totalPages: result?.totalPages || 0
      });

      if (!result) {
        setError('No response from job fetching service');
        return;
      }

      setJobs(result.jobs || []);
      setCurrentPage(result.currentPage || 1);
      setTotalPages(result.totalPages || 0);
      setTotalJobs(result.totalJobs || 0);
      setHasMore(result.hasMore || false);

      addDebugStep('FETCH_JOBS_SUCCESS', {
        finalJobsCount: result.jobs?.length || 0
      });

    } catch (error: any) {
      addDebugStep('FETCH_JOBS_ERROR', {
        message: error.message,
        stack: error.stack,
        code: error.code
      });
      console.error("Full error object:", error);
      setError(`Failed to fetch jobs: ${error.message}`);
      setJobs([]);
    } finally {
      setPageLoading(false);
    }
  }, [userProfileValue, salaryRange, experience, jobType]);

  // Enhanced initial data fetch with detailed logging
  const fetchInitialData = useCallback(async () => {
    addDebugStep('INIT_START');
    setLoading(true);
    setError(null);
    
    try {
      const currentUser = auth.currentUser;
      addDebugStep('INIT_USER_CHECK', { 
        hasUser: !!currentUser, 
        uid: currentUser?.uid,
        email: currentUser?.email 
      });
      
      if (!currentUser) {
        throw new Error('No authenticated user found');
      }

      addDebugStep('INIT_FETCH_PROFILE_START');
      const userProfile = await getUserProfile(currentUser.uid) as UserDetails;
      addDebugStep('INIT_FETCH_PROFILE_SUCCESS', { 
        hasProfile: !!userProfile,
        jobTitle: userProfile?.jobTitle,
        firstName: userProfile?.firstName,
        skills: userProfile?.skills?.length || 0,
        email: userProfile?.email
      });
      
      setUserProfileValue(userProfile);
      
      if (!userProfile) {
        setError('Failed to load user profile. Please complete your profile setup.');
        return;
      }

      addDebugStep('INIT_FETCH_HIDDEN_START');
      const hideJobs = await getHiddenJobs(currentUser.uid);
      addDebugStep('INIT_FETCH_HIDDEN_SUCCESS', { count: hideJobs?.length || 0 });
      setHiddenJobs(hideJobs || []);
      
      // Fetch first page of jobs
      addDebugStep('INIT_FETCH_JOBS_START');
      await fetchJobsWithPagination(1, filter);
      
    } catch (error: any) {
      addDebugStep('INIT_ERROR', {
        message: error.message,
        stack: error.stack,
        code: error.code
      });
      console.error("Full init error:", error);
      setError(`Failed to load data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [fetchJobsWithPagination, filter]);

  // Enhanced auth state listener
  useEffect(() => {
    addDebugStep('AUTH_LISTENER_SETUP');
    
    const unsubscribe = auth.onAuthStateChanged((user) => {
      addDebugStep('AUTH_STATE_CHANGE', { 
        hasUser: !!user, 
        uid: user?.uid,
        email: user?.email,
        hasFetched: hasFetchedJobs.current 
      });
      
      if (user && !hasFetchedJobs.current) {
        hasFetchedJobs.current = true;
        fetchInitialData();
      } else if (!user) {
        addDebugStep('AUTH_NO_USER_REDIRECT');
        window.location.href = '/dashboard/onboarding/login';
      }
    });
    
    return () => {
      addDebugStep('AUTH_LISTENER_CLEANUP');
      unsubscribe();
    };
  }, [fetchInitialData]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || pageLoading) return;
    
    addDebugStep('PAGE_CHANGE', { from: currentPage, to: page });
    fetchJobsWithPagination(page, filter);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = event.target.value;
    setFilter(searchTerm);
    
    addDebugStep('FILTER_CHANGE', { searchTerm });
    setCurrentPage(1);
    fetchJobsWithPagination(1, searchTerm);
  };

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

  // Force re-fetch button for debugging
  const forceRefetch = () => {
    addDebugStep('FORCE_REFETCH');
    setError(null);
    setJobs([]);
    hasFetchedJobs.current = false;
    fetchInitialData();
  };

  // Error display component
  if (error) {
    return (
      <SidebarProvider style={{ "--sidebar-width": "19rem" } as React.CSSProperties}>
        <AppSidebar />
        <SidebarInset>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-4 relative">
            <div className="text-center py-8">
              <div className="bg-red-900/20 border border-red-500 rounded-lg p-6 max-w-2xl mx-auto">
                <h2 className="text-red-400 text-xl font-semibold mb-2">Error Loading Jobs</h2>
                <p className="text-red-300 mb-4">{error}</p>
                <div className="space-y-2 mb-4">
                  <button 
                    onClick={forceRefetch}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md mr-2"
                  >
                    Try Again
                  </button>
                  <button 
                    onClick={() => window.location.href = '/dashboard/complete-profile'}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                  >
                    Complete Profile
                  </button>
                </div>
                
                {/* Debug info */}
                <details className="text-left">
                  <summary className="cursor-pointer text-red-300">Debug Info</summary>
                  <div className="mt-2 text-xs text-red-200 max-h-40 overflow-y-auto">
                    {debugSteps.map((step, index) => (
                      <div key={index}>{step}</div>
                    ))}
                  </div>
                </details>
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
            
            {/* Debug Panel */}
            <div id="debug-info" className="bg-gray-900 text-green-400 p-4 rounded-lg text-xs max-h-32 overflow-y-auto font-mono">
              <div className="font-bold mb-2">Debug Log:</div>
              {debugSteps.map((step, index) => (
                <div key={index}>{step}</div>
              ))}
            </div>

            {/* Status Panel */}
            <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-4">
              <h3 className="text-blue-400 font-semibold mb-2">Job Board Status</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>User:</strong> {userProfileValue?.firstName || 'Loading...'}
                </div>
                <div>
                  <strong>Job Title:</strong> {userProfileValue?.jobTitle || 'Not set'}
                </div>
                <div>
                  <strong>Jobs Loaded:</strong> {jobs.length}
                </div>
                <div>
                  <strong>Total Available:</strong> {totalJobs}
                </div>
                <div>
                  <strong>Loading:</strong> {pageLoading ? 'Yes' : 'No'}
                </div>
                <div>
                  <strong>Hidden Jobs:</strong> {hiddenJobs.length}
                </div>
              </div>
              <button 
                onClick={forceRefetch}
                className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
              >
                Force Refresh
              </button>
            </div>

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
                <div className="text-center py-8">
                  <div className="bg-yellow-900/20 border border-yellow-500 rounded-lg p-6 max-w-md mx-auto">
                    <h3 className="text-yellow-400 text-lg font-semibold mb-2">No Jobs Found</h3>
                    <p className="text-yellow-300 mb-4">
                      {filter ? "No jobs match your search." : 
                       !userProfileValue?.jobTitle ? "Please set a job title in your profile." :
                       "No jobs available for your profile."}
                    </p>
                    <button 
                      onClick={() => window.location.href = '/dashboard/complete-profile'}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md"
                    >
                      Update Profile
                    </button>
                  </div>
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
