"use client";
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Input } from "../ui/input";
import { auth, saveUserProfile } from "@/lib/firebaseConfig/firebaseConfig";
import { Button } from "../ui/button"; // Import Button component
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { UserDetails } from "@/lib/types";
import Link from "next/link";
import Image from "next/image";

interface UploadCvProps {
  isEditing: boolean;
  userDetails: UserDetails;
}

const UploadCv: React.FC<UploadCvProps> = ({ isEditing, userDetails }) => {
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

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
    const coverLetterElement = document.querySelector(
      'input[name="coverlatter"]'
    ) as HTMLInputElement;
    const user = auth.currentUser;

    if (user && coverLetterElement && coverLetterElement.value) {
      const userDetails: UserDetails = {
        coverLetter: coverLetterElement.value,
      };
      await saveUserProfile(user.uid, userDetails);

      coverLetterElement.value = "";
    }
    setLoading(false);
  };

  return (
    <>
      <Card className="grid grid-cols-5 max-w-[100%] py-6 text-white border border-gray rounded-xl">
        <CardHeader className="col-span-2">
          <CardTitle>Upload your resume or CV</CardTitle>
          <CardDescription>Upload most up-to-date resume.</CardDescription>
        </CardHeader>
        <CardContent className="col-span-3">
          {isEditing ? (
            <>
              <div className="bg-[#0C111D] px-6 py-4 rounded-xl">
                <Input
                  type="file"
                  id="uploadFile"
                  name="uploadFile"
                  className="text-white bg-[#0C111D] py-6 px-4 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-gray hover:file:bg-violet-100"
                  onChange={handleUploadCv}
                  style={{ display: "none" }}
                />
                <label
                  htmlFor="uploadFile"
                  className="flex flex-col items-center cursor-pointer w-full px-8 py-4 rounded gap-3"
                >
                  <Image
                    src={"/static/icons/uploadIcon.svg"}
                    width={48}
                    height={48}
                    alt="Upload"
                  />
                  <p className="text-text-sm-semibold text-[#CECFD2] font-inter">
                    Click to upload{" "}
                    <span className="text-text-sm-regular text-[#94969C]">
                      {" "}
                      or drag and drop <br /> DOC, DOCX, PDF(max. 5Mb)
                    </span>
                  </p>
                  {fileName && <p className="mt-2">{fileName}</p>}
                </label>
              </div>
              <Button
                onClick={handleSaveCvButtonClick}
                className="mt-4 w-full text-white bg-transparent  bg-blue items-center"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save"}
              </Button>
            </>
          ) : (
            <>
              {userDetails.cv ? (
                <Link
                  href={userDetails.cv}
                  target="_blank"
                  className="border px-4 py-2 rounded bg-blue"
                >
                  Open Your Resume
                </Link>
              ) : (
                "No CV uploaded"
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Card className="grid grid-cols-8 max-w-[100%] py-6 text-white border border-gray rounded-xl">
        <CardHeader className="col-span-3">
          <CardTitle>Cover Letter</CardTitle>
          <CardDescription>Write most updated cover letter</CardDescription>
        </CardHeader>
        <CardContent className="col-span-5">
          {isEditing ? (
            <>
              <Input
                type="Text"
                name="coverlatter"
                placeholder="Cover Letter"
                className="bg-gray px-3 pt-3 pb-16 rounded-md w-full items-center justify-center"
              />
              <Button
                onClick={handleSaveCoverLetterButtonClick}
                className="mt-4 bg-blue w-full"
              >
                {/* {loading ? 'Saving...' : 'Save'} */}
                Save
              </Button>
            </>
          ) : (
            <>
              {userDetails.coverLetter ? (
                <p>{userDetails.coverLetter}</p>
              ) : (
                "No Cover Letter uploaded"
              )}
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default UploadCv;
