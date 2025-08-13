"use client";
import { AppSidebar } from "@/components/app-sidebar";
import EditProfile from "@/components/completeProfile/editProfile";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
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
          {/* Mobile Navigation Trigger */}
          <div className="lg:hidden fixed top-6 right-4 z-50">
            <div className="bg-black/80 p-1.5 rounded-md shadow-md border border-gray-600/50 backdrop-blur-sm">
              <SidebarTrigger className="text-white hover:text-gray-200 h-6 w-6" />
            </div>
          </div>
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <EditProfile />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default HomePage;
