import * as React from "react";
import { LogOut, UserRound } from "lucide-react";
import { auth, getUserProfile } from "@/lib/firebaseConfig/firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import Image from "next/image";
import { usePathname } from "next/navigation";
import Link from "next/link";

const handleLogout = async () => {
  try {
    await signOut(auth);
    localStorage.removeItem("firebaseToken");
    window.location.href = "/";
  } catch (error) {
    console.error("Error logging out:", error);
  }
};

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
      title: "Community",
      url: "https://chat.whatsapp.com/your-whatsapp-community-link",
      image: "/static/icons/community.svg",
    },
  ],
};

const NavLink = ({
  href,
  children,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) => {
  const pathname = usePathname();

  return (
    <Link target="_blank" href={href} rel="noopener noreferrer">
      <div
        className={`text-white font-inter px-5 py-2 rounded-lg  ${
          pathname === href
            ? "bg-gradient-to-r from-[#8F63CC] from-30% to-[#01010B] text-text-md-medium rounded-sm"
            : ""
        } ${className}`}
      >
        {children}
      </div>
    </Link>
  );
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [userProfile, setUserProfile] = React.useState<{
    firstName: string;
    lastName: string;
    email: string;
  } | null>(null);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const profile = await getUserProfile(user.uid);
        setUserProfile({
          firstName: profile.firstName,
          lastName: profile.lastName,
          email: profile.email,
        });
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <Sidebar
      variant="floating"
      collapsible={"icon"}
      {...props}
      className="bg-background z-40"
    >
      <div className="bg-gradient-to-b from-[#020217] from-60% to-[#9164CF] text-[#CECFD2] h-screen rounded-2xl border-[#454545] border-[2px] ">
        <SidebarHeader className="border-b-[2px] border-[#1F242F]">
          <SidebarTrigger />
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
              <SidebarMenuButton size="lg" asChild className="py-4">
                <Link href="/complete-profile" className="flex flex-row">
                  <div className="flex rounded-full size-12 items-center justify-center bg-sidebar-primary text-sidebar-primary-foreground">
                    <UserRound className="size-8" />
                  </div>
                  <div className="flex flex-col gap-0.5 leading-none">
                    <span className="font-semibold">
                      {`${userProfile?.firstName} ${userProfile?.lastName}` ||
                        "Loading..."}
                    </span>
                    <span className="">
                      {userProfile?.email || "Loading..."}
                    </span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent className="">
          <SidebarGroup>
            <SidebarMenu className="gap-3  text-[#CECFD2]">
              {data.navMain.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      href={item.url}
                      className={`font-medium text-text-md-semibold font-inter gap-3`}
                    >
                      <Image
                        src={item.image}
                        alt={item.title}
                        width={24}
                        height={24}
                        className="hover:text-black"
                      />
                      {item.title}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
          <SidebarMenu className="flex absolute bottom-6 w-[90%] rounded py-2 hover:bg-white hover:text-black text-[#CECFD2]">
            <button
              onClick={handleLogout}
              className="px-6 cursor-pointer flex flex-row gap-3 text-text-md-semibold font-inter"
            >
              <LogOut className="size-6" />
              Logout
            </button>
          </SidebarMenu>
        </SidebarContent>
      </div>
    </Sidebar>
  );
}
