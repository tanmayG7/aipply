import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const WorkExperience = () => {
  const [experience, setExperience] = useState({
    company: "",
    title: "",
    startDate: "",
    endDate: "",
    current: false,
    type: "fulltime",
    description: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setExperience((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  return (
    <Card className="grid grid-cols-7 max-w-[828px] py-6 text-white">
      <CardHeader className="col-span-2">
        <CardTitle>Work Experience</CardTitle>
        <CardDescription>Add your past job roles.</CardDescription>
      </CardHeader>
      <CardContent className="col-span-5">
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
            <input
            type="checkbox"
              name="current"
              checked={experience.current}
              onChange={handleChange}
            />
            <Label>I currently work here</Label>
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
      </CardContent>
    </Card>
  );
};

export default WorkExperience;
