"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";

const ScrollToTopBtn = () => {
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [buttonPosition, setButtonPosition] = useState("bottom-16");

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;

      if (scrollY > 0) {
        setShowScrollButton(true);
      } else {
        setShowScrollButton(false);
      }

      setButtonPosition("bottom-16");
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div>
      {showScrollButton && (
        <div
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className={`p-2 z-50 custom-md:p-4 rounded-full bg-[#AE94FF] bg-[] w-fit fixed right-6 ${buttonPosition} cursor-pointer`}
        >
          <Image
            src={"/static/icons/scrollBtn.svg"}
            width={29}
            height={29}
            alt="scroll to top"
          />
        </div>
      )}
    </div>
  );
};

export default ScrollToTopBtn;
