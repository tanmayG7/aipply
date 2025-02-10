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
import { useState } from "react";

const EducationSection = () => {
  const [education, setEducation] = useState({
    college: "",
    graduationYear: "",
    degree: "",
    endDate: "",
    description: "",
    gpa: "",
    maxGpa: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setEducation((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Card className="grid grid-cols-7 max-w-[828px] text-white py-6 border-b border-gray rounded-none">
      <CardHeader className="col-span-2">
        <CardTitle>Education</CardTitle>
        <CardDescription>What schools have you studied at?</CardDescription>
      </CardHeader>
      <CardContent className="col-span-5">
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
            <Button className="w-fit px-8 bg-transparent border border-gray">
              Save
            </Button>
            <Button className="w-fit px-8 bg-transparent border border-gray">
              Cancel
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EducationSection;
