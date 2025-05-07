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

const HomePage: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchDashboardData(user.uid);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchDashboardData = async (uid: string) => {
    try {
      const data = await getDashboardData(uid);
      setDashboardData(data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

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
        style={
          {
            "--sidebar-width": "19rem",
          } as React.CSSProperties
        }
      >
        <AppSidebar />
        
        <SidebarInset>
          <div className="flex flex-1 flex-col gap-4 p-4 relative bg-[#020218] text-white">
            {!dashboardData ? (
              <HomeShimmer />
            ) : (
              <div className="flex flex-col gap-6">
                <div className="gap-3">
                  <h1 className="font-inter text-[#ECECED] font-bold text-[40px]">
                    Home
                  </h1>
                  <p className="font-inter text-[#F5F5F6] text-text-sm-semibold">
                    Today we have curated 20 jobs for you.
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
                    <DashboardChart
                      packageAppliedTo={dashboardData.packageAppliedTo}
                    />
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
                            Add discount code to your page to increase sales
                          </p>
                          <Button
                            variant={"secondary"}
                            className="bg-background text-white border hover:bg-blue text-text-sm-medium w-fit font-inter"
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
                            Contact support or check out our marketing guide!
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
