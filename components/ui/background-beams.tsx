"use client";
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const BackgroundBeams = ({ className }: { className?: string }) => {
    return (
        <div
            className={cn(
                "absolute inset-0 z-0 flex h-full w-full items-center justify-center bg-transparent pointer-events-none",
                className
            )}
        >
            <div className="absolute inset-0 bg-transparent z-0 opacity-30">
                <div className="absolute top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute top-[30%] left-[20%] w-[400px] h-[400px] bg-purple-500/20 rounded-full blur-[80px]" />
            </div>

            <svg
                className="absolute z-0 h-full w-full"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 1000 1000"
                preserveAspectRatio="none"
            >
                <motion.path
                    d="M0,100 Q500,500 1000,100"
                    fill="none"
                    stroke="url(#grad1)"
                    strokeWidth="4"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.8 }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                />
                <motion.path
                    d="M0,300 Q500,700 1000,300"
                    fill="none"
                    stroke="url(#grad2)"
                    strokeWidth="4"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1, opacity: 0.8 }}
                    transition={{ duration: 2.5, delay: 0.5, ease: "easeInOut" }}
                />

                <defs>
                    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0" />
                        <stop offset="50%" stopColor="#8b5cf6" stopOpacity="1" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#ec4899" stopOpacity="0" />
                        <stop offset="50%" stopColor="#8b5cf6" stopOpacity="1" />
                        <stop offset="100%" stopColor="#ec4899" stopOpacity="0" />
                    </linearGradient>
                </defs>
            </svg>
        </div>
    );
};
