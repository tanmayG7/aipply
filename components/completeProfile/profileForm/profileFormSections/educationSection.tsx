import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { auth, saveUserProfile } from "@/lib/firebaseConfig/firebaseConfig";
import { Education } from "@/lib/types"; // Add this import

interface EducationSectionProps {
  educations: Education[];
  onAddEducation: (education: Education) => void;
  onEditEducation: (index: number) => void;
  onDeleteEducation: (index: number) => void;
  isEditing: boolean;
  dropdownOpenIndex: number | null;
  toggleDropdown: (index: number) => void;
  editingEducation: Education | null;
}

const EducationSection: React.FC<EducationSectionProps> = ({
  isEditing,
  educations,
  onAddEducation,
  onEditEducation,
  onDeleteEducation,
  dropdownOpenIndex,
  toggleDropdown,
  editingEducation,
}) => {
  console.log("userDetails", educations);
  const [education, setEducation] = useState<Education>({
    college: editingEducation?.college || "",
    graduationYear: editingEducation?.graduationYear || "",
    degree: editingEducation?.degree || "",
    endDate: editingEducation?.endDate || "",
    description: editingEducation?.description || "",
    gpa: editingEducation?.gpa || "",
    maxGpa: editingEducation?.maxGpa || "",
  });

  useEffect(() => {
    setEducation({
      college: editingEducation?.college || "",
      graduationYear: editingEducation?.graduationYear || "",
      degree: editingEducation?.degree || "",
      endDate: editingEducation?.endDate || "",
      description: editingEducation?.description || "",
      gpa: editingEducation?.gpa || "",
      maxGpa: editingEducation?.maxGpa || "",
    });
  }, [editingEducation]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setEducation((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const updatedEducations = editingEducation
      ? educations.map((edu) => (edu === editingEducation ? education : edu))
      : [...educations, education];

    onAddEducation(education);
    const user = auth.currentUser;
    if (user) {
      const newEducation = {
        education: updatedEducations,
      };
      await saveUserProfile(user.uid, newEducation);
    }
    setEducation({
      college: "",
      graduationYear: "",
      degree: "",
      endDate: "",
      description: "",
      gpa: "",
      maxGpa: "",
    });
  };

  return (
    <>
      <Card className="grid grid-cols-7 max-w-[828px] text-white py-6 border-b border-gray rounded-none">
        <CardHeader className="col-span-2">
          <CardTitle>Education</CardTitle>
          <CardDescription>What schools have you studied at?</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 col-span-5">
          <div className="flex flex-col gap-4">
            {educations.map((education, index) => (
              <div
                key={index}
                className="flex flex-row py-4 px-4 border border-[#371b7e] rounded-lg"
              >
                <div className="flex flex-col flex-grow gap-4">
                  <div className="flex flex-row justify-between">
                    <h2 className="text-display-xs-bold max-w-[380px]">
                      {education.college}
                    </h2>
                    <div className="flex flex-col">
                      <p className="text-text-md-bold ">
                        GPA : {education.gpa} / {education.maxGpa}
                      </p>
                    </div>
                  </div>
                  <h3 className="text-text-xl-medium">
                    {education.degree} - {education.graduationYear}
                  </h3>

                  <p className="text-text-md-regular opacity-70 max-w-[480px]">
                    <span className="text-text-md-semibold">Description:</span>{" "}
                    {education.description}
                  </p>
                </div>
                {isEditing && (
                  <div className="relative flex flex-col text-white items-start justify-start ml-4">
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
                          onClick={() => onEditEducation(index)}
                          className="text-text-lg-regular font-inter cursor-pointer"
                        >
                          Edit
                        </p>
                        <p
                          onClick={() => onDeleteEducation(index)}
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
            <div className="flex flex-col gap-4">
              <Label>College/University</Label>
              <Input
                name="college"
                value={education.college}
                onChange={handleChange}
                placeholder="Enter College/University Name"
                required
              />

              <Label>Graduation Year</Label>
              <Input
                type="number"
                name="graduationYear"
                placeholder="Enter Graduation Year"
                value={education.graduationYear}
                onChange={handleChange}
                required
              />

              <Label>Degree/Major</Label>
              <Input
                name="degree"
                value={education.degree}
                onChange={handleChange}
                placeholder="Enter Degree/Major"
                required
              />

              <Label>End Date</Label>
              <Input
                type="date"
                name="endDate"
                value={education.endDate}
                onChange={handleChange}
                required
              />

              <Label>Description</Label>
              <textarea
                name="description"
                value={education.description}
                onChange={handleChange}
                className="bg-gray px-3 pt-3 pb-12 rounded-md"
                placeholder="Describe your education..."
              />

              <Label>GPA</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  name="gpa"
                  value={education.gpa}
                  onChange={handleChange}
                  placeholder="GPA"
                  required
                />
                <Input
                  type="number"
                  name="maxGpa"
                  value={education.maxGpa}
                  onChange={handleChange}
                  placeholder="Max GPA"
                  required
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
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default EducationSection;
