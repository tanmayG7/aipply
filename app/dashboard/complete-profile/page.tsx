"use client";
import { AppSidebar } from "@/components/app-sidebar";
import EditProfile from "@/components/completeProfile/editProfile";
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
      <SidebarInset className="flex flex-col">
        <div className="flex flex-1 flex-col p-4 lg:p-6 relative bg-[#020218] text-white overflow-x-hidden">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <EditProfile />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default HomePage;
