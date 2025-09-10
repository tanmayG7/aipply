"use client";

import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <div className="relative mx-auto flex h-full min-h-[500px] flex-col items-center justify-center rounded-2xl border border-neutral-800/50 bg-gradient-to-br from-neutral-900/50 via-neutral-800/30 to-neutral-900/50 p-8 backdrop-blur-sm">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5"></div>
      <div className="absolute left-4 top-4 h-16 w-16 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/10 blur-xl"></div>
      <div className="absolute right-6 bottom-6 h-20 w-20 rounded-full bg-gradient-to-br from-purple-500/15 to-blue-500/10 blur-xl"></div>
      
      {/* Animated Grid Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="h-full w-full bg-[linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
      </div>
      
      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Premium Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-300 backdrop-blur-sm"
        >
          <div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse"></div>
          Land your dream job faster with AI
        </motion.div>

        {/* Enhanced Headline */}
        <motion.h1 
          className="mb-4 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-3xl font-bold text-transparent md:text-4xl lg:text-5xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          Track • Apply • Succeed
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mb-8 max-w-md text-neutral-300 text-lg font-medium leading-relaxed"
        >
          Automate your job search with AI-powered applications and intelligent tracking
        </motion.p>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mb-8 flex flex-wrap items-center justify-center gap-6 text-sm"
        >
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-green-400"></div>
            <span className="text-neutral-300">6142 Jobs Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-blue-400"></div>
            <span className="text-neutral-300">600 Jobs/Month Auto Apply</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-purple-400"></div>
            <span className="text-neutral-300">85% Time Saved</span>
          </div>
        </motion.div>
        
        {/* Enhanced CTA Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="mb-8 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button 
            onClick={() => window.location.href = "/dashboard/job-board"}
            className="group relative w-48 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 px-6 py-3 text-white font-semibold shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
            <span className="relative flex items-center justify-center gap-2">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Explore Jobs
            </span>
          </button>
          <button 
            onClick={() => window.location.href = "/features/auto-apply"}
            className="group relative w-48 overflow-hidden rounded-xl border-2 border-neutral-600 bg-transparent px-6 py-3 font-semibold text-neutral-300 transition-all duration-300 hover:border-blue-400 hover:bg-blue-400/10 hover:text-blue-300 hover:scale-105"
          >
            <span className="relative flex items-center justify-center gap-2">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Try Auto Apply
            </span>
          </button>
        </motion.div>
        
        {/* Enhanced Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="relative mx-auto w-full max-w-md rounded-2xl border border-neutral-700/50 bg-neutral-800/30 p-4 shadow-2xl backdrop-blur-sm"
        >
          {/* Mock Browser Bar */}
          <div className="mb-3 flex items-center gap-2 rounded-t-xl bg-neutral-900/50 px-3 py-2">
            <div className="flex gap-1">
              <div className="h-2 w-2 rounded-full bg-red-400"></div>
              <div className="h-2 w-2 rounded-full bg-yellow-400"></div>
              <div className="h-2 w-2 rounded-full bg-green-400"></div>
            </div>
            <div className="ml-2 flex-1 rounded bg-neutral-800 px-3 py-1 text-xs text-neutral-500">
              aipply.io/dashboard
            </div>
          </div>
          
          {/* Enhanced Dashboard Mock */}
          <div className="aspect-[4/3] overflow-hidden rounded-xl border border-neutral-600/50 bg-gradient-to-br from-neutral-800 via-neutral-900 to-black">
            <div className="flex h-full flex-col items-center justify-center p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                  <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Job Success Rate</p>
                  <p className="text-2xl font-bold text-green-400">94%</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 w-full">
                <div className="rounded-lg border border-neutral-700 bg-neutral-800/50 p-3 text-center">
                  <p className="text-xs text-neutral-400">Applied Today</p>
                  <p className="text-lg font-bold text-blue-400">43</p>
                </div>
                <div className="rounded-lg border border-neutral-700 bg-neutral-800/50 p-3 text-center">
                  <p className="text-xs text-neutral-400">Responses</p>
                  <p className="text-lg font-bold text-green-400">12</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Floating Elements */}
          <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg">
            <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </motion.div>
      </div>
    </div>
  );
}