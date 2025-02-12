import React, { useState, useEffect, useRef } from "react";
import AboutSection from "./profileFormSections/aboutSection";
import EducationSection from "./profileFormSections/educationSection";
import AchievementsSection from "./profileFormSections/achievementsSection";
import SocialMediaLinks from "./profileFormSections/socialMediaLinks";
import Skills from "./profileFormSections/skillsSection";
// import { Button } from "@/components/ui/button";
// import Link from "next/link";

const ProfileForm = () => {
  const [educations, setEducations] = useState<
    {
      college: string;
      graduationYear: string;
      degree: string;
      endDate: string;
      description: string;
      gpa: string;
      maxGpa: string;
    }[]
  >([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleAddEducation = (education: {
    college: string;
    graduationYear: string;
    degree: string;
    endDate: string;
    description: string;
    gpa: string;
    maxGpa: string;
  }) => {
    if (editingIndex !== null) {
      const updatedEducations = educations.map((edu, index) =>
        index === editingIndex ? education : edu
      );
      setEducations(updatedEducations);
      setEditingIndex(null);
    } else {
      setEducations([...educations, education]);
    }
  };

  const handleEditEducation = (index: number) => {
    setEditingIndex(index);
  };

  const handleDeleteEducation = (index: number) => {
    setEducations(educations.filter((_, i) => i !== index));
  };

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <div className="py-6 border border-gray rounded-xl">
      <AboutSection />
      <SocialMediaLinks />
      {educations.map((education, index) => (
        <div
          key={index}
          className="flex flex-row py-4 px-4 border border-gray bg-blue rounded-lg mt-4 mx-4"
        >
          <div className="flex flex-col flex-grow">
            <div className="flex flex-row justify-between">
              <h2 className="text-display-xs-bold">{education.college}</h2>
              <div className="flex flex-col">
                <p className="text-text-md-bold">
                  {education.gpa} / {education.maxGpa}
                </p>
                <p className="text-text-md-bold">{education.graduationYear}</p>
              </div>
            </div>
            <h3 className="text-text-xl-medium">{education.degree}</h3>
          </div>
          <div className="relative flex flex-col text-white items-start justify-start ml-4" ref={dropdownRef}>
            <span className="cursor-pointer text-[28px]" onClick={toggleDropdown}>
              :
            </span>
            {dropdownOpen && (
              <div className="absolute flex flex-col z-60 top-0 bg-white text-black px-6 py-2 right-0 rounded-md">
                <p
                  onClick={() => handleEditEducation(index)}
                  className="text-text-lg-regular font-inter"
                >
                  Edit
                </p>
                <p
                  onClick={() => handleDeleteEducation(index)}
                  className="text-text-lg-regular font-inter"
                >
                  Delete
                </p>
              </div>
            )}
          </div>
        </div>
      ))}
      <EducationSection
        onAddEducation={handleAddEducation}
        editingEducation={
          editingIndex !== null ? educations[editingIndex] : null
        }
      />
      <Skills />
      <AchievementsSection />
    </div>
  );
};

export default ProfileForm;
