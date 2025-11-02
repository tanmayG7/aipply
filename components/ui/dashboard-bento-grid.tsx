"use client";

import React from "react";
import { BentoGridItem } from "@/components/ui/bento-grid";
import {
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
      {/* Mobile: Vertical stack with centered content, Desktop: Original grid layout */}
      <div className="md:grid md:grid-cols-2 md:gap-3 lg:gap-4 w-full space-y-0 md:space-y-0">
        {/* Mobile: Vertical stack layout */}
        <div className="md:hidden">
          <div className="bg-[#0C111D] border border-[#1F242F] rounded-xl p-4 space-y-6">
            {items(stats).map((item, index) => (
              <div key={index} className="relative">
                {/* Item content */}
                <div className="flex flex-col items-center text-center space-y-3">
                  {/* Icon centered */}
                  <div className="flex items-center justify-center">
                    {item.icon}
                  </div>
                  {/* Stats value */}
                  <div className="flex items-center justify-center">
                    {item.header}
                  </div>
                  {/* Title and description */}
                  <div className="space-y-1">
                    <div className="font-inter font-semibold text-sm text-neutral-200 leading-tight">
                      {item.title}
                    </div>
                    {item.description && (
                      <div className="font-inter text-xs text-neutral-300 leading-tight opacity-80">
                        {item.description}
                      </div>
                    )}
                  </div>
                </div>
                {/* Invisible separator line (except for last item) */}
                {index < items(stats).length - 1 && (
                  <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-full h-px bg-transparent border-b border-[#1F242F]/30"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Desktop: Original grid layout */}
        <div className="hidden md:contents">
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