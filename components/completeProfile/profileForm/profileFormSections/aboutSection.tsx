import React from "react";

import { Label } from "@/components/ui/label";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const AboutSection = () => {
  const [formData, setFormData] = React.useState({
    yourName: "",
    uploadFile: "",
    whereYouBased: "",
    primaryRole: "",
    experience: "",
    role: "",
    bio: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
  return (
    <Card className="grid grid-cols-7 gap-[52px] max-w-[828px] py-6 border-b border-gray rounded-none">
      <CardHeader className="col-span-2">
        <CardTitle className="text-[16px] font-inter font-semibold text-white">
          About
        </CardTitle>
        <CardDescription className="font-inter text-[14px] leading-[20px]">
          Tell us about yourself so startups know who you are.
        </CardDescription>
      </CardHeader>
      <CardContent className="col-span-5">
        <div className="flex flex-col w-full gap-6">
          <div className="grid gap-2 text-white">
            <Label htmlFor="yourName">Your Name</Label>
            <Input
              id="yourName"
              name="yourName"
              type="text"
              placeholder="Enter your First Name"
              value={formData.yourName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="flex flex-row gap-2 text-white">
            <Image
              src="/static/images/profilePic.png"
              alt="Profile"
              width={56}
              height={56}
              className="rounded-full"
            />
            <Input
              type="file"
              name="uploadFile"
              placeholder="Upload a new picture"
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid gap-2 text-white">
            <Label htmlFor="whereYouBased">Where You Based:</Label>
            <Input
              type="text"
              name="whereYouBased"
              placeholder="Where You Based"
              onChange={handleChange}
              required
            />
          </div>
          <div className="grid gap-2 text-white">
            <Label htmlFor="primaryRole">Select Your Primary Role:</Label>
            <Input
              type="text"
              name="primaryRole"
              placeholder="Select Your Primary Role"
              onChange={handleChange}
              required
            />
          </div>
          <div className="grid gap-2 text-white">
            <Label htmlFor="experience">Years of Experience:</Label>
            <Input
              type="number"
              name="experience"
              placeholder="Years of Experience"
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid gap-2 text-white">
            <Label htmlFor="role">Select Role as a Keyword:</Label>
            <Input
              type="text"
              name="role"
              placeholder="Select Role as a Keyword:"
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid gap-2 text-white">
            <Label htmlFor="bio">Your Bio:</Label>
            <textarea
              name="bio"
              placeholder="Your Bio"
              onChange={handleChange}
              required
              className="bg-gray px-3 pt-3 pb-12 rounded-md"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AboutSection;
