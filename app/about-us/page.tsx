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
    <div className="bg-[#000000]">
      <div className="pt-7">
        <Header />
      </div>

      {/* Hero Section */}
      <ResponsivePageContainer>
        <div className="pt-[51px]">
          <div className="absolute w-full h-[924px] top-[135px] left-1/2 transform -translate-x-1/2 bg-[#AE94FF] bg-opacity-50 blur-[280px] backdrop-blur-[400px] rounded-full"></div>
          <div className="relative">
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
          <div className="absolute z-0 w-full h-[818px] top-[200px] left-1/2 transform -translate-x-1/2 bg-[#AE94FF] bg-opacity-30 blur-[300px] backdrop-blur-[400px] rounded-full"></div>
          
          <div className="relative z-10 text-center">
            <h2 className="font-manrope text-[36px] custom-md:text-[48px] font-semibold leading-[160%] text-white mb-8">
              🎯 Our Mission
            </h2>
            <p className="font-manrope font-normal text-[20px] custom-md:text-[24px] leading-[160%] text-[#CECFD2] max-w-3xl mx-auto">
              To make job seeking less painful and more powerful — with AI, empathy, and execution.
            </p>
          </div>
        </div>
      </ResponsivePageContainer>

      {/* Story Section */}
      <ResponsivePageContainer>
        <div className="pt-[80px] pb-[80px]">
          <div className="text-center">
            <h2 className="font-manrope text-[36px] custom-md:text-[48px] font-semibold leading-[160%] text-white mb-8">
              🚀 Our Story
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
        <div className="pt-[80px] pb-[80px]">
          <div className="text-center">
            <h2 className="font-manrope text-[36px] custom-md:text-[48px] font-semibold leading-[160%] text-white mb-12">
              🔥 Backed By
            </h2>
            <div className="flex flex-col custom-md:flex-row justify-center gap-8 custom-md:gap-12 items-center">
              <div className="bg-[#111111] p-8 rounded-[20px] border border-[#333741]">
                <p className="font-manrope text-[18px] text-white font-semibold">Google for Startups Accelerator</p>
              </div>
              <div className="bg-[#111111] p-8 rounded-[20px] border border-[#333741]">
                <p className="font-manrope text-[18px] text-white font-semibold">BITS Conquest</p>
              </div>
              <div className="bg-[#111111] p-8 rounded-[20px] border border-[#333741]">
                <p className="font-manrope text-[18px] text-white font-semibold">Wadhwani Foundation</p>
              </div>
            </div>
          </div>
        </div>
      </ResponsivePageContainer>

      {/* Team Section */}
      <ResponsivePageContainer>
        <div className="pt-[80px] pb-[80px] relative">
          <div className="absolute z-0 w-full h-[600px] top-[100px] left-1/2 transform -translate-x-1/2 bg-[#AE94FF] bg-opacity-20 blur-[250px] backdrop-blur-[400px] rounded-full"></div>
          
          <div className="relative z-10 text-center">
            <h2 className="font-manrope text-[36px] custom-md:text-[48px] font-semibold leading-[160%] text-white mb-12">
              👥 Meet the Team
            </h2>
            <div className="grid grid-cols-1 custom-md:grid-cols-2 gap-8 custom-md:gap-12 max-w-5xl mx-auto">
              {/* Tanmay Garg */}
              <div className="bg-[#111111] p-8 rounded-[30px] border border-[#333741]">
                <h3 className="font-manrope text-[24px] font-bold text-white mb-2">Tanmay Garg</h3>
                <p className="font-manrope text-[18px] font-semibold text-[#52A9FF] mb-4">Co-Founder & CEO</p>
                <p className="font-manrope text-[16px] text-[#CECFD2] leading-[150%]">
                  <em>A marketing monk who used to dance.</em> 2X entrepreneur with 13 years of experience. Ex-AdPushup, Allevents, Artishus. Built a $230M ARR pipeline at AdPushup.
                </p>
              </div>
              
              {/* Disha Garg */}
              <div className="bg-[#111111] p-8 rounded-[30px] border border-[#333741]">
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
        <div className="pt-[80px] pb-[80px]">
          <div className="text-center">
            <h2 className="font-manrope text-[36px] custom-md:text-[48px] font-semibold leading-[160%] text-white mb-8">
              🌍 Remote First, Human Always
            </h2>
            <div className="max-w-4xl mx-auto space-y-6">
              <p className="font-manrope font-normal text-[18px] custom-md:text-[20px] leading-[160%] text-[#CECFD2]">
                We're a small, scrappy, all-remote team building for job seekers everywhere. We believe in rapid execution, human connection, and problem-solving at scale.
              </p>
              <p className="font-manrope font-bold text-[20px] custom-md:text-[24px] leading-[160%] text-[#52A9FF]">
                💼 We're hiring! Reach out at hello@aipply.io
              </p>
            </div>
          </div>
        </div>
      </ResponsivePageContainer>

      {/* Values Section */}
      <ResponsivePageContainer>
        <div className="pt-[80px] pb-[80px]">
          <div className="text-center">
            <h2 className="font-manrope text-[36px] custom-md:text-[48px] font-semibold leading-[160%] text-white mb-12">
              🧠 What We Believe In
            </h2>
            <div className="grid grid-cols-1 custom-md:grid-cols-2 custom-lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              <div className="bg-[#111111] p-6 rounded-[20px] border border-[#333741]">
                <p className="font-manrope text-[18px] text-white font-semibold">⚡ Speed > Perfection</p>
              </div>
              <div className="bg-[#111111] p-6 rounded-[20px] border border-[#333741]">
                <p className="font-manrope text-[18px] text-white font-semibold">👥 User-first, always</p>
              </div>
              <div className="bg-[#111111] p-6 rounded-[20px] border border-[#333741]">
                <p className="font-manrope text-[18px] text-white font-semibold">🤝 Transparency & trust</p>
              </div>
              <div className="bg-[#111111] p-6 rounded-[20px] border border-[#333741]">
                <p className="font-manrope text-[18px] text-white font-semibold">🌍 Fairness in opportunity</p>
              </div>
              <div className="bg-[#111111] p-6 rounded-[20px] border border-[#333741]">
                <p className="font-manrope text-[18px] text-white font-semibold">🧰 No fluff, just solutions</p>
              </div>
            </div>
          </div>
        </div>
      </ResponsivePageContainer>

      {/* Join the Movement Section */}
      <ResponsivePageContainer>
        <div className="pt-[80px] pb-[100px]">
          <div className="text-center">
            <h2 className="font-manrope text-[36px] custom-md:text-[48px] font-semibold leading-[160%] text-white mb-12">
              📢 Join the Movement
            </h2>
            <div className="flex flex-col custom-md:flex-row justify-center gap-6 custom-md:gap-8 items-center max-w-4xl mx-auto">
              <div className="bg-[#111111] p-6 rounded-[20px] border border-[#333741] flex-1">
                <p className="font-manrope text-[16px] text-[#CECFD2]">📩 Newsletter – Coming Soon</p>
              </div>
              <Link href="https://tinyurl.com/aipplyjobcommunity" target="_blank" rel="noopener noreferrer" className="flex-1">
                <div className="bg-gradient-to-r from-[#52A9FF] to-[#5D29FF] p-6 rounded-[20px] border border-[#5D29FF] cursor-pointer hover:opacity-90 transition-opacity">
                  <p className="font-manrope text-[16px] text-white font-semibold">💬 Join WhatsApp Community</p>
                </div>
              </Link>
              <div className="bg-[#111111] p-6 rounded-[20px] border border-[#333741] flex-1">
                <p className="font-manrope text-[16px] text-[#CECFD2]">📲 Follow us on Social Media</p>
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
