"use client";
import { AppSidebar } from "@/components/app-sidebar";
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
        <div className="flex flex-1 flex-col gap-4 p-4 relative bg-[#020218] text-white">
          <h1 className="items-center text-display-xl-semibold">Reminder Section</h1>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default HomePage;
