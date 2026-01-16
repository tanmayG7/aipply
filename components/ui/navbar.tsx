"use client";
import React from "react";
import Image from "next/image";
import { Menu } from "lucide-react";

export function Navbar() {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 bg-[#020218]/80 backdrop-blur-lg border-b border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 sm:h-20">
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center">
                        <Image
                            src="/static/icons/aipplyLogo.svg"
                            alt="Aipply Logo"
                            width={120}
                            height={32}
                            className="w-28 sm:w-32 lg:w-36 h-auto"
                            priority
                        />
                    </div>

                    {/* Hamburger Menu (Right Aligned) */}
                    <button
                        type="button"
                        className="p-2 rounded-lg border border-white/10 bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        aria-label="Menu"
                    >
                        <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                </div>
            </div>
        </nav>
    );
}
