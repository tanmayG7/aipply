"use client";
import Footer from "@/components/common/footer/footer";
import Header from "@/components/common/header/header";
import { ResponsivePageContainer } from "@/components/common/responsivePageContainer/responsivePageContainer";
import ScrollToTopBtn from "@/components/common/scrollToTopBtn/scrollToTopBtn";
import MonthlyComponent from "@/components/sections/pricing/monthlyComponent/monthlyComponent";
import QuarterlyComponent from "@/components/sections/pricing/quarlerlyComponent/quarlerlyComponent";
import YearlyComponent from "@/components/sections/pricing/yearlyComponent/yearlyComponent";
import React, { useState } from "react";

const Pricing = () => {
  const [selectedPlan, setSelectedPlan] = useState("monthly");

  const getButtonClass = (plan: string) => {
    return `font-manrope font-[500] text-[18px] leading-[160%] text-white px-[12px] custom-sm:px-[30px] py-2 ${
      selectedPlan === plan ? "border border-white rounded-md" : ""
    }`;
  };

  return (
    <div>
      <div className="pt-7">
        <Header />
      </div>

      <ResponsivePageContainer>
        <div className="flex flex-col gap-[53px] py-[78px]">
          <div className="flex flex-col gap-9">
            <div className="flex flex-col items-center gap-3">
              <h1 className="font-manrope font-semibold text-[48px] leading-[120%] custom-md:leading-[160%] text-white">
                Choose your Plan
              </h1>
              <p className="font-manrope font-[500] text-[18px] leading-[160%] text-white opacity-[70%]">
                10x your job search by automating with AiPply.
              </p>
            </div>
            <div className="flex flex-row border border-white border-opacity-[20%] w-fit m-auto bg-white bg-opacity-10 p-2 rounded-lg">
              <button
                onClick={() => setSelectedPlan("monthly")}
                className={getButtonClass("monthly")}
              >
                Monthly
              </button>
              <button
                onClick={() => setSelectedPlan("quarterly")}
                className={getButtonClass("quarterly")}
              >
                Quarterly
              </button>
              <button
                onClick={() => setSelectedPlan("yearly")}
                className={getButtonClass("yearly")}
              >
                Yearly
              </button>
            </div>
          </div>
          
          {/* Render all components but hide the ones not selected, pass visibility prop */}
          <div>
            <div className={selectedPlan === "monthly" ? "block" : "hidden"}>
              <MonthlyComponent />
            </div>
            <div className={selectedPlan === "quarterly" ? "block" : "hidden"}>
              <QuarterlyComponent isVisible={selectedPlan === "quarterly"} />
            </div>
            <div className={selectedPlan === "yearly" ? "block" : "hidden"}>
              <YearlyComponent isVisible={selectedPlan === "yearly"} />
            </div>
          </div>
        </div>
      </ResponsivePageContainer>

      <Footer />

      <ScrollToTopBtn />
    </div>
  );
};

export default Pricing;
