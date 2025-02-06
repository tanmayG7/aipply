import * as React from "react";
import {  UserRound } from "lucide-react";

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
import { Button } from "./ui/button";


const data = {
  navMain: [
    {
      title: "Home",
      url: "/home",
      image: "/static/icons/homeIcon.svg",
    },
    {
      title: "Job Tracker",
      url: "/job-tracker",
      image: "/static/icons/jobTracker.svg",
    },
    {
      title: "Job Board",
      url: "/job-board",
      image: "/static/icons/layers-three.svg",
    },
    {
      title: "Reminder",
      url: "/reminder",
      image: "/static/icons/layers-three.svg",
    },
    {
      title: "Chatbot",
      url: "/chatbot",
      image: "/static/icons/check-done.svg",
    },
    {
      title: "Community",
      url: "/community",
      image: "/static/icons/community.svg",
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="floating" {...props} className="bg-background ">
      <div className="bg-gradient-to-b from-[#020217] to-[#470b9a] text-[#CECFD2] h-screen rounded-2xl border-[#454545] border-[2px] ">
        <SidebarHeader className="border-b-[2px] border-[#1F242F]">
          <div className="flex items-center justify-center py-6">
            <Image
              src={"/static/icons/aipplyLogo.svg"}
              alt="Aipply Logo"
              width={142}
              height={48}
            />
          </div>
          <SidebarMenu>
            <SidebarMenuItem className="flex flex-col gap-4 pb-6">
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
              <Button
                size="lg"
                variant="secondary"
                className="w-full bg-background border rounded-lg border-[#333741] text-white"
              >
                Complete Profile
                <Image
                  src="/static/icons/arrow-right.svg"
                  alt="arrow right"
                  width={24}
                  height={24}
                />
              </Button>
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
                      className={`font-medium text-text-md-semibold font-inter gap-3`}
                    >
                      <Image
                        src={item.image}
                        alt={item.title}
                        width={24}
                        height={24}
                        className="text-[#94969C]"
                      />
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
