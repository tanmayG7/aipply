import React, { useEffect, useState } from "react";

import ProfileForm from "./profileForm/profileForm";
import UploadCv from "./uploadCv";
import PreferenceForm from "./preferenceForm";
import { Button } from "../ui/button";
import Image from "next/image";
import { auth, getUserProfile, saveUserProfile } from "@/lib/firebaseConfig/firebaseConfig";
import { UserDetails } from "@/lib/types";
import { onAuthStateChanged } from "firebase/auth";

const EditProfile: React.FC = () => {
  const [selectedSection, setSelectedSection] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [userDetails, setUserDetails] = useState<UserDetails>({} as UserDetails);

  const handleEditClick = async () => {
    const user = auth.currentUser;
    if (user) {
      const details: UserDetails = await getUserProfile(user.uid);
      setUserDetails(details);
      if (isEditing) {
        
        await saveUserProfile(user.uid, details);
      }
    }
    setIsEditing(!isEditing);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const fetchUserDetails = async () => {
          const details: UserDetails = await getUserProfile(user.uid);
          setUserDetails(details);
        };
        fetchUserDetails();
      }
    });

    return () => unsubscribe();
  }, []);

  const handleCancel = () => {
    setIsEditing(false);
  }

  const renderSection = () => {
    switch (selectedSection) {
      case "profile":
        return <ProfileForm isEditing={isEditing} userDetails={userDetails} />;
      case "resume":
        return <UploadCv isEditing={isEditing} />;
      case "preferences":
        return <PreferenceForm isEditing={isEditing} userDetails={userDetails} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-[828px]">
      <div className="flex flex-row justify-between">
        <p className="font-inter text-[28px] text-lg font-bold">
          Edit your AipPly profile
        </p>
        <div className="flex flex-row gap-4">
          <Button
            className="w-fit bg-transparent border hover:bg-slate-800"
            onClick={handleEditClick}
          >
            <Image
              src={
                isEditing
                  ? "/static/icons/bookmark.svg"
                  : "/static/icons/add.svg"
              }
              width={20}
              height={20}
              alt={isEditing ? "save" : "update"}
            />
            {isEditing ? "Save" : "Update now"}
          </Button>
          <Button
            className="w-fit bg-transparent border hover:bg-slate-800"
            onClick={handleCancel}
          >
            Cancel
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 max-w-[525px] border-b-[1px] border-[#454545] ">
        <button
          onClick={() => setSelectedSection("profile")}
          className={`text-text-sm-semibold pb-4 ${
            selectedSection === "profile"
              ? "text-white border-b-2 border-white"
              : "text-[#667085]"
          }`}
        >
          Profile
        </button>
        <button
          onClick={() => setSelectedSection("resume")}
          className={`text-text-sm-semibold pb-4 ${
            selectedSection === "resume"
              ? "text-white border-b-2 border-white"
              : "text-[#667085]"
          }`}
        >
          Resume/CV
        </button>
        <button
          onClick={() => setSelectedSection("preferences")}
          className={`text-text-sm-semibold pb-4 ${
            selectedSection === "preferences"
              ? "text-white border-b-2 border-white"
              : "text-[#667085]"
          }`}
        >
          Preferences
        </button>
      </div>
      {renderSection()}
    </div>
  );
};

export default EditProfile;
