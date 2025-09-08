"use client";

import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <div className="relative mx-auto flex max-w-4xl flex-col items-center justify-center py-6">
      {/* Decorative borders */}
      <div className="absolute inset-y-0 left-0 h-full w-px bg-neutral-800/60">
        <div className="absolute top-0 h-20 w-px bg-gradient-to-b from-transparent via-blue-500/70 to-transparent" />
      </div>
      <div className="absolute inset-y-0 right-0 h-full w-px bg-neutral-800/60">
        <div className="absolute h-20 w-px bg-gradient-to-b from-transparent via-blue-500/70 to-transparent" />
      </div>
      <div className="absolute inset-x-0 bottom-0 h-px w-full bg-neutral-800/60">
        <div className="absolute mx-auto h-px w-32 bg-gradient-to-r from-transparent via-blue-500/70 to-transparent" />
      </div>
      
      <div className="px-4 py-6">
        <h1 className="relative z-10 mx-auto max-w-3xl text-center text-xl font-bold text-slate-300 md:text-2xl lg:text-3xl">
          {"Land your dream job faster with AI"
            .split(" ")
            .map((word, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, filter: "blur(4px)", y: 10 }}
                animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.1,
                  ease: "easeInOut",
                }}
                className="mr-2 inline-block"
              >
                {word}
              </motion.span>
            ))}
        </h1>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.8 }}
          className="relative z-10 mx-auto max-w-lg py-3 text-center text-sm font-normal text-neutral-400"
        >
          Track applications, discover opportunities, and automate your job search with our intelligent platform.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 1 }}
          className="relative z-10 mt-4 flex flex-wrap items-center justify-center gap-3"
        >
          <button 
            onClick={() => window.location.href = "/dashboard/job-board"}
            className="w-44 transform rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-700"
          >
            Explore Jobs
          </button>
          <button 
            onClick={() => window.location.href = "/features/auto-apply"}
            className="w-44 transform rounded-lg border border-neutral-600 bg-transparent px-4 py-2 text-sm font-medium text-neutral-300 transition-all duration-300 hover:-translate-y-0.5 hover:bg-neutral-800"
          >
            Try Auto Apply
          </button>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 1.2 }}
          className="relative z-10 mt-8 rounded-2xl border border-neutral-700 bg-neutral-800/30 p-3 shadow-md"
        >
          <div className="w-full overflow-hidden rounded-xl border border-neutral-600">
            <div className="aspect-[16/10] bg-gradient-to-br from-neutral-800 via-neutral-900 to-black flex items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-blue-600/20 flex items-center justify-center">
                  <svg className="h-6 w-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                  </svg>
                </div>
                <p className="text-sm text-neutral-400">Your job search dashboard</p>
                <p className="text-xs text-neutral-500 mt-1">Track • Apply • Succeed</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}