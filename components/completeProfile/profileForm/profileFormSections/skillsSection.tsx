import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Skills = () => {
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");

  const addSkill = () => {
    if (skillInput && !skills.includes(skillInput)) {
      setSkills([...skills, skillInput]);
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  return (
    <Card className="grid grid-cols-7 max-w-[828px] py-6 text-white border-b border-gray rounded-none">
      <CardHeader className="col-span-2">
        <CardTitle>Skills</CardTitle>
        <CardDescription>Add your key skills.</CardDescription>
      </CardHeader>
      <CardContent className="col-span-5">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <div
                key={skill}
                className="bg-gray-700 px-3 py-1 rounded-full flex items-center gap-2"
              >
                {skill}
                <button onClick={() => removeSkill(skill)}>✕</button>
              </div>
            ))}
          </div>

          <Input
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            placeholder="Enter a skill"
          />
          <Button
            onClick={addSkill}
            className="w-fit px-8 bg-transparent border border-gray hover:bg-gray-700"
          >
            Add Skill
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default Skills;
