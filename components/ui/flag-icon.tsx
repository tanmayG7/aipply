// Optional: Enhanced flag component with fallback
"use client";
import React from "react";
import { cn } from "@/lib/utils";

interface FlagIconProps {
  countryCode: string;
  emoji: string;
  className?: string;
}

export const FlagIcon: React.FC<FlagIconProps> = ({ 
  countryCode, 
  emoji, 
  className = "" 
}) => {
  return (
    <span 
      className={cn("inline-block text-base leading-none", className)}
      role="img"
      aria-label={`${countryCode} flag`}
      style={{ fontFamily: 'Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, system-ui' }}
    >
      {emoji}
    </span>
  );
};