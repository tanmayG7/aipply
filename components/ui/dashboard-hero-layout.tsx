"use client";

import { cn } from "@/lib/utils";
import React from "react";
import DashboardBentoGrid from "@/components/ui/dashboard-bento-grid";
import HeroSection from "@/components/ui/hero-section";

interface DashboardStats {
  gettingStarted: number;
  totalJobsShown: number;
  jobsApplied: number;
  averageExperience: number;
  averagePackage: number;
}

interface DashboardHeroLayoutProps {
  stats: DashboardStats;
  className?: string;
}

export default function DashboardHeroLayout({ 
  stats, 
  className 
}: DashboardHeroLayoutProps) {
  return (
    <div className={cn("w-full", className)}>
      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch min-h-[600px]">
        {/* Left Column - Bento Grid */}
        <div className="flex flex-col">
          <div className="mb-4">
            <h2 className="font-inter text-[#ECECED] font-bold text-xl lg:text-2xl mb-2">
              Dashboard Overview
            </h2>
            <p className="font-inter text-[#94969C] text-sm">
              Track your job search progress and statistics
            </p>
          </div>
          
          {/* Bento Grid Container */}
          <div className="flex-1 flex items-center">
            <DashboardBentoGrid stats={stats} />
          </div>
        </div>

        {/* Right Column - Hero Section */}
        <div className="flex flex-col">
          <div className="flex-1 flex items-center">
            <div className="w-full">
              <HeroSection />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}