import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useState } from "react";
import {
  auth,
  saveUserProfile,
} from "@/lib/firebaseConfig/firebaseConfig";
import { Button } from "@/components/ui/button";

const SocialMediaLinks = () => {
  const [socialMediaLinks, setSocialMediaLinks] = useState({
    website: "",
    linkedin: "",
    github: "",
    twitter: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSocialMediaLinks((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (user) {
      const userDetails = {
         socialMediaLinks,
      }
      await saveUserProfile(user.uid, userDetails);
    }
    setSocialMediaLinks({
      website: "",
      linkedin: "",
      github: "",
      twitter: "",
    });
  };

  return (
    <form>
      <Card className="grid grid-cols-7 gap-[52px] max-w-[828px] py-6 border-b border-gray rounded-none">
        <CardHeader className="col-span-2">
          <CardTitle className="text-[16px] font-inter font-semibold text-white">
            Social Profiles
          </CardTitle>
          <CardDescription className="font-inter text-[14px] leading-[20px]">
            Where can people find you online?
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 col-span-5">
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
          <div className="flex gap-4">
            <Button
              className="w-fit px-8 bg-transparent text-white border border-[#84849a]"
              onClick={handleSave}
            >
              Save
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
};

export default SocialMediaLinks;
