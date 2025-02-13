import React, { useState, useEffect, useRef } from "react";
import AboutSection from "./profileFormSections/aboutSection";
import EducationSection from "./profileFormSections/educationSection";
import AchievementsSection from "./profileFormSections/achievementsSection";
import SocialMediaLinks from "./profileFormSections/socialMediaLinks";
import Skills from "./profileFormSections/skillsSection";
import WorkExperience from "./profileFormSections/workExperience";

interface ProfileFormProps {
  isEditing: boolean;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ isEditing }) => {
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

  const [workExperiences, setWorkExperiences] = useState<
    {
      company: string;
      title: string;
      startDate: string;
      endDate: string;
      current: boolean;
      type: string;
      description: string;
    }[]
  >([]);
  const [editingWorkIndex, setEditingWorkIndex] = useState<number | null>(null);

  const handleAddExperience = (experience: {
    company: string;
    title: string;
    startDate: string;
    endDate: string;
    current: boolean;
    type: string;
    description: string;
  }) => {
    if (editingWorkIndex !== null) {
      const updatedExperiences = workExperiences.map((exp, index) =>
        index === editingWorkIndex ? experience : exp
      );
      setWorkExperiences(updatedExperiences);
      setEditingWorkIndex(null);
    } else {
      setWorkExperiences([...workExperiences, experience]);
    }
  };

  const handleEditExperience = (index: number) => {
    setEditingWorkIndex(index);
  };

  const handleDeleteExperience = (index: number) => {
    setWorkExperiences(workExperiences.filter((_, i) => i !== index));
  };

  const [dropdownOpenIndex, setDropdownOpenIndex] = useState<number | null>(
    null
  );
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpenIndex(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDropdown = (index: number) => {
    setDropdownOpenIndex(dropdownOpenIndex === index ? null : index);
  };

  return (
    <div className="py-6 border border-gray rounded-xl">
      <AboutSection />
      <SocialMediaLinks />
      {/* {workExperiences.map((experience, index) => (
        <div
          key={index}
          className="flex flex-row py-4 px-4 border border-gray rounded-lg mt-4 mx-4"
        >
          <div className="flex flex-col flex-grow">
            <div className="flex flex-row justify-between">
              <h2 className="text-display-xs-bold">{experience.company}</h2>
              <div className="flex flex-col">
                <p className="text-text-md-bold">
                  {experience.startDate} -{" "}
                  {experience.current ? "Present" : experience.endDate}
                </p>
              </div>
            </div>
            <h3 className="text-text-xl-medium">{experience.type}</h3>
            <p className="text-text-md-bold">{experience.title}</p>
          </div>
          {isEditing && (
            <div
              className="relative flex flex-col text-white items-start justify-start ml-4"
              ref={dropdownRef}
            >
              <Image
                src="/static/icons/three-dot.svg"
                alt="More"
                width={24}
                height={24}
                onClick={() => toggleDropdown(index)}
              />
              {dropdownOpenIndex === index && (
                <div className="absolute flex flex-col z-60 top-12 bg-white text-black px-6 py-2 right-0 rounded-md">
                  <p
                    onClick={() => handleEditExperience(index)}
                    className="text-text-lg-regular font-inter cursor-pointer"
                  >
                    Edit
                  </p>
                  <p
                    onClick={() => handleDeleteExperience(index)}
                    className="text-text-lg-regular font-inter cursor-pointer"
                  >
                    Delete
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      ))} */}
      {/* {isEditing && ( */}
      <WorkExperience
        workExperiences={workExperiences}
        onEditExperience={handleEditExperience}
        onDeleteExperience={handleDeleteExperience}
        isEditing={isEditing}
        dropdownOpenIndex={dropdownOpenIndex}
        toggleDropdown={toggleDropdown}
        onAddExperience={(experience) =>
          handleAddExperience({
            ...experience,
            current:
              experience.current === "true" || experience.current === true,
          })
        }
        editingExperience={
          editingWorkIndex !== null
            ? workExperiences[editingWorkIndex]
            : undefined
        }
      />
      {/* )} */}
      <EducationSection
        educations={educations}
        onAddEducation={handleAddEducation}
        onEditEducation={handleEditEducation}
        onDeleteEducation={handleDeleteEducation}
        isEditing={isEditing}
        dropdownOpenIndex={dropdownOpenIndex}
        toggleDropdown={toggleDropdown}
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
