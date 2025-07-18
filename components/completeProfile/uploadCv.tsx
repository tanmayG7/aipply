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
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ 
                border: '1px solid #374151', 
                borderRadius: '8px', 
                padding: '24px', 
                backgroundColor: 'rgba(17, 24, 39, 0.5)',
                width: '100%'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ 
                    border: '2px dashed #4B5563', 
                    borderRadius: '8px', 
                    padding: '32px', 
                    backgroundColor: 'rgba(31, 41, 55, 0.3)',
                    textAlign: 'center',
                    width: '100%'
                  }}>
                    <Input
                      type="file"
                      id="uploadFile"
                      name="uploadFile"
                      style={{ display: 'none' }}
                      onChange={handleUploadCv}
                      accept=".pdf,.doc,.docx"
                    />
                    <label htmlFor="uploadFile" style={{ cursor: 'pointer', width: '100%', display: 'block' }}>
                      <div style={{ color: 'white', fontWeight: '500', marginBottom: '8px' }}>Click to upload file</div>
                      <div style={{ color: '#9CA3AF', fontSize: '14px' }}>PDF, DOC, DOCX up to 5MB</div>
                    </label>
                  </div>
                  {fileName && (
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ color: '#10B981', fontSize: '14px' }}>Selected: {fileName}</p>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <Button
                  onClick={handleSaveCvButtonClick}
                  style={{ 
                    padding: '8px 24px', 
                    color: 'white', 
                    backgroundColor: '#2563EB', 
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save Resume"}
                </Button>
              </div>
            </div>
          ) : (
            <div style={{ width: '100%' }}>
              {userDetails.cv ? (
                <div style={{ 
                  border: '1px solid #374151', 
                  borderRadius: '8px', 
                  padding: '24px', 
                  backgroundColor: 'rgba(17, 24, 39, 0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%'
                }}>
                  <div>
                    <h4 style={{ color: 'white', fontWeight: '500', margin: '0 0 4px 0' }}>Resume uploaded</h4>
                    <p style={{ color: '#9CA3AF', fontSize: '14px', margin: '0' }}>Your resume is ready</p>
                  </div>
                  <Link
                    href={userDetails.cv}
                    target="_blank"
                    style={{ 
                      padding: '8px 16px', 
                      backgroundColor: '#2563EB', 
                      color: 'white', 
                      textDecoration: 'none',
                      borderRadius: '6px'
                    }}
                  >
                    View Resume
                  </Link>
                </div>
              ) : (
                <div style={{ 
                  border: '1px solid #374151', 
                  borderRadius: '8px', 
                  padding: '24px', 
                  backgroundColor: 'rgba(17, 24, 39, 0.5)',
                  textAlign: 'center',
                  width: '100%'
                }}>
                  <p style={{ color: '#9CA3AF', margin: '0' }}>No resume uploaded yet</p>
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
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ 
                border: '1px solid #374151', 
                borderRadius: '8px', 
                padding: '16px', 
                backgroundColor: 'rgba(17, 24, 39, 0.5)',
                width: '100%'
              }}>
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Write your cover letter here..."
                  style={{
                    width: '100%',
                    height: '160px',
                    backgroundColor: 'transparent',
                    color: 'white',
                    border: 'none',
                    outline: 'none',
                    resize: 'none',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
              <div>
                <Button
                  onClick={handleSaveCoverLetterButtonClick}
                  style={{ 
                    padding: '8px 24px', 
                    color: 'white', 
                    backgroundColor: '#2563EB', 
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save Cover Letter"}
                </Button>
              </div>
            </div>
          ) : (
            <div style={{ width: '100%' }}>
              {userDetails.coverLetter ? (
                <div style={{ 
                  border: '1px solid #374151', 
                  borderRadius: '8px', 
                  padding: '24px', 
                  backgroundColor: 'rgba(17, 24, 39, 0.5)',
                  width: '100%'
                }}>
                  <p style={{ color: '#D1D5DB', whiteSpace: 'pre-wrap', lineHeight: '1.6', margin: '0' }}>
                    {userDetails.coverLetter}
                  </p>
                </div>
              ) : (
                <div style={{ 
                  border: '1px solid #374151', 
                  borderRadius: '8px', 
                  padding: '24px', 
                  backgroundColor: 'rgba(17, 24, 39, 0.5)',
                  textAlign: 'center',
                  width: '100%'
                }}>
                  <p style={{ color: '#9CA3AF', margin: '0' }}>No cover letter written yet</p>
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
