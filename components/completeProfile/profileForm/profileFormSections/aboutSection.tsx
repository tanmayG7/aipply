/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateUserProfile, auth } from "@/lib/firebaseConfig/firebaseConfig";

const AboutSection = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    mobileNumber: "",
    email: "",
    currentJobTitle: "",
    aimingJobTitle: "",
    currentCTC: "",
    expectedCTC: "",
    linkedinProfile: "",
  });

  const [isFieldDirty, setIsFieldDirty] = useState(false);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setFormData((prevData) => ({
        ...prevData,
        email: user.email || "",
        firstName: user.displayName?.split(" ")[0] || "",
        lastName: user.displayName?.split(" ")[1] || "",
      }));
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setIsFieldDirty(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const user = auth.currentUser;
      if (user) {
        await updateUserProfile(user.uid, formData);
        setIsFieldDirty(false);
      }
    } catch (error: any) {
      console.error(error.message);
    }
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
        <form onSubmit={handleSubmit} className="flex flex-col w-full gap-6">
          <div className="grid gap-2 text-white">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              name="firstName"
              type="text"
              placeholder="Enter your First Name"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="grid gap-2 text-white">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              name="lastName"
              type="text"
              placeholder="Enter your Last Name"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="grid gap-2 text-white">
            <Label htmlFor="mobileNumber">Mobile Number</Label>
            <Input
              id="mobileNumber"
              name="mobileNumber"
              type="text"
              placeholder="Enter your Mobile Number"
              value={formData.mobileNumber}
              onChange={handleChange}
              required
            />
          </div>
          <div className="grid gap-2 text-white">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your Email"
              value={formData.email}
              onChange={handleChange}
              required
              readOnly
            />
          </div>
          <div className="grid gap-2 text-white">
            <Label htmlFor="currentJobTitle">Current Job Title</Label>
            <Input
              id="currentJobTitle"
              name="currentJobTitle"
              type="text"
              placeholder="Enter your Current Job Title"
              value={formData.currentJobTitle}
              onChange={handleChange}
              required
            />
          </div>
          <div className="grid gap-2 text-white">
            <Label htmlFor="aimingJobTitle">Aiming Job Title</Label>
            <select
              id="aimingJobTitle"
              name="aimingJobTitle"
              value={formData.aimingJobTitle}
              onChange={handleChange}
              required
              className="p-3 text-text-sm-regular font-inter text-[#94969C] bg-gray"
            >
              <option value="" disabled>
                Select your aiming job title
              </option>
              <option value="Content Writing">Content Writing</option>
              <option value="Data Analyst">Data Analyst</option>
              <option value="Data Engineer">Data Engineer</option>
              <option value="Digital Marketing">Digital Marketing</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Operations">Operations</option>
              <option value="Social Media">Social Media</option>
              <option value="Software Developer">Software Developer</option>
            </select>
          </div>
          <div className="grid gap-2 text-white">
            <Label htmlFor="currentCTC">Current CTC</Label>
            <Input
              id="currentCTC"
              name="currentCTC"
              type="text"
              placeholder="Enter your Current CTC"
              value={formData.currentCTC}
              onChange={handleChange}
              required
            />
          </div>
          <div className="grid gap-2 text-white">
            <Label htmlFor="expectedCTC">Expected CTC</Label>
            <Input
              id="expectedCTC"
              name="expectedCTC"
              type="text"
              placeholder="Enter your Expected CTC"
              value={formData.expectedCTC}
              onChange={handleChange}
              required
            />
          </div>
          <div className="grid gap-2 text-white">
            <Label htmlFor="linkedinProfile">LinkedIn Profile</Label>
            <Input
              id="linkedinProfile"
              name="linkedinProfile"
              type="text"
              placeholder="https://"
              value={formData.linkedinProfile}
              onChange={handleChange}
              required
            />
          </div>
          {isFieldDirty && (
            <Button type="submit" className="mt-4">
              Save
            </Button>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default AboutSection;
