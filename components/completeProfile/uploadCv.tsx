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
    <>
      {/* Resume Upload Section */}
      <Card className="grid grid-cols-7 gap-[52px] py-6 border-b border-gray rounded-none">
        <CardHeader className="col-span-2">
          <CardTitle className="text-[16px] font-inter font-semibold text-white">
            Upload your resume or CV
          </CardTitle>
          <CardDescription className="font-inter text-[14px] leading-[20px]">
            Upload most up-to-date resume.
          </CardDescription>
        </CardHeader>
        <CardContent className="col-span-5">
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
                  {fileName && <p className="mt-2 text-white">{fileName}</p>}
                </label>
              </div>
              <div className="flex gap-4 mt-4">
                <Button
                  onClick={handleSaveCvButtonClick}
                  className="w-fit px-8 text-white bg-transparent border border-gray"
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save Resume"}
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-2">
              {userDetails.cv ? (
                <Link
                  href={userDetails.cv}
                  target="_blank"
                  className="inline-block border px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                >
                  Open Your Resume
                </Link>
              ) : (
                <p className="text-gray-500 italic">No resume uploaded</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cover Letter Section */}
      <Card className="grid grid-cols-7 gap-[52px] py-6 rounded-none">
        <CardHeader className="col-span-2">
          <CardTitle className="text-[16px] font-inter font-semibold text-white">
            Cover Letter
          </CardTitle>
          <CardDescription className="font-inter text-[14px] leading-[20px]">
            Write most updated cover letter
          </CardDescription>
        </CardHeader>
        <CardContent className="col-span-5">
          {isEditing ? (
            <>
              <textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Write your cover letter here..."
                className="bg-gray px-3 pt-3 pb-16 rounded-md w-full text-white placeholder-gray-400 border border-gray-600 focus:border-blue-500 focus:outline-none"
                rows={6}
              />
              <div className="flex gap-4 mt-4">
                <Button
                  onClick={handleSaveCoverLetterButtonClick}
                  className="w-fit px-8 text-white bg-transparent border border-gray"
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save Cover Letter"}
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-2">
              {userDetails.coverLetter ? (
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                  <p className="text-gray-300 whitespace-pre-wrap">{userDetails.coverLetter}</p>
                </div>
              ) : (
                <p className="text-gray-500 italic">No cover letter written</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default UploadCv;
