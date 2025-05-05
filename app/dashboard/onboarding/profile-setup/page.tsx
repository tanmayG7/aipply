/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getUserProfile,
  saveUserProfile,
} from "@/lib/firebaseConfig/firebaseConfig";
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { auth } from "@/lib/firebaseConfig/firebaseConfig";
import Head from "next/head";
import { jobRoles, roleBasedSkills } from "@/lib/jobRoles";
import { ChevronDown } from "lucide-react";

export default function ProfileSetup() {
  const [page, setPage] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    mobileNumber: "",
    email: "",
    jobTitle: "",
    currentCTC: "",
    expectedCTC: "",
    linkedinProfile: "",
    lastPreferenceChangedDate: "",
    createdDate: "",
    updatedDate: "",
    showDropdown: false,
  });

  const [skills, setSkills] = useState<string[]>([]);
  const [skillsInput, setSkillsInput] = useState("");
  const [jobRoleSearch, setJobRoleSearch] = useState("");

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

  useEffect(() => {
    if (formData.jobTitle) {
      const suggestedSkills = roleBasedSkills[formData.jobTitle] || [];
      setSkills(suggestedSkills);
    }
  }, [formData.jobTitle]);

  const [errors, setErrors] = useState({
    firstName: false,
    lastName: false,
    mobileNumber: false,
    email: false,
    skills: false,
    jobTitle: false,
    currentCTC: false,
    expectedCTC: false,
    linkedinProfile: false,
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const validatePage = () => {
    const newErrors = { ...errors };
    const phoneNumberRegex = /^\+91-\d{10}$/;
    const ctcRegex = /^\d+LPA$/;
    const linkedinRegex = /^https:\/\/[a-z]{2,3}\.linkedin\.com\/.*$/;

    if (page === 1) {
      newErrors.firstName = !formData.firstName;
      newErrors.lastName = !formData.lastName;
      newErrors.mobileNumber =
        !formData.mobileNumber || !phoneNumberRegex.test(formData.mobileNumber);
      newErrors.email = !formData.email;
    } else if (page === 2) {
      newErrors.jobTitle = !formData.jobTitle;
    } else if (page === 3) {
      newErrors.skills = skills.length === 0;
    } else if (page === 4) {
      newErrors.currentCTC =
        !formData.currentCTC || !ctcRegex.test(formData.currentCTC);
    } else if (page === 5) {
      newErrors.expectedCTC =
        !formData.expectedCTC || !ctcRegex.test(formData.expectedCTC);
    } else if (page === 6) {
      newErrors.linkedinProfile =
        !formData.linkedinProfile ||
        !linkedinRegex.test(formData.linkedinProfile);
    }
    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error);
  };

  const handleNext = () => {
    if (validatePage()) {
      setPage((prev) => prev + 1);
    }
  };

  const handleBack = () => setPage((prev) => prev - 1);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === "firstName" || name === "lastName") {
      formattedValue = value.charAt(0).toUpperCase() + value.slice(1);
    } else if (name === "mobileNumber") {
      formattedValue = value.replace(/^0/, "");
      if (!formattedValue.startsWith("+91-")) {
        formattedValue = `+91-${formattedValue}`;
      }
    }

    setFormData({ ...formData, [name]: formattedValue });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validatePage()) {
      setLoading(true);
      try {
        const user = auth.currentUser;
        if (user) {
          const currentDate = new Date().toISOString();
          const updatedFormData = {
            userId: user.uid,
            ...formData,
            skills,
            lastPreferenceChangedDate: currentDate,
            updatedDate: currentDate,
            createdDate: formData.createdDate || currentDate,
            onboardingCompleted: true, // Set onboardingCompleted to true
          };
          await saveUserProfile(user.uid, updatedFormData);
          router.push("/dashboard/home");
        }
      } catch (error: any) {
        console.error(error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const [innerHeight, setInnerHeight] = useState(0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setInnerHeight(window.innerHeight);
      const handleResize = () => setInnerHeight(window.innerHeight);
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  const getTopPosition = () => {
    return innerHeight > 700 ? "top-0" : "top-[45px]";
  };

  const addSkill = async () => {
    if (skillsInput && !skills.includes(skillsInput)) {
      const updatedSkills = [...skills, skillsInput];
      setSkills(updatedSkills);
      setSkillsInput("");
      await handleSave();
    }
  };

  const removeSkill = async (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
    const user = auth.currentUser;
    if (user) {
      const userDetails = await getUserProfile(user.uid);
      const updatedSkills = (userDetails.skills ?? []).filter(
        (s: string) => s !== skill
      );
      await saveUserProfile(user.uid, { skills: updatedSkills });
    }
  };

  const handleSave = async () => {
    const user = auth.currentUser;
    if (user) {
      const userDetails = {
        skills,
      };
      await saveUserProfile(user.uid, userDetails);
    }
  };

  return (
    <>
      <Head>
        <title>Profile Setup - Aipply</title>
        <meta
          name="description"
          content="Set up your profile to apply for jobs on Aipply."
        />
      </Head>
      <div className="h-screen flex items-center justify-center bg-[#020218]">
        <div className="flex flex-col gap-[60px]">
          <div
            className={`flex gap-4 relative left-1/2 transform -translate-x-1/2 items-center justify-center md:max-w-[520px] w-full ${getTopPosition()}`}
          >
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className={`w-[10%] p-[2px] ${
                  page - 1 > index ? "bg-[#5D29FF]" : "bg-white"
                }`}
              ></div>
            ))}
          </div>
          <Card className="text-white flex flex-col md:gap-[80px] gap-10">
            <CardHeader className="flex flex-col gap-10 text-center items-center md:min-w-[594px] w-full">
              <Image
                src={"/static/icons/aipplyLogo.svg"}
                alt="Aipply Logo"
                width={224}
                height={76}
              />
              <div className="grid grid-cols-1 gap-3">
                <CardTitle className="text-display-sm-semibold font-inter">
                  {" Welcome! Let's create your profile"}
                </CardTitle>
                <div className="text-text-md-regular font-inter text-[#94969C]">
                  Apply privately to thousands of tech companies and start-ups
                  with one profile.
                </div>
              </div>
            </CardHeader>
            <CardContent className="md:w-[80%] w-full m-auto">
              <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                {page === 1 && (
                  <div className="grid gap-6">
                    <div className="grid grid-cols-2 md:gap-6 gap-2">
                      <div className="grid gap-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          type="text"
                          placeholder="Enter your First Name"
                          value={formData.firstName}
                          onChange={handleChange}
                          required
                          className={errors.firstName ? "border-red-500" : ""}
                        />
                        {errors.firstName && (
                          <p className="text-red-500">First Name is required</p>
                        )}
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          type="text"
                          placeholder="Enter your Last Name"
                          value={formData.lastName}
                          onChange={handleChange}
                          required
                          className={errors.lastName ? "border-red-500" : ""}
                        />
                        {errors.lastName && (
                          <p className="text-red-500">Last Name is required</p>
                        )}
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="mobileNumber">Mobile Number</Label>
                      <Input
                        id="mobileNumber"
                        name="mobileNumber"
                        type="text"
                        placeholder="Enter your Mobile Number"
                        value={formData.mobileNumber}
                        onChange={handleChange}
                        required
                        className={errors.mobileNumber ? "border-red-500" : ""}
                      />
                      {errors.mobileNumber && (
                        <p className="text-red-500">
                          Mobile Number is required and should be in the format
                          +91-XXXXXXXXXX
                        </p>
                      )}
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Enter your Email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className={errors.email ? "border-red-500" : ""}
                      />
                      {errors.email && (
                        <p className="text-red-500">Email is required</p>
                      )}
                    </div>
                  </div>
                )}

                {page === 2 && (
                  <div className="grid gap-6">
                    <div className="grid gap-2 relative">
                      <Label htmlFor="jobTitle">Aiming Job Title</Label>
                      <div className="relative">
                        <div
                          className={`p-3 border border-[#333741] rounded-md cursor-pointer flex justify-between items-center ${
                            errors.jobTitle ? "border-red-500" : ""
                          }`}
                          onClick={() =>
                            setFormData((prevData) => ({
                              ...prevData,
                              showDropdown: !prevData.showDropdown,
                            }))
                          }
                        >
                          <span className="text-[#85888E] text-text-md-regular">
                            {formData.jobTitle ||
                              "Select your aiming job title"}
                          </span>
                          <ChevronDown className="w-5 h-5 text-[#85888E]" />
                        </div>
                        {formData.showDropdown && (
                          <div className="absolute mt-2 w-full z-10 bg-[#020218]">
                            <Input
                              type="text"
                              placeholder="Search job roles"
                              value={jobRoleSearch}
                              onChange={(e) => setJobRoleSearch(e.target.value)}
                              className="mb-2"
                            />
                            <div className="bg-[#4423a8] max-h-72 overflow-y-auto text-white w-full rounded-md shadow-lg">
                              {jobRoles
                                .filter((role) =>
                                  role
                                    .toLowerCase()
                                    .includes(jobRoleSearch.toLowerCase())
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
                      {errors.jobTitle && (
                        <p className="text-red-500">
                          Aiming Job Title is required
                        </p>
                      )}
                      <p className="text-text-sm-regular font-inter text-[#94969C]">
                        Ex: Marketing Manager, Software Engineer, Sales
                        Associate.
                      </p>
                    </div>
                  </div>
                )}
                {page === 3 && (
                  <div className="grid gap-6">
                    <div className="grid gap-2">
                      <Label htmlFor="skills">Skills</Label>
                      <div className="flex flex-col gap-4 max-w-[640px]">
                        <div className="text-text-sm-regular font-inter text-[#94969C]">
                          Suggested skills based on your selected role:{" "}
                          {roleBasedSkills[formData.jobTitle]?.join(", ") ||
                            "None"}
                        </div>
                        <div className="flex flex-wrap gap-4">
                          {skills.map((skill) => (
                            <div
                              key={skill}
                              className="px-6 py-2 rounded-full flex items-center gap-2 text-text-md-semibold text-white font-inter border border-white/15"
                            >
                              {skill}
                              <button onClick={() => removeSkill(skill)}>
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>

                        <Input
                          value={skillsInput}
                          onChange={(e) => setSkillsInput(e.target.value)}
                          placeholder="Add Skills"
                          onKeyDown={async (e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              await addSkill();
                            }
                          }}
                        />

                        {errors.skills && (
                          <p className="text-red-500">Skills required</p>
                        )}
                        <p className="text-text-sm-regular font-inter text-[#94969C]">
                          Ex: Reactjs, NodeJs, C#, JavaScript ...
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {page === 4 && (
                  <div className="grid gap-6">
                    <div className="grid gap-2">
                      <Label htmlFor="currentCTC">Current CTC</Label>
                      <Input
                        id="currentCTC"
                        name="currentCTC"
                        type="text"
                        placeholder="Enter your Current CTC"
                        value={formData.currentCTC}
                        onChange={handleChange}
                        required
                        className={errors.currentCTC ? "border-red-500" : ""}
                      />
                      {errors.currentCTC && (
                        <p className="text-red-500">
                          Current CTC is required and should be in the format X
                          LPA
                        </p>
                      )}
                      <p className="text-text-sm-regular font-inter text-[#94969C]">
                        Ex: 10LPA, 20LPA, 30LPA.
                      </p>
                    </div>
                  </div>
                )}
                {page === 5 && (
                  <div className="grid gap-6">
                    <div className="grid gap-2">
                      <Label htmlFor="expectedCTC">Expected CTC</Label>
                      <Input
                        id="expectedCTC"
                        name="expectedCTC"
                        type="text"
                        placeholder="Enter your Expected CTC"
                        value={formData.expectedCTC}
                        onChange={handleChange}
                        required
                        className={errors.expectedCTC ? "border-red-500" : ""}
                      />
                      {errors.expectedCTC && (
                        <p className="text-red-500">
                          Expected CTC is required and should be in the format X
                          LPA
                        </p>
                      )}
                      <p className="text-text-sm-regular font-inter text-[#94969C]">
                        Ex: 10LPA, 20LPA, 30LPA.
                      </p>
                    </div>
                  </div>
                )}
                {page === 6 && (
                  <div className="grid gap-6">
                    <div className="grid gap-2">
                      <Label htmlFor="linkedinProfile">LinkedIn Profile</Label>
                      <Input
                        id="linkedinProfile"
                        name="linkedinProfile"
                        type="text"
                        placeholder="https://"
                        value={formData.linkedinProfile}
                        onChange={handleChange}
                        required
                        className={
                          errors.linkedinProfile ? "border-red-500" : ""
                        }
                      />
                      {errors.linkedinProfile && (
                        <p className="text-red-500">
                          LinkedIn Profile is required and should be a valid URL
                          starting with https://
                        </p>
                      )}
                    </div>
                  </div>
                )}
                <div className="flex justify-between gap-16">
                  {page > 1 && (
                    <Button type="button" onClick={handleBack}>
                      <Image
                        src="/static/icons/arrow-left.svg"
                        alt="Back"
                        width={24}
                        height={24}
                      />
                      Back
                    </Button>
                  )}
                  {page < 6 ? (
                    <Button type="button" onClick={handleNext}>
                      Next
                      <Image
                        src="/static/icons/arrow-right.svg"
                        alt="Back"
                        width={24}
                        height={24}
                      />
                    </Button>
                  ) : (
                    <Button type="submit" disabled={loading}>
                      {loading ? "Submitting..." : "Submit"}
                    </Button>
                  )}
                </div>
              </form>

              <div className="font-inter text-center text-text-md-regular text-muted-foreground text-[#94969C] mt-5">
        Already have an account, <Link href="/dashboard/onboarding/login" className="text-white hover:underline">sign-In</Link> now
      </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
