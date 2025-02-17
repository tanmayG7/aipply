"use client";
import Image from "next/image";
import React from "react";

const Header: React.FC = () => {
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
    </div>
  );
};

export default Header;
