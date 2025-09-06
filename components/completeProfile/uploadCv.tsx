"use client";
import React, { useState } from "react";
import { Input } from "../ui/input";
import { auth, saveUserProfile } from "@/lib/firebaseConfig/firebaseConfig";
import { Button } from "../ui/button";
import { CheckCircle2 } from "lucide-react";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { UserDetails } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";

interface UploadCvProps {
  isEditing: boolean;
  userDetails: UserDetails;
  onExitEditMode?: () => void;
}

const UploadCv: React.FC<UploadCvProps> = ({ isEditing, userDetails, onExitEditMode }) => {
  const [resumeSaveStatus, setResumeSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [coverLetterSaveStatus, setCoverLetterSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
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
    setResumeSaveStatus('saving');
    try {
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
        
        setResumeSaveStatus('saved');
        setTimeout(() => {
          setResumeSaveStatus('idle');
          if (onExitEditMode) {
            onExitEditMode();
          }
        }, 2000);
      }
    } catch (error) {
      console.error('Error saving resume:', error);
      setResumeSaveStatus('idle');
    }
  };

  const handleSaveCoverLetterButtonClick = async () => {
    setCoverLetterSaveStatus('saving');
    try {
      const user = auth.currentUser;

      if (user && coverLetter) {
        const userDetails: UserDetails = {
          coverLetter: coverLetter,
        };
        await saveUserProfile(user.uid, userDetails);
        
        setCoverLetterSaveStatus('saved');
        setTimeout(() => {
          setCoverLetterSaveStatus('idle');
          if (onExitEditMode) {
            onExitEditMode();
          }
        }, 2000);
      }
    } catch (error) {
      console.error('Error saving cover letter:', error);
      setCoverLetterSaveStatus('idle');
    }
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
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center mb-4 bg-gray-800/30">
                <Input
                  type="file"
                  id="uploadFile"
                  name="uploadFile"
                  className="hidden"
                  onChange={handleUploadCv}
                  accept=".pdf,.doc,.docx"
                />
                <label htmlFor="uploadFile" className="cursor-pointer block">
                  <div className="mb-4">
                    <Image
                      src="/static/icons/uploadIcon.svg"
                      width={48}
                      height={48}
                      alt="Upload"
                      className="mx-auto"
                    />
                  </div>
                  <div className="text-white font-medium mb-2">Click to upload</div>
                  <div className="text-slate-400 text-sm">or drag and drop <br /> DOC, DOCX, PDF (max. 5MB)</div>
                </label>
              </div>
              {fileName && (
                <div className="text-center mb-4">
                  <p className="text-green-400 text-sm">Selected: {fileName}</p>
                </div>
              )}
              <Button
                onClick={handleSaveCvButtonClick}
                disabled={resumeSaveStatus === 'saving' || resumeSaveStatus === 'saved'}
                className={`w-fit px-8 text-white transition-colors ${
                  resumeSaveStatus === 'saved' 
                    ? 'bg-green-600 border-green-600 cursor-not-allowed' 
                    : 'bg-transparent border border-gray'
                }`}
              >
                {resumeSaveStatus === 'saving' ? (
                  "Saving..."
                ) : resumeSaveStatus === 'saved' ? (
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Saved!</span>
                  </div>
                ) : (
                  "Save Resume"
                )}
              </Button>
            </div>
          ) : (
            <div>
              {userDetails.cv ? (
                <div className="flex items-center justify-between border border-[#371b7e] rounded-lg p-4">
                  <div>
                    <h4 className="text-white font-medium">Resume uploaded</h4>
                    <p className="text-slate-400 text-sm">Your resume is ready</p>
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
                <div className="border border-[#371b7e] rounded-lg p-4 text-center">
                  <p className="text-slate-500 italic opacity-70">No resume uploaded yet</p>
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
                className="bg-gray px-3 pt-3 pb-16 rounded-md w-full text-white placeholder-gray-400 border border-gray-600 focus:border-blue-500 focus:outline-none mb-4"
                rows={6}
              />
              <Button
                onClick={handleSaveCoverLetterButtonClick}
                disabled={coverLetterSaveStatus === 'saving' || coverLetterSaveStatus === 'saved'}
                className={`w-fit px-8 text-white transition-colors ${
                  coverLetterSaveStatus === 'saved' 
                    ? 'bg-green-600 border-green-600 cursor-not-allowed' 
                    : 'bg-transparent border border-gray'
                }`}
              >
                {coverLetterSaveStatus === 'saving' ? (
                  "Saving..."
                ) : coverLetterSaveStatus === 'saved' ? (
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Saved!</span>
                  </div>
                ) : (
                  "Save Cover Letter"
                )}
              </Button>
            </div>
          ) : (
            <div>
              {userDetails.coverLetter ? (
                <div className="border border-[#371b7e] rounded-lg p-4">
                  <p className="text-text-lg-regular opacity-70 text-white whitespace-pre-wrap">{userDetails.coverLetter}</p>
                </div>
              ) : (
                <div className="border border-[#371b7e] rounded-lg p-4 text-center">
                  <p className="text-slate-500 italic opacity-70">No cover letter written yet</p>
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
