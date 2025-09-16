"use client";

import { cn } from "@/lib/utils";
import React from "react";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import {
  IconTrendingUp,
  IconBriefcase,
  IconSend,
  IconCalendar,
  IconCash,
} from "@tabler/icons-react";

interface DashboardStats {
  totalJobsShown: number;
  jobsApplied: number;
  averageExperience: number;
  averagePackage: number;
}

interface DashboardBentoGridProps {
  stats: DashboardStats;
}

export default function DashboardBentoGrid({ stats }: DashboardBentoGridProps) {
  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Compact Pentagon-like layout with 4 items */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full">
        {/* Top item - spans 2 columns */}
        <div className="col-span-2">
          <BentoGridItem
            title={items(stats)[0].title}
            description={items(stats)[0].description}
            header={items(stats)[0].header}
            icon={items(stats)[0].icon}
            className="border-[#1F242F] bg-[#0C111D] hover:bg-[#1F242F]/50 text-white relative shadow-sm hover:shadow-lg transition-all duration-200 h-20 sm:h-24 min-h-[5rem] sm:min-h-[6rem]"
          />
        </div>

        {/* Middle row - 2 items */}
        <BentoGridItem
          title={items(stats)[1].title}
          description={items(stats)[1].description}
          header={items(stats)[1].header}
          icon={items(stats)[1].icon}
          className="border-[#1F242F] bg-[#0C111D] hover:bg-[#1F242F]/50 text-white relative shadow-sm hover:shadow-lg transition-all duration-200 h-20 sm:h-24 min-h-[5rem] sm:min-h-[6rem]"
        />
        <BentoGridItem
          title={items(stats)[2].title}
          description={items(stats)[2].description}
          header={items(stats)[2].header}
          icon={items(stats)[2].icon}
          className="border-[#1F242F] bg-[#0C111D] hover:bg-[#1F242F]/50 text-white relative shadow-sm hover:shadow-lg transition-all duration-200 h-20 sm:h-24 min-h-[5rem] sm:min-h-[6rem]"
        />

        {/* Bottom item - spans 2 columns */}
        <div className="col-span-2">
          <BentoGridItem
            title={items(stats)[3].title}
            description={items(stats)[3].description}
            header={items(stats)[3].header}
            icon={items(stats)[3].icon}
            className="border-[#1F242F] bg-[#0C111D] hover:bg-[#1F242F]/50 text-white relative shadow-sm hover:shadow-lg transition-all duration-200 h-20 sm:h-24 min-h-[5rem] sm:min-h-[6rem]"
          />
        </div>
      </div>
    </div>
  );
}

const Skeleton = ({ children }: { children?: React.ReactNode }) => (
  <div className="flex items-center justify-center relative">
    {children}
  </div>
);

const items = (stats: DashboardStats) => [
  {
    title: "Total Jobs Shown",
    description: "Available positions in your feed",
    header: (
      <Skeleton>
        <div className="text-xs sm:text-sm font-bold text-[#F5F5F6] bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-lg px-2 py-1 border border-blue-500/30 min-w-[50px] sm:min-w-[60px] text-center">
          {stats.totalJobsShown.toLocaleString()}
        </div>
      </Skeleton>
    ),
    icon: <IconBriefcase className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" />,
  },
  {
    title: "Jobs Applied",
    description: "",
    header: (
      <Skeleton>
        <div className="text-xs sm:text-sm font-bold text-[#F5F5F6] bg-gradient-to-r from-green-500/20 to-green-600/20 rounded-lg px-2 py-1 border border-green-500/30 min-w-[50px] sm:min-w-[60px] text-center">
          {stats.jobsApplied}
        </div>
      </Skeleton>
    ),
    icon: <IconSend className="h-5 w-5 sm:h-6 sm:w-6 text-green-400" />,
  },
  {
    title: "Avg Experience",
    description: "",
    header: (
      <Skeleton>
        <div className="text-xs sm:text-sm font-bold text-[#F5F5F6] bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-lg px-2 py-1 border border-purple-500/30 min-w-[50px] sm:min-w-[60px] text-center">
          {stats.averageExperience} yrs
        </div>
      </Skeleton>
    ),
    icon: <IconCalendar className="h-5 w-5 sm:h-6 sm:w-6 text-purple-400" />,
  },
  {
    title: "Average Package",
    description: "For positions applied to",
    header: (
      <Skeleton>
        <div className="text-xs sm:text-sm font-bold text-[#F5F5F6] bg-gradient-to-r from-orange-500/20 to-orange-600/20 rounded-lg px-2 py-1 border border-orange-500/30 min-w-[50px] sm:min-w-[60px] text-center">
          {stats.averagePackage} LPA
        </div>
      </Skeleton>
    ),
    icon: <IconCash className="h-5 w-5 sm:h-6 sm:w-6 text-orange-400" />,
  },
];