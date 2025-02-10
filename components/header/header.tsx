"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";

const Header: React.FC = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <div className="flex flex-row items-center justify-end gap-6 py-3 px-4 border border-[#454545] mt-6 rounded-xl mx-6 bg-[#020218] w-[95%]">
      <button
        type="button"
        className="hidden md:flex w-fit text-white rounded-lg border border-[#454545] px-4 py-2 bg-[#161B26]"
      >
        Actively looking for a job
      </button>
      <Image
        src="/static/icons/notification.svg"
        alt="Profile"
        width={24}
        height={24}
        className="rounded-full"
      />
      <div className="flex flex-row gap-2">
        <div className="text-white flex flex-row">
          <Image
            src="/static/images/profilePic.png"
            alt="Profile"
            width={40}
            height={40}
            className="rounded-full"
          />
        </div>
        <div className="flex flex-col text-white items-center justify-center">
          <span className="cursor-pointer" onClick={toggleDropdown}>
            ▼
          </span>
          {dropdownOpen && (
            <div className="absolute flex flex-col z-20 top-24 bg-white text-black px-6 py-2 right-8 rounded-md ">
              <Link href="/complete-profile" className="text-text-lg-regular font-inter">
                Profile
              </Link>
              <Link href="/settings" className="text-text-lg-regular font-inter">
                Settings
              </Link>
              <div className="divider" />
              <Link href="/" className="text-text-lg-regular font-inter">
                Logout
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
