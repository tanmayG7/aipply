import Image from "next/image";
import React from "react";

interface dashboardCardProps {
  title: string;
  totalNumber: string;
  id: string;
}

const DashboardCard: React.FC<dashboardCardProps> = ({
  title,
  totalNumber,
  id,
}) => {
  return (
    <div className="border border-[#1F242F] bg-[#0C111D] px-6 py-6 rounded-xl relative">
      <div key={id} className="flex flex-col gap-2 items-start">
        <h3 className="text-text-sm-medium font-inter text-[#94969C]">
          {title}
        </h3>
        <p className="text-display-sm-semibold font-inter text-[#F5F5F6]">
          {totalNumber}
        </p>
      </div>
      <div className="absolute hidden custom-md:flex top-0 m-auto left-0 right-0 w-[70%] h-[1px] ">
        <Image
          src={"/static/icons/gradientLine.svg"}
          fill
          alt="gradient line"
        />
      </div>
    </div>
  );
};

export default DashboardCard;
