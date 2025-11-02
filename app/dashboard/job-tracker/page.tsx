"use client"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger, useSidebar } from "@/components/ui/sidebar"
import type React from "react"
import { useState, useEffect } from "react"
import { auth, firestore } from "@/lib/firebaseConfig/firebaseConfig"
import { onAuthStateChanged } from "firebase/auth"
import { JobTrackerShimmer } from "@/components/loaders/loader"
import { collection, query, where, getDocs } from "firebase/firestore"

// Auto-applied job interface
interface AutoAppliedJob {
  id: string
  jobId: string
  title: string
  company: string
  location: string
  experience: string
  salary: string[]
  platform: string
  jobUrl: string
  autoApplied: boolean
  appliedDate: string
  appliedAt: string
  status: string
  isActive: boolean
  userId: string
  createdAt: string
  extractedAt: string
}

const MobileTrigger = () => {
  const { openMobile } = useSidebar()

  if (openMobile) return null

  return (
    <div className="lg:hidden fixed top-4 right-4 z-50">
      <div className="bg-white/10 backdrop-blur-xl p-2 rounded-xl shadow-lg border border-white/20">
        <SidebarTrigger className="text-white hover:text-gray-200 h-5 w-5" />
      </div>
    </div>
  )
}

// Function to get all applied jobs and filter auto-applied ones
const getAppliedJobs = async (userId: string): Promise<AutoAppliedJob[]> => {
  try {
    const jobsRef = collection(firestore, "appliedJobs")
    const jobsQuery = query(jobsRef, where("userId", "==", userId), where("autoApplied", "==", true))
    const jobsSnapshot = await getDocs(jobsQuery)

    const jobs = jobsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as AutoAppliedJob[]

    return jobs.sort((a, b) => new Date(b.appliedAt || b.appliedDate).getTime() - new Date(a.appliedAt || a.appliedDate).getTime())
  } catch (error: unknown) {
    console.error("Error fetching applied jobs:", error)
    return []
  }
}

// Enhanced Pagination component
const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}) => {
  const getPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    return pages
  }

  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-center gap-2 mt-8 pb-6">
      <button
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        className="px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white/70 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 hover:border-white/20 transition-all duration-200 text-sm font-medium"
      >
        First
      </button>
      
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white/70 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 hover:border-white/20 transition-all duration-200 text-sm font-medium"
      >
        ← Previous
      </button>

      <div className="flex items-center gap-1">
        {getPageNumbers().map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-4 py-2 rounded-lg border transition-all duration-200 text-sm font-medium ${
              currentPage === page
                ? "bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-500/20"
                : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:border-white/20"
            }`}
          >
            {page}
          </button>
        ))}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white/70 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 hover:border-white/20 transition-all duration-200 text-sm font-medium"
      >
        Next →
      </button>

      <button
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        className="px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white/70 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 hover:border-white/20 transition-all duration-200 text-sm font-medium"
      >
        Last
      </button>
    </div>
  )
}

// Enhanced Auto-applied job card component
const AutoAppliedJobCard = ({ job }: { job: AutoAppliedJob }) => {
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    } catch {
      return "N/A"
    }
  }

  const formatTimeAgo = (dateString: string) => {
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffTime = Math.abs(now.getTime() - date.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays === 1) return "1 day ago"
      if (diffDays < 7) return `${diffDays} days ago`
      if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`
      return `${Math.ceil(diffDays / 30)} months ago`
    } catch {
      return "N/A"
    }
  }

  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case "applied_successfully":
        return {
          color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
          icon: "✓",
          label: "Auto applied"
        }
      case "pending":
        return {
          color: "bg-amber-500/20 text-amber-400 border-amber-500/30",
          icon: "⏳",
          label: "Pending"
        }
      case "rejected":
        return {
          color: "bg-red-500/20 text-red-400 border-red-500/30",
          icon: "✗",
          label: "Rejected"
        }
      default:
        return {
          color: "bg-gray-500/20 text-gray-400 border-gray-500/30",
          icon: "•",
          label: status.replace("_", " ")
        }
    }
  }

  const statusConfig = getStatusConfig(job.status)

  return (
    <div className="group bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-white font-semibold text-lg truncate group-hover:text-blue-300 transition-colors">
              {job.title}
            </h3>
            {/* <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs px-3 py-1 rounded-full font-medium shadow-lg whitespace-nowrap">
              AUTO APPLIED
            </span> */}
          </div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white text-sm font-semibold">
              {job.company.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-gray-300 font-medium">{job.company}</p>
              <p className="text-gray-400 text-sm flex items-center gap-1">
                <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                {job.location}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-3">
          <span className={`${statusConfig.color} border text-sm px-3 py-1.5 rounded-full flex items-center gap-2 font-medium`}>
            <span>{statusConfig.icon}</span>
            {statusConfig.label}
          </span>
          <div className="text-right">
            <p className="text-gray-400 text-xs uppercase tracking-wider font-medium">{job.platform}</p>
            <p className="text-gray-500 text-xs">{formatTimeAgo(job.appliedAt || job.appliedDate)}</p>
          </div>
        </div>
      </div>

      {/* Job Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <span className="text-blue-400 text-xs">💼</span>
            </div>
            <span className="text-gray-400 text-sm font-medium">Experience</span>
          </div>
          <p className="text-white font-medium">{job.experience || "Not specified"}</p>
        </div>
        
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 bg-green-500/20 rounded-lg flex items-center justify-center">
              <span className="text-green-400 text-xs">💰</span>
            </div>
            <span className="text-gray-400 text-sm font-medium">Salary</span>
          </div>
          <p className="text-white font-medium">
            {Array.isArray(job.salary) ? job.salary.join(", ") : job.salary || "Not disclosed"}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
            Applied on {formatDate(job.appliedAt || job.appliedDate)}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1 h-1 bg-purple-400 rounded-full"></span>
            ID: {job.jobId.slice(0, 8)}...
          </span>
        </div>

        <a
          href={job.jobUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group/btn bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white text-sm py-2.5 px-6 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl hover:shadow-blue-500/25 hover:-translate-y-0.5 flex items-center gap-2"
        >
          View Job
          <span className="transform group-hover/btn:translate-x-0.5 transition-transform">→</span>
        </a>
      </div>
    </div>
  )
}

// Enhanced Stats Card Component
const StatsCard = ({ title, value, icon, color }: { title: string; value: number; icon: string; color: string }) => (
  <div className={`bg-gradient-to-br ${color} backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-white/80 text-sm font-medium mb-1">{title}</p>
        <p className="text-white text-3xl font-bold">{value}</p>
      </div>
      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl">
        {icon}
      </div>
    </div>
  </div>
)

const JobTrackerPage: React.FC = () => {
  const [autoAppliedJobs, setAutoAppliedJobs] = useState<AutoAppliedJob[]>([])
  const [filteredJobs, setFilteredJobs] = useState<AutoAppliedJob[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [jobsPerPage] = useState<number>(9)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setLoading(true)
        const currentUserId = user.uid

        try {
          const jobs = await getAppliedJobs(currentUserId)
          setAutoAppliedJobs(jobs)
          setFilteredJobs(jobs)
        } catch (error) {
          console.error("Error fetching auto-applied jobs:", error)
        } finally {
          setLoading(false)
        }
      } else {
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [])

  // Filter jobs based on search and status
  useEffect(() => {
    let filtered = autoAppliedJobs

    const q = searchQuery.trim().toLowerCase()
    if (q) {
      filtered = filtered.filter((job) => {
        const title = (job.title || "").toLowerCase()
        const company = (job.company || "").toLowerCase()
        const location = (job.location || "").toLowerCase()
        const platform = (job.platform || "").toLowerCase()
        const jobId = (job.jobId || "").toLowerCase()
        return (
          title.includes(q) || company.includes(q) || location.includes(q) || platform.includes(q) || jobId.includes(q)
        )
      })
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((job) => job.status === statusFilter)
    }

    setFilteredJobs(filtered)
    setCurrentPage(1)
  }, [searchQuery, statusFilter, autoAppliedJobs])

  // Get current jobs for pagination
  const indexOfLastJob = currentPage * jobsPerPage
  const indexOfFirstJob = indexOfLastJob - jobsPerPage
  const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob)
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage)

  // Get unique status values for filter dropdown
  const uniqueStatuses = [...new Set(autoAppliedJobs.map((job) => job.status))]

  // Calculate stats
  const stats = {
    total: autoAppliedJobs.length,
    successful: autoAppliedJobs.filter(job => job.status === "applied_successfully").length,
    pending: autoAppliedJobs.filter(job => job.status === "pending").length,
    rejected: autoAppliedJobs.filter(job => job.status === "rejected").length
  }

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
        <div className="flex flex-col w-full min-h-screen bg-gradient-to-br from-[#020218] via-[#0f0f23] to-[#020218] text-white">
          <MobileTrigger />

          {loading ? (
            <JobTrackerShimmer />
          ) : (
            <>
              {/* Header Section */}
              <div className="flex flex-1 flex-col gap-6 p-4 lg:pl-6 lg:pr-6 lg:pt-6">
                <div className="container mx-auto max-w-7xl">
                  {/* Title and Description */}
                  <div className="text-center mb-8">
                    <h1 className="font-inter text-white font-bold text-3xl sm:text-4xl lg:text-5xl mb-4 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                      Auto-Applied Jobs
                    </h1>
                    <p className="font-inter text-gray-400 text-lg max-w-2xl mx-auto">
                      Track all your automatically applied jobs in one place. Stay organized and never miss an opportunity.
                    </p>
                  </div>

                  {/* Stats Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <StatsCard 
                      title="Total Applied" 
                      value={stats.total} 
                      icon="📊" 
                      color="from-blue-500/20 to-blue-600/20" 
                    />
                    <StatsCard 
                      title="Successful" 
                      value={stats.successful} 
                      icon="✅" 
                      color="from-emerald-500/20 to-emerald-600/20" 
                    />
                    <StatsCard 
                      title="Pending" 
                      value={stats.pending} 
                      icon="⏳" 
                      color="from-amber-500/20 to-amber-600/20" 
                    />
                    <StatsCard 
                      title="Rejected" 
                      value={stats.rejected} 
                      icon="❌" 
                      color="from-red-500/20 to-red-600/20" 
                    />
                  </div>

                  {/* Search and Filter Section */}
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-8">
                    <div className="flex flex-col lg:flex-row gap-4">
                      <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <span className="text-gray-400">🔍</span>
                        </div>
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full bg-white/10 border border-white/20 text-white pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder:text-gray-400"
                          placeholder="Search by title, company, location, or job ID..."
                        />
                      </div>
                      
                      <div className="relative">
                        <select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          className="bg-white/10 border border-white/20 text-white py-3 px-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none cursor-pointer min-w-[180px]"
                        >
                          <option value="all">All Status</option>
                          {uniqueStatuses.map((status) => (
                            <option key={status} value={status} className="bg-[#1a1a2e]">
                              {status.replace("_", " ").toUpperCase()}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <span className="text-gray-400">▼</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Results counter */}
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <p className="text-gray-400 text-sm">
                        {filteredJobs.length === autoAppliedJobs.length 
                          ? `Showing all ${filteredJobs.length} jobs`
                          : `Found ${filteredJobs.length} of ${autoAppliedJobs.length} jobs`
                        }
                        {(searchQuery || statusFilter !== "all") && (
                          <button
                            onClick={() => {
                              setSearchQuery("")
                              setStatusFilter("all")
                            }}
                            className="ml-2 text-blue-400 hover:text-blue-300 underline"
                          >
                            Clear filters
                          </button>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Jobs Grid */}
                  {currentJobs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20">
                      <div className="w-24 h-24 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mb-6">
                        <span className="text-4xl">💼</span>
                      </div>
                      <h3 className="text-2xl text-white font-semibold mb-3">No Jobs Found</h3>
                      <p className="text-gray-400 text-center max-w-md">
                        {searchQuery || statusFilter !== "all"
                          ? "Try adjusting your search criteria or filters to find more results."
                          : "Your auto-applied jobs will appear here once the system starts applying to positions for you."}
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-6">
                        {currentJobs.map((job) => (
                          <AutoAppliedJobCard key={job.id} job={job} />
                        ))}
                      </div>

                      {/* Pagination */}
                      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default JobTrackerPage