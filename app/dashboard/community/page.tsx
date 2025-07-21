"use client";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import Head from "next/head";

const whatsInsideData = [
  {
    image: "/static/communityPage/jobtips.png",
    title: "Insider Job Tips & Hacks",
    description: "Get exclusive insights and proven strategies to land your dream job faster."
  },
  {
    image: "/static/communityPage/hiringupdates.png",
    title: "Exclusive Hiring Updates & Hidden Openings",
    description: "Access job opportunities before they go public and stay ahead of the competition."
  },
  {
    image: "/static/communityPage/networking.png",
    title: "Networking with Peers",
    description: "Connect with like-minded professionals and expand your career network."
  },
  {
    image: "/static/communityPage/interview.jpeg",
    title: "Resume & Interview Hacks",
    description: "Master the art of crafting compelling resumes and acing interviews."
  },
  {
    image: "/static/communityPage/webinars.png",
    title: "Live Q&As & Webinars",
    description: "Participate in interactive sessions with industry experts and career coaches."
  },
  {
    image: "/static/communityPage/newfeatures.png",
    title: "Early Access to New Features",
    description: "Be the first to try new AiPply features before they're released to everyone."
  },
  {
    image: "/static/communityPage/feedback.png",
    title: "Beta Testing & Prioritized Feedback",
    description: "Shape the future of AiPply with your input and get priority support."
  },
];

const communityBenefits = [
  {
    icon: "/static/communityPage/jobtipsIcons.svg",
    title: "Expert Guidance",
    description: "Learn from industry professionals and career coaches"
  },
  {
    icon: "/static/communityPage/hiringIcon.svg",
    title: "Hidden Opportunities",
    description: "Access exclusive job openings before they go public"
  },
  {
    icon: "/static/communityPage/networkIcon.svg",
    title: "Professional Network",
    description: "Connect with like-minded peers and expand your reach"
  },
  {
    icon: "/static/communityPage/earlyAccess.svg",
    title: "Early Access",
    description: "Try new AiPply features before official release"
  }
];

const DashboardCommunityPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Simulate loading for consistency with other dashboard pages
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Loading shimmer component
  const CommunityShimmer = () => (
    <div className="flex flex-col gap-6">
      <div className="animate-pulse">
        <div className="h-12 bg-[#454545] rounded mb-2 w-64"></div>
        <div className="h-4 bg-[#454545] rounded w-96"></div>
      </div>
      <div className="animate-pulse">
        <div className="h-80 bg-[#454545] rounded-xl"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-48 bg-[#454545] rounded-lg"></div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <Head>
        <title>Community - Aipply</title>
        <meta name="description" content="Join the AiPply community for exclusive job tips, networking, and early access." />
      </Head>
      <SidebarProvider style={{ "--sidebar-width": "19rem" } as React.CSSProperties}>
        <AppSidebar />
        
        <SidebarInset>
          <div className="flex flex-1 flex-col gap-4 p-4 relative bg-[#020218] text-white">
            {loading ? (
              <CommunityShimmer />
            ) : (
              <div className="flex flex-col gap-6">
                {/* Header Section - matches home page pattern */}
                <div className="gap-3">
                  <h1 className="font-inter text-[#ECECED] font-bold text-[40px]">
                    Community
                  </h1>
                  <p className="font-inter text-[#F5F5F6] text-text-sm-semibold">
                    Join our exclusive community for insider tips, networking, and early access to new features.
                  </p>
                </div>

                {/* Hero Image Section */}
                <div className="relative w-full h-[400px] rounded-xl overflow-hidden border border-[#454545]">
                  <Image
                    src="/static/images/community.png"
                    alt="Community hero"
                    fill={true}
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-8 left-8 right-8">
                    <h2 className="font-inter font-bold text-[32px] text-white mb-2">
                      Exclusive Community.
                    </h2>
                    <h2 className="font-inter font-bold text-[32px] text-white mb-4">
                      Exclusive Support.
                    </h2>
                    <Link href="https://www.tinyurl.com/aipplyjobcommunity" target="_blank" rel="noopener noreferrer">
                      <button className="font-inter font-bold text-[16px] border-[#5D29FF] text-white border rounded-full px-6 py-3 bg-gradient-to-r from-[#52A9FF] to-[#5D29FF] hover:from-[#4A9FEF] hover:to-[#5323EF] transition-all duration-200">
                        Join the AiPply Community
                      </button>
                    </Link>
                  </div>
                </div>

                {/* What's Inside Section */}
                <div>
                  <h2 className="text-display-xs-semibold font-inter mb-6">
                    What's Inside
                  </h2>

                  {/* Grid Layout for community features */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {whatsInsideData.map((item, index) => (
                      <div
                        key={index}
                        className="bg-[#111111] border border-[#454545] rounded-lg p-6 hover:border-[#5D29FF] transition-colors duration-200"
                      >
                        <div className="relative w-full h-[180px] rounded-lg overflow-hidden mb-4">
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill={true}
                            className="object-cover"
                          />
                        </div>
                        <h3 className="font-inter text-[#ECECED] font-semibold text-[18px] mb-3">
                          {item.title}
                        </h3>
                        <p className="font-inter text-[#94969C] text-[14px] font-normal leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Benefits Grid - Similar to home page dashboard cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {communityBenefits.map((benefit, index) => (
                    <div 
                      key={index}
                      className="bg-[#111111] border border-[#454545] rounded-lg p-6 text-center hover:border-[#5D29FF] transition-colors duration-200"
                    >
                      <div className="bg-[#020218] p-4 rounded-full w-fit mx-auto mb-4">
                        <Image
                          src={benefit.icon}
                          alt={benefit.title}
                          width={32}
                          height={32}
                        />
                      </div>
                      <h4 className="font-inter text-[#ECECED] font-semibold text-[16px] mb-2">
                        {benefit.title}
                      </h4>
                      <p className="font-inter text-[#94969C] text-[14px] leading-relaxed">
                        {benefit.description}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Recommended Actions Section - Similar to home page */}
                <div>
                  <div className="flex flex-col gap-6">
                    <h2 className="text-display-xs-semibold font-inter">
                      Get Started
                    </h2>
                    <div className="flex flex-row justify-between w-[80%]">
                      <div className="flex flex-row items-start gap-4">
                        <Image
                          src="/static/icons/layers-three.svg"
                          alt="Community"
                          width={40}
                          height={40}
                          className="border p-1 rounded-lg"
                        />
                        <div className="flex flex-col gap-2">
                          <h3 className="text-text-lg-semibold font-inter">
                            Join Our Community
                          </h3>
                          <p className="text-text-md-medium font-inter text-[#94969C]">
                            Connect with professionals and get exclusive access
                          </p>
                          <Link href="https://www.tinyurl.com/aipplyjobcommunity" target="_blank" rel="noopener noreferrer">
                            <button className="bg-background text-white border hover:bg-blue text-text-sm-medium w-fit font-inter px-4 py-2 rounded-md transition-colors duration-200">
                              Join Community
                            </button>
                          </Link>
                        </div>
                      </div>

                      <div className="flex flex-row items-start gap-4">
                        <Image
                          src="/static/icons/layers-three.svg"
                          alt="Support"
                          width={40}
                          height={40}
                          className="border p-1 rounded-lg"
                        />
                        <div className="flex flex-col gap-2">
                          <h3 className="text-text-lg-semibold font-inter">
                            Need Help?
                          </h3>
                          <p className="text-text-md-medium font-inter text-[#94969C]">
                            Get support from our community experts
                          </p>
                          <button className="bg-background text-white border hover:bg-blue text-text-sm-medium w-fit font-inter px-4 py-2 rounded-md transition-colors duration-200">
                            Get Help
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Final CTA */}
                <div className="text-center py-8">
                  <Link href="https://www.tinyurl.com/aipplyjobcommunity" target="_blank" rel="noopener noreferrer">
                    <button className="font-inter w-full md:w-[460px] font-bold text-[18px] border-[#5D29FF] text-white border rounded-full px-8 py-4 bg-gradient-to-r from-[#52A9FF] to-[#5D29FF] hover:from-[#4A9FEF] hover:to-[#5323EF] transition-all duration-200">
                      Join the AiPply Community Today
                    </button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </>
  );
};

export default DashboardCommunityPage;
