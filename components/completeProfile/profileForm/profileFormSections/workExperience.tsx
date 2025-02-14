import React, { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import DateFormate from "@/components/dateFormateChange/dateFormateChange";
import { auth, saveUserProfile } from "@/lib/firebaseConfig/firebaseConfig";
import { Experience } from "@/lib/types";


interface WorkExperienceProps {
  onAddExperience: (experience: Experience) => void;
  editingExperience?: Experience | null;
  workExperiences: Experience[];
  onEditExperience: (index: number) => void;
  onDeleteExperience: (index: number) => void;
  dropdownOpenIndex: number | null;
  toggleDropdown: (index: number) => void;
  isEditing: boolean; // Add this prop
}

const WorkExperience: React.FC<WorkExperienceProps> = ({
  onAddExperience,
  editingExperience,
  workExperiences,
  onEditExperience,
  onDeleteExperience,
  dropdownOpenIndex,
  toggleDropdown,
  isEditing, // Destructure this prop
}) => {
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const [experience, setExperience] = useState<Experience>({
    company: editingExperience?.company || "",
    title: editingExperience?.title || "",
    startDate: editingExperience?.startDate || "",
    endDate: editingExperience?.endDate || "",
    current: editingExperience?.current || false,
    type: editingExperience?.type || "",
    description: editingExperience?.description || "",
  });

  useEffect(() => {
    setExperience({
      company: editingExperience?.company || "",
      title: editingExperience?.title || "",
      startDate: editingExperience?.startDate || "",
      endDate: editingExperience?.endDate || "",
      current: editingExperience?.current || false,
      type: editingExperience?.type || "",
      description: editingExperience?.description || "",
    });
  }, [editingExperience]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setExperience((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = () => {
    setExperience((prev) => ({ ...prev, current: !prev.current }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const user = auth.currentUser;
    if (user) {
      const updatedExperiences = editingExperience
        ? workExperiences.map((exp) =>
            exp === editingExperience ? experience : exp
          )
        : [...workExperiences, experience];

      const userDetails = {
        experience: updatedExperiences,
      };
      saveUserProfile(user.uid, userDetails);
    }

    onAddExperience(experience);
    setExperience({
      company: "",
      title: "",
      startDate: "",
      endDate: "",
      current: false,
      type: "fulltime",
      description: "",
    });
  };

  return (
    <form>
      <Card className="grid grid-cols-7 max-w-[828px] py-10 text-white border-b border-gray rounded-none">
        <CardHeader className="col-span-2">
          <CardTitle>Work Experience</CardTitle>
          <CardDescription>Add your past job roles.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 col-span-5">
          <div className="flex flex-col gap-4">
            {workExperiences.length &&
              workExperiences.map((experience, index) => (
                <div
                  key={index}
                  className="flex flex-row py-4 px-4 border border-[#371b7e] rounded-lg"
                >
                  <div className="flex flex-col flex-grow gap-3">
                    <div className="flex flex-row justify-between">
                      <h2 className="text-display-xs-bold">
                        {experience.company}
                      </h2>

                      <div className="flex flex-col">
                        <p className="text-text-md-bold">
                          <DateFormate date={experience.startDate} /> -{" "}
                          {experience.current ? (
                            "Present"
                          ) : (
                            <DateFormate date={experience.endDate} />
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-row items-center justify-between">
                      <p className="text-text-md-bold">{experience.title}</p>
                      <h3 className="text-text-xl-medium">{experience.type}</h3>
                    </div>

                    <div>
                      <p className="text-text-md-regular opacity-70 max-w-[480px]">
                        <span className="text-text-sm-semibold">
                          Description: {experience.description}
                        </span>
                      </p>
                    </div>
                  </div>
                  {isEditing && (
                    <div
                      className="relative flex flex-col text-white items-start justify-start ml-4"
                      ref={dropdownRef}
                    >
                      <Image
                        src="/static/icons/three-dot.svg"
                        alt="More"
                        width={24}
                        height={24}
                        onClick={() => toggleDropdown(index)}
                      />

                      {dropdownOpenIndex === index && (
                        <div className="absolute flex flex-col z-60 top-12 bg-white text-black px-6 py-2 right-0 rounded-md">
                          <p
                            onClick={() => onEditExperience(index)}
                            className="text-text-lg-regular font-inter cursor-pointer"
                          >
                            Edit
                          </p>
                          <p
                            onClick={() => onDeleteExperience(index)}
                            className="text-text-lg-regular font-inter cursor-pointer"
                          >
                            Delete
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
          </div>
          {isEditing && (
            <>
              <div className="flex flex-col gap-4">
                <Label>Company</Label>
                <Input
                  name="company"
                  value={experience.company}
                  onChange={handleChange}
                  placeholder="Enter Company Name"
                  required
                />

                <Label>Title</Label>
                <Input
                  name="title"
                  value={experience.title}
                  onChange={handleChange}
                  placeholder="Enter Job Title"
                  required
                />

                <Label>Start Date</Label>
                <Input
                  type="date"
                  name="startDate"
                  value={experience.startDate}
                  onChange={handleChange}
                  required
                />

                <Label>End Date</Label>
                <Input
                  type="date"
                  name="endDate"
                  value={experience.endDate}
                  onChange={handleChange}
                  disabled={experience.current}
                  required={!experience.current}
                />

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="current"
                    checked={experience.current}
                    onCheckedChange={handleCheckboxChange}
                  />
                  <Label htmlFor="current">I currently work here</Label>
                </div>

                <Label>Employment Type</Label>
                <select
                  name="type"
                  value={experience.type}
                  onChange={handleChange}
                  className="bg-gray px-3 py-2 rounded-md"
                >
                  <option value="fulltime">Full-time</option>
                  <option value="parttime">Part-time</option>
                </select>

                <Label>Description</Label>
                <textarea
                  name="description"
                  value={experience.description}
                  onChange={handleChange}
                  className="bg-gray px-3 pt-3 pb-12 rounded-md"
                  placeholder="Describe your work experience..."
                />
              </div>
              <div className="flex gap-4">
                <Button
                  className="w-fit px-8 bg-transparent border border-gray"
                  onClick={handleSave}
                >
                  <Image
                    src={"/static/icons/add.svg"}
                    width={20}
                    height={20}
                    alt="update"
                  />
                  Save
                </Button>
                <Button className="w-fit px-8 bg-transparent border border-gray">
                  Cancel
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </form>
  );
};

export default WorkExperience;
