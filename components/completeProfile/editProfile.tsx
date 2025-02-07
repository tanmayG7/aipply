import React, { useState } from "react";
import ProfileForm from "./profileForm/profileForm";
import UploadCv from "./uploadCv";
import PreferenceForm from "./preferenceForm";
import { Button } from "../ui/button";
import Image from "next/image";

const EditProfile: React.FC = () => {
  const [selectedSection, setSelectedSection] = useState("profile");

  const renderSection = () => {
    switch (selectedSection) {
      case "profile":
        return <ProfileForm />;
      case "resume":
        return <UploadCv />;
      case "preferences":
        return <PreferenceForm />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-row justify-between">
        <p className="font-inter text-[28px] text-lg font-bold">
          Edit your AipPly profile
        </p>
        <Button className="w-fit bg-transparent border  hover:bg-slate-800">
          <Image
            src={"/static/icons/add.svg"}
            width={20}
            height={20}
            alt="update"
          />
          Update now
        </Button>
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
