/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { auth, saveUserProfile } from "@/lib/firebaseConfig/firebaseConfig";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { UserDetails } from "@/lib/types";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

interface AboutSectionProps {
  userDetails: UserDetails;
  isEditing: boolean;
}

const AboutSection: React.FC<AboutSectionProps> = ({
  isEditing,
  userDetails,
}) => {
  const [formData, setFormData] = useState({
    firstName: userDetails.firstName || "",
    lastName: userDetails.lastName || "",
    whereYouBased: userDetails.whereYouBased || "",
    primaryRole: userDetails.primaryRole || "",
    workexperience: userDetails.workexperience || "",
    role: userDetails.role || "",
    bio: userDetails.bio || "",
  });

  const [profilePic, setProfilePic] = useState(userDetails.uploadFile || "");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const user = auth.currentUser;
      if (user) {
        const storage = getStorage();
        const storageRef = ref(
          storage,
          `profilePictures/${user.uid}/${file.name}`
        );
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
        setFormData((prevData) => ({
          ...prevData,
          uploadFile: downloadURL,
        }));
        setProfilePic(downloadURL);
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const user = auth.currentUser;
      if (user) {
        await saveUserProfile(user.uid, formData);
        setFormData({
          firstName: "",
          lastName: "",
          whereYouBased: "",
          primaryRole: "",
          workexperience: "",
          role: "",
          bio: "",
        });
      }
    } catch (error: any) {
      console.error(error.message);
    }
  };

  return (
    <Card className="grid grid-cols-7 gap-[52px] max-w-[100%] py-6 border-b border-gray rounded-none">
      <CardHeader className="col-span-2">
        <CardTitle className="text-[16px] font-inter font-semibold text-white">
          About
        </CardTitle>
        <CardDescription className="font-inter text-[14px] leading-[20px]">
          Tell us about yourself so startups know who you are.
        </CardDescription>
      </CardHeader>
      <CardContent className="col-span-5">
        {isEditing ? (
          <form className="flex flex-col w-full gap-6">
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
            <div className="flex flex-row gap-2 text-white">
              <Image
                src={profilePic || "/static/images/profilePic.png"}
                alt="Profile"
                width={56}
                height={56}
                className="rounded-full"
              />
              <div>
                <Input
                  type="file"
                  name="uploadFile"
                  placeholder="Upload a new picture"
                  onChange={handleFileChange}
                  required
                  className="text-white bg-gray py-4 px-4 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-gray hover:file:bg-violet-100"
                />
              </div>
            </div>
            <div className="grid gap-2 text-white">
              <Label htmlFor="whereYouBased">Where You Based:</Label>
              <Input
                type="text"
                name="whereYouBased"
                value={formData.whereYouBased}
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
                value={formData.primaryRole}
                placeholder="Select Your Primary Role"
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid gap-2 text-white">
              <Label htmlFor="experience">Years of Experience:</Label>
              <Input
                type="number"
                name="workexperience"
                value={formData.workexperience}
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
                value={formData.role}
                placeholder="Select Role as a Keyword:"
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid gap-2 text-white">
              <Label htmlFor="bio">Your Bio:</Label>
              <textarea
                name="bio"
                value={formData.bio}
                placeholder="Your Bio"
                onChange={handleChange}
                required
                className="bg-gray px-3 pt-3 pb-12 rounded-md"
              />
            </div>
            <div className="flex gap-4">
              <Button
                className="w-fit px-8 text-white bg-transparent border border-gray"
                onClick={handleSave}
              >
                Save
              </Button>
            </div>
          </form>
        ) : (
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-row gap-4 items-center">
              <Image
                src={profilePic || "/static/images/profilePic.png"}
                alt="Profile"
                width={64}
                height={64}
                className="rounded-full"
              />
              <div className="flex flex-col">
                <h1 className="text-white text-text-lg-semibold">
                  {userDetails.firstName} {userDetails.lastName}
                </h1>
                <p className="text-slate-300 text-text-md-medium">
                  {userDetails.email}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 ">
              <div className="grid grid-cols-2 justify-between text-white">
                <div className="flex flex-col gap-1">
                  <h1 className="text-slate-500 text-text-lg-bold">
                    First Name
                  </h1>
                  <h1 className="text-text-lg-regular">{userDetails.firstName}</h1>
                </div>
                <div className="flex flex-col gap-1">
                  <h1 className="text-slate-500 text-text-lg-bold">
                    Last Name
                  </h1>
                  <h1 className="text-text-lg-regular">{userDetails.lastName}</h1>
                </div>
              </div>

              <div className="grid grid-cols-2 justify-between text-white">
                <div className="flex flex-col gap-1">
                  <h1 className="text-slate-500 text-text-lg-bold">
                    Primary Role:
                  </h1>
                  <h1 className="text-text-lg-regular">
                    {userDetails.primaryRole}
                  </h1>
                </div>
                <div className="flex flex-col gap-1">
                  <h1 className="text-slate-500 text-text-lg-bold">
                    Work Experience
                  </h1>
                  <h1 className="text-text-lg-regular">
                    {userDetails.workexperience}
                  </h1>
                </div>
              </div>

              <div className="grid grid-cols-2 justify-between text-white">
                <div className="flex flex-col gap-1">
                  <h1 className="text-slate-500 text-text-lg-bold">Role</h1>
                  <h1 className="text-text-lg-regular">{userDetails.role}</h1>
                </div>
                <div className="flex flex-col gap-1">
                  <h1 className="text-slate-500 text-text-lg-bold">Location</h1>
                  <h1 className="text-text-lg-regular">
                    {userDetails.whereYouBased}
                  </h1>
                </div>
              </div>

              <div className="grid grid-cols-1 justify-between text-white">
                <div className="flex flex-col gap-1">
                  <h1 className="text-slate-500 text-text-lg-bold">Bio</h1>
                  <h1 className="text-text-lg-regular opacity-70">{userDetails.bio}</h1>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </CardContent>
    </Card>
  );
};

export default AboutSection;
