"use client";
import Footer from "@/components/common/footer/footer";
import Header from "@/components/common/header/header";
import { ResponsivePageContainer } from "@/components/common/responsivePageContainer/responsivePageContainer";
import ScrollToTopBtn from "@/components/common/scrollToTopBtn/scrollToTopBtn";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const AboutUsPage = () => {
  return (
    <div className="bg-[#000000] relative overflow-hidden">
      <div className="pt-7">
        <Header />
      </div>

      {/* Hero Section */}
      <ResponsivePageContainer>
        <div className="pt-[51px] relative">
          {/* Background blur - moved to prevent overlap */}
          <div className="absolute w-full h-[924px] top-[50px] left-1/2 transform -translate-x-1/2 bg-[#AE94FF] bg-opacity-50 blur-[280px] backdrop-blur-[400px] rounded-full -z-10"></div>
          
          <div className="relative z-10">
            <div className="px-4 custom-lg:px-[103px] text-center pt-[100px] pb-[80px]">
              <h1 className="font-manrope font-bold text-[40px] custom-md:text-[60px] leading-[120%] custom-md:leading-[160%] text-white mb-6">
                About Us
              </h1>
              <h2 className="font-manrope font-semibold text-[32px] custom-md:text-[40px] leading-[120%] text-[#52A9FF] mb-4">
                Job Seeking, Solved.
              </h2>
              <p className="font-manrope font-normal text-[18px] custom-md:text-[20px] leading-[160%] text-[#CECFD2] max-w-4xl mx-auto">
                Every day, millions of job seekers send out resumes into a void. They never hear back. The system's broken — and we're here to fix it.
              </p>
              <p className="font-manrope font-normal text-[18px] custom-md:text-[20px] leading-[160%] text-white mt-6 max-w-4xl mx-auto">
                <strong>AiPply</strong> is your AI-powered job-seeking copilot that automates job discovery, personalizes resumes, and applies on your behalf — so you can focus on showing up, not signing in.
              </p>
              <p className="font-manrope font-normal text-[18px] custom-md:text-[20px] leading-[160%] text-[#CECFD2] mt-6 max-w-4xl mx-auto">
                We're not building a tool. We're building a world where <strong className="text-[#52A9FF]">employees and employers have equal opportunity.</strong>
              </p>
            </div>
          </div>
        </div>
      </ResponsivePageContainer>

      {/* Mission Section */}
      <ResponsivePageContainer>
        <div className="pt-[100px] pb-[80px] relative">
          <div className="absolute z-0 w-full h-[818px] top-[100px] left-1/2 transform -translate-x-1/2 bg-[#AE94FF] bg-opacity-30 blur-[300px] backdrop-blur-[400px] rounded-full -z-10"></div>
          
          <div className="relative z-10 text-center">
            <h2 className="font-manrope text-[36px] custom-md:text-[48px] font-semibold leading-[160%] text-white mb-8">
              Our Mission
            </h2>
            <p className="font-manrope font-normal text-[20px] custom-md:text-[24px] leading-[160%] text-[#CECFD2] max-w-3xl mx-auto">
              To make job seeking less painful and more powerful — with AI, empathy, and execution.
            </p>
          </div>
        </div>
      </ResponsivePageContainer>

      {/* Story Section */}
      <ResponsivePageContainer>
        <div className="pt-[80px] pb-[80px] relative z-10">
          <div className="text-center">
            <h2 className="font-manrope text-[36px] custom-md:text-[48px] font-semibold leading-[160%] text-white mb-8">
              Our Story
            </h2>
            <div className="max-w-4xl mx-auto space-y-6">
              <p className="font-manrope font-normal text-[18px] custom-md:text-[20px] leading-[160%] text-[#CECFD2]">
                In 2025, frustrated by the way great candidates were being overlooked due to outdated systems and overwhelming processes, we decided to take action.
              </p>
              <div className="space-y-4">
                <p className="font-manrope font-normal text-[18px] custom-md:text-[20px] leading-[160%] text-white">
                  We asked:
                </p>
                <div className="space-y-2">
                  <p className="font-manrope font-normal text-[18px] custom-md:text-[20px] leading-[160%] text-[#52A9FF]">
                    👉 <em>What if applying to jobs didn't suck?</em>
                  </p>
                  <p className="font-manrope font-normal text-[18px] custom-md:text-[20px] leading-[160%] text-[#52A9FF]">
                    👉 <em>What if tech could bring speed, scale, and fairness to the job market?</em>
                  </p>
                </div>
              </div>
              <p className="font-manrope font-normal text-[18px] custom-md:text-[20px] leading-[160%] text-white">
                From that question, <strong className="text-[#52A9FF]">AiPply</strong> was born — a copilot that <strong>finds jobs, tailors resumes, and applies for you.</strong>
              </p>
              <p className="font-manrope font-normal text-[18px] custom-md:text-[20px] leading-[160%] text-[#CECFD2]">
                We're building fast, staying user-first, and focused on helping people get hired — globally.
              </p>
            </div>
          </div>
        </div>
      </ResponsivePageContainer>

      {/* Backed By Section */}
      <ResponsivePageContainer>
        <div className="pt-[80px] pb-[80px] relative z-10">
          <div className="text-center">
            <h2 className="font-manrope text-[36px] custom-md:text-[48px] font-semibold leading-[160%] text-white mb-12">
              Backed By
            </h2>
            <div className="flex flex-col custom-md:flex-row justify-center gap-8 custom-md:gap-12 items-center">
              <div className="bg-[#111111] p-8 rounded-[20px] border border-[#333741] flex flex-col items-center">
                <Image 
                  src="/static/images/google-logo.png" 
                  alt="Google for Startups" 
                  width={64}
                  height={64}
                  className="mb-4 object-contain"
                />
                <p className="font-manrope text-[18px] text-white font-semibold text-center">Google for Startup</p>
              </div>
              <div className="bg-[#111111] p-8 rounded-[20px] border border-[#333741] flex flex-col items-center">
                <Image 
                  src="/static/images/bits-conquest-logo.png" 
                  alt="BITS Conquest" 
                  width={64}
                  height={64}
                  className="mb-4 object-contain"
                />
                <p className="font-manrope text-[18px] text-white font-semibold text-center">BITS Conquest</p>
              </div>
              <div className="bg-[#111111] p-8 rounded-[20px] border border-[#333741] flex flex-col items-center">
                <Image 
                  src="/static/images/wadhwani-foundation-logo.png" 
                  alt="Wadhwani Foundation" 
                  width={64}
                  height={64}
                  className="mb-4 object-contain"
                />
                <p className="font-manrope text-[18px] text-white font-semibold text-center">Wadhwani Foundation</p>
              </div>
            </div>
          </div>
        </div>
      </ResponsivePageContainer>

      {/* Team Section */}
      <ResponsivePageContainer>
        <div className="pt-[80px] pb-[80px] relative">
          <div className="absolute z-0 w-full h-[600px] top-[0px] left-1/2 transform -translate-x-1/2 bg-[#AE94FF] bg-opacity-20 blur-[250px] backdrop-blur-[400px] rounded-full -z-10"></div>
          
          <div className="relative z-10 text-center">
            <h2 className="font-manrope text-[36px] custom-md:text-[48px] font-semibold leading-[160%] text-white mb-12">
              Meet the Team
            </h2>
            <div className="grid grid-cols-1 custom-md:grid-cols-2 gap-8 custom-md:gap-12 max-w-5xl mx-auto">
              {/* Tanmay Garg */}
              <div className="bg-[#111111] p-8 rounded-[30px] border border-[#333741]">
                <Image 
                  src="/static/images/tanmay-garg.jpg" 
                  alt="Tanmay Garg" 
                  width={96}
                  height={96}
                  className="mx-auto mb-6 rounded-full object-cover"
                />
                <h3 className="font-manrope text-[24px] font-bold text-white mb-2">Tanmay Garg</h3>
                <p className="font-manrope text-[18px] font-semibold text-[#52A9FF] mb-4">Co-Founder & CEO</p>
                <p className="font-manrope text-[16px] text-[#CECFD2] leading-[150%]">
                  <em>A marketing monk who used to dance.</em> 2X entrepreneur with 13 years of experience. Ex-AdPushup, Allevents, Artishus. Built a $230M ARR pipeline at AdPushup.
                </p>
              </div>
              
              {/* Disha Garg */}
              <div className="bg-[#111111] p-8 rounded-[30px] border border-[#333741]">
                <Image 
                  src="/static/images/disha-garg.jpg" 
                  alt="Disha Garg" 
                  width={96}
                  height={96}
                  className="mx-auto mb-6 rounded-full object-cover"
                />
                <h3 className="font-manrope text-[24px] font-bold text-white mb-2">Disha Garg</h3>
                <p className="font-manrope text-[18px] font-semibold text-[#52A9FF] mb-4">Co-Founder & CTO</p>
                <p className="font-manrope text-[16px] text-[#CECFD2] leading-[150%]">
                  Tech genius. Ex-1MG, Location Labs, Koovs. Currently building AiPply while raising a 6-month-old. ❤️
                </p>
              </div>
            </div>
          </div>
        </div>
      </ResponsivePageContainer>

      {/* Culture Section */}
      <ResponsivePageContainer>
        <div className="pt-[80px] pb-[80px] relative z-10">
          <div className="text-center">
            <h2 className="font-manrope text-[36px] custom-md:text-[48px] font-semibold leading-[160%] text-white mb-8">
              Remote First, Human Always
            </h2>
            <div className="max-w-4xl mx-auto space-y-6">
              <p className="font-manrope font-normal text-[18px] custom-md:text-[20px] leading-[160%] text-[#CECFD2]">
                We're a small, scrappy, all-remote team building for job seekers everywhere. We believe in rapid execution, human connection, and problem-solving at scale.
              </p>
              <p className="font-manrope font-bold text-[20px] custom-md:text-[24px] leading-[160%] text-[#52A9FF]">
                We're hiring! Reach out at careers@aipply.io
              </p>
            </div>
          </div>
        </div>
      </ResponsivePageContainer>

      {/* Values Section */}
      <ResponsivePageContainer>
        <div className="pt-[80px] pb-[80px] relative z-10">
          <div className="text-center">
            <h2 className="font-manrope text-[36px] custom-md:text-[48px] font-semibold leading-[160%] text-white mb-12">
              What We Believe In
            </h2>
            <div className="grid grid-cols-1 custom-md:grid-cols-2 custom-lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              <div className="bg-[#111111] p-6 rounded-[20px] border border-[#333741]">
                <p className="font-manrope text-[18px] text-white font-semibold">Speed {'>'}  Perfection</p>
              </div>
              <div className="bg-[#111111] p-6 rounded-[20px] border border-[#333741]">
                <p className="font-manrope text-[18px] text-white font-semibold">User-first, always</p>
              </div>
              <div className="bg-[#111111] p-6 rounded-[20px] border border-[#333741]">
                <p className="font-manrope text-[18px] text-white font-semibold">Transparency & trust</p>
              </div>
              <div className="bg-[#111111] p-6 rounded-[20px] border border-[#333741]">
                <p className="font-manrope text-[18px] text-white font-semibold">Fairness in opportunity</p>
              </div>
              <div className="bg-[#111111] p-6 rounded-[20px] border border-[#333741]">
                <p className="font-manrope text-[18px] text-white font-semibold">No fluff, just solutions</p>
              </div>
            </div>
          </div>
        </div>
      </ResponsivePageContainer>

      {/* Join the Movement Section */}
      <ResponsivePageContainer>
        <div className="pt-[80px] pb-[100px] relative z-10">
          <div className="text-center">
            <h2 className="font-manrope text-[36px] custom-md:text-[48px] font-semibold leading-[160%] text-white mb-12">
              Join the Movement
            </h2>
            <div className="flex flex-col custom-md:flex-row justify-center gap-6 custom-md:gap-8 items-center max-w-4xl mx-auto">
              <div className="bg-[#111111] p-6 rounded-[20px] border border-[#333741] flex-1">
                <p className="font-manrope text-[16px] text-[#CECFD2]">Newsletter – Coming Soon</p>
              </div>
              <Link href="https://tinyurl.com/aipplyjobcommunity" target="_blank" rel="noopener noreferrer" className="flex-1">
                <div className="bg-gradient-to-r from-[#52A9FF] to-[#5D29FF] p-6 rounded-[20px] border border-[#5D29FF] cursor-pointer hover:opacity-90 transition-opacity">
                  <p className="font-manrope text-[16px] text-white font-semibold">Join WhatsApp Community</p>
                </div>
              </Link>
              <div className="bg-[#111111] p-6 rounded-[20px] border border-[#333741] flex-1">
                <div className="flex items-center justify-center gap-4">
                <Link href="https://www.linkedin.com/company/aipply-io/" className="text-[#CECFD2] hover:text-[#52A9FF] transition-colors">
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
</Link>
<Link href="https://www.instagram.com/aipply.io/" className="text-[#CECFD2] hover:text-[#52A9FF] transition-colors">
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
</Link>
                </div>
                <p className="font-manrope text-[16px] text-[#CECFD2] mt-2">Follow us on Social Media</p>
              </div>
            </div>
          </div>
        </div>
      </ResponsivePageContainer>

      <Footer />
      <ScrollToTopBtn />
    </div>
  );
};

export default AboutUsPage;
