/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
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
import { Upload, CheckCircle2 } from "lucide-react";
import { jobRoles } from "@/lib/jobRoles";

interface AboutSectionProps {
  userDetails: UserDetails;
  isEditing: boolean;
  onExitEditMode?: () => void;
  onRefresh?: () => Promise<void>;
}

const AboutSection: React.FC<AboutSectionProps> = ({
  isEditing,
  userDetails,
  onExitEditMode,
  onRefresh,
}) => {
  console.log(userDetails,"formData");
  const [formData, setFormData] = useState({
    firstName: userDetails.firstName || "",
    lastName: userDetails.lastName || "",
    whereYouBased: userDetails.whereYouBased || "",
    jobTitle: userDetails.jobTitle || "",
    workexperience: userDetails.workexperience || "",
    role: userDetails.role || "",
    bio: userDetails.bio || "",
    showDropdown: false,
  });

  const [profilePic, setProfilePic] = useState(userDetails.uploadFile || "");
  const [fileName, setFileName] = useState<string | null>(null);
  const [jobRoleSearch, setJobRoleSearch] = useState("");
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Update form data when userDetails change
    setFormData({
      firstName: userDetails.firstName || "",
      lastName: userDetails.lastName || "",
      whereYouBased: userDetails.whereYouBased || "",
      jobTitle: userDetails.jobTitle || "",
      workexperience: userDetails.workexperience || "",
      role: userDetails.role || "",
      bio: userDetails.bio || "",
      showDropdown: false,
    });
    
    // Update profile picture
    setProfilePic(userDetails.uploadFile || "");
  }, [userDetails])

  // Cleanup timeout on unmount or when save status changes
  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId])

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
      setFileName(file.name);
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
    
    // Prevent double-clicks
    if (saveStatus !== 'idle') return;
    
    // Basic form validation
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      alert('Please fill in your first and last name.');
      return;
    }
    
    if (!formData.whereYouBased.trim()) {
      alert('Please enter your location.');
      return;
    }
    
    setSaveStatus('saving');
    try {
      const user = auth.currentUser;
      if (!user) {
        alert('Please log in to save your profile.');
        setSaveStatus('idle');
        return;
      }
      
      // Include profile picture in save data if it exists
      const saveData = {
        ...formData,
        ...(profilePic && { uploadFile: profilePic })
      };
      
      await saveUserProfile(user.uid, saveData);
      
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
      console.error('Error saving profile:', error);
      setSaveStatus('idle');
      
      const errorMessage = error?.message || 'Unknown error occurred';
      alert(`Failed to save profile: ${errorMessage}. Please try again.`);
    }
  };

  const handleJobTitleFocus = () => {
    setFormData((prevData) => ({
      ...prevData,
      showDropdown: true,
    }));
  };

  const handleJobTitleBlur = () => {
    setTimeout(() => {
      setFormData((prevData) => ({
        ...prevData,
        showDropdown: false,
      }));
    }, 200);
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
            <div className="flex flex-row gap-6 text-white">
              {profilePic ? (
                <Image
                  src={profilePic}
                  alt="Profile"
                  width={56}
                  height={56}
                  className="rounded-full"
                />
              ) : (
                <div className="flex w-[60px] h-[60px] rounded-full size-12 items-center justify-center bg-sidebar-primary text-sidebar-primary-foreground text-text-xl-semibold">
                  {userDetails.firstName?.charAt(0) ?? ""}
                  {userDetails.lastName?.charAt(0) ?? ""}
                </div>
              )}
              <div className="flex flex-row gap-4 items-center">
                <Input
                  id="uploadFile"
                  type="file"
                  name="uploadFile"
                  placeholder="Upload a new picture"
                  onChange={handleFileChange}
                  required
                  style={{ display: "none" }}
                  className="text-white bg-gray py-4 px-4 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-gray hover:file:bg-violet-100"
                />
                <label
                  htmlFor="uploadFile"
                  className="flex items-center border-[#606060] cursor-pointer border w-fit px-8 py-4 rounded"
                >
                  <Upload className="mr-2" /> Upload profile picture
                </label>
                {fileName && <p className="mt-2">{fileName}</p>}
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
              <Label htmlFor="jobTitle">Select Your Primary Role:</Label>
              <Input
                type="text"
                name="jobTitle"
                value={formData.jobTitle}
                placeholder={formData.jobTitle}
                onChange={(e) => {
                  handleChange(e);
                  setJobRoleSearch(e.target.value); 
                }}
                
                onFocus={handleJobTitleFocus}
                onBlur={handleJobTitleBlur}
                required
              />
              {formData.showDropdown && (
                <div className="absolute mt-20 w-[48%] z-10 bg-[#020218]">
                  <div className="bg-[#4423a8] max-h-72 overflow-y-auto text-white w-full rounded-md shadow-lg">
                    {jobRoles
                      .filter((role) =>
                        role.toLowerCase().includes(jobRoleSearch.toLowerCase())
                      )
                      .map((role, index) => (
                        <div
                          key={index}
                          className="p-2 hover:bg-[#7960c2] cursor-pointer text-text-md-regular"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              jobTitle: role,
                              showDropdown: false,
                            })
                          }
                        >
                          {role}
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
            <div className="grid gap-2 text-white">
              <Label htmlFor="experience">Years of Experience:</Label>
              <Input
                type="text"
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
          </form>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex flex-row gap-4 items-center">
              {profilePic ? (
                <Image
                  src={profilePic}
                  alt="Profile"
                  width={56}
                  height={56}
                  className="rounded-full"
                />
              ) : (
                <div className="flex w-[60px] h-[60px] rounded-full size-12 items-center justify-center bg-sidebar-primary text-sidebar-primary-foreground text-text-xl-semibold">
                  {userDetails.firstName?.charAt(0) ?? ""}
                  {userDetails.lastName?.charAt(0) ?? ""}
                </div>
              )}
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
                  <h1 className="text-text-lg-regular">
                    {userDetails.firstName}
                  </h1>
                </div>
                <div className="flex flex-col gap-1">
                  <h1 className="text-slate-500 text-text-lg-bold">
                    Last Name
                  </h1>
                  <h1 className="text-text-lg-regular">
                    {userDetails.lastName}
                  </h1>
                </div>
              </div>

              <div className="grid grid-cols-2 justify-between text-white">
                {userDetails.jobTitle && (<div className="flex flex-col gap-1">
                  <h1 className="text-slate-500 text-text-lg-bold">
                    Primary Role:
                  </h1>
                  <h1 className="text-text-lg-regular">
                    {userDetails.jobTitle}
                  </h1>
                </div>)}

                {userDetails.workexperience && (
                  <div className="flex flex-col gap-1">
                    <h1 className="text-slate-500 text-text-lg-bold">
                      Work Experience
                    </h1>
                    <h1 className="text-text-lg-regular">
                      {userDetails.workexperience !== "" ? userDetails.workexperience : ""}
                    </h1>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 justify-between text-white">
                {userDetails.role && (
                  <div className="flex flex-col gap-1">
                    <h1 className="text-slate-500 text-text-lg-bold">Role</h1>
                    <h1 className="text-text-lg-regular">{userDetails.role}</h1>
                  </div>
                )}

                {userDetails.whereYouBased && (
                  <div className="flex flex-col gap-1">
                    <h1 className="text-slate-500 text-text-lg-bold">
                      Location
                    </h1>
                    <h1 className="text-text-lg-regular">
                      {userDetails.whereYouBased}
                    </h1>
                  </div>
                )}
              </div>

              {userDetails.bio && (<div className="grid grid-cols-1 justify-between text-white">
                <div className="flex flex-col gap-4">
                  <h1 className="text-slate-500 text-text-lg-bold">Bio</h1>
                  <h1 className="text-text-lg-regular opacity-70 border border-[#371b7e] px-4 py-4 rounded">
                    {userDetails.bio}
                  </h1>
                </div>
              </div>)}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AboutSection;
