"use client";
import { AppSidebar } from "@/components/app-sidebar";
import DashboardCard from "@/components/card/DashboardCard/DashboardCard";
import { DashboardChart } from "@/components/charts/pieCharts";
import { Button } from "@/components/ui/button";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import Head from "next/head";
import GetStartedCard from "@/components/card/getStartedCard/getStartedCard";
import { auth, getDashboardData } from "@/lib/firebaseConfig/firebaseConfig";
import { DashboardData } from "@/lib/types";
import { DashboardBarChart } from "@/components/charts/barChart";
import { HomeShimmer } from "@/components/loaders/loader";
import { testSkillTree } from '@/lib/test-skill-tree';

const DEBUG = process.env.NODE_ENV === 'development';

const debugLog = (message: string, data?: any) => {
  if (DEBUG) {
    console.log(`🏠 HomePage: ${message}`, data || '');
  }
};

const HomePage: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    debugLog('Setting up auth listener');
    
    const unsubscribe = auth.onAuthStateChanged((user) => {
      debugLog('Auth state changed', { hasUser: !!user, uid: user?.uid });
      
      if (user) {
        fetchDashboardData(user.uid);
      } else {
        debugLog('No user - redirecting to login');
        window.location.href = '/dashboard/onboarding/login';
      }
    });

    return () => {
      debugLog('Cleaning up auth listener');
      unsubscribe();
    };
  }, []);

  // Test skill tree in development
 useEffect(() => {
  console.log('🔥 BASIC TEST - This should appear in console');
  console.log('Environment:', process.env.NODE_ENV);
  console.log('Auth current user:', auth.currentUser?.uid);
}, []);

  const fetchDashboardData = async (uid: string) => {
    try {
      debugLog('Fetching dashboard data', { uid });
      setLoading(true);
      setError(null);
      
      const data = await getDashboardData(uid);
      debugLog('Dashboard data fetched', { 
        hasData: !!data,
        jobsApplied: data?.jobsApplied,
        totalJobsShown: data?.totalJobsShown
      });
      
      setDashboardData(data);
    } catch (error: any) {
      console.error("Error fetching dashboard data:", error);
      debugLog('Error fetching dashboard data', error);
      setError(`Failed to load dashboard: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Error display
  if (error) {
    return (
      <>
        <Head>
          <title>Home - Aipply</title>
          <meta name="description" content="Welcome to Aipply. Find your dream job today." />
        </Head>
        <SidebarProvider style={{ "--sidebar-width": "19rem" } as React.CSSProperties}>
          <AppSidebar />
          <SidebarInset>
            <div className="flex flex-1 flex-col gap-4 p-4 relative bg-[#020218] text-white">
              <div className="text-center py-8">
                <div className="bg-red-900/20 border border-red-500 rounded-lg p-6 max-w-md mx-auto">
                  <h2 className="text-red-400 text-xl font-semibold mb-2">Error Loading Dashboard</h2>
                  <p className="text-red-300 mb-4">{error}</p>
                  <button 
                    onClick={() => {
                      setError(null);
                      if (auth.currentUser) {
                        fetchDashboardData(auth.currentUser.uid);
                      }
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
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Home - Aipply</title>
        <meta name="description" content="Welcome to Aipply. Find your dream job today." />
      </Head>
      <SidebarProvider style={{ "--sidebar-width": "19rem" } as React.CSSProperties}>
        <AppSidebar />
        
        <SidebarInset>
          <div className="flex flex-1 flex-col gap-4 p-4 relative bg-[#020218] text-white">
            {loading ? (
              <HomeShimmer />
            ) : (
              <div className="flex flex-col gap-6">
                {/* Debug info in development */}
                {DEBUG && (
                  <div className="bg-gray-800 p-2 rounded text-xs text-gray-300">
                    Debug: Data loaded: {!!dashboardData} | Jobs Applied: {dashboardData?.jobsApplied}
                  </div>
                )}
                
                <div className="gap-3">
                  <h1 className="font-inter text-[#ECECED] font-bold text-[40px]">
                    Home
                  </h1>
                  <p className="font-inter text-[#F5F5F6] text-text-sm-semibold">
                    Today we have curated {dashboardData?.totalJobsShown || 0} jobs for you.
                  </p>
                </div>
                
                <div className="w-[50%]">
                  <GetStartedCard appliedJoblength={dashboardData?.jobsApplied ? parseInt(dashboardData.jobsApplied.toString()) : 0}/>
                </div>
                
                <div className="grid grid-cols-4 gap-4">
                  {dashboardData && (
                    <>
                      <DashboardCard
                        id="2"
                        title="Total Jobs Shown"
                        totalNumber={dashboardData.totalJobsShown.toString()}
                      />
                      <DashboardCard
                        id="3"
                        title="Jobs Applied"
                        totalNumber={dashboardData.jobsApplied.toString()}
                      />
                      <DashboardCard
                        id="1"
                        title="Avg. Experience (Years)"
                        totalNumber={dashboardData.averageExperience.toString()}
                      />
                      <DashboardCard
                        id="4"
                        title="Avg. Package (LPA)"
                        totalNumber={dashboardData.averagePackage.toFixed(1)}
                      />
                    </>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-8">
                  {dashboardData && (
                    <DashboardBarChart locationData={dashboardData.location} />
                  )}
                  {dashboardData && (
                    <DashboardChart packageAppliedTo={dashboardData.packageAppliedTo} />
                  )}
                </div>

                <div>
                  <div className="flex flex-col gap-6">
                    <h2 className="text-display-xs-semibold font-inter">
                      Recommended actions
                    </h2>
                    <div className="flex flex-row justify-between w-[80%]">
                      <div className="flex flex-row items-start gap-4">
                        <Image
                          src="/static/icons/layers-three.svg"
                          alt="Arrow"
                          width={40}
                          height={40}
                          className="border p-1 rounded-lg"
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
                            className="bg-background text-white border hover:bg-blue text-text-sm-medium w-fit font-inter"
                            onClick={() => window.location.href = '/dashboard/job-board'}
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
                          className="border p-1 rounded-lg"
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
                            className="bg-background text-white border hover:bg-blue text-text-sm-medium w-fit font-inter"
                          >
                            Contact Support
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </>
  );
};

export default HomePage;
