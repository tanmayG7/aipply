import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "../ui/input";
import { Checkbox } from "../ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import { auth, saveUserProfile } from "@/lib/firebaseConfig/firebaseConfig";
import { UserDetails } from "@/lib/types";

interface PreferenceFormProps {
  isEditing: boolean;
  userDetails: UserDetails;
  onExitEditMode?: () => void;
  onRefresh?: () => Promise<void>;
}

const PreferenceForm: React.FC<PreferenceFormProps> = ({
  isEditing,
  userDetails,
  onExitEditMode,
  onRefresh,
}) => {
  const [preferences, setPreferences] = useState({
    jobSearchStatus: false,
    jobType: "fulltime",
    additionalTypes: {
      contractor: false,
      intern: false,
      freelance: false,
    },
    openToRemote: false,
  });

  const [locations, setLocations] = useState<string[]>([]);
  const [locationInput, setLocationInput] = useState("");
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  useEffect(() => {
    if (userDetails?.preferences) {
      setPreferences({
        jobSearchStatus: userDetails.preferences.jobSearchStatus ?? false,
        jobType: userDetails.preferences.jobType ?? "fulltime",
        additionalTypes: {
          contractor:
            userDetails.preferences.additionalTypes?.contractor ?? false,
          intern: userDetails.preferences.additionalTypes?.intern ?? false,
          freelance:
            userDetails.preferences.additionalTypes?.freelance ?? false,
        },
        openToRemote: userDetails.preferences.openToRemote ?? false,
      });
    }
    setLocations(userDetails.locations || []);
  }, [userDetails]);

  const addLocation = () => {
    if (locationInput.trim() && !locations.includes(locationInput.trim())) {
      setLocations([...locations, locationInput.trim()]);
      setLocationInput("");
    }
  };

  const removeLocation = (location: string) => {
    setLocations(locations.filter((s) => s !== location));
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPreferences((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (
    type: keyof typeof preferences.additionalTypes | "openToRemote"
  ) => {
    setPreferences((prev) => ({
      ...prev,
      [type]:
        type === "openToRemote"
          ? !prev.openToRemote
          : {
              ...prev.additionalTypes,
              [type]: !prev.additionalTypes[type as keyof typeof preferences.additionalTypes],
            },
    }));
  };

  const handleSavePreferences = async () => {
    // Prevent double-clicks
    if (saveStatus !== 'idle') return;
    
    setSaveStatus('saving');
    try {
      const user = auth.currentUser;
      if (!user) {
        alert('Please log in to save your preferences.');
        setSaveStatus('idle');
        return;
      }
      
      const updatedUserDetails = {
        preferences,
        locations,
      };
      await saveUserProfile(user.uid, updatedUserDetails);
      
      // Refresh parent component data
      if (onRefresh) {
        await onRefresh();
      }
      
      setSaveStatus('saved');
      
      // Show success state for 2 seconds then exit edit mode
      setTimeout(() => {
        setSaveStatus('idle');
        if (onExitEditMode) {
          onExitEditMode();
        }
      }, 2000);
      
    } catch (error: any) {
      console.error('Error saving preferences:', error);
      setSaveStatus('idle');
      
      const errorMessage = error?.message || 'Unknown error occurred';
      alert(`Failed to save preferences: ${errorMessage}. Please try again.`);
    }
  };

  return (
    <div className="py-6 border border-gray rounded-xl">
      {/* Job Search Status Section */}
      <Card className="grid grid-cols-7 gap-[52px] max-w-[100%] py-6 border-b border-gray rounded-none">
        <CardHeader className="col-span-2">
          <CardTitle className="text-[16px] font-inter font-semibold text-white">
            Job Search Status
          </CardTitle>
          <CardDescription className="font-inter text-[14px] leading-[20px]">
            Set your current job search preferences.
          </CardDescription>
        </CardHeader>
        <CardContent className="col-span-5">
          {isEditing ? (
            <Button
              onClick={() =>
                setPreferences((prev) => ({
                  ...prev,
                  jobSearchStatus: !prev.jobSearchStatus,
                }))
              }
              className={`w-full px-4 py-2 rounded-md text-white transition ${
                preferences.jobSearchStatus
                  ? "bg-green-600 hover:bg-green-500 w-fit"
                  : "bg-gray-600 hover:bg-gray-500 w-fit border border-gray"
              }`}
            >
              <p className="text-[16px] font-semibold font-inter opacity-70 text-white">
                {preferences.jobSearchStatus
                  ? "Actively looking for a job"
                  : "Not actively looking"}
              </p>
            </Button>
          ) : (
            <p className={`text-[16px] border border-[#371b7e] w-fit px-4 py-2 rounded font-semibold font-inter opacity-70 text-white ${
                preferences.jobSearchStatus
                  ? "bg-green-600 hover:bg-green-500 w-fit"
                  : "bg-gray-600 hover:bg-gray-500 w-fit border border-[#371b7e]"
              }`}>
              {preferences.jobSearchStatus
                ? "Actively looking for a job"
                : "Not actively looking"}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Job Type Section */}
      <Card className="grid grid-cols-7 gap-[52px] max-w-[100%] py-6 border-b border-gray rounded-none">
        <CardHeader className="col-span-2">
          <CardTitle className="text-[16px] font-inter font-semibold text-white">
            Preferred Job Type
          </CardTitle>
          <CardDescription className="font-inter text-[14px] leading-[20px]">
            Select your preferred employment type.
          </CardDescription>
        </CardHeader>
        <CardContent className="col-span-5">
          {isEditing ? (
            <select
              name="jobType"
              value={preferences.jobType}
              onChange={handleChange}
              className="bg-gray px-3 py-2 rounded-md text-white"
            >
              <option value="fulltime">Full-time</option>
              <option value="parttime">Part-time</option>
            </select>
          ) : (
            <p className="text-[16px] font-semibold font-inter opacity-70 text-white border border-[#371b7e] px-4 py-2 rounded">
              {preferences.jobType === "fulltime" ? "Full-time" : "Part-time"}
            </p>
          )}

          {/* Additional Job Types */}
          <div className="mt-6">
            <p className="text-white font-semibold mb-4">
              Open for the following job types:
            </p>
            <div className="flex flex-col gap-2 opacity-70">
              {["contractor", "intern", "freelance"].map((type) => (
                <div key={type} className="flex items-center gap-2">
                  {isEditing ? (
                    <>
                      <Checkbox
                        id={type}
                        checked={
                          preferences.additionalTypes[
                            type as keyof typeof preferences.additionalTypes
                          ]
                        }
                        onCheckedChange={() =>
                          setPreferences((prev) => ({
                            ...prev,
                            additionalTypes: {
                              ...prev.additionalTypes,
                              [type]: !prev.additionalTypes[type as keyof typeof preferences.additionalTypes],
                            },
                          }))
                        }
                      />
                      <Label htmlFor={type} className="text-white">
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </Label>
                    </>
                  ) : (
                    <span className="text-white opacity-70">
                      {type.charAt(0).toUpperCase() + type.slice(1)}:{" "}
                      {preferences.additionalTypes[
                        type as keyof typeof preferences.additionalTypes
                      ]
                        ? "Yes"
                        : "No"}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Locations Section */}
      <Card className="grid grid-cols-7 gap-[52px] max-w-[100%] py-6 rounded-none">
        <CardHeader className="col-span-2">
          <CardTitle className="text-[16px] font-inter font-semibold text-white">
            Preferred Locations
          </CardTitle>
          <CardDescription className="font-inter text-[14px] leading-[20px]">
            Add your preferred work locations.
          </CardDescription>
        </CardHeader>
        <CardContent className="col-span-5">
          <div className="flex flex-wrap gap-4 mb-4">
            {locations.map((location) => (
              <div
                key={location}
                className="bg-gray-700 px-4 py-2 rounded flex items-center gap-2 text-white font-inter border border-[#371b7e]"
              >
                {location}
                {isEditing && (
                  <button onClick={() => removeLocation(location)} className="text-red-400 hover:text-red-300">
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>

          {isEditing && (
            <div className="flex gap-2 mb-4">
              <Input
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                placeholder="Enter preferred location"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    addLocation();
                  }
                }}
                className="flex-1 text-white"
              />
              <Button
                onClick={addLocation}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4"
              >
                Add
              </Button>
            </div>
          )}

          {/* Remote Work Option */}
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Checkbox
                  id="opentoremote"
                  checked={preferences.openToRemote}
                  onCheckedChange={() => handleCheckboxChange("openToRemote")}
                />
                <Label
                  htmlFor="opentoremote"
                  className="font-inter text-white"
                >
                  Open to working remotely
                </Label>
              </>
            ) : (
              <span className="text-white opacity-70">
                Open to remote work: {preferences.openToRemote ? "Yes" : "No"}
              </span>
            )}
          </div>

          {/* Save Button */}
          {isEditing && (
            <div className="flex gap-4 mt-6">
              <Button
                onClick={handleSavePreferences}
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
                  "Save Preferences"
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PreferenceForm;
