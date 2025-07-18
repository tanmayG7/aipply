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
          {isEditing ? (
            <div className="space-y-6">
              <div className="border border-gray-700 rounded-lg p-6 bg-gray-900/50">
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center justify-center border-2 border-dashed border-gray-600 rounded-lg p-8 bg-gray-800/30">
                    <div className="text-center">
                      <div className="mb-4">
                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <Input
                        type="file"
                        id="uploadFile"
                        name="uploadFile"
                        className="hidden"
                        onChange={handleUploadCv}
                        accept=".pdf,.doc,.docx"
                      />
                      <label htmlFor="uploadFile" className="cursor-pointer">
                        <div className="text-white font-medium">Click to upload file</div>
                        <div className="text-gray-400 text-sm mt-1">PDF, DOC, DOCX up to 5MB</div>
                      </label>
                    </div>
                  </div>
                  {fileName && (
                    <div className="text-center">
                      <p className="text-green-400 text-sm">Selected: {fileName}</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-start">
                <Button
                  onClick={handleSaveCvButtonClick}
                  className="px-6 py-2 text-white bg-blue-600 hover:bg-blue-700 border-0"
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save Resume"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {userDetails.cv ? (
                <div className="border border-gray-700 rounded-lg p-6 bg-gray-900/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">Resume uploaded</h4>
                      <p className="text-gray-400 text-sm">Your resume is ready</p>
                    </div>
                    <Link
                      href={userDetails.cv}
                      target="_blank"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                    >
                      View Resume
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="border border-gray-700 rounded-lg p-6 bg-gray-900/50">
                  <p className="text-gray-400 text-center">No resume uploaded yet</p>
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
            <div className="space-y-6">
              <div className="border border-gray-700 rounded-lg p-4 bg-gray-900/50">
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Write your cover letter here..."
                  className="w-full h-40 bg-transparent text-white placeholder-gray-400 border-0 resize-none focus:outline-none"
                  rows={8}
                />
              </div>
              <div className="flex justify-start">
                <Button
                  onClick={handleSaveCoverLetterButtonClick}
                  className="px-6 py-2 text-white bg-blue-600 hover:bg-blue-700 border-0"
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save Cover Letter"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {userDetails.coverLetter ? (
                <div className="border border-gray-700 rounded-lg p-6 bg-gray-900/50">
                  <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{userDetails.coverLetter}</p>
                </div>
              ) : (
                <div className="border border-gray-700 rounded-lg p-6 bg-gray-900/50">
                  <p className="text-gray-400 text-center">No cover letter written yet</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
      </Card>
    </div>
  );
};

export default UploadCv;
