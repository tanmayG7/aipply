"use client";
import { AppSidebar } from "@/components/app-sidebar";
import ReminderCard from "@/components/card/reminderCard/reminderCard";
import Header from "@/components/header/header";
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
      <SidebarInset>
        <Header />
        <div className="flex flex-1 flex-col p-4 relative bg-[#020218] text-white gap-8 px-6">
          <div className="flex flex-col gap-3">
            <h1 className="font-inter text-[#ECECED] text-[40px] font-bold ">
              Reminder
            </h1>
            <p className="font-inter text-[#F5F5F6] text-text-sm-semibold">
              Prompting to take action
            </p>
          </div>

          <div className="flex flex-col gap-8 ">
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
      </SidebarInset>
    </SidebarProvider>
  );
};

export default HomePage;
