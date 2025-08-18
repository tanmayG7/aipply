// Flag component using react-country-flag (when available) with emoji fallback
"use client";
import React from "react";
import { cn } from "@/lib/utils";

interface FlagIconProps {
  countryCode: string;
  className?: string;
}

export const FlagIcon: React.FC<FlagIconProps> = ({ 
  countryCode, 
  className = "" 
}) => {
  // When react-country-flag is available, use this approach:
  // import ReactCountryFlag from 'react-country-flag';
  // 
  // return (
  //   <ReactCountryFlag
  //     countryCode={countryCode.toUpperCase()}
  //     svg
  //     className={cn("inline-block text-base leading-none", className)}
  //     aria-label={`${countryCode} flag`}
  //   />
  // );

  // Fallback to a simple text representation until react-country-flag is installed
  return (
    <span 
      className={cn("inline-block text-base leading-none bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded text-xs font-mono", className)}
      aria-label={`${countryCode} flag`}
    >
      {countryCode.toUpperCase()}
    </span>
  );
};