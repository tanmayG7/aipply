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
import { auth, saveUserProfile } from "@/lib/firebaseConfig/firebaseConfig";
import { Button } from "@/components/ui/button";
import { UserDetails } from "@/lib/types";

interface SocialMediaLinksProps {
  isEditing: boolean;
  userDetails: UserDetails;
}

const SocialMediaLinks: React.FC<SocialMediaLinksProps> = ({
  isEditing,
  userDetails,
}) => {
  const [socialMediaLinks, setSocialMediaLinks] = useState({
    website: userDetails.socialMediaLinks.website || "",
    linkedin: userDetails.socialMediaLinks.linkedin || "",
    github: userDetails.socialMediaLinks.github || "",
    twitter: userDetails.socialMediaLinks.twitter || "",
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
      };
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
      <Card className="grid grid-cols-7 gap-[52px] max-w-[828px] py-10 border-b border-gray rounded-none">
        <CardHeader className="col-span-2">
          <CardTitle className="text-[16px] font-inter font-semibold text-white">
            Social Profiles
          </CardTitle>
          <CardDescription className="font-inter text-[14px] leading-[20px]">
            Where can people find you online?
          </CardDescription>
        </CardHeader>
        {isEditing ? (
          <CardContent className="flex flex-col gap-4 col-span-5">
            <div className="flex flex-col w-full gap-6">
              <div className="grid gap-2 text-white">
                <Label htmlFor="website">Website:</Label>
                <Input
                  type="url"
                  name="website"
                  value={socialMediaLinks.website}
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
                  value={socialMediaLinks.linkedin}
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
                  value={socialMediaLinks.github}
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
                  value={socialMediaLinks.twitter}
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
        ) : (
          <CardContent>
            <div className="flex flex-col gap-4 ">
              <h1 className="text-white opacity-80 px-6 py-2 text-text-lg-bold rounded-md">
                Github: 
                <span className="px-2 text-text-lg-regular">{userDetails.socialMediaLinks.github}</span>
              </h1>
              <h1 className="text-white opacity-80 px-6 py-2 text-text-lg-bold rounded-md">
                Linkedin:
                <span className="px-2 text-text-lg-regular">{userDetails.socialMediaLinks.linkedin}</span>
              </h1>
              <h1 className="text-white opacity-80  px-6 py-2 text-text-lg-bold rounded-md">
                Twitter:
                <span className="px-2 text-text-lg-regular">{userDetails.socialMediaLinks.twitter}</span>
              </h1>
              <h1 className="text-white opacity-80  px-6 py-2 text-text-lg-bold rounded-md">
                Website:
                <span className="px-2 text-text-lg-regular">{userDetails.socialMediaLinks.website}</span>
              </h1>
            </div>
          </CardContent>
        )}
      </Card>
    </form>
  );
};

export default SocialMediaLinks;
