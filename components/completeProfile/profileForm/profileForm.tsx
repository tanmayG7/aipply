import React, { useState, useEffect, useRef } from "react";
import AboutSection from "./profileFormSections/aboutSection";
import EducationSection from "./profileFormSections/educationSection";
import AchievementsSection from "./profileFormSections/achievementsSection";
import SocialMediaLinks from "./profileFormSections/socialMediaLinks";
import Skills from "./profileFormSections/skillsSection";
import WorkExperience from "./profileFormSections/workExperience";
import { auth, saveUserProfile } from "@/lib/firebaseConfig/firebaseConfig";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface ProfileFormProps {
  isEditing: boolean;
  // userDetails: any;
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

  const handleSaveProfile = async () => {
    const user = auth.currentUser;
    if (user) {
      const userDetails = {
        educations,
        workExperiences,
      };
      await saveUserProfile(user.uid, userDetails);
    }
  };

  return (
    <div className="py-6 border border-gray rounded-xl">
      <AboutSection />
      <SocialMediaLinks />

      {/* {isEditing && ( */}
      <WorkExperience
        // users={userDetails}
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
        // users={userDetails}
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
      <Button
        className="w-fit px-8 bg-transparent border border-gray"
        onClick={handleSaveProfile}
      >
        <Image
          src={"/static/icons/add.svg"}
          width={20}
          height={20}
          alt="update"
        />
        Save
      </Button>
    </div>
  );
};

export default ProfileForm;
