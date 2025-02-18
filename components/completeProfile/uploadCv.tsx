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

interface UploadCvProps {
  isEditing: boolean;
  userDetails: UserDetails;
}

const UploadCv: React.FC<UploadCvProps> = ({ isEditing, userDetails }) => {
  const [loading, setLoading] = useState(false);

  const handleUploadCv = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
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

      // Clear input
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

      // Clear input
      coverLetterElement.value = "";
    }
    setLoading(false);
  };

  return (
    <>
      <Card className="grid grid-cols-8 max-w-[828px] py-6 text-white border border-gray rounded-xl">
        <CardHeader className="col-span-3">
          <CardTitle>Upload your resume or CV</CardTitle>
          <CardDescription>Upload most up-to-date resume.</CardDescription>
        </CardHeader>
        <CardContent className="col-span-5">
          {isEditing ? (
            <>
              <Input
                type="file"
                id="uploadFile"
                name="uploadFile"
                className="text-white bg-gray py-6 px-4 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-gray hover:file:bg-violet-100"
                onChange={handleUploadCv}
              />
              <Button
                onClick={handleSaveCvButtonClick}
                className="mt-4"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save"}
              </Button>
            </>
          ) : (
            <>
              {userDetails.cv ? (
                <Link href={userDetails.cv} className="border px-4 py-2 rounded bg-blue">Open Your Resume</Link>
              ) : (
                "No CV uploaded"
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Card className="grid grid-cols-8 max-w-[828px] py-6 text-white border border-gray rounded-xl">
        <CardHeader className="col-span-3">
          <CardTitle>Cover Latter</CardTitle>
          <CardDescription>Upload most up-to-date resume.</CardDescription>
        </CardHeader>
        <CardContent className="col-span-5">
          {isEditing ? (
          <>
            <Input
              type="Text"
              name="coverlatter"
              placeholder="Cover Letter"
              className="bg-gray px-3 pt-3 pb-12 rounded-md w-full items-center justify-center"
            />
            <Button onClick={handleSaveCoverLetterButtonClick} className="mt-4">
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
