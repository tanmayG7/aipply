"use client";
import React, { useState } from "react";
import { Input } from "../ui/input";
import { auth, saveUserProfile } from "@/lib/firebaseConfig/firebaseConfig";
import { Button } from "../ui/button";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { UserDetails } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";

interface UploadCvProps {
  isEditing: boolean;
  userDetails: UserDetails;
}

const UploadCv: React.FC<UploadCvProps> = ({ isEditing, userDetails }) => {
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [coverLetter, setCoverLetter] = useState(userDetails.coverLetter || "");

  const handleUploadCv = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!allowedTypes.includes(file.type)) {
        alert("Only PDF and DOC files are allowed.");
        return;
      }
      const user = auth.currentUser;
      if (user) {
        const storage = getStorage();
        const storageRef = ref(storage, `resumes/${user.uid}/resume`);
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
        const userDetails = {
          cv: downloadURL,
        };
        await saveUserProfile(user.uid, userDetails);
      }
    }
  };

  const handleSaveCvButtonClick = async () => {
    setLoading(true);
    const inputElement = document.getElementById(
      "uploadFile"
    ) as HTMLInputElement;
    const user = auth.currentUser;

    if (user && inputElement && inputElement.files) {
      const event = {
        target: inputElement,
      } as React.ChangeEvent<HTMLInputElement>;
      await handleUploadCv(event);
      const storage = getStorage();
      const storageRef = ref(storage, `resumes/${user.uid}/resume`);
      const downloadURL = await getDownloadURL(storageRef);
      const userDetails: UserDetails = { cv: downloadURL };
      await saveUserProfile(user.uid, userDetails);

      inputElement.value = "";
    }
    setLoading(false);
  };

  const handleSaveCoverLetterButtonClick = async () => {
    setLoading(true);
    const user = auth.currentUser;

    if (user && coverLetter) {
      const userDetails: UserDetails = {
        coverLetter: coverLetter,
      };
      await saveUserProfile(user.uid, userDetails);
    }
    setLoading(false);
  };

  return (
    <div className="py-6 border border-gray rounded-xl">
      {/* Resume Upload Section */}
      <Card className="grid grid-cols-7 gap-[52px] max-w-[100%] py-6 border-b border-gray rounded-none">
        <CardHeader className="col-span-2">
          <CardTitle className="text-[16px] font-inter font-semibold text-white">
            Upload your resume or CV
          </CardTitle>
          <CardDescription className="font-inter text-[14px] leading-[20px]">
            Upload most up-to-date resume.
          </CardDescription>
        </CardHeader>
  return (
    <div className="py-6 border border-gray rounded-xl">
      {/* Resume Upload Section */}
      <Card className="grid grid-cols-7 gap-[52px] max-w-[100%] py-6 border-b border-gray rounded-none">
        <CardHeader className="col-span-2">
          <CardTitle className="text-[16px] font-inter font-semibold text-white">
            Upload your resume or CV
          </CardTitle>
          <CardDescription className="font-inter text-[14px] leading-[20px]">
            Upload most up-to-date resume.
          </CardDescription>
        </CardHeader>
        <CardContent className="col-span-5">
          <p className="text-[16px] border border-gray w-fit px-4 py-2 rounded bg-black font-semibold font-inter opacity-70 text-white">
            {isEditing ? "Upload Mode" : "View Mode"}
          </p>
        </CardContent>
      </Card>

      {/* Cover Letter Section */}
      <Card className="grid grid-cols-7 gap-[52px] max-w-[100%] py-6 rounded-none">
        <CardHeader className="col-span-2">
          <CardTitle className="text-[16px] font-inter font-semibold text-white">
            Cover Letter
          </CardTitle>
          <CardDescription className="font-inter text-[14px] leading-[20px]">
            Write most updated cover letter
          </CardDescription>
        </CardHeader>
        <CardContent className="col-span-5">
          <p className="text-[16px] border border-gray w-fit px-4 py-2 rounded bg-black font-semibold font-inter opacity-70 text-white">
            {isEditing ? "Edit Cover Letter" : "View Cover Letter"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
      </Card>
    </div>
  );
};

export default UploadCv;
