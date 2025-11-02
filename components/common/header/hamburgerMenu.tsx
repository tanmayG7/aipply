"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { Transition } from "@headlessui/react";
import Link from "next/link";
import Image from "next/image";
import {
  XMarkIcon,
  ChevronDownIcon,
  Bars3Icon,
} from "@heroicons/react/24/outline";
import { usePathname } from "next/navigation";
export const HamburgerMenu = ({
  subPages,
  scrolled,
}: {
  subPages: { [key: string]: { name: string; redirectUrl: string }[] };
  scrolled?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerButtonRef = useRef<HTMLButtonElement>(null);
  const firstFocusableRef = useRef<HTMLButtonElement>(null);

  // Helper function to check if path is active
  const isActiveLink = useCallback((path: string, basePath?: string) => {
    if (basePath) {
      return pathname.startsWith(basePath);
    }
    return pathname === path;
  }, [pathname]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const toggleSection = (key: string) => {
    setActiveSection((prevSection) => (prevSection === key ? null : key));
  };

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
    setActiveSection(null);
  }, [pathname]);

  // Handle body scroll lock and focus management
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("overflow-hidden");
      
      // Focus first focusable element when menu opens
      setTimeout(() => {
        if (firstFocusableRef.current) {
          firstFocusableRef.current.focus();
        }
      }, 100);
    } else {
      document.body.classList.remove("overflow-hidden");
      
      // Return focus to trigger button when menu closes
      if (triggerButtonRef.current) {
        triggerButtonRef.current.focus();
      }
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [isOpen]);

  // Focus trap functionality
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        return;
      }

      if (event.key === 'Tab') {
        const focusableElements = menuRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (!focusableElements?.length) return;
        
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
        
        if (event.shiftKey && document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        } else if (!event.shiftKey && document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <div className="flex custom-md:hidden">
      <button
        ref={triggerButtonRef}
        onClick={toggleMenu}
        className="text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent rounded-md p-2 transition-colors duration-200 hover:bg-white/10"
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-expanded={isOpen}
        aria-controls="mobile-menu"
      >
        <Bars3Icon
          className={`h-8 w-8 ${scrolled ? "text-white" : "text-white"}`}
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
        <div 
          id="mobile-menu"
          ref={menuRef}
          className="fixed flex flex-col w-full inset-0 bg-gradient-to-b from-[#020217] from-80% to-[#9164CF] z-[10000] min-h-screen pt-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="mobile-menu-title"
        >
          {/* Invisible overlay for click-to-close */}
          <div 
            className="absolute inset-0 bg-transparent"
            onClick={toggleMenu}
            aria-hidden="true"
          />
          
          {/* Menu content */}
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex justify-between items-center p-4">
              <Link 
                href="/"
                className="focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent rounded-md"
                onClick={toggleMenu}
              >
                <Image
                  src={"/static/icons/aipplyLogo.svg"}
                  alt="AiPly logo"
                  width={121}
                  height={41}
                />
              </Link>
              <button
                ref={firstFocusableRef}
                onClick={toggleMenu}
                className="text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent rounded-md p-2 transition-colors duration-200 hover:bg-white/10"
                aria-label="Close menu"
              >
                <XMarkIcon className="h-8 w-8 text-white" />
              </button>
            </div>
            <div className="border border-white border-opacity-10" />
            <nav 
              className="flex flex-col py-4 overflow-y-auto gap-8 h-full bg-gradient-to-b from-[#020217] to-[#9164CF] px-4 custom-sm:px-12 z-[999] relative flex-grow pt-8"
              role="navigation"
              aria-label="Mobile navigation"
            >
              <h2 id="mobile-menu-title" className="sr-only">Main Menu</h2>
              
              <div className="flex flex-col gap-8">
                {Object.keys(subPages).map((key) => (
                  <div key={key} className="group">
                    <div className="flex flex-row items-center justify-between">
                      <button
                        onClick={() => toggleSection(key)}
                        className="text-white font-manrope leading-[160%] text-[16px] font-[500] w-full text-left py-2 px-2 rounded-md focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent transition-colors duration-200 hover:bg-white/10"
                        aria-expanded={activeSection === key}
                        aria-controls={`${key}-submenu`}
                      >
                        {key.charAt(0).toUpperCase() +
                          key.slice(1).replace(/-/g, " ")}
                      </button>
                      <ChevronDownIcon 
                        className={`h-4 w-4 text-white transition-transform duration-200 ${
                          activeSection === key ? 'rotate-180' : ''
                        }`} 
                      />
                    </div>

                    <Transition
                      show={activeSection === key}
                      enter="transition-max-height ease-in-out duration-300"
                      enterFrom="max-h-0 overflow-hidden"
                      enterTo="max-h-[1000px] overflow-hidden"
                      leave="transition-max-height ease-in-out duration-300"
                      leaveFrom="max-h-[1000px] overflow-hidden"
                      leaveTo="max-h-0 overflow-hidden"
                    >
                      <div
                        id={`${key}-submenu`}
                        className="px-4 mt-4 overflow-hidden gap-2 rounded-xl border-[1px] border-white border-opacity-15 py-4 w-full"
                        style={{
                          boxShadow:
                            "0px 2px 4px -2px rgba(16, 24, 40, 0.06), 0px 4px 8px -2px rgba(16, 24, 40, 0.1)",
                        }}
                        role="menu"
                        aria-orientation="vertical"
                      >
                        {subPages[key].map((subPage) => (
                          <Link
                            key={subPage.redirectUrl}
                            href={subPage.redirectUrl}
                            className={`block text-white font-manrope leading-[160%] text-[16px] font-[500] text-base py-4 px-4 rounded-[8px] cursor-pointer transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent hover:text-black hover:bg-blue active:bg-blue active:text-white ${
                              isActiveLink(subPage.redirectUrl, key === 'resources' ? '/resources' : undefined) 
                                ? 'bg-white/20 font-semibold' 
                                : ''
                            }`}
                            onClick={toggleMenu}
                            role="menuitem"
                          >
                            {subPage.name}
                          </Link>
                        ))}
                      </div>
                    </Transition>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-4 mt-8 pt-8 border-t border-white/20">
                <Link
                  href="/dashboard/onboarding/login"
                  className="text-white font-manrope leading-[160%] text-[16px] font-[500] w-full text-center py-3 px-4 rounded-md transition-colors duration-200 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent border border-white/20"
                  onClick={toggleMenu}
                >
                  Join Now
                </Link>
              </div>
            </nav>
          </div>
        </div>
      </Transition>
    </div>
  );
};
