"use client";
import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { ResponsivePageContainer } from "../responsivePageContainer/responsivePageContainer";
import { HamburgerMenu } from "./hamburgerMenu";
import { features } from "@/lib/staticData";
import { Button } from "@/components/ui/button";

const resources = [
  {
    name: "Professional CV Services",
    redirectUrl: "/cv-services",
  },
  {
    name: "Smart Resume Analysis",
    redirectUrl: "/resume-analysis",
  },
  {
    name: "Linkedin Optimization Template",
    redirectUrl: "/resources/LinkedIn",
  },
  {
    name: "ATS Friendly CV Template",
    redirectUrl: "/resources/ats",
  },
  { name: "Tips for Interview", redirectUrl: "/resources/interview" },
];

const NavLink = ({
  href,
  children,
  className = "",
  isActive = false,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  isActive?: boolean;
  onClick?: () => void;
}) => {
  return (
    <Link 
      href={href} 
      className={`text-white font-manrope transition-colors duration-200 hover:text-white/80 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent rounded-md ${isActive ? 'text-white font-semibold' : ''} ${className}`}
      aria-current={isActive ? "page" : undefined}
      onClick={onClick}
    >
      {children}
    </Link>
  );
};

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  // Scroll detection for sticky header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActiveLink = useCallback((path: string, basePath?: string) => {
    if (basePath) {
      return pathname.startsWith(basePath);
    }
    return pathname === path;
  }, [pathname]);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 w-full z-[9998] transition-all duration-300 ${
        isScrolled ? 'bg-black/90 backdrop-blur-md shadow-lg' : 'bg-transparent'
      }`}
      role="banner"
    >
      <ResponsivePageContainer>
        <div className="flex flex-row justify-between items-center py-4">
          <Link 
            href="/"
            className="focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent rounded-md"
            aria-label="Go to homepage"
          >
            <Image
              src={"/static/icons/aipplyLogo.svg"}
              alt="AiPly logo"
              width={121}
              height={41}
              priority
            />
          </Link>

          <div className="flex flex-row items-center gap-10">
            <nav 
              className="flex items-center gap-10"
              role="navigation"
              aria-label="Main navigation"
            >
              {/* --- FEATURES DROPDOWN (PURE CSS HOVER + ANIMATION) --- */}
              <div className="relative hidden custom-md:flex group h-full py-3">
                <button
                  className="text-white flex items-center gap-1 px-4 py-2 rounded-lg group-hover:bg-white group-hover:bg-opacity-10 transition-colors duration-200 focus:outline-none"
                  type="button"
                >
                  <span className="text-white text-text-md-medium">Features</span>
                  <ChevronDownIcon className="w-[20px] h-[20px] text-white transition-transform duration-200 group-hover:rotate-180" />
                </button>
                
                {/* Tailwind handles display/hiding via `opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto`.
                  Framer motion handles the physical sliding transition seamlessly.
                */}
                <div className="absolute z-[9999] top-full left-1/2 w-[215px] pt-2 -translate-x-1/2 transform opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 ease-out origin-top group-hover:translate-y-0 translate-y-2">
                  <div className="bg-gradient-to-b from-[#4c4088] to-[#7030ca] shadow-lg rounded-lg border border-white border-opacity-[10%]">
                    {features.map((feature, index) => (
                      <NavLink
                        key={feature.redirectUrl}
                        href={feature.redirectUrl}
                        isActive={isActiveLink(feature.redirectUrl)}
                        className={`block p-4 font-manrope text-[16px] leading-[160%] font-[500] text-white hover:bg-white hover:bg-opacity-15 active:bg-white active:bg-opacity-20 transition-colors duration-150 ${
                          index !== features.length - 1
                            ? "border-b border-white border-opacity-20"
                            : ""
                        } ${index === 0 ? "rounded-t-lg" : ""} ${
                          index === features.length - 1 ? "rounded-b-lg" : ""
                        }`}
                      >
                        {feature.name}
                      </NavLink>
                    ))}
                  </div>
                </div>
              </div>

              {/* --- RESOURCES DROPDOWN (PURE CSS HOVER + ANIMATION) --- */}
              <div className="relative hidden custom-md:flex group h-full py-3">
                <button
                  className="text-white flex items-center gap-1 px-4 py-2 rounded-lg group-hover:bg-white group-hover:bg-opacity-10 transition-colors duration-200 focus:outline-none"
                  type="button"
                >
                  <span className="text-white text-text-md-medium">Resources</span>
                  <ChevronDownIcon className="w-[20px] h-[20px] text-white transition-transform duration-200 group-hover:rotate-180" />
                </button>
                
                <div className="absolute z-[9999] top-full left-1/2 w-[275px] pt-2 -translate-x-1/2 transform opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 ease-out origin-top group-hover:translate-y-0 translate-y-2">
                  <div className="bg-gradient-to-b from-[#4c4088] to-[#7030ca] shadow-lg rounded-lg border border-white border-opacity-[10%]">
                    {resources.map((resource, index) => (
                      <NavLink
                        key={resource.redirectUrl}
                        href={resource.redirectUrl}
                        isActive={isActiveLink(resource.redirectUrl, "/resources")}
                        className={`block p-4 text-white font-manrope leading-[160%] text-[16px] font-[500] hover:bg-white hover:bg-opacity-15 active:bg-white active:bg-opacity-20 transition-colors duration-150 ${
                          index !== resources.length - 1
                            ? "border-b border-white border-opacity-20"
                            : ""
                        } ${index === 0 ? "rounded-t-lg" : ""} ${
                          index === resources.length - 1 ? "rounded-b-lg" : ""
                        }`}
                      >
                        {resource.name}
                      </NavLink>
                    ))}
                  </div>
                </div>
              </div>

              <div className="hidden custom-md:flex flex-row gap-6">
                <Link 
                  href="/dashboard/onboarding/login"
                  className="focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent rounded-md"
                >
                  <Button type="button" className="text-white hover:bg-white/10 transition-colors duration-200">
                    Join Now
                  </Button>
                </Link>
              </div>
            </nav>
          </div>
        </div>
      </ResponsivePageContainer>
      <div className="custom-md:hidden block absolute top-0 right-0 p-4">
        <HamburgerMenu
          subPages={{ features: features, resources: resources }}
          scrolled={isScrolled}
        />
      </div>
    </header>
  );
};

export default Header;
