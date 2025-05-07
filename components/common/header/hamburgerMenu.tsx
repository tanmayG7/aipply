"use client";
import { useState, useEffect } from "react";
import { Transition } from "@headlessui/react";
import Link from "next/link";
import Image from "next/image";
import {
  XMarkIcon,
  ChevronDownIcon,
  Bars3Icon,
} from "@heroicons/react/24/outline";
import { ResponsivePageContainer } from "@/components/common/responsivePageContainer/responsivePageContainer";

export const HamburgerMenu = ({
  subPages,
  scrolled,
}: {
  subPages: { [key: string]: { name: string; redirectUrl: string }[] };
  scrolled?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const toggleSection = (key: string) => {
    setActiveSection((prevSection) => (prevSection === key ? null : key));
  };

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [isOpen]);

  return (
    <ResponsivePageContainer>
      <div className="flex custom-md:hidden">
        <button
          onClick={toggleMenu}
          className="text-white focus:outline-none"
          aria-label="Open Menu"
        >
          <Bars3Icon
            className={`h-10 w-10 ${scrolled ? "text-white" : "text-white"}`}
          />
        </button>
        <Transition
          show={isOpen}
          enter="transition ease-in-out duration-300 transform"
          enterFrom="translate-x-full"
          enterTo="translate-x-0"
          leave="transition ease-in-out duration-300 transform"
          leaveFrom="translate-x-0"
          leaveTo="translate-x-full"
        >
          <div className="fixed flex flex-col w-full inset-0 bg-gradient-to-b from-[#020217] from-80% to-[#9164CF] z-50 min-h-screen pt-4">
            <div className="flex justify-between items-center p-4">
              <Link href="/">
                <Image
                  src={"/static/icons/aipplyLogo.svg"}
                  alt="AiPly logo"
                  width={121}
                  height={41}
                />
              </Link>
              <button
                onClick={toggleMenu}
                className="text-black focus:outline-none"
                aria-label="Close Menu"
              >
                <XMarkIcon className="h-8 w-8 mr-1 text-white" />
              </button>
            </div>
            <div className="border border-white border-opacity-10" />
            <nav className="flex flex-col py-4 overflow-y-auto gap-8 h-full bg-gradient-to-b from-[#020217] to-[#9164CF] px-4 custom-sm:px-12 z-[999] relative flex-grow pt-8">
              <div className="flex flex-col gap-8">
                {Object.keys(subPages).map((key) => (
                  <div key={key} className="group">
                    <div className="flex flex-row">
                      <button
                        onClick={() => toggleSection(key)}
                        className="text-white font-manrope leading-[160%] text-[16px] font-[500] w-full text-left"
                      >
                        {key.charAt(0).toUpperCase() +
                          key.slice(1).replace(/-/g, " ")}
                      </button>
                      <ChevronDownIcon className="h-4 w-4 text-white" />
                    </div>

                    <Transition
                      show={activeSection === key}
                      enter="transition-max-height ease-in-out duration-50"
                      enterFrom="max-h-0 overflow-hidden"
                      enterTo="max-h-[1000px] overflow-hidden"
                      leave="transition-max-height ease-in-out duration-50"
                      leaveFrom="max-h-[1000px] overflow-hidden"
                      leaveTo="max-h-0 overflow-hidden"
                    >
                      <div
                        className="px-4 mt-4 overflow-hidden gap-2 rounded-xl border-[1px] border-white border-opacity-15 py-4 w-full"
                        style={{
                          boxShadow:
                            "0px 2px 4px -2px rgba(16, 24, 40, 0.06), 0px 4px 8px -2px rgba(16, 24, 40, 0.1)",
                        }}
                      >
                        {subPages[key].map((subPage) => (
                          <Link
                            key={subPage.redirectUrl}
                            href={subPage.redirectUrl}
                            className="block text-white font-manrope leading-[160%] text-[16px] font-[500] text-base py-4 px-4 hover:text-black hover:bg-blue hover:rounded-[8px] cursor-pointer active:bg-blue active:text-white active:rounded-[8px]"
                            onClick={toggleMenu}
                          >
                            {subPage.name}
                          </Link>
                        ))}
                      </div>
                    </Transition>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-8">
                <Link href="/dashboard/onboarding/login">
                  <p className="text-white font-manrope leading-[160%] text-[16px] font-[500] w-full text-left">
                    Login
                  </p>
                </Link>
                <Link href="/dashboard/onboarding/profile-setup">
                  <p className="text-white font-manrope leading-[160%] text-[16px] font-[500] w-full text-left">
                    Sign up
                  </p>
                </Link>
              </div>
            </nav>
          </div>
        </Transition>
      </div>
    </ResponsivePageContainer>
  );
};
