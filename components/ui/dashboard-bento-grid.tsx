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
  gettingStarted: number;
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
    <BentoGrid className="max-w-4xl mx-auto">
      {items(stats).map((item, i) => (
        <BentoGridItem
          key={i}
          title={item.title}
          description={item.description}
          header={item.header}
          icon={item.icon}
          className={cn(
            "border-[#1F242F] bg-[#0C111D] hover:bg-[#1F242F]/50 text-white relative",
            "shadow-sm hover:shadow-lg transition-all duration-200",
            i === 3 || i === 4 ? "md:col-span-2" : ""
          )}
        />
      ))}
    </BentoGrid>
  );
}

const Skeleton = ({ children }: { children?: React.ReactNode }) => (
  <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-[#1F242F]/50 to-[#0C111D]/50 items-center justify-center relative">
    {/* Gradient line at top */}
    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[70%] h-[1px] bg-gradient-to-r from-transparent via-blue-500/60 to-transparent"></div>
    {children}
  </div>
);

const items = (stats: DashboardStats) => [
  {
    title: "Getting Started",
    description: `${stats.gettingStarted}% profile completion`,
    header: (
      <Skeleton>
        <div className="text-3xl font-bold text-white">
          {stats.gettingStarted}%
        </div>
      </Skeleton>
    ),
    icon: <IconTrendingUp className="h-4 w-4 text-neutral-500" />,
  },
  {
    title: "Total Jobs Shown",
    description: "Available positions in your feed",
    header: (
      <Skeleton>
        <div className="text-3xl font-bold text-white">
          {stats.totalJobsShown.toLocaleString()}
        </div>
      </Skeleton>
    ),
    icon: <IconBriefcase className="h-4 w-4 text-neutral-500" />,
  },
  {
    title: "Jobs Applied",
    description: "Your total applications submitted",
    header: (
      <Skeleton>
        <div className="text-3xl font-bold text-white">
          {stats.jobsApplied}
        </div>
      </Skeleton>
    ),
    icon: <IconSend className="h-4 w-4 text-neutral-500" />,
  },
  {
    title: "Average Experience",
    description: "Years of experience for applied positions",
    header: (
      <Skeleton>
        <div className="text-3xl font-bold text-white">
          {stats.averageExperience} yrs
        </div>
      </Skeleton>
    ),
    icon: <IconCalendar className="h-4 w-4 text-neutral-500" />,
  },
  {
    title: "Average Package",
    description: "LPA for positions you've applied to",
    header: (
      <Skeleton>
        <div className="text-3xl font-bold text-white">
          {stats.averagePackage} LPA
        </div>
      </Skeleton>
    ),
    icon: <IconCash className="h-4 w-4 text-neutral-500" />,
  },
];