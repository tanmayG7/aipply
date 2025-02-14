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

const PreferenceForm: React.FC<PreferenceFormProps> = ({ isEditing, userDetails }) => {
  const [preferences, setPreferences] = useState({
    jobSearchStatus: false,
    jobType: "fulltime",
    additionalTypes: {
      contractor: false,
      intern: false,
      freelance: false,
    },
  });

  const [locations, setLocations] = useState<string[]>([]);
  const [locationInput, setLocationInput] = useState("");

  useEffect(() => {
    const fetchUserPreferences = async () => {
        setPreferences(userDetails.preferences || {});
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

  const handleSavePreferences = async () => {
    const user = auth.currentUser;
    console.log(preferences)
    if (user) {
      const userDetails = {
        preferences,
        locations,
      };
      await saveUserProfile(user.uid, userDetails);
    }
  };

  return (
    <Card className="grid grid-cols-7 max-w-[828px] py-6 text-white border border-gray rounded-xl">
      <CardHeader className="col-span-2">
        <CardTitle>Preferences</CardTitle>
        <CardDescription>Set your job preferences.</CardDescription>
      </CardHeader>
      <CardContent className="col-span-5">
        <div className="flex flex-col gap-4">
          <Label>Where are you in job search?</Label>
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
            <p>{preferences.jobSearchStatus ? "Actively looking for a job" : "Not actively looking"}</p>
          )} 

          <Label>What type of job are you interested in?*</Label>
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
            <p>{preferences.jobType === "fulltime" ? "Full-time" : "Part-time"}</p>
           )}
          <Label>Open for the following job types:</Label>
          <div className="flex flex-col gap-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="contractor"
                checked={preferences.additionalTypes.contractor}
              />
              <label
                htmlFor="contractor"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Contractor
              </label>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="intern"
                checked={preferences.additionalTypes.intern}
              />
              <Label htmlFor="intern">Intern</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="freelance"
                checked={preferences.additionalTypes.freelance}
              />
              <Label htmlFor="freelance">Freelance</Label>
            </div>
          </div>

          <Label>What location do you want to work in?*</Label>
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
            className="w-fit px-8 bg-transparent border border-gray hover:bg-gray-700"
          >
            Save Preferences
          </Button>
        )} 
        </div>
      </CardContent>
    </Card>
  );
};

export default PreferenceForm;
