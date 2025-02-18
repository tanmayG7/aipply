import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "../ui/input";
import { Checkbox } from "../ui/checkbox";
import { auth, saveUserProfile } from "@/lib/firebaseConfig/firebaseConfig";
import { UserDetails } from "@/lib/types";

interface PreferenceFormProps {
  isEditing: boolean;
  userDetails: UserDetails;
}

const PreferenceForm: React.FC<PreferenceFormProps> = ({
  isEditing,
  userDetails,
}) => {
  const [preferences, setPreferences] = useState({
    jobSearchStatus: false,
    jobType: "fulltime",
    additionalTypes: {
      contractor: userDetails.preferences?.additionalTypes?.contractor ||  false,
      intern: userDetails.preferences?.additionalTypes?.intern || false,
      freelance: userDetails.preferences?.additionalTypes?.freelance || false,
    },
  });

  const [locations, setLocations] = useState<string[]>([]);
  const [locationInput, setLocationInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchUserPreferences = async () => {
      setPreferences({
        jobSearchStatus: userDetails.preferences?.jobSearchStatus ?? false,
        jobType: userDetails.preferences?.jobType ?? "fulltime",
        additionalTypes: {
          contractor:
            userDetails.preferences?.additionalTypes?.contractor ?? false,
          intern: userDetails.preferences?.additionalTypes?.intern ?? false,
          freelance:
            userDetails.preferences?.additionalTypes?.freelance ?? false,
        },
      });
      setLocations(userDetails.locations || []);
    };

    if (isEditing) {
      fetchUserPreferences();
    }
  }, [isEditing, userDetails.locations, userDetails.preferences]);

  const addLocation = () => {
    if (locationInput && !locations.includes(locationInput)) {
      setLocations([...locations, locationInput]);
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

  const handleCheckboxChange = (type: keyof typeof preferences.additionalTypes) => {
    setPreferences((prev) => ({
      ...prev,
      additionalTypes: {
        ...prev.additionalTypes,
        [type]: !prev.additionalTypes[type],
      },
    }));
  };

  const handleSavePreferences = async () => {
    setIsSaving(true);
    const user = auth.currentUser;
    if (user) {
      const updatedUserDetails = {
        preferences,
        locations,
      };
      await saveUserProfile(user.uid, updatedUserDetails);
    }
    setIsSaving(false);
  };

  return (
    <Card className="grid grid-cols-6 max-w-[100%] py-6 text-white border border-gray rounded-xl">
      <CardHeader className="col-span-3">
        <CardTitle>Preferences</CardTitle>
        <CardDescription>Set your job preferences.</CardDescription>
      </CardHeader>
      <CardContent className="col-span-3">
        <div className="flex flex-col gap-4">
          {isEditing ? (
            <Label className="text-[16px] font-semibold font-inter">
              Where are you in job search?
            </Label>
          ) : (
            <p className="text-text-lg-semibold font-semibold font-inter">
              Where are you in job search?
            </p>
          )}
          {isEditing ? (
            <Button
              onClick={() =>
                setPreferences((prev) => ({
                  ...prev,
                  jobSearchStatus: !prev.jobSearchStatus,
                }))
              }
              className="w-fit px-8 bg-transparent bg-gray hover:bg-gray-600"
            >
              {preferences.jobSearchStatus
                ? "Actively looking for a job"
                : "Not actively looking"}
            </Button>
          ) : (
            <p className="text-[16px] font-semibold font-inter opacity-70">
              {preferences.jobSearchStatus
                ? "Actively looking for a job"
                : "Not actively looking"}
            </p>
          )}

          {isEditing ? (
            <Label className="text-[16px] font-semibold font-inter">
              What type of job are you interested in?*
            </Label>
          ) : (
            <p className="text-text-lg-semibold font-semibold font-inter">
              What type of job are you interested in?*
            </p>
          )}

          {isEditing ? (
            <select
              name="jobType"
              value={preferences.jobType}
              onChange={handleChange}
              className="bg-gray px-3 py-2 rounded-md"
            >
              <option value="fulltime">Full-time</option>
              <option value="parttime">Part-time</option>
            </select>
          ) : (
            <p className="text-[16px] font-semibold font-inter opacity-70 text-white">
              {preferences.jobType === "fulltime" ? "Full-time" : "Part-time"}
            </p>
          )}
          {isEditing ? (
            <Label>Open for the following job types:</Label>
          ) : (
            <p className="text-text-lg-semibold text-white">
              Open for the following job types:
            </p>
          )}

          <div className="flex flex-col gap-2 opacity-70">
            <div className="flex items-center space-x-2">
              {isEditing ? (
                <Checkbox
                  id="contractor"
                  checked={preferences.additionalTypes.contractor}
                  onChange={() => handleCheckboxChange("contractor")}
                />
              ) : (
                <p className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Contractor:{" "}
                  {preferences.additionalTypes.contractor ? "Yes" : "No"}
                </p>
              )}
              {isEditing && (
                <label
                  htmlFor="contractor"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Contractor
                </label>
              )}
            </div>
            <div className="flex items-center gap-2">
              {isEditing ? (
                <Checkbox
                  id="intern"
                  checked={preferences.additionalTypes.intern}
                  onChange={() =>
                    handleCheckboxChange("intern")
                  }
                />
              ) : (
                <p className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Intern: {preferences.additionalTypes.intern ? "Yes" : "No"}
                </p>
              )}
              {isEditing && <Label htmlFor="intern">Intern</Label>}
            </div>
            <div className="flex items-center gap-2">
              {isEditing ? (
                <Checkbox
                  id="freelance"
                  checked={preferences.additionalTypes.freelance}
                  onChange={() => handleCheckboxChange("freelance")}
                />
              ) : (
                <p className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Freelance:{" "}
                  {preferences.additionalTypes.freelance ? "Yes" : "No"}
                </p>
              )}
              {isEditing && <Label htmlFor="freelance">Freelance</Label>}
            </div>
          </div>

          {isEditing ? (
            <Label className="text-[16px] font-semibold font-inter opacity-70">
              What location do you want to work in?*
            </Label>
          ) : (
            <p className="text-[16px] font-semibold font-inter">
              {" "}
              What location do you want to work in?*
            </p>
          )}

          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              {locations.map((location) => (
                <div
                  key={location}
                  className="bg-gray-700 px-3 py-1 rounded-full flex items-center gap-2"
                >
                  {location}
                  {isEditing && (
                    <button onClick={() => removeLocation(location)}>✕</button>
                  )}
                </div>
              ))}
            </div>

            {isEditing && (
              <Input
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                placeholder="Enter preferred Locations"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    addLocation();
                  }
                }}
              />
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Checkbox
                id="opentoremote"
                checked={preferences.jobType === "fulltime"}
              />
              <Label htmlFor="opentoremote">open to working remotely</Label>
            </div>
          </div>
          {isEditing && (
            <select
              name="jobType"
              value={preferences.jobType}
              onChange={handleChange}
              className="bg-gray px-3 py-2 rounded-md"
            >
              <option value="fulltime">Yes</option>
              <option value="parttime">No</option>
            </select>
          )}
          {isEditing && (
            <Button
              onClick={handleSavePreferences}
              className="w-fit px-8 bg-blue border border-gray hover:bg-gray-700"
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save Preferences"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PreferenceForm;
