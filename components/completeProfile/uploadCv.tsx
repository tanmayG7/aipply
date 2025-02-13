import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { auth, saveUserProfile } from "@/lib/firebaseConfig/firebaseConfig";
import { Button } from '../ui/button'; // Import Button component

interface UploadCvProps {
  isEditing: boolean;
}

const UploadCv:React.FC<UploadCvProps> = () => {

  const handleUploadCv = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const user = auth.currentUser;
      if (user) {
        const userDetails = {
          cv: file.name,
        };
        await saveUserProfile(user.uid, userDetails);
      }
    }
  };

  const handleSaveButtonClick = async () => {
    const inputElement = document.getElementById('uploadFile') as HTMLInputElement;
    if (inputElement && inputElement.files) {
      const event = { target: inputElement } as React.ChangeEvent<HTMLInputElement>;
      await handleUploadCv(event);
    }
  };

  return (
    <Card className="grid grid-cols-8 max-w-[828px] py-6 text-white border border-gray rounded-xl">
      <CardHeader className="col-span-3">
        <CardTitle>Upload your resume or CV</CardTitle>
        <CardDescription>Upload most up-to-date resume.</CardDescription>
      </CardHeader>
      <CardContent className="col-span-5">
        {/* {isEditing && ( */}
          <>
            <Input
              type="file"
              id="uploadFile"
              name="uploadFile"
              className="bg-gray px-3 pt-3 pb-12 rounded-md w-full items-center justify-center"
              onChange={handleUploadCv}
            />
            <Button onClick={handleSaveButtonClick} className="mt-4">Save</Button>
          </>
        {/* )} */}
      </CardContent>
    </Card>
  );
}

export default UploadCv;