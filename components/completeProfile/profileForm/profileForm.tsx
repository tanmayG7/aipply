import React, { useState, useEffect, useRef } from "react";
import AboutSection from "./profileFormSections/aboutSection";
import EducationSection from "./profileFormSections/educationSection";
import AchievementsSection from "./profileFormSections/achievementsSection";
import SocialMediaLinks from "./profileFormSections/socialMediaLinks";
import Skills from "./profileFormSections/skillsSection";
import { auth, getUserProfile } from "@/lib/firebaseConfig/firebaseConfig";
import { Education, Experience, UserDetails } from "@/lib/types";
import WorkExperience from "./profileFormSections/workExperience";
// import { UserDetails } from "@/lib/types";

interface ProfileFormProps {
  isEditing: boolean;
  userDetails: UserDetails;
}

const ProfileForm: React.FC<ProfileFormProps> = ({
  isEditing,
  userDetails,
}) => {
  console.log(userDetails);
  const [educations, setEducations] = useState<Education[]>();
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  useEffect(() => {
    if (userDetails) {
      setEducations(userDetails.education);
      setWorkExperiences(userDetails.experience);
    }
  }, [userDetails]);

  const handleAddEducation = (education: Education) => {
    if (editingIndex !== null) {
      const updatedEducations = (educations || []).map((edu, index) =>
        index === editingIndex ? education : edu
      );
      setEducations(updatedEducations);
      setEditingIndex(null);
    } else {
      setEducations([...(educations || []), education]);
    }
  };

  const handleEditEducation = (index: number) => {
    setEditingIndex(index);
  };

  const handleDeleteEducation = (index: number) => {
    if (educations) {
      setEducations(educations.filter((_, i) => i !== index));
    }
  };

  const [workExperiences, setWorkExperiences] = useState<Experience[]>();
  const [editingWorkIndex, setEditingWorkIndex] = useState<number | null>(null);

  const handleAddExperience = (experience: Experience) => {
    if (editingWorkIndex !== null) {
      const updatedExperiences = (workExperiences || []).map((exp, index) =>
        index === editingWorkIndex ? experience : exp
      );
      setWorkExperiences(updatedExperiences);
      setEditingWorkIndex(null);
    } else {
      setWorkExperiences([...(workExperiences || []), experience]);
    }
  };

  const handleEditExperience = (index: number) => {
    setEditingWorkIndex(index);
  };

  const handleDeleteExperience = (index: number) => {
    setWorkExperiences((workExperiences || []).filter((_, i) => i !== index));
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

  useEffect(() => {
    const fetchUserDetails = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDetails = await getUserProfile(user.uid);
        setEducations(userDetails.education || []);
        setWorkExperiences(userDetails.experience || []);
      }
    };

    if (isEditing) {
      fetchUserDetails();
    }
  }, [isEditing]);

  if(!educations) return null;

  return (
    <div className="py-6 border border-gray rounded-xl">
      <AboutSection userDetails={userDetails} isEditing={isEditing} />
      <SocialMediaLinks isEditing={isEditing} userDetails={userDetails} />
      <WorkExperience
        workExperiences={workExperiences || []}
        onEditExperience={handleEditExperience}
        onDeleteExperience={handleDeleteExperience}
        dropdownOpenIndex={dropdownOpenIndex}
        toggleDropdown={toggleDropdown}
        onAddExperience={handleAddExperience}
        editingExperience={
          editingWorkIndex !== null
            ? (workExperiences ?? [])[editingWorkIndex]
            : undefined
        }
        isEditing={isEditing}
      />

      <EducationSection
        isEditing={isEditing}
        educations={educations}
        onAddEducation={handleAddEducation}
        onEditEducation={handleEditEducation}
        onDeleteEducation={handleDeleteEducation}
        dropdownOpenIndex={dropdownOpenIndex}
        toggleDropdown={toggleDropdown}
        editingEducation={
          editingIndex !== null ? educations[editingIndex] : null
        }
      />
      <Skills isEditing={isEditing} userDetails={userDetails} />
      <AchievementsSection isEditing={isEditing} userDetails={userDetails} />
    </div>
  );
};

export default ProfileForm;
