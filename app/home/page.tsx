"use client";
import { AppSidebar } from "@/components/app-sidebar";
import DashboardCard from "@/components/card/DashboardCard/DashboardCard";
import { DashboardLineChart } from "@/components/charts/lineChart";
import { DashboardChart } from "@/components/charts/pieCharts";
import Header from "@/components/header/header";
import { Button } from "@/components/ui/button";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { DashboardData } from "@/lib/staticData";
import Image from "next/image";
import React from "react";
import Head from "next/head";
import GetStartedCard from "@/components/card/getStartedCard/getStartedCard";

const HomePage: React.FC = () => {
  return (
    <>
      <Head>
        <title>Home - Aipply</title>
        <meta name="description" content="Welcome to Aipply. Find your dream job today." />
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
          <Header />
          <div className="flex flex-1 flex-col gap-4 p-4 relative bg-[#020218] text-white">
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
                <GetStartedCard />
              </div>
              <div className="grid grid-cols-4 gap-4">
                {DashboardData.map((data) => (
                  <DashboardCard
                    key={data.id}
                    id={data.id}
                    title={data.title}
                    totalNumber={data.totalNumber.toString()}
                  />
                ))}
              </div>
              <div className="grid grid-cols-2 gap-8 py-10">
                <DashboardChart />
                <DashboardLineChart />
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
          </div>
        </SidebarInset>
      </SidebarProvider>
    </>
  );
};

export default HomePage;
