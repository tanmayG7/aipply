"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  auth,
  getUserProfile,
  saveUserProfile,
} from "@/lib/firebaseConfig/firebaseConfig";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Head from "next/head";
import {
  MapPin,
  DollarSign,
  Clock,
  FileText,
  Settings,
  Zap,
} from "lucide-react";

interface AutoApplySettings {
  isEnabled: boolean;
  jobTitles: string[];
  locations: string[];
  salaryRange: {
    min: number;
    max: number;
  };
  experienceRange: {
    min: number;
    max: number;
  };
  jobTypes: string[];
  platforms: string[];
  keywords: string[];
  excludeKeywords: string[];
  maxApplicationsPerDay: number;
  coverLetterTemplate: string;
  resumeUrl: string;
  preferences: {
    remoteOnly: boolean;
    hybridOk: boolean;
    onSiteOk: boolean;
    startupFriendly: boolean;
    corporateOnly: boolean;
  };
}

const defaultSettings: AutoApplySettings = {
  isEnabled: false,
  jobTitles: [],
  locations: [],
  salaryRange: { min: 0, max: 100 },
  experienceRange: { min: 0, max: 15 },
  jobTypes: [],
  platforms: [],
  keywords: [],
  excludeKeywords: [],
  maxApplicationsPerDay: 10,
  coverLetterTemplate: "",
  resumeUrl: "",
  preferences: {
    remoteOnly: false,
    hybridOk: true,
    onSiteOk: true,
    startupFriendly: false,
    corporateOnly: false,
  },
};

const jobTypeOptions = [
  "Full-time",
  "Part-time",
  "Contract",
  "Internship",
  "Freelance",
];
const platformOptions = [
  "Hirist",
  "Naukri",
  "Shine",
  "Indeed",
  "Foundit",
  "Glassdoor",
  "Cutshort",
  "Internshala",
  "Instahyre",
];
const popularLocations = [
  "Bangalore",
  "Mumbai",
  "Delhi",
  "Hyderabad",
  "Chennai",
  "Pune",
  "Kolkata",
  "Ahmedabad",
  "Remote",
];

export default function AutoApplySetup() {
  const [page, setPage] = useState(1);
  const [settings, setSettings] = useState<AutoApplySettings>(defaultSettings);
  const [loading, setLoading] = useState(false);
  const [newJobTitle, setNewJobTitle] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newKeyword, setNewKeyword] = useState("");
  const [newExcludeKeyword, setNewExcludeKeyword] = useState("");
  const router = useRouter();

  useEffect(() => {
    const loadUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const profile: any = await getUserProfile(user.uid);
          setUserProfile(profile);

          // Pre-populate with user's existing data
          if (profile.autoApplySettings) {
            setSettings(profile.autoApplySettings);
          } else {
            // Set defaults based on user profile
            setSettings((prev) => ({
              ...prev,
              jobTitles: profile.jobTitle ? [profile.jobTitle] : [],
              salaryRange: {
                min: profile.currentCTC
                  ? Number.parseInt(profile.currentCTC.replace("LPA", ""))
                  : 0,
                max: profile.expectedCTC
                  ? Number.parseInt(profile.expectedCTC.replace("LPA", ""))
                  : 100,
              },
              keywords: profile.skills || [],
            }));
          }
        } catch (error) {
          console.error("Error loading user profile:", error);
        }
      }
    };

    loadUserData();
  }, []);

  const handleNext = () => {
    setPage((prev) => Math.min(prev + 1, 6));
  };

  const handleBack = () => {
    setPage((prev) => Math.max(prev - 1, 1));
  };

  const addJobTitle = () => {
    if (newJobTitle && !settings.jobTitles.includes(newJobTitle)) {
      setSettings((prev) => ({
        ...prev,
        jobTitles: [...prev.jobTitles, newJobTitle],
      }));
      setNewJobTitle("");
    }
  };

  const removeJobTitle = (title: string) => {
    setSettings((prev) => ({
      ...prev,
      jobTitles: prev.jobTitles.filter((t) => t !== title),
    }));
  };

  const addLocation = () => {
    if (newLocation && !settings.locations.includes(newLocation)) {
      setSettings((prev) => ({
        ...prev,
        locations: [...prev.locations, newLocation],
      }));
      setNewLocation("");
    }
  };

  const removeLocation = (location: string) => {
    setSettings((prev) => ({
      ...prev,
      locations: prev.locations.filter((l) => l !== location),
    }));
  };

  const addKeyword = () => {
    if (newKeyword && !settings.keywords.includes(newKeyword)) {
      setSettings((prev) => ({
        ...prev,
        keywords: [...prev.keywords, newKeyword],
      }));
      setNewKeyword("");
    }
  };

  const removeKeyword = (keyword: string) => {
    setSettings((prev) => ({
      ...prev,
      keywords: prev.keywords.filter((k) => k !== keyword),
    }));
  };

  const addExcludeKeyword = () => {
    if (
      newExcludeKeyword &&
      !settings.excludeKeywords.includes(newExcludeKeyword)
    ) {
      setSettings((prev) => ({
        ...prev,
        excludeKeywords: [...prev.excludeKeywords, newExcludeKeyword],
      }));
      setNewExcludeKeyword("");
    }
  };

  const removeExcludeKeyword = (keyword: string) => {
    setSettings((prev) => ({
      ...prev,
      excludeKeywords: prev.excludeKeywords.filter((k) => k !== keyword),
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (user) {
        await saveUserProfile(user.uid, {
          autoApplySettings: {
            ...settings,
            isEnabled: true,
            updatedAt: new Date().toISOString(),
          },
        });
        router.push("/dashboard/auto-apply/dashboard");
      }
    } catch (error) {
      console.error("Error saving auto-apply settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderProgressBar = () => (
    <div className="flex gap-4 relative left-1/2 transform -translate-x-1/2 items-center justify-center md:max-w-[520px] w-full">
      {[...Array(6)].map((_, index) => (
        <div
          key={index}
          className={`w-[10%] p-[2px] ${
            page - 1 > index ? "bg-[#5D29FF]" : "bg-white"
          }`}
        />
      ))}
    </div>
  );

  return (
    <>
      <Head>
        <title>Auto-Apply Setup - AiPply</title>
        <meta
          name="description"
          content="Set up your auto-apply preferences for job applications."
        />
      </Head>

      <div className="min-h-screen flex items-center justify-center bg-[#020218] py-8">
        <div className="flex flex-col gap-[60px] w-full max-w-4xl px-4">
          {renderProgressBar()}

          <Card className="text-white">
            <CardHeader className="text-center">
              <Image
                src="/static/icons/aipplyLogo.svg"
                alt="AiPply Logo"
                width={224}
                height={76}
                className="mx-auto mb-6"
              />
              <CardTitle className="text-display-sm-semibold font-inter">
                {page === 1 && "Job Preferences"}
                {page === 2 && "Location & Salary"}
                {page === 3 && "Platforms & Job Types"}
                {page === 4 && "Keywords & Filters"}
                {page === 5 && "Application Settings"}
                {page === 6 && "Review & Activate"}
              </CardTitle>
              <p className="text-text-md-regular font-inter text-[#94969C]">
                {page === 1 && "Tell us what kind of jobs you're looking for"}
                {page === 2 && "Set your location and salary preferences"}
                {page === 3 && "Choose platforms and job types"}
                {page === 4 && "Add keywords to improve job matching"}
                {page === 5 && "Configure your application preferences"}
                {page === 6 && "Review your settings and activate auto-apply"}
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Page 1: Job Preferences */}
              {page === 1 && (
                <div className="space-y-6">
                  <div>
                    <Label className="text-lg font-semibold mb-4 block">
                      Job Titles
                    </Label>
                    <div className="flex gap-2 mb-4">
                      <Input
                        placeholder="Add job title (e.g., Software Engineer)"
                        value={newJobTitle}
                        onChange={(e) => setNewJobTitle(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && addJobTitle()}
                      />
                      <Button onClick={addJobTitle} variant="outline">
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {settings.jobTitles.map((title) => (
                        <Badge
                          key={title}
                          variant="secondary"
                          className="px-3 py-1"
                        >
                          {title}
                          <button
                            onClick={() => removeJobTitle(title)}
                            className="ml-2 text-red-400 hover:text-red-300"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-lg font-semibold mb-4 block">
                      Experience Range (Years)
                    </Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Minimum</Label>
                        <Input
                          type="number"
                          value={settings.experienceRange.min}
                          onChange={(e) =>
                            setSettings((prev) => ({
                              ...prev,
                              experienceRange: {
                                ...prev.experienceRange,
                                min: Number.parseInt(e.target.value) || 0,
                              },
                            }))
                          }
                        />
                      </div>
                      <div>
                        <Label>Maximum</Label>
                        <Input
                          type="number"
                          value={settings.experienceRange.max}
                          onChange={(e) =>
                            setSettings((prev) => ({
                              ...prev,
                              experienceRange: {
                                ...prev.experienceRange,
                                max: Number.parseInt(e.target.value) || 15,
                              },
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Page 2: Location & Salary */}
              {page === 2 && (
                <div className="space-y-6">
                  <div>
                    <Label className="text-lg font-semibold mb-4 block flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      Preferred Locations
                    </Label>
                    <div className="flex gap-2 mb-4">
                      <Input
                        placeholder="Add location (e.g., Bangalore, Remote)"
                        value={newLocation}
                        onChange={(e) => setNewLocation(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && addLocation()}
                      />
                      <Button onClick={addLocation} variant="outline">
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {settings.locations.map((location) => (
                        <Badge
                          key={location}
                          variant="secondary"
                          className="px-3 py-1"
                        >
                          {location}
                          <button
                            onClick={() => removeLocation(location)}
                            className="ml-2 text-red-400 hover:text-red-300"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {popularLocations.map((location) => (
                        <Button
                          key={location}
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (!settings.locations.includes(location)) {
                              setSettings((prev) => ({
                                ...prev,
                                locations: [...prev.locations, location],
                              }));
                            }
                          }}
                          className="text-xs"
                        >
                          {location}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-lg font-semibold mb-4 block flex items-center gap-2">
                      <DollarSign className="w-5 h-5" />
                      Salary Range (LPA)
                    </Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Minimum</Label>
                        <Input
                          type="number"
                          value={settings.salaryRange.min}
                          onChange={(e) =>
                            setSettings((prev) => ({
                              ...prev,
                              salaryRange: {
                                ...prev.salaryRange,
                                min: Number.parseInt(e.target.value) || 0,
                              },
                            }))
                          }
                        />
                      </div>
                      <div>
                        <Label>Maximum</Label>
                        <Input
                          type="number"
                          value={settings.salaryRange.max}
                          onChange={(e) =>
                            setSettings((prev) => ({
                              ...prev,
                              salaryRange: {
                                ...prev.salaryRange,
                                max: Number.parseInt(e.target.value) || 100,
                              },
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-lg font-semibold mb-4 block">
                      Work Preferences
                    </Label>
                    <div className="space-y-3">
                      {[
                        { key: "remoteOnly", label: "Remote Only" },
                        { key: "hybridOk", label: "Hybrid Work OK" },
                        { key: "onSiteOk", label: "On-site Work OK" },
                        { key: "startupFriendly", label: "Startup Friendly" },
                        { key: "corporateOnly", label: "Corporate Only" },
                      ].map(({ key, label }) => (
                        <div key={key} className="flex items-center space-x-2">
                          <Checkbox
                            id={key}
                            checked={
                              settings.preferences[
                                key as keyof typeof settings.preferences
                              ]
                            }
                            onCheckedChange={(checked) =>
                              setSettings((prev) => ({
                                ...prev,
                                preferences: {
                                  ...prev.preferences,
                                  [key]: checked,
                                },
                              }))
                            }
                          />
                          <Label htmlFor={key}>{label}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Page 3: Platforms & Job Types */}
              {page === 3 && (
                <div className="space-y-6">
                  <div>
                    <Label className="text-lg font-semibold mb-4 block">
                      Job Platforms
                    </Label>
                    <div className="grid grid-cols-3 gap-3">
                      {platformOptions.map((platform) => (
                        <div
                          key={platform}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={platform}
                            checked={settings.platforms.includes(platform)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSettings((prev) => ({
                                  ...prev,
                                  platforms: [...prev.platforms, platform],
                                }));
                              } else {
                                setSettings((prev) => ({
                                  ...prev,
                                  platforms: prev.platforms.filter(
                                    (p) => p !== platform
                                  ),
                                }));
                              }
                            }}
                          />
                          <Label htmlFor={platform}>{platform}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-lg font-semibold mb-4 block">
                      Job Types
                    </Label>
                    <div className="grid grid-cols-2 gap-3">
                      {jobTypeOptions.map((type) => (
                        <div key={type} className="flex items-center space-x-2">
                          <Checkbox
                            id={type}
                            checked={settings.jobTypes.includes(type)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSettings((prev) => ({
                                  ...prev,
                                  jobTypes: [...prev.jobTypes, type],
                                }));
                              } else {
                                setSettings((prev) => ({
                                  ...prev,
                                  jobTypes: prev.jobTypes.filter(
                                    (t) => t !== type
                                  ),
                                }));
                              }
                            }}
                          />
                          <Label htmlFor={type}>{type}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Page 4: Keywords & Filters */}
              {page === 4 && (
                <div className="space-y-6">
                  <div>
                    <Label className="text-lg font-semibold mb-4 block">
                      Include Keywords
                    </Label>
                    <div className="flex gap-2 mb-4">
                      <Input
                        placeholder="Add keyword (e.g., React, Python)"
                        value={newKeyword}
                        onChange={(e) => setNewKeyword(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && addKeyword()}
                      />
                      <Button onClick={addKeyword} variant="outline">
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {settings.keywords.map((keyword) => (
                        <Badge
                          key={keyword}
                          variant="secondary"
                          className="px-3 py-1"
                        >
                          {keyword}
                          <button
                            onClick={() => removeKeyword(keyword)}
                            className="ml-2 text-red-400 hover:text-red-300"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-lg font-semibold mb-4 block">
                      Exclude Keywords
                    </Label>
                    <div className="flex gap-2 mb-4">
                      <Input
                        placeholder="Add keyword to exclude (e.g., Sales, Marketing)"
                        value={newExcludeKeyword}
                        onChange={(e) => setNewExcludeKeyword(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === "Enter" && addExcludeKeyword()
                        }
                      />
                      <Button onClick={addExcludeKeyword} variant="outline">
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {settings.excludeKeywords.map((keyword) => (
                        <Badge
                          key={keyword}
                          variant="destructive"
                          className="px-3 py-1"
                        >
                          {keyword}
                          <button
                            onClick={() => removeExcludeKeyword(keyword)}
                            className="ml-2 text-red-200 hover:text-red-100"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Page 5: Application Settings */}
              {page === 5 && (
                <div className="space-y-6">
                  <div>
                    <Label className="text-lg font-semibold mb-4 block flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Daily Application Limit
                    </Label>
                    <Input
                      type="number"
                      value={settings.maxApplicationsPerDay}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          maxApplicationsPerDay:
                            Number.parseInt(e.target.value) || 10,
                        }))
                      }
                      min="1"
                      max="50"
                    />
                    <p className="text-sm text-gray-400 mt-2">
                      Recommended: 10-20 applications per day for best results
                    </p>
                  </div>

                  <div>
                    <Label className="text-lg font-semibold mb-4 block flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Cover Letter Template
                    </Label>
                    <Textarea
                      placeholder="Write a template cover letter that will be customized for each application..."
                      value={settings.coverLetterTemplate}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          coverLetterTemplate: e.target.value,
                        }))
                      }
                      rows={6}
                    />
                    <p className="text-sm text-gray-400 mt-2">
                      Use placeholders like {"{company}"}, {"{position}"},{" "}
                      {"{skills}"} for personalization
                    </p>
                  </div>

                  <div>
                    <Label className="text-lg font-semibold mb-4 block">
                      Resume URL
                    </Label>
                    <Input
                      placeholder="https://drive.google.com/your-resume-link"
                      value={settings.resumeUrl}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          resumeUrl: e.target.value,
                        }))
                      }
                    />
                    <p className="text-sm text-gray-400 mt-2">
                      Link to your resume (Google Drive, Dropbox, etc.)
                    </p>
                  </div>
                </div>
              )}

              {/* Page 6: Review & Activate */}
              {page === 6 && (
                <div className="space-y-6">
                  <div className="bg-[#111111] p-6 rounded-lg">
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      Auto-Apply Summary
                    </h3>

                    <div className="grid grid-cols-2 gap-6 text-sm">
                      <div>
                        <p className="font-semibold text-gray-300">
                          Job Titles:
                        </p>
                        <p>{settings.jobTitles.join(", ") || "None"}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-300">
                          Locations:
                        </p>
                        <p>{settings.locations.join(", ") || "None"}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-300">
                          Salary Range:
                        </p>
                        <p>
                          {settings.salaryRange.min} -{" "}
                          {settings.salaryRange.max} LPA
                        </p>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-300">
                          Experience:
                        </p>
                        <p>
                          {settings.experienceRange.min} -{" "}
                          {settings.experienceRange.max} years
                        </p>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-300">
                          Platforms:
                        </p>
                        <p>{settings.platforms.join(", ") || "None"}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-300">
                          Daily Limit:
                        </p>
                        <p>{settings.maxApplicationsPerDay} applications</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-[#20CEB6]/10 to-[#2E2ADC]/10 p-6 rounded-lg border border-[#20CEB6]/20">
                    <div className="flex items-center gap-3 mb-4">
                      <Zap className="w-6 h-6 text-[#20CEB6]" />
                      <h3 className="text-xl font-semibold">
                        Ready to Activate Auto-Apply?
                      </h3>
                    </div>
                    <p className="text-gray-300 mb-4">
                      Your auto-apply system will start working immediately
                      after activation. You can pause or modify settings anytime
                      from your dashboard.
                    </p>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="terms"
                        checked={settings.isEnabled}
                        onCheckedChange={(checked) =>
                          setSettings((prev) => ({
                            ...prev,
                            isEnabled: !!checked,
                          }))
                        }
                      />
                      <Label htmlFor="terms" className="text-sm">
                        I understand that auto-apply will submit applications on
                        my behalf
                      </Label>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6">
                {page > 1 && (
                  <Button onClick={handleBack} variant="outline">
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
                  <Button onClick={handleNext} className="ml-auto">
                    Next
                    <Image
                      src="/static/icons/arrow-right.svg"
                      alt="Next"
                      width={24}
                      height={24}
                    />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={loading || !settings.isEnabled}
                    className="ml-auto bg-gradient-to-r from-[#20CEB6] to-[#2E2ADC]"
                  >
                    {loading ? "Activating..." : "Activate Auto-Apply"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}