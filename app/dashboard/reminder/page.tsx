"use client";
import { AppSidebar } from "@/components/app-sidebar";
import ReminderCard from "@/components/card/reminderCard/reminderCard";
import { SidebarInset, SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import React from "react";

const MobileTrigger = () => {
  const { openMobile } = useSidebar();
  
  if (openMobile) return null; // Hide when mobile sidebar is open
  
  return (
    <div className="lg:hidden fixed top-6 right-4 z-50">
      <div className="bg-black/80 p-1.5 rounded-md shadow-md border border-gray-600/50 backdrop-blur-sm">
        <SidebarTrigger className="text-white hover:text-gray-200 h-6 w-6" />
      </div>
    </div>
  );
};

const ReminderPage: React.FC = () => {
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
        <div className="flex flex-1 flex-col p-4 lg:p-6 relative bg-[#020218] text-white gap-6 lg:gap-8 overflow-x-hidden">
          <MobileTrigger />
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-3">
              <h1 className="font-inter text-[#ECECED] text-2xl sm:text-3xl lg:text-[40px] font-bold">
                Reminder
              </h1>
              <p className="font-inter text-[#F5F5F6] text-text-sm-semibold">
                Prompting to take action
              </p>
            </div>

            <div className="flex flex-col gap-6 lg:gap-8">
              <ReminderCard />
              <ReminderCard />
              <ReminderCard />
              <ReminderCard />
              <ReminderCard />
              <ReminderCard />
              <ReminderCard />
              <ReminderCard />
              <ReminderCard />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default ReminderPage;
