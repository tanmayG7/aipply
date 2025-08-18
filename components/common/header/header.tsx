/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { usePathname, useRouter } from "next/navigation";
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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isResourcesDropdownOpen, setIsResourcesDropdownOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [dropdownTimeout, setDropdownTimeout] = useState<NodeJS.Timeout | null>(null);
  const [resourcesTimeout, setResourcesTimeout] = useState<NodeJS.Timeout | null>(null);
  
  const pathname = usePathname();
  const router = useRouter();
  const featuresDropdownRef = useRef<HTMLDivElement>(null);
  const resourcesDropdownRef = useRef<HTMLDivElement>(null);

  // Scroll detection for sticky header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Route change detection to close dropdowns
  useEffect(() => {
    const handleRouteChange = () => {
      setIsDropdownOpen(false);
      setIsResourcesDropdownOpen(false);
      if (dropdownTimeout) clearTimeout(dropdownTimeout);
      if (resourcesTimeout) clearTimeout(resourcesTimeout);
    };

    handleRouteChange(); // Close on initial load
  }, [pathname, dropdownTimeout, resourcesTimeout]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (featuresDropdownRef.current && !featuresDropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (resourcesDropdownRef.current && !resourcesDropdownRef.current.contains(event.target as Node)) {
        setIsResourcesDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
        setIsResourcesDropdownOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

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

  // Helper function to check if path is active
  const isActiveLink = useCallback((path: string, basePath?: string) => {
    if (basePath) {
      return pathname.startsWith(basePath);
    }
    return pathname === path;
  }, [pathname]);

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
    }, 150);
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
    }, 150);
    setResourcesTimeout(timeout);
  };

  const handleDropdownClick = () => {
    if (dropdownTimeout) {
      clearTimeout(dropdownTimeout);
      setDropdownTimeout(null);
    }
    if (resourcesTimeout) {
      clearTimeout(resourcesTimeout);
      setResourcesTimeout(null);
    }
    setIsResourcesDropdownOpen(false);
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleResourcesClick = () => {
    if (resourcesTimeout) {
      clearTimeout(resourcesTimeout);
      setResourcesTimeout(null);
    }
    if (dropdownTimeout) {
      clearTimeout(dropdownTimeout);
      setDropdownTimeout(null);
    }
    setIsDropdownOpen(false);
    setIsResourcesDropdownOpen(!isResourcesDropdownOpen);
  };

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
              <div
                ref={featuresDropdownRef}
                className="relative hidden custom-md:flex"
                onMouseEnter={handleDropdownEnter}
                onMouseLeave={handleDropdownLeave}
              >
                <button
                  className="text-white flex items-center gap-1 px-4 py-3 rounded-lg hover:bg-white hover:bg-opacity-10 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent"
                  onClick={handleDropdownClick}
                  aria-expanded={isDropdownOpen}
                  aria-controls="features-dropdown"
                  aria-haspopup="true"
                >
                  <span className="text-white text-text-md-medium">
                    Features
                  </span>
                  <ChevronDownIcon 
                    className={`w-[20px] h-[20px] text-white transition-transform duration-200 ${
                      isDropdownOpen ? 'rotate-180' : ''
                    }`} 
                  />
                </button>
                
                {isDropdownOpen && (
                  <div
                    id="features-dropdown"
                    className="absolute z-[9999] bg-gradient-to-b from-[#4c4088] to-[#7030ca] shadow-lg rounded-lg border border-white border-opacity-[10%] top-full mt-1 left-1/2 transform -translate-x-1/2 w-[215px]"
                    onMouseEnter={handleDropdownEnter}
                    onMouseLeave={handleDropdownLeave}
                    role="menu"
                    aria-orientation="vertical"
                  >
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
                        onClick={() => {
                          setIsDropdownOpen(false);
                          if (dropdownTimeout) clearTimeout(dropdownTimeout);
                        }}
                      >
                        {feature.name}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>

              <div
                ref={resourcesDropdownRef}
                className="relative hidden custom-md:flex"
                onMouseEnter={handleResourcesEnter}
                onMouseLeave={handleResourcesLeave}
              >
                <button
                  className="text-white items-center gap-1 flex px-4 py-3 rounded-lg hover:bg-white hover:bg-opacity-10 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent"
                  onClick={handleResourcesClick}
                  aria-expanded={isResourcesDropdownOpen}
                  aria-controls="resources-dropdown"
                  aria-haspopup="true"
                >
                  <span className="text-white text-text-md-medium">
                    Resources
                  </span>
                  <ChevronDownIcon 
                    className={`w-[20px] h-[20px] text-white transition-transform duration-200 ${
                      isResourcesDropdownOpen ? 'rotate-180' : ''
                    }`} 
                  />
                </button>
                
                {isResourcesDropdownOpen && (
                  <div
                    id="resources-dropdown"
                    className="absolute z-[9999] bg-gradient-to-b from-[#4c4088] to-[#7030ca] shadow-lg rounded-lg border border-white border-opacity-[10%] top-full mt-1 left-1/2 transform -translate-x-1/2 w-[275px]"
                    onMouseEnter={handleResourcesEnter}
                    onMouseLeave={handleResourcesLeave}
                    role="menu"
                    aria-orientation="vertical"
                  >
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
                        onClick={() => {
                          setIsResourcesDropdownOpen(false);
                          if (resourcesTimeout) clearTimeout(resourcesTimeout);
                        }}
                      >
                        {resource.name}
                      </NavLink>
                    ))}
                  </div>
                )}
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
