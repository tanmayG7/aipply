import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';

const UploadCv = () => {
  return (
    <Card className="grid grid-cols-8 max-w-[828px] py-6 text-white">
      <CardHeader className="col-span-3">
        <CardTitle>Upload your resume or CV</CardTitle>
        <CardDescription>Upload most up-to-date resume.</CardDescription>
      </CardHeader>
      <CardContent className="col-span-5">
        <Input
          type="file"
          id="uploadFile"
          name="uploadFile"
          className="bg-gray px-3 pt-3 pb-12 rounded-md w-full items-center justify-center"
        />
      </CardContent>
    </Card>
  );
}

export default UploadCv;