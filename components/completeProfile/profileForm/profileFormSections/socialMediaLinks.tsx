import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import React from 'react'

const SocialMediaLinks = () => {
  const handleChange = (
    // e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    // const { name, value } = e.target;
    // setFormData((prevData) => ({
    //   ...prevData,
    //   [name]: value,
    // }));
  };
  return (
    <Card className="grid grid-cols-7 gap-[52px] max-w-[828px] py-6 border-b border-gray rounded-none">
      <CardHeader className="col-span-2">
        <CardTitle className="text-[16px] font-inter font-semibold text-white">
          Social Profiles
        </CardTitle>
        <CardDescription className="font-inter text-[14px] leading-[20px]">
          Where can people find you online?
        </CardDescription>
      </CardHeader>
      <CardContent className="col-span-5">
        <div className="flex flex-col w-full gap-6">
          <div className="grid gap-2 text-white">
            <Label htmlFor="website">Website:</Label>
            <Input
              type="url"
              name="website"
              placeholder="Enter your website URL"
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid gap-2 text-white">
            <Label htmlFor="linkedin">LinkedIn:</Label>
            <Input
              type="url"
              name="linkedin"
              placeholder="Enter your LinkedIn profile URL"
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid gap-2 text-white">
            <Label htmlFor="github">GitHub:</Label>
            <Input
              type="url"
              name="github"
              placeholder="Enter your GitHub profile URL"
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid gap-2 text-white">
            <Label htmlFor="twitter">Twitter/X:</Label>
            <Input
              type="url"
              name="twitter"
              placeholder="Enter your Twitter/X profile URL"
              onChange={handleChange}
              required
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default SocialMediaLinks