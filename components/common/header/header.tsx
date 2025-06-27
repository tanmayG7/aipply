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
    name: "Linkedin Optimization Template",
    redirectUrl: "/resources/LinkedIn",
  },
  {
    name: "ATS Friendly CV Template",
    redirectUrl: "/resources/ats-friendly-resume",
  },
  { name: "Cover Letter Template", redirectUrl: "/resources/cover-latter" },
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
  const pathname = usePathname();

  return (
    <Link href={href}>
      <div
        className={`text-white font-manrope  ${
          pathname === href ? "bg-[#351c98] border-none rounded-lg" : ""
        } ${className}`}
      >
        {children}
      </div>
    </Link>
  );
};

const Header = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isResourcesDropdownOpen, setIsResourcesDropdownOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
  const toggleResourcesDropdown = () =>
    setIsResourcesDropdownOpen(!isResourcesDropdownOpen);

  return (
    <header className="flex flex-row w-full">
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
                className="relative hidden custom-md:flex "
                onMouseEnter={() => setIsDropdownOpen(true)}
                onMouseLeave={() => setIsDropdownOpen(false)}
              >
                <button
                  className={`text-white flex items-center gap-1`}
                  onClick={toggleDropdown}
                >
                  <p className={`text-white py-[15px] text-text-md-medium`}>
                    Features
                  </p>
                  <ChevronDownIcon className="w-[20px] h-[20px] text-white" />
                </button>
                {isDropdownOpen && (
                  <div
                    className="absolute z-20 bg-gradient-to-b from-[#4c4088] to-[#7030ca] shadow-lg rounded-lg border border-opacity-[10%] mt-12 left-1/2 transform -translate-x-1/2 w-[215px] grid w-grid-cols-1 "
                    onMouseEnter={() => setIsDropdownOpen(true)}
                    onMouseLeave={() => setIsDropdownOpen(false)}
                  >
                    {features.map((feature, index) => (
                      <NavLink
                        key={index}
                        href={feature.redirectUrl}
                        className={`block p-4 font-manrope text-[16px] leading-[160%] font-[500] text-white ${
                          index !== features.length - 1
                            ? "border-b border-[#8148979e]"
                            : ""
                        }`}
                      >
                        {feature.name}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>

              <div
                className="relative hidden custom-md:flex "
                onMouseEnter={() => setIsResourcesDropdownOpen(true)}
                onMouseLeave={() => setIsResourcesDropdownOpen(false)}
              >
                <button
                  className={`text-white items-center gap-1 flex `}
                  onClick={toggleResourcesDropdown}
                >
                  <p className={`text-white py-[15px] text-text-md-medium`}>
                    Resources
                  </p>
                  <ChevronDownIcon className="w-[20px] h-[20px] text-white" />
                </button>
                {isResourcesDropdownOpen && (
                  <div
                    className="absolute z-20 bg-gradient-to-b from-[#4c4088] to-[#7030ca] shadow-lg rounded-lg border border-opacity-[10%] mt-12 left-1/2 transform -translate-x-1/2 w-[275px] grid w-grid-cols-1"
                    onMouseEnter={() => setIsResourcesDropdownOpen(true)}
                    onMouseLeave={() => setIsResourcesDropdownOpen(false)}
                  >
                    {resources.map((resource, index) => (
                      <NavLink
                        key={index}
                        href={resource.redirectUrl}
                        className={`block p-4 text-white font-manrope leading-[160%] text-[16px] font-[500] ${
                          index !== resources.length - 1
                            ? "border-b border-[#2A6D5B]"
                            : ""
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
