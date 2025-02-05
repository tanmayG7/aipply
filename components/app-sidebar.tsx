import * as React from "react";
import { UserRound } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Image from "next/image";

// This is sample data.
const data = {
  navMain: [
    {
      title: "Home",
      url: "/home",
    },
    {
      title: "Job Tracker",
      url: "/job-tracker",
    },
    {
      title: "Job Board",
      url: "/job-board",
    },
    {
      title: "Reminder",
      url: "/reminder",
    },
    {
      title: "Tasks",
      url: "/tasks",
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="floating" {...props} className="bg-background ">
      <div className="bg-gradient-to-b from-[#020217] to-[#9164CF] text-[#CECFD2] h-screen rounded-2xl border-[#454545] border-[2px] ">
        <SidebarHeader className="border-b-[2px] border-[#1F242F]">
          <div className="flex items-center justify-center">
            <Image
              src={"/static/icons/aipplyLogo.svg"}
              alt="Aipply Logo"
              width={142}
              height={48}
            />
          </div>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <a href="#">
                  <div className="flex rounded-full size-12 items-center justify-center bg-sidebar-primary text-sidebar-primary-foreground">
                    <UserRound className="size-8" />
                  </div>
                  <div className="flex flex-col gap-0.5 leading-none">
                    <span className="font-semibold">Gwen Stacy</span>
                    <span className="">gwenstacy@gmail.com</span>
                  </div>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu className="gap-3 text-[#CECFD2]">
              {data.navMain.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a
                      href={item.url}
                      className="font-medium text-text-md-semibold font-inter"
                    >
                      {item.title}
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </div>
    </Sidebar>
  );
}
