import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useState, useEffect } from "react";
import { auth, saveUserProfile } from "@/lib/firebaseConfig/firebaseConfig";
import { Button } from "@/components/ui/button";
import { UserDetails } from "@/lib/types";
import {
  LucideGithub,
  LucideLinkedin,
  LucideTwitter,
  LucideGlobe,
  CheckCircle2,
} from "lucide-react";

interface SocialMediaLinksProps {
  isEditing: boolean;
  userDetails: UserDetails;
  onExitEditMode?: () => void;
  onRefresh?: () => Promise<void>;
}

const SocialMediaLinks: React.FC<SocialMediaLinksProps> = ({
  isEditing,
  userDetails,
  onExitEditMode,
  onRefresh,
}) => {
  const [socialMediaLinks, setSocialMediaLinks] = useState({
    website: userDetails.socialMediaLinks?.website || "",
    linkedin: userDetails.socialMediaLinks?.linkedin || "",
    github: userDetails.socialMediaLinks?.github || "",
    twitter: userDetails.socialMediaLinks?.twitter || "",
  });
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  // Update social media links when userDetails change
  useEffect(() => {
    setSocialMediaLinks({
      website: userDetails.socialMediaLinks?.website || "",
      linkedin: userDetails.socialMediaLinks?.linkedin || "",
      github: userDetails.socialMediaLinks?.github || "",
      twitter: userDetails.socialMediaLinks?.twitter || "",
    });
  }, [userDetails]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSocialMediaLinks((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent double-clicks
    if (saveStatus !== 'idle') return;
    
    setSaveStatus('saving');
    try {
      const user = auth.currentUser;
      if (!user) {
        alert('Please log in to save your social profiles.');
        setSaveStatus('idle');
        return;
      }
      
      const userDetails = {
        socialMediaLinks,
      };
      await saveUserProfile(user.uid, userDetails);
      
      // Refresh parent component data
      if (onRefresh) {
        await onRefresh();
      }
      
      setSaveStatus('saved');
      
      // Show success state for 2 seconds then exit edit mode
      const newTimeoutId = setTimeout(() => {
        setSaveStatus('idle');
        if (onExitEditMode) {
          onExitEditMode();
        }
      }, 2000);
      setTimeoutId(newTimeoutId);
      
    } catch (error: any) {
      console.error('Error saving social profiles:', error);
      setSaveStatus('idle');
      
      const errorMessage = error?.message || 'Unknown error occurred';
      alert(`Failed to save social profiles: ${errorMessage}. Please try again.`);
    }
  };

  return (
    <form>
      <Card className="grid grid-cols-7 gap-[52px] max-w-[100%] py-10 border-b border-gray rounded-none" style={{display:"flex",flexWrap:"wrap"}}>
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
                onClick={handleSave}
                disabled={saveStatus === 'saving' || saveStatus === 'saved'}
                className={`w-fit px-8 text-white transition-colors ${
                  saveStatus === 'saved' 
                    ? 'bg-green-600 border-green-600 cursor-not-allowed' 
                    : 'bg-transparent border border-gray'
                }`}
              >
                {saveStatus === 'saving' ? (
                  "Saving..."
                ) : saveStatus === 'saved' ? (
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Saved!</span>
                  </div>
                ) : (
                  "Save"
                )}
              </Button>
            </div>
          </CardContent>
        ) : (
          <CardContent className="flex col-span-5">
            <div className="flex flex-col gap-4 ">
              <div className="flex flex-col gap-4">
                {userDetails.socialMediaLinks?.github && (
                  <div className="flex flex-row gap-2">
                    <LucideGithub className="text-white" />
                    <h1 className="text-slate-500 text-text-xl-bold">
                      Github:
                    </h1>
                    <h1 className="text-text-lg-regular text-white cursor-pointer hover:opacity-70">
                      {userDetails.socialMediaLinks?.github}
                    </h1>
                  </div>
                )}

                {userDetails.socialMediaLinks?.linkedin && (
                <div className="flex flex-row gap-3">
                  <LucideLinkedin className="text-white" />
                  <h1 className="text-slate-500 text-text-lg-bold">
                    Linkedin:
                  </h1>
                  <h1 className="text-text-lg-regular text-white cursor-pointer hover:opacity-70">
                    {userDetails.socialMediaLinks?.linkedin}
                  </h1>
                </div>
                )}

                {userDetails.socialMediaLinks?.twitter && (
                <div className="flex flex-row gap-3">
                  <LucideTwitter className="text-white" />
                  <h1 className="text-slate-500 text-text-lg-bold">Twitter:</h1>
                  <h1 className="text-text-lg-regular text-white cursor-pointer hover:opacity-70">
                    {userDetails.socialMediaLinks?.twitter}
                  </h1>
                </div>
                )}

                {userDetails.socialMediaLinks?.website && (
                <div className="flex flex-row gap-3">
                  <LucideGlobe className="text-white" />
                  <h1 className="text-slate-500 text-text-lg-bold">Website:</h1>
                  <h1 className="text-text-lg-regular text-white cursor-pointer hover:opacity-70">
                    {userDetails.socialMediaLinks?.website}
                  </h1>
                </div>
                )}
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </form>
  );
};

export default SocialMediaLinks;
