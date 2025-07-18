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
        <CardContent className="col-span-5">
          {isEditing ? (
            <div>
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center mb-4">
                <Input
                  type="file"
                  id="uploadFile"
                  name="uploadFile"
                  className="hidden"
                  onChange={handleUploadCv}
                  accept=".pdf,.doc,.docx"
                />
                <label htmlFor="uploadFile" className="cursor-pointer block">
                  <div className="text-white font-medium mb-2">Click to upload file</div>
                  <div className="text-gray-400 text-sm">PDF, DOC, DOCX up to 5MB</div>
                </label>
              </div>
              {fileName && (
                <div className="text-center mb-4">
                  <p className="text-green-400 text-sm">Selected: {fileName}</p>
                </div>
              )}
              <Button
                onClick={handleSaveCvButtonClick}
                className="px-6 py-2 text-white bg-blue-600 hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Resume"}
              </Button>
            </div>
          ) : (
            <div>
              {userDetails.cv ? (
                <div className="flex items-center justify-between border border-gray-700 rounded-lg p-4">
                  <div>
                    <h4 className="text-white font-medium">Resume uploaded</h4>
                    <p className="text-gray-400 text-sm">Your resume is ready</p>
                  </div>
                  <Link
                    href={userDetails.cv}
                    target="_blank"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                  >
                    View Resume
                  </Link>
                </div>
              ) : (
                <div className="border border-gray-700 rounded-lg p-4 text-center">
                  <p className="text-gray-400">No resume uploaded yet</p>
                </div>
              )}
            </div>
          )}
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
          {isEditing ? (
            <div>
              <textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Write your cover letter here..."
                className="w-full h-32 bg-gray-800 border border-gray-600 rounded-md px-3 py-3 text-white placeholder-gray-400 resize-none mb-4"
                rows={6}
              />
              <Button
                onClick={handleSaveCoverLetterButtonClick}
                className="px-6 py-2 text-white bg-blue-600 hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Cover Letter"}
              </Button>
            </div>
          ) : (
            <div>
              {userDetails.coverLetter ? (
                <div className="border border-gray-700 rounded-lg p-4">
                  <p className="text-gray-300 whitespace-pre-wrap">{userDetails.coverLetter}</p>
                </div>
              ) : (
                <div className="border border-gray-700 rounded-lg p-4 text-center">
                  <p className="text-gray-400">No cover letter written yet</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UploadCv;
