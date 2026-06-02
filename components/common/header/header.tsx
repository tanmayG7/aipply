"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
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

// Premium ultra-snappy GitHub easing variants
const dropdownVariants = {
  hidden: { 
    opacity: 0, 
    y: 8, 
    scale: 0.97,
    pointerEvents: "none" as const,
    transition: { duration: 0.1, ease: "easeInOut" }
  },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    pointerEvents: "auto" as const,
    transition: {
      duration: 0.15,
      ease: [0.16, 1, 0.3, 1] // GitHub ease-out curve
    }
  }
};

const Header = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isResourcesDropdownOpen, setIsResourcesDropdownOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const pathname = usePathname();
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
    setIsDropdownOpen(false);
    setIsResourcesDropdownOpen(false);
  }, [pathname]);

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

  const isActiveLink = useCallback((path: string, basePath?: string) => {
    if (basePath) {
      return pathname.startsWith(basePath);
    }
    return pathname === path;
  }, [pathname]);

  if (!isMounted) return null;

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
              {/* Features Trigger Box */}
              <div
                ref={featuresDropdownRef}
                className="relative hidden custom-md:flex"
                onMouseEnter={() => {
                  setIsResourcesDropdownOpen(false);
                  setIsDropdownOpen(true);
                }}
                onMouseLeave={() => setIsDropdownOpen(false)}
              >
                <button
                  className="text-white flex items-center gap-1 px-4 py-3 rounded-lg hover:bg-white hover:bg-opacity-10 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent"
                  aria-expanded={isDropdownOpen}
                  aria-controls="features-dropdown"
                  aria-haspopup="true"
                >
                  <span className="text-white text-text-md-medium">Features</span>
                  <ChevronDownIcon 
                    className={`w-[20px] h-[20px] text-white transition-transform duration-200 ${
                      isDropdownOpen ? 'rotate-180' : ''
                    }`} 
                  />
                </button>
                
                {/* Framer motion list panel */}
                <motion.div
                  id="features-dropdown"
                  variants={dropdownVariants}
                  initial="hidden"
                  animate={isDropdownOpen ? "visible" : "hidden"}
                  className="absolute z-[9999] top-full left-1/2 w-[215px] pt-2 origin-top -translate-x-1/2"
                  role="menu"
                  aria-orientation="vertical"
                >
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
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        {feature.name}
                      </NavLink>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Resources Trigger Box */}
              <div
                ref={resourcesDropdownRef}
                className="relative hidden custom-md:flex"
                onMouseEnter={() => {
                  setIsDropdownOpen(false);
                  setIsResourcesDropdownOpen(true);
                }}
                onMouseLeave={() => setIsResourcesDropdownOpen(false)}
              >
                <button
                  className="text-white items-center gap-1 flex px-4 py-3 rounded-lg hover:bg-white hover:bg-opacity-10 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent"
                  aria-expanded={isResourcesDropdownOpen}
                  aria-controls="resources-dropdown"
                  aria-haspopup="true"
                >
                  <span className="text-white text-text-md-medium">Resources</span>
                  <ChevronDownIcon 
                    className={`w-[20px] h-[20px] text-white transition-transform duration-200 ${
                      isResourcesDropdownOpen ? 'rotate-180' : ''
                    }`} 
                  />
                </button>
                
                <motion.div
                  id="resources-dropdown"
                  variants={dropdownVariants}
                  initial="hidden"
                  animate={isResourcesDropdownOpen ? "visible" : "hidden"}
                  className="absolute z-[9999] top-full left-1/2 w-[275px] pt-2 origin-top -translate-x-1/2"
                  role="menu"
                  aria-orientation="vertical"
                >
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
                        onClick={() => setIsResourcesDropdownOpen(false)}
                      >
                        {resource.name}
                      </NavLink>
                    ))}
                  </div>
                </motion.div>
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
