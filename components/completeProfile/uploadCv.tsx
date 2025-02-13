import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';

interface UploadCvProps {
  isEditing: boolean;
}

const UploadCv:React.FC<UploadCvProps> = ({ isEditing }) => {
  return (
    <Card className="grid grid-cols-8 max-w-[828px] py-6 text-white border border-gray rounded-xl">
      <CardHeader className="col-span-3">
        <CardTitle>Upload your resume or CV</CardTitle>
        <CardDescription>Upload most up-to-date resume.</CardDescription>
      </CardHeader>
      <CardContent className="col-span-5">
        {isEditing && (
          <Input
            type="file"
            id="uploadFile"
            name="uploadFile"
            className="bg-gray px-3 pt-3 pb-12 rounded-md w-full items-center justify-center"
          />
        )}
      </CardContent>
    </Card>
  );
}

export default UploadCv;