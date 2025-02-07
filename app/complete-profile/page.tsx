"use client";
import { AppSidebar } from "@/components/app-sidebar";
import EditProfile from "@/components/completeProfile/editProfile";
import Header from "@/components/header/header";
import { Progress } from "@/components/ui/progress";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
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
      <SidebarInset className="flex flex-col gap-10">
        <Header />
        <div className="flex flex-row">
          <p className="text-white">Last profile updated on: Feb 6, 2024</p>
          <div className="flex flex-row items-center gap-2">
            <Progress value={40} />
            <p className="font-inter text-[#CECFD2] font-medium text-[12px]">
              40%
            </p>
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-4 p-4 relative bg-[#020218] text-white">
          <EditProfile />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default HomePage;
