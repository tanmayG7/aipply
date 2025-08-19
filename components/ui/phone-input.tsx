"use client";
import React, { useState, useRef, useEffect } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";
import { countryCodes, CountryCode } from "@/lib/countryCodes";

// Pattern to allow only digits, spaces, hyphens, parentheses
const PHONE_NUMBER_PATTERN = /[^0-9\s\-()]/g;

interface PhoneInputProps {
  countryCode: string;
  phoneNumber: string;
  onCountryCodeChange: (code: string) => void;
  onPhoneNumberChange: (number: string) => void;
  required?: boolean;
  className?: string;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  countryCode,
  phoneNumber,
  onCountryCodeChange,
  onPhoneNumberChange,
  required = false,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedCountry = countryCodes.find(country => country.dialCode === countryCode) || countryCodes[0];

  const filteredCountries = countryCodes.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.dialCode.includes(searchTerm) ||
    country.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleCountrySelect = (country: CountryCode) => {
    onCountryCodeChange(country.dialCode);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(PHONE_NUMBER_PATTERN, ''); // Allow only digits, spaces, hyphens, parentheses
    onPhoneNumberChange(value);
  };

  return (
    <div className={cn("relative", className)}>
      <div className="flex">
        {/* Country Code Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="shadow-input flex items-center h-10 px-3 rounded-l-md border border-[#333741] bg-gray-50 text-sm transition duration-400 focus-visible:ring-[2px] focus-visible:ring-neutral-400 focus-visible:outline-none dark:bg-zinc-800 dark:text-white dark:shadow-[0px_0px_1px_1px_#404040] dark:focus-visible:ring-neutral-600 min-w-[120px]"
          >
            <span className="mr-2">{selectedCountry.flag}</span>
            <span className="text-xs font-medium">{selectedCountry.dialCode}</span>
            <ChevronDownIcon 
              className={cn(
                "w-4 h-4 ml-1 transition-transform duration-200",
                isOpen && "rotate-180"
              )} 
            />
          </button>

          {/* Dropdown Menu */}
          {isOpen && (
            <div className="absolute top-full left-0 mt-1 country-dropdown-width bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-md shadow-lg z-50 country-dropdown-max-h overflow-hidden">
              {/* Search Input */}
              <div className="p-2 border-b border-gray-200 dark:border-zinc-700">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search country..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-zinc-700 border border-gray-200 dark:border-zinc-600 rounded focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:text-white"
                />
              </div>

              {/* Countries List */}
              <div className="overflow-y-auto country-dropdown-max-h">
                {filteredCountries.length > 0 ? (
                  filteredCountries.map((country) => (
                    <button
                      key={country.code}
                      type="button"
                      onClick={() => handleCountrySelect(country)}
                      className={cn(
                        "w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-zinc-700 flex items-center gap-3 text-sm transition-colors",
                        selectedCountry.code === country.code && "bg-gray-100 dark:bg-zinc-700"
                      )}
                    >
                      <span className="text-base">{country.flag}</span>
                      <span className="flex-1 truncate dark:text-white">{country.name}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                        {country.dialCode}
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                    No countries found
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Phone Number Input */}
        <input
          type="tel"
          value={phoneNumber}
          onChange={handlePhoneNumberChange}
          placeholder="Enter phone number"
          required={required}
          autoComplete="tel-national"
          className="shadow-input flex-1 h-10 w-full rounded-r-md border-none bg-gray-50 px-3 py-2 text-sm text-black transition duration-400 focus-visible:ring-[2px] focus-visible:ring-neutral-400 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-800 dark:text-white dark:shadow-[0px_0px_1px_1px_#404040] dark:focus-visible:ring-neutral-600"
        />
      </div>

      {/* Full Number Display (Hidden for screen readers) */}
      <input
        type="hidden"
        name="fullPhoneNumber"
        value={`${countryCode} ${phoneNumber}`.trim()}
      />
    </div>
  );
};