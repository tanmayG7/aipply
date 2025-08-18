// components/ui/Icon.tsx
"use client";
import React from 'react';
import { cn } from '@/lib/utils';
import { iconsByName, resolveIcon, type IconName } from '@/lib/icon-map';

interface IconProps {
  name: IconName | string;
  size?: number;
  className?: string;
  ariaLabel?: string;
  inline?: boolean;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 24,
  className = "",
  ariaLabel,
  inline = false
}) => {
  // Get the icon component
  const IconComponent = typeof name === 'string' && name in iconsByName 
    ? iconsByName[name as IconName]
    : resolveIcon(name);
  
  return (
    <IconComponent
      size={size}
      className={cn(
        "text-current", // Inherit text color
        inline && "align-[-0.125em]", // Align with text baseline when inline
        className
      )}
      aria-hidden={!ariaLabel}
      aria-label={ariaLabel}
    />
  );
};