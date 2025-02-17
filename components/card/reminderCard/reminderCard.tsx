import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

const ReminderCard = () => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [status, setStatus] = useState("interview");

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  const changeStatus = () => {
    setMenuVisible(false);
    setStatus(status === "interview" ? "noReply" : "interview");
  };

  const handleInterviewStatus = () => {
    setMenuVisible(false);
    setStatus("interview");
  }

  const handleNoReplyStatus = () => {
    setMenuVisible(false);
    setStatus("noReply");
  }

  return (
    <div className="flex flex-row justify-between">
      <div className="flex flex-row gap-10 items-center">
        <div className="flex flex-row gap-3">
          <Image
            src={"/static/jobBoardImages/catalogLogo.jpeg"}
            alt={`company logo`}
            className="rounded-full w-full"
            width={28}
            height={28}
          />
          <h4 className="font-inter text-[24px] text-white font-normal">
            AiPply
          </h4>
        </div>
        <p className="font-inter font-normal text-white text-[16px] ">
          Software Engineer
        </p>
      </div>
      <div className="relative flex flex-row gap-10 items-center justify-center">
        <div className="flex flex-row gap-10">
          {!menuVisible && ( status === "interview" ? (
            <div className="flex flex-col items-center">
              <Button className="flex flex-col w-[275px] h-[44px] cursor-pointer text-text-md-semibold font-inter text-white border-[1px] border-[#E3D9FB] bg-gradient-to-b from-[#6033F5] to-[#A061F1] hover:bg-[#7e46cc]">
                Interview
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Button
                variant={"outline"}
                className="w-[275px] h-[44px] cursor-pointer text-text-md-semibold font-inter text-white border-[1px] border-[#6033F5] bg-gradient-to-b from-black from-60% to-[#A061F1]"
              >
                No Reply
              </Button>
            </div>
          ))}
          
          {menuVisible && (
            <div className="flex flex-row gap-4 items-center">
              <Button
                className="flex flex-col w-[275px] h-[44px] cursor-pointer text-text-md-semibold font-inter text-white border-[1px] border-[#E3D9FB] bg-gradient-to-b from-[#6033F5] to-[#A061F1] hover:bg-[#7e46cc]"
                onClick={handleInterviewStatus}
              >
                Interview
              </Button>
              <Button
                variant={"outline"}
                className="w-[275px] h-[44px] cursor-pointer text-text-md-semibold font-inter text-white border-[1px] hover:text-white border-[#6033F5] bg-gradient-to-b from-black from-60% to-[#A061F1]"
                onClick={handleNoReplyStatus}
              >
                No Reply
              </Button>
            </div>
          )}
        </div>
        <div className="relative">
          <button className="" onClick={toggleMenu}>
            <Image
              src="/static/icons/three-dot.svg"
              alt="more"
              width={24}
              height={24}
            />
          </button>
          {menuVisible && (
            <div className="absolute right-0 mt-3 w-36 bg-[#050513] text-black shadow-lg z-10 border-[1px] border-[#333232]">
              <button
                className="block px-4 py-2 text-sm text-gray-700 w-36 text-white text-start hover:bg-white hover:text-black rounded"
                onClick={changeStatus}
              >
                Change Status
              </button>
              <button className="block px-4 py-2 text-sm text-gray-700 w-36 text-white text-start hover:bg-white hover:text-black rounded">
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReminderCard;
