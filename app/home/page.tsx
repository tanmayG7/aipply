"use client";
import { AppSidebar } from "@/components/app-sidebar";
import DashboardCard from "@/components/card/DashboardCard/DashboardCard";
import { DashboardLineChart } from "@/components/charts/lineChart";
import { DashboardChart } from "@/components/charts/pieCharts";
import Header from "@/components/header/header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { DashboardData } from "@/lib/staticData";
import React from "react";

const HomePage: React.FC = () => {
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
        <Header />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-4 relative bg-[#020218] text-white">
          <div>
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
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default HomePage;
