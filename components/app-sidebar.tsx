import * as React from "react";
import { LogOut, Settings, ChevronRight, Edit3, Crown, Zap, Star } from "lucide-react";
import { auth, getUserProfile, getUserSubscription } from "@/lib/firebaseConfig/firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, updateDoc, getFirestore } from "firebase/firestore";
import { UserDetails, UserSubscription } from "@/lib/types";

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
import { useIsMobile } from "@/hooks/use-mobile";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { UserIcon } from "@heroicons/react/24/solid";

const handleLogout = async () => {
  try {
    await signOut(auth);
    localStorage.removeItem("firebaseToken");
    window.location.href = "/";
  } catch (error) {
    console.error("Error logging out:", error);
  }
};

const firestore = getFirestore();

const handleCommunityJoin = async () => {
  const user = auth.currentUser;
  if (user) {
    const userDocRef = doc(firestore, "users", user.uid);
    await updateDoc(userDocRef, {
      community: true,
    });
  }
};

const data = {
  navMain: [
    {
      title: "Home",
      url: "/dashboard/home",
      image: "/static/sidebarIcons/home.svg",
    },
    {
      title: "Job Tracker",
      url: "/dashboard/job-tracker",
      image: "/static/sidebarIcons/jobTracker.svg",
    },
    {
      title: "Job Board",
      url: "/dashboard/job-board",
      image: "/static/sidebarIcons/jobBoard.svg",
    },
    // {
    //   title: "Reminder",
    //   url: "/dashboard/reminder",
    //   image: "/static/icons/layers-three.svg",
    // },
    {
      title: "Community",
      url: "/dashboard/community",
      image: "/static/sidebarIcons/community.svg",
      onClick: handleCommunityJoin,
    },
  ],
};

const NavLink = ({
  href,
  children,
  className = "",
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) => {
  const pathname = usePathname();

  return (
    <Link href={href}>
      <div
        className={`text-white font-inter px-5 py-2 rounded-lg  ${
          pathname === href
            ? "bg-gradient-to-r from-[#8F63CC] from-30% to-[#01010B] text-text-md-medium rounded-sm"
            : ""
        } ${className}`}
        onClick={onClick}
      >
        {children}
      </div>
    </Link>
  );
};

// Premium CTA Button Component
const PremiumCTAButton: React.FC<{
  userSubscription?: UserSubscription;
  isMobile: boolean;
}> = ({ userSubscription, isMobile }) => {
  const router = useRouter();
  const isPremium = userSubscription?.subscriptionStatus === 'premium';
  
  const handleClick = () => {
    if (isPremium) {
      // Navigate to manage subscription
      router.push('/dashboard/subscription');
    } else {
      // Navigate to pricing page
      router.push('/pricing');
    }
  };

  if (isPremium) {
    return (
      <button
        onClick={handleClick}
        className={`w-full ${isMobile ? 'p-3' : 'p-4'} rounded-lg border border-gray-600/50 bg-gray-800/30 hover:bg-gray-700/40 hover:border-gray-500/60 transition-all duration-200 group`}
      >
        <div className="flex items-center justify-between text-gray-300 group-hover:text-white">
          <div className="flex items-center gap-3">
            <div className={`${isMobile ? 'p-1.5' : 'p-2'} bg-gray-700/50 rounded-md`}>
              <Settings className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-gray-400 group-hover:text-gray-300`} />
            </div>
            <div className="text-left">
              <p className={`${isMobile ? 'text-sm' : 'text-base'} font-medium leading-tight`}>
                Manage Subscription
              </p>
              <p className={`${isMobile ? 'text-xs' : 'text-sm'} opacity-70 leading-tight`}>
                Premium Plan
              </p>
            </div>
          </div>
          <ChevronRight className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200`} />
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={`w-full ${isMobile ? 'p-3' : 'p-4'} rounded-xl bg-gradient-to-br from-purple-600 via-violet-600 to-purple-700 hover:from-purple-700 hover:via-violet-700 hover:to-purple-800 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl group relative overflow-hidden`}
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
      
      {/* Sparkle effect */}
      <div className="absolute top-2 right-2 opacity-70 group-hover:opacity-100 transition-opacity duration-300">
        <Star className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} text-yellow-300 animate-pulse`} />
      </div>
      
      <div className="relative flex items-center justify-between text-white">
        <div className="flex items-center gap-3">
          <div className={`${isMobile ? 'p-1.5' : 'p-2'} bg-gradient-to-br from-yellow-400 to-amber-500 rounded-lg shadow-lg group-hover:rotate-12 transition-transform duration-300`}>
            <Zap className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-white`} />
          </div>
          <div className="text-left">
            <p className={`${isMobile ? 'text-sm' : 'text-base'} font-bold leading-tight group-hover:text-yellow-200 transition-colors duration-300`}>
              Upgrade to Premium
            </p>
            <p className={`${isMobile ? 'text-xs' : 'text-sm'} opacity-90 leading-tight group-hover:opacity-100 transition-opacity duration-300`}>
              Unlimited Auto-Apply
            </p>
          </div>
        </div>
        <div className="flex flex-col items-center">
          <ChevronRight className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} group-hover:translate-x-1 transition-transform duration-300`} />
          {!isMobile && (
            <div className="text-xs bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent font-bold animate-pulse">
              50% OFF
            </div>
          )}
        </div>
      </div>
    </button>
  );
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const isMobile = useIsMobile();
  const [userProfile, setUserProfile] = React.useState<{
    firstName: string;
    lastName: string;
    email: string;
    profileImage: string;
    subscription?: UserSubscription;
  } | null>(null);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Fetch user profile and subscription data separately
          const [profile, subscription] = await Promise.all([
            getUserProfile(user.uid),
            getUserSubscription(user.uid)
          ]);

          setUserProfile({
            firstName: profile.firstName || "",
            lastName: profile.lastName || "",
            email: profile.email || "",
            profileImage: profile.uploadFile || "",
            subscription: subscription,
          });
        } catch (error) {
          console.error('Error fetching user data:', error);
          // Set profile without subscription if there's an error
          const profile = await getUserProfile(user.uid);
          setUserProfile({
            firstName: profile.firstName || "",
            lastName: profile.lastName || "",
            email: profile.email || "",
            profileImage: profile.uploadFile || "",
            subscription: undefined,
          });
        }
      } else {
        setUserProfile(null);
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
      <div className={`bg-gradient-to-b from-[#020217] from-60% to-[#9164CF] text-[#CECFD2] h-screen ${isMobile ? 'rounded-none' : 'rounded-2xl'} ${isMobile ? 'border-0' : 'border-[#454545] border-[2px]'}`}>
        <SidebarHeader className="border-b-[2px] border-[#1F242F]">
          {isMobile && (
            <div className="flex justify-between items-center py-2">
              <Link href="/">
                <Image
                  src={"/static/icons/aipplyLogo.svg"}
                  alt="Aipply Logo"
                  width={100}
                  height={34}
                  priority
                  className="object-contain"
                  onError={() => console.log('Mobile logo failed to load')}
                />
              </Link>
              <SidebarTrigger />
            </div>
          )}
          {!isMobile && (
            <>
              <SidebarTrigger />
              <div className="flex items-center justify-center py-6">
                <Link href="/">
                  <Image
                    src={"/static/icons/aipplyLogo.svg"}
                    alt="Aipply Logo"
                    width={142}
                    height={48}
                    priority
                    className="object-contain"
                    onError={() => console.log('Logo failed to load')}
                  />
                </Link>
              </div>
            </>
          )}
          <SidebarMenu>
            <SidebarMenuItem className={`flex flex-col gap-4 ${isMobile ? 'mb-3' : 'mb-6'}`}>
              <SidebarMenuButton size={isMobile ? "default" : "lg"} asChild className={`${isMobile ? "py-2" : "py-4"} transition-all duration-200 hover:bg-white/5 hover:border-white/10 border border-transparent rounded-lg group`}>
                <Link
                  href="/dashboard/complete-profile"
                  className="flex flex-row items-center justify-between w-full"
                >
                  <div className="flex items-center gap-3">
                    {userProfile?.profileImage ? (
                      <div className={`flex rounded-full ${isMobile ? 'size-8' : 'size-12'} items-center justify-center bg-sidebar-primary text-sidebar-primary-foreground relative`}>
                        <Image
                          src={userProfile?.profileImage || ""}
                          alt="User Image"
                          width={isMobile ? 32 : 48}
                          height={isMobile ? 32 : 48}
                          className="rounded-full"
                        />
                        <div className={`absolute -bottom-0.5 -right-0.5 ${isMobile ? 'w-3 h-3' : 'w-4 h-4'} bg-blue-600 rounded-full flex items-center justify-center`}>
                          <Edit3 className={`${isMobile ? 'w-1.5 h-1.5' : 'w-2 h-2'} text-white`} />
                        </div>
                      </div>
                    ) : (
                      <div className={`flex rounded-full ${isMobile ? 'size-8' : 'size-12'} items-center justify-center bg-sidebar-primary text-sidebar-primary-foreground ${isMobile ? 'text-sm' : 'text-text-xl-semibold'} relative`}>
                        {userProfile?.firstName && userProfile?.lastName ? (
                          (userProfile.firstName.charAt(0) || "") +
                          (userProfile.lastName.charAt(0) || "")
                        ) : (
                          <UserIcon className={`${isMobile ? 'w-4 h-4' : 'w-6 h-6'} text-white`} />
                        )}
                        <div className={`absolute -bottom-0.5 -right-0.5 ${isMobile ? 'w-3 h-3' : 'w-4 h-4'} bg-blue-600 rounded-full flex items-center justify-center`}>
                          <Edit3 className={`${isMobile ? 'w-1.5 h-1.5' : 'w-2 h-2'} text-white`} />
                        </div>
                      </div>
                    )}
                    <div className="flex flex-col gap-0.5 leading-none">
                      <span className={`font-semibold ${isMobile ? 'text-sm' : ''} text-white`}>
                        {`${userProfile?.firstName} ${userProfile?.lastName}` ||
                          "Loading..."}
                      </span>
                      <span className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-300 group-hover:text-[#B692F6] flex items-center gap-1 transition-colors duration-200`}>
                        <Settings className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'}`} />
                        Profile Settings
                      </span>
                    </div>
                  </div>
                  <ChevronRight className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-gray-400 group-hover:text-white transition-colors duration-200 group-hover:translate-x-1 transition-transform`} />
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent className="">
          <SidebarGroup>
            <SidebarMenu className={`${isMobile ? 'gap-2' : 'gap-3'} text-[#CECFD2]`}>
              {data.navMain.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      href={item.url}
                      className={`font-medium ${isMobile ? 'text-sm' : 'text-text-md-semibold'} font-inter ${isMobile ? 'gap-2' : 'gap-3'}`}
                      onClick={item.onClick}
                    >
                      <Image
                        src={item.image}
                        alt={item.title}
                        width={isMobile ? 20 : 24}
                        height={isMobile ? 20 : 24}
                        className={`hover:text-black ${
                          item.title === "Home" ? "opacity-70" : ""
                        }`}
                      />
                      {item.title}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
          
          {/* Premium CTA Button */}
          <div className={`flex absolute ${isMobile ? 'bottom-16' : 'bottom-20'} w-[90%]`}>
            <PremiumCTAButton 
              userSubscription={userProfile?.subscription} 
              isMobile={isMobile}
            />
          </div>
          
          <SidebarMenu className={`flex absolute ${isMobile ? 'bottom-4' : 'bottom-6'} w-[90%] rounded ${isMobile ? 'py-1' : 'py-2'} hover:bg-white hover:text-black text-[#CECFD2]`}>
            <button
              onClick={handleLogout}
              className={`${isMobile ? 'px-4' : 'px-6'} cursor-pointer flex flex-row ${isMobile ? 'gap-2' : 'gap-3'} ${isMobile ? 'text-sm' : 'text-text-md-semibold'} font-inter`}
            >
              <LogOut className={`${isMobile ? 'size-4' : 'size-6'}`} />
              Logout
            </button>
          </SidebarMenu>
        </SidebarContent>
      </div>
    </Sidebar>
  );
}
