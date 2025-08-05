/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { usePathname } from "next/navigation";
import { ResponsivePageContainer } from "../responsivePageContainer/responsivePageContainer";
import { HamburgerMenu } from "./hamburgerMenu";
import { features } from "@/lib/staticData";
import { Button } from "@/components/ui/button";

const resources = [
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
}: {
  href: any;
  children: any;
  className?: string;
}) => {
  return (
    <Link href={href}>
      <div className={`text-white font-manrope ${className}`}>
        {children}
      </div>
    </Link>
  );
};

const Header = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isResourcesDropdownOpen, setIsResourcesDropdownOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [dropdownTimeout, setDropdownTimeout] = useState<NodeJS.Timeout | null>(null);
  const [resourcesTimeout, setResourcesTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (dropdownTimeout) clearTimeout(dropdownTimeout);
      if (resourcesTimeout) clearTimeout(resourcesTimeout);
    };
  }, [dropdownTimeout, resourcesTimeout]);

  if (!isMounted) return null;

  const handleDropdownEnter = () => {
    if (dropdownTimeout) {
      clearTimeout(dropdownTimeout);
      setDropdownTimeout(null);
    }
    // Close resources dropdown immediately when hovering features
    if (resourcesTimeout) {
      clearTimeout(resourcesTimeout);
      setResourcesTimeout(null);
    }
    setIsResourcesDropdownOpen(false);
    setIsDropdownOpen(true);
  };

  const handleDropdownLeave = () => {
    const timeout = setTimeout(() => {
      setIsDropdownOpen(false);
    }, 200);
    setDropdownTimeout(timeout);
  };

  const handleResourcesEnter = () => {
    if (resourcesTimeout) {
      clearTimeout(resourcesTimeout);
      setResourcesTimeout(null);
    }
    // Close features dropdown immediately when hovering resources
    if (dropdownTimeout) {
      clearTimeout(dropdownTimeout);
      setDropdownTimeout(null);
    }
    setIsDropdownOpen(false);
    setIsResourcesDropdownOpen(true);
  };

  const handleResourcesLeave = () => {
    const timeout = setTimeout(() => {
      setIsResourcesDropdownOpen(false);
    }, 200);
    setResourcesTimeout(timeout);
  };

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
  const toggleResourcesDropdown = () =>
    setIsResourcesDropdownOpen(!isResourcesDropdownOpen);

  return (
    <header className="flex flex-row w-full relative z-[9998]">
      <ResponsivePageContainer>
        <div className="flex flex-row justify-between">
          <Link href="/">
            <Image
              src={"/static/icons/aipplyLogo.svg"}
              alt="AiPly logo"
              width={121}
              height={41}
            />
          </Link>

          <div className="flex flex-row items-center gap-10">
            <nav className="flex items-center gap-10">
              <div
                className="relative hidden custom-md:flex"
                onMouseEnter={handleDropdownEnter}
                onMouseLeave={handleDropdownLeave}
              >
                <button
                  className="text-white flex items-center gap-1 px-4 py-3 rounded-lg hover:bg-white hover:bg-opacity-10 transition-colors duration-200"
                  onClick={toggleDropdown}
                >
                  <p className="text-white text-text-md-medium">
                    Features
                  </p>
                  <ChevronDownIcon className="w-[20px] h-[20px] text-white" />
                </button>
                
                {isDropdownOpen && (
                  <div
                    className="absolute z-[9999] bg-gradient-to-b from-[#4c4088] to-[#7030ca] shadow-lg rounded-lg border border-white border-opacity-[10%] top-full mt-1 left-1/2 transform -translate-x-1/2 w-[215px] grid w-grid-cols-1"
                    onMouseEnter={handleDropdownEnter}
                    onMouseLeave={handleDropdownLeave}
                  >
                    {features.map((feature, index) => (
                      <NavLink
                        key={index}
                        href={feature.redirectUrl}
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
                )}
              </div>

              <div
                className="relative hidden custom-md:flex"
                onMouseEnter={handleResourcesEnter}
                onMouseLeave={handleResourcesLeave}
              >
                <button
                  className="text-white items-center gap-1 flex px-4 py-3 rounded-lg hover:bg-white hover:bg-opacity-10 transition-colors duration-200"
                  onClick={toggleResourcesDropdown}
                >
                  <p className="text-white text-text-md-medium">
                    Resources
                  </p>
                  <ChevronDownIcon className="w-[20px] h-[20px] text-white" />
                </button>
                
                {isResourcesDropdownOpen && (
                  <div
                    className="absolute z-[9999] bg-gradient-to-b from-[#4c4088] to-[#7030ca] shadow-lg rounded-lg border border-white border-opacity-[10%] top-full mt-1 left-1/2 transform -translate-x-1/2 w-[275px] grid w-grid-cols-1"
                    onMouseEnter={handleResourcesEnter}
                    onMouseLeave={handleResourcesLeave}
                  >
                    {resources.map((resource, index) => (
                      <NavLink
                        key={index}
                        href={resource.redirectUrl}
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
                )}
              </div>
              <div className="hidden custom-md:flex flex-row gap-6">
                <Link href="/dashboard/onboarding/login">
                  <Button type="button" className="text-white">
                    Join Now
                  </Button>
                </Link>
              </div>
            </nav>
          </div>
        </div>
      </ResponsivePageContainer>
      <div className="custom-md:hidden block">
        <HamburgerMenu
          subPages={{ features: features, resources: resources }}
        />
      </div>
    </header>
  );
};

export default Header;
