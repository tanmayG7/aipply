"use client";
import { AppSidebar } from "@/components/app-sidebar";
import DashboardCard from "@/components/card/DashboardCard/DashboardCard";
import { DashboardChart } from "@/components/charts/pieCharts";
import { Button } from "@/components/ui/button";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import Head from "next/head";
import GetStartedCard from "@/components/card/getStartedCard/getStartedCard";
import HeroSection from "@/components/ui/hero-section";
import DashboardBentoGrid from "@/components/ui/dashboard-bento-grid";
import MobileAutoApplyCarousel from "@/components/ui/mobile-auto-apply-carousel";
import CVOrdersCard from "@/components/dashboard/CVOrdersCard";
import {
  auth,
  getDashboardData,
  firestore,
  getAppliedJobs,
} from "@/lib/firebaseConfig/firebaseConfig";
import { DashboardData } from "@/lib/types";
import { DashboardBarChart } from "@/components/charts/barChart";
// import { HomeShimmer } from "@/components/loaders/loader";
// import { testSkillTree } from "@/lib/test-skill-tree";
import { doc, getDoc } from "firebase/firestore";

const DEBUG = process.env.NODE_ENV === "development";

const debugLog = (message: string, data?: unknown) => {
  if (DEBUG) {
    console.log(`🏠 HomePage: ${message}`, data || "");
  }
};

interface AutoAppliedStats {
  totalAutoApplied: number;
  todayAutoApplied: number;
  thisMonthAutoApplied: number;
}

interface UserSubscription {
  subscriptionStatus: string;
  // Add other subscription fields as needed
}

const MobileTrigger = () => {
  const { openMobile } = useSidebar();

  if (openMobile) return null; // Hide when mobile sidebar is open

  return (
    <div className="lg:hidden fixed top-4 right-4 z-40">
      <div className="bg-black/90 p-2 rounded-lg shadow-lg border border-gray-600/50 backdrop-blur-sm">
        <SidebarTrigger className="text-white hover:text-gray-200 h-5 w-5" />
      </div>
    </div>
  );
};


const getUserSubscription = async (
  userId: string
): Promise<UserSubscription | null> => {
  try {
    const subscriptionDoc = await getDoc(
      doc(firestore, "subscriptions", userId)
    );
    if (subscriptionDoc.exists()) {
      return subscriptionDoc.data() as UserSubscription;
    }
    return null;
  } catch (error: unknown) {
    debugLog("Error fetching subscription:", error);
    return null;
  }
};

interface AppliedJob {
  autoApplied?: boolean;
  appliedDate?: string;
  appliedAt?: string;
}

const calculateAutoAppliedStats = (appliedJobs: AppliedJob[]): AutoAppliedStats => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Filter only auto-applied jobs
  const autoAppliedJobs = appliedJobs.filter((job) => job.autoApplied === true);

  const todayAutoApplied = autoAppliedJobs.filter((job) => {
    const dateStr = job.appliedDate || job.appliedAt || new Date().toISOString();
    const appliedDate = new Date(dateStr);
    return appliedDate >= today;
  }).length;

  const thisMonthAutoApplied = autoAppliedJobs.filter((job) => {
    const dateStr = job.appliedDate || job.appliedAt || new Date().toISOString();
    const appliedDate = new Date(dateStr);
    return appliedDate >= thisMonth;
  }).length;

  return {
    totalAutoApplied: autoAppliedJobs.length,
    todayAutoApplied,
    thisMonthAutoApplied,
  };
};

interface CronResult {
  success?: boolean;
  error?: string;
  [key: string]: unknown;
}

const HomePage: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [autoAppliedStats, setAutoAppliedStats] =
    useState<AutoAppliedStats | null>(null);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Add cron testing states
  const [cronLoading, setCronLoading] = useState(false);
  const [cronResult, setCronResult] = useState<CronResult | null>(null);



  useEffect(() => {
    debugLog("Setting up auth listener");

    const unsubscribe = auth.onAuthStateChanged((user) => {
      debugLog("Auth state changed", { hasUser: !!user, uid: user?.uid });

      if (user) {
        console.log('====================================');
        console.log(user.uid,"user id");
        console.log('====================================');
        fetchDashboardData(user.uid);
        fetchAutoAppliedData(user.uid);
      } else {
        debugLog("No user - redirecting to login");
        window.location.href = "/dashboard/onboarding/login";
      }
    });

    return () => {
      debugLog("Cleaning up auth listener");
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    console.log("🧪 Testing skill tree...");

    // Import the test function directly
    import("@/lib/test-skill-tree")
      .then((testModule) => {
        console.log("✅ Test module loaded:", Object.keys(testModule));

        if (testModule.testSkillTree) {
          console.log("🎯 Running testSkillTree...");
          testModule.testSkillTree();
        } else {
          console.log("❌ testSkillTree function not found");
        }
      })
      .catch((error) => {
        console.error("❌ Failed to import test module:", error);

        // If test module fails, try testing the enhanced-skill-tree directly
        import("@/lib/enhanced-skill-tree")
          .then((skillModule) => {
            console.log(
              "✅ Skill tree module loaded as fallback:",
              Object.keys(skillModule)
            );

            if (skillModule.getSkillsStats) {
              const stats = skillModule.getSkillsStats();
              console.log("📊 Direct stats test:", stats);
            }

            if (skillModule.getSkillsForJobTitle) {
              const skills =
                skillModule.getSkillsForJobTitle("Software Engineer");
              console.log("🔧 Software Engineer skills:", skills?.slice(0, 5));
            }
          })
          .catch((skillError) => {
            console.error("❌ Both imports failed:", {
              testError: error,
              skillError,
            });
          });
      });
  }, []);

  // Add cron test function
  const testCronJob = async () => {
    setCronLoading(true);
    setCronResult(null);

    try {
      debugLog("Testing cron job...");
      const response = await fetch("/api/cron/daily-auto-apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: auth?.currentUser?.uid, // send userId in body
        }),
      });

      const result = await response.json();
      setCronResult(result);
      console.log("🚀 Cron job result:", result);

      // Refresh dashboard data after cron job
      if (auth.currentUser) {
        fetchDashboardData(auth.currentUser.uid);
      }
    } catch (error: unknown) {
      console.error("Error testing cron job:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setCronResult({ error: "Failed to run cron job: " + errorMessage });
    } finally {
      setCronLoading(false);
    }
  };

  const fetchDashboardData = async (uid: string) => {
    try {
      debugLog("Fetching dashboard data", { uid });
      setError(null);

      const data = await getDashboardData(uid);
      debugLog("Dashboard data fetched", {
        hasData: !!data,
        jobsApplied: data?.jobsApplied,
        totalJobsShown: data?.totalJobsShown,
      });

      setDashboardData(data);
    } catch (error: unknown) {
      console.error("Error fetching dashboard data:", error);
      debugLog("Error fetching dashboard data", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setError(`Failed to load dashboard: ${errorMessage}`);
    }
  };

  const fetchAutoAppliedData = async (uid: string) => {
    try {
      debugLog("Fetching auto-applied data&&&&&&&&&&&&&&&&&&&&&&&&", { uid });

      // Check subscription status
      const subscription = await getUserSubscription(uid);
      console.log('====================================');
      console.log(subscription,"subscription");
      console.log('====================================');
      const userIsSubscribed =
        subscription?.subscriptionStatus === "premium" ||
        subscription?.subscriptionStatus === "active";
      setIsSubscribed(userIsSubscribed);

      console.log('====================================');
      console.log(userIsSubscribed,"user is subscribed");
      console.log('====================================');

      if (userIsSubscribed) {
        // Fetch applied jobs for subscribed users
        const appliedJobs = await getAppliedJobs(uid);
        debugLog("Applied jobs fetched", { appliedJobs});

        // Calculate auto-applied stats - map to AppliedJob type
        const mappedJobs: AppliedJob[] = appliedJobs.map((job) => ({
          autoApplied: (job as AppliedJob).autoApplied,
          appliedDate: (job as AppliedJob).appliedDate,
          appliedAt: (job as AppliedJob).appliedAt,
        }));
        const stats = calculateAutoAppliedStats(mappedJobs);
        debugLog("Auto-applied stats calculated", stats);

        setAutoAppliedStats(stats);
      }
    } catch (error: unknown) {
      console.error("Error fetching auto-applied data:", error);
      debugLog("Error fetching auto-applied data", error);
      // Don't set error state for auto-applied data to avoid blocking the main dashboard
    }
  };

  // Error display
  if (error) {
    return (
      <>
        <Head>
          <title>Home - Aipply</title>
          <meta
            name="description"
            content="Welcome to Aipply. Find your dream job today."
          />
        </Head>
        <SidebarProvider
          style={{ "--sidebar-width": "19rem" } as React.CSSProperties}
        >
          <AppSidebar />
          <SidebarInset>
            <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6 relative bg-[#020218] text-white overflow-x-hidden">
              <MobileTrigger />
              <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="text-center py-8">
                  <div className="bg-red-900/20 border border-red-500 rounded-lg p-6 max-w-md mx-auto">
                    <h2 className="text-red-400 text-xl font-semibold mb-2">
                      Error Loading Dashboard
                    </h2>
                    <p className="text-red-300 mb-4">{error}</p>
                    <button
                      onClick={() => {
                        setError(null);
                        if (auth.currentUser) {
                          fetchDashboardData(auth.currentUser.uid);
                          fetchAutoAppliedData(auth.currentUser.uid);
                        }
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md h-11"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Home - Aipply</title>
        <meta
          name="description"
          content="Welcome to Aipply. Find your dream job today."
        />
      </Head>
      <SidebarProvider
        style={{ "--sidebar-width": "19rem" } as React.CSSProperties}
      >
        <AppSidebar />

        <SidebarInset>
          <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6 relative bg-[#020218] text-white overflow-x-hidden">
            <MobileTrigger />
            <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 w-full max-w-full">
              {/* {loading ? ( */}
                {/* // <HomeShimmer /> */}
              {/* // ) : ( */}
                <div className="flex flex-col gap-6">
                  {/* Debug info in development
                  {DEBUG && (
                    <div className="bg-gray-800 p-2 rounded text-xs text-gray-300">
                      Debug: Data loaded: {!!dashboardData} | Jobs Applied:{" "}
                      {dashboardData?.jobsApplied} | Subscribed: {isSubscribed}{" "}
                      | Auto Applied: {autoAppliedStats?.totalAutoApplied}
                    </div>
                  )} */}

                  <div className="gap-3">
                    <h1 className="font-inter text-[#ECECED] font-bold text-2xl sm:text-3xl lg:text-[40px]">
                      Home
                    </h1>
                    <p className="font-inter text-[#F5F5F6] text-text-sm-semibold">
                      Today we have curated {dashboardData?.totalJobsShown || 0}{" "}
                      jobs for you.
                    </p>
                  </div>

                  <div className="flex flex-col lg:flex-row gap-6 items-start">
                    {/* Getting Started Card - Always first */}
                    <div className="w-full lg:w-1/2 flex flex-col gap-4 min-w-0 order-1 lg:order-1">
                      <GetStartedCard
                        appliedJoblength={
                          dashboardData?.jobsApplied
                            ? parseInt(dashboardData.jobsApplied.toString())
                            : 0
                        }
                      />

                      {/* Quick Stats - Third on mobile, Second on desktop */}
                      {dashboardData && (
                        <div className="flex flex-col gap-4 order-3 lg:order-2">
                          <div className="text-center">
                            <h3 className="font-inter text-[#ECECED] font-semibold text-lg mb-1">
                              Quick Stats
                            </h3>
                            <p className="font-inter text-[#94969C] text-sm">
                              Your job search metrics at a glance
                            </p>
                          </div>
                          <DashboardBentoGrid
                            stats={{
                              totalJobsShown: dashboardData.totalJobsShown || 0,
                              jobsApplied: dashboardData.jobsApplied
                                ? parseInt(dashboardData.jobsApplied.toString())
                                : 0,
                              averageExperience: dashboardData.averageExperience || 0,
                              averagePackage: dashboardData.averagePackage || 0,
                            }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Hero Section - Second on mobile, Second column on desktop */}
                    <div className="w-full lg:w-1/2 min-w-0 order-2 lg:order-3">
                      <HeroSection />
                    </div>
                  </div>

                  {/* Auto Applied Jobs Cards - Only for subscribed users */}
                  {isSubscribed && autoAppliedStats && (
                    <>
                      {/* Mobile Carousel View */}
                      <MobileAutoApplyCarousel stats={autoAppliedStats} />

                      {/* Desktop Grid View - Hidden on mobile */}
                      <div className="hidden md:flex flex-col gap-4">
                        <div className="flex flex-col gap-3 text-center md:text-left">
                          <h2 className="font-inter text-[#ECECED] font-semibold text-xl">
                            Auto Apply Statistics
                          </h2>
                          <p className="font-inter text-[#94969C] text-sm">
                            Track your automated job applications performance
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          <DashboardCard
                            id="5"
                            title="Total Auto Applied"
                            totalNumber={autoAppliedStats.totalAutoApplied.toString()}
                          />
                          <DashboardCard
                            id="6"
                            title="Auto Applied Today"
                            totalNumber={autoAppliedStats.todayAutoApplied.toString()}
                          />
                          <DashboardCard
                            id="7"
                            title="Auto Applied This Month"
                            totalNumber={autoAppliedStats.thisMonthAutoApplied.toString()}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* CV Orders Section */}
                  <div className="mt-6">
                    <CVOrdersCard />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                    {dashboardData && (
                      <DashboardBarChart
                        locationData={dashboardData.location}
                      />
                    )}
                    {dashboardData && (
                      <DashboardChart
                        packageAppliedTo={dashboardData.packageAppliedTo}
                      />
                    )}
                  </div>

                  <div>
                    <div className="flex flex-col gap-6">
                      <h2 className="text-lg sm:text-xl lg:text-display-xs-semibold font-inter">
                        Recommended actions
                      </h2>
                      <div className="flex flex-col lg:flex-row lg:justify-between gap-6 lg:gap-4 w-full lg:w-[80%]">
                        <div className="flex flex-row items-start gap-4">
                          <Image
                            src="/static/icons/layers-three.svg"
                            alt="Arrow"
                            width={40}
                            height={40}
                            className="border p-1 rounded-lg flex-shrink-0"
                          />
                          <div className="flex flex-col gap-2">
                            <h3 className="text-text-lg-semibold font-inter">
                              Find more jobs
                            </h3>
                            <p className="text-text-md-medium font-inter text-[#94969C]">
                              Discover opportunities that match your skills
                            </p>
                            <Button
                              variant={"secondary"}
                              className="bg-background text-white border hover:bg-blue text-text-sm-medium w-fit font-inter h-11"
                              onClick={() =>
                                (window.location.href = "/dashboard/job-board")
                              }
                            >
                              Find more jobs
                            </Button>
                          </div>
                        </div>

                        <div className="flex flex-row items-start gap-4">
                          <Image
                            src="/static/icons/layers-three.svg"
                            alt="Arrow"
                            width={40}
                            height={40}
                            className="border p-1 rounded-lg flex-shrink-0"
                          />
                          <div className="flex flex-col gap-2">
                            <h3 className="text-text-lg-semibold font-inter">
                              Need Help?
                            </h3>
                            <p className="text-text-md-medium font-inter text-[#94969C]">
                              Contact support or check out our help guide!
                            </p>
                            <Button
                              variant={"secondary"}
                              className="bg-background text-white border hover:bg-blue text-text-sm-medium w-fit font-inter h-11"
                            >
                              Contact Support
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cron Job Test Section - Only in Development */}
                  {DEBUG && (
                    <div className="bg-gray-800 p-4 rounded-lg border border-gray-600">
                      <h3 className="text-lg font-semibold text-white mb-3">
                        Test Auto-Apply Cron Job
                      </h3>

                      <div className="flex flex-col gap-3">
                        <Button
                          onClick={testCronJob}
                          disabled={cronLoading}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md h-11 w-fit"
                        >
                          {cronLoading
                            ? "Running Cron Job..."
                            : "Test Auto-Apply Cron"}
                        </Button>

                        {cronResult && (
                          <div className="bg-gray-900 p-3 rounded border border-gray-700 max-h-96 overflow-auto">
                            <h4 className="text-sm font-medium text-green-400 mb-2">
                              Cron Job Result:
                            </h4>
                            <pre className="text-xs text-gray-300 whitespace-pre-wrap">
                              {JSON.stringify(cronResult, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              {/* )} */}
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </>
  );
};

export default HomePage;
