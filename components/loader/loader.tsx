import React from "react";
import Lottie from "react-lottie";
import animationData from "@/public/static/lottie/loader.json";

interface LoaderProps {
  lottieFile?: object;
  message?: string;
}

const Loader: React.FC<LoaderProps> = ({
  lottieFile = animationData,
  message = "Fetching details for you. Please wait...",
}) => {
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: lottieFile,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  return (
    <div className="flex items-center justify-center bg-gradient-to-b from-black to-[#8F63CC] bg-opacity-50 z-50 border border-primary rounded-2xl">
      <div className="flex flex-col items-center p-4">
        <Lottie options={defaultOptions} height={450} width={450} />
        <p className="text-white mt-4 text-text-xl-semibold">{message}</p>
      </div>
    </div>
  );
};

export default Loader;
