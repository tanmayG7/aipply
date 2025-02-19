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
      contractor: false,
      intern: false,
      freelance: false,
    },
    openToRemote: false,
  });

  const [locations, setLocations] = useState<string[]>([]);
  const [locationInput, setLocationInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);

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
    <Card className="grid grid-cols-7 max-w-[100%] py-6 text-white border border-gray rounded-lg shadow-md bg-gray-900">
      <CardHeader className="col-span-3">
        <CardTitle className="text-xl font-semibold">Preferences</CardTitle>
        <CardDescription className="text-gray-400">
          Set your job preferences.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col col-span-4 gap-6">
        <div className="flex flex-col gap-4">
          <Label className="text-[16px] font-semibold font-inter">
            Job Search Status
          </Label>
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
              <p className="text-[16px] font-semibold font-inter opacity-70 ">
                {preferences.jobSearchStatus
                  ? "Actively looking for a job"
                  : "Not actively looking"}
              </p>
            </Button>
          ) : (
            <p className={`text-[16px] border border-gray w-fit px-4 py-2 rounded bg-black font-semibold font-inter opacity-70 ${
                preferences.jobSearchStatus
                  ? "bg-green-600 hover:bg-green-500 w-fit"
                  : "bg-gray-600 hover:bg-gray-500 w-fit border border-gray"
              }`}>
              {preferences.jobSearchStatus
                ? "Actively looking for a job"
                : "Not actively looking"}
            </p>
          )}
        </div>

        <div className="flex flex-col w-fit gap-4">
          <Label className="font-semibold">Preferred Job Type</Label>
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
            <p className="text-[16px] font-semibold font-inter opacity-70 text-white border border-gray px-4 py-2 bg-black rounded">
              {preferences.jobType === "fulltime" ? "Full-time" : "Part-time"}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-text-lg-semibold text-white">
            Open for the following job types:
          </p>
          <div className="flex flex-col gap-2 opacity-70">
            {["contractor", "intern", "freelance"].map((type) => (
              <div key={type} className="flex items-center gap-2">
                {isEditing ? (
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
                ) : (
                  <span className="text-gray-300">
                    {type.charAt(0).toUpperCase() + type.slice(1)}:{" "}
                    {preferences.additionalTypes[
                      type as keyof typeof preferences.additionalTypes
                    ]
                      ? "Yes"
                      : "No"}
                  </span>
                )}
                {isEditing && (
                  <Label htmlFor={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Label>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <Label className="text-text-lg-semibold text-white font-inter">
            Preferred Locations
          </Label>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-4">
                {locations.map((location) => (
                  <div
                    key={location}
                    className="bg-gray-700 px-4 py-2 rounded flex items-center gap-2 text-text-md-semibold text-white font-inter border border-[#371b7e]"
                  >
                    {location}
                    {isEditing && (
                      <button onClick={() => removeLocation(location)}>
                        ✕
                      </button>
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
                  checked={preferences.openToRemote}
                  onCheckedChange={() => handleCheckboxChange("openToRemote")}
                />
                <Label
                  htmlFor="opentoremote"
                  className="font-inter text-text-md-semibold"
                >
                  open to working remotely
                </Label>
              </div>
            </div>
          </div>
        </div>

        {isEditing && (
          <Button
            onClick={handleSavePreferences}
            className="w-fit px-8 bg-blue border border-gray hover:bg-gray-700"
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save Preferences"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default PreferenceForm;
