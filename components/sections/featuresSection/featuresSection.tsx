import Button from "@/components/common/button/button";
import { ResponsivePageContainer } from "@/components/common/responsivePageContainer/responsivePageContainer";
import React from "react";
import FeatureCard from "@/components/card/featureCard/featureCard";

const cardData = [
  {
    title: "Custom Job Listings",
    description:
      "Get personalized job listings from top portals, filtered to your preferences, and saved automatically for easy tracking.",
    image: "/static/featureCardIcons/jobListing.svg",
  },
  {
    title: "Auto Apply",
    description:
      "Automatically finds job matches, submits applications based on set preferences, and tracks every submission in real-time.",
    image: "/static/featureCardIcons/autoApply.svg",
  },
  {
    title: "Job Application Tracker",
    description:
      "Tracks and organizes all job applications in one place, updating statuses in real-time for easy monitoring.",
    image: "/static/featureCardIcons/customResources.svg",
  },
  {
    title: "Custom Resources",
    description:
      "Get tailored cover letters, ATS-optimized resumes, and LinkedIn profile enhancements to boost your job search success.",
    image: "/static/featureCardIcons/jobtracker.svg",
  },
];

const FeaturesSection = () => {
  return (
    <ResponsivePageContainer>
      <div className="flex flex-col custom-lg:grid custom-lg:grid-cols-9 gap-[76px]">
        <div className="flex flex-col gap-4 col-span-3">
          <Button text="Features" />
          <div className="flex flex-col gap-4">
            <h1 className="font-manrope text-[36px] leading-[44px] font-semibold text-[#F5F5F6]">
              Let AI do the Heavy-lifting!
            </h1>
            <p className="font-manrope text-[20px] leading-[30px] font-normal text-[#CECFD2]">
              No more daily hustle to apply for a job, just sit back and enjoy
              the power of 1-click.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 custom-md:grid-cols-2 col-span-6 gap-10">
          {cardData.map((card, index) => (
            <FeatureCard key={index} card={card} />
          ))}
        </div>
      </div>
    </ResponsivePageContainer>
  );
};

export default FeaturesSection;
