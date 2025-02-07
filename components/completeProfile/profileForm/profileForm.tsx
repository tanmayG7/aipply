import React from "react";
import AboutSection from "./profileFormSections/aboutSection";
import SocialMediaLinks from "./profileFormSections/socialMediaLinks";
import WorkExperience from "./profileFormSections/workExperience";
import EducationSection from "./profileFormSections/educationSection";
import AchievementsSection from "./profileFormSections/achievementsSection";
import Skills from "./profileFormSections/skillsSection";


const ProfileForm = () => {

  return (
    <div className="px-6 py-6">
         <AboutSection />
         <SocialMediaLinks />
         <WorkExperience />
         <EducationSection />
         <Skills />
         <AchievementsSection />
         
    </div>
  );
};

export default ProfileForm;
