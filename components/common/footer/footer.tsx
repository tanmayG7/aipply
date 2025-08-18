import React from "react";
import { ResponsivePageContainer } from "../responsivePageContainer/responsivePageContainer";
import Image from "next/image";
import Link from "next/link";
import { features } from "@/lib/staticData";
import { Icon } from "@/components/ui/Icon";

const quickLinks = [{ name: "About Us", path: "/about-us" },
                    { name: "Pricing", path: "/pricing" },
{ name: "Privacy Policy", path: "/privacy" },
{ name: "Terms and Conditions", path: "/terms" },
{ name: "Cancellation & Refund", path: "/refund" },
{ name: "Contact Us", path: "/contact-us" }];


const Footer = () => {
  return (
    <footer className="relative bg-[#0D0D0D] py-[88px]" role="contentinfo">
      {/* Fixed blur effect with lower z-index */}
      <div className="absolute w-[70%] h-[100px] bottom-[4px] left-1/2 transform -translate-x-1/2 bg-[#AE94FF] rounded-full blur-[100px] z-0"></div>
      
      {/* Content container with higher z-index */}
      <div className="relative z-10">
        <ResponsivePageContainer>
          <div className="flex flex-col custom-md:flex-row justify-between gap-10">
            <div className="flex flex-col gap-8">
              <Link 
                href="/"
                className="w-fit focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent rounded-md"
                aria-label="Go to homepage"
              >
                <Image
                  src={"/static/icons/aipplyLogo.svg"}
                  alt="AiPly logo"
                  width={121}
                  height={41}
                />
              </Link>

              <div className="flex flex-col gap-1">
                <p className="font-manrope text-[16px] text-[#CECFD2]">
                  Because Finding a Job is not YOUR Job!
                </p>
                <p className="font-manrope text-[16px] text-[#CECFD2] flex items-center gap-1">
                  It&apos;s Ours! <Icon name="smile" size={16} ariaLabel="Smile" inline />
                </p>
              </div>
              <div className="flex flex-row gap-6">
                <Link
                  href="https://www.instagram.com/aipply.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent rounded-md p-1 transition-transform duration-200 hover:scale-110"
                  aria-label="Follow us on Instagram (opens in new tab)"
                >
                  <Image
                    src={"/static/socialMediaIcons/instagram.svg"}
                    alt="Instagram"
                    width={24}
                    height={24}
                  />
                </Link>
                <Link
                  href="https://www.linkedin.com/company/aipply-io/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent rounded-md p-1 transition-transform duration-200 hover:scale-110"
                  aria-label="Connect with us on LinkedIn (opens in new tab)"
                >
                  <Image
                    src={"/static/socialMediaIcons/linkedin.svg"}
                    alt="LinkedIn"
                    width={24}
                    height={24}
                  />
                </Link>
              </div>
            </div>

            <div className="flex flex-col custom-lg:flex-row gap-10">
              <div className="grid grid-cols-1 custom-md:grid-cols-2 gap-10">
                <nav className="flex flex-col gap-6" role="navigation" aria-label="Quick links">
                  <h2 className="text-[25px] font-semibold font-manrope text-white">
                    Quick Links
                  </h2>
                  {quickLinks.map((link, index) => (
                    <Link 
                      key={index} 
                      href={link.path} 
                      className="relative z-10 font-manrope text-[16px] text-[#CECFD2] hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent rounded-sm w-fit"
                    >
                      {link.name}
                    </Link>
                  ))}
                </nav>

                <nav className="flex flex-col gap-6" role="navigation" aria-label="Features">
                  <h2 className="text-[25px] font-semibold font-manrope text-white">
                    Features
                  </h2>
                  {features.map((feature, index) => (
                    <Link 
                      key={index} 
                      href={feature.redirectUrl} 
                      className="relative z-10 font-manrope text-[16px] text-[#CECFD2] hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent rounded-sm w-fit"
                    >
                      {feature.name}
                    </Link>
                  ))}
                </nav>
              </div>

              <div className="flex flex-col gap-6">
                <h2 className="text-[25px] font-semibold font-manrope text-white">
                  Contact Us
                </h2>
                <address className="flex flex-col gap-6 w-full relative z-10 not-italic">
                  <p className="font-manrope text-[16px] text-[#CECFD2]">
                    Noida, Sector - 168
                  </p>
                  <a 
                    href="mailto:tanmaygarg01@gmail.com"
                    className="font-manrope text-[16px] text-[#CECFD2] hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent rounded-sm w-fit"
                    aria-label="Send email to tanmaygarg01@gmail.com"
                  >
                    tanmaygarg01@gmail.com
                  </a>
                  <a 
                    href="tel:+919999852132"
                    className="font-manrope text-[16px] text-[#CECFD2] hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent rounded-sm w-fit"
                    aria-label="Call +91 9999852132"
                  >
                    +91 9999852132
                  </a>
                </address>
              </div>
            </div>
          </div>
        </ResponsivePageContainer>
      </div>
    </footer>
  );
};

export default Footer;
