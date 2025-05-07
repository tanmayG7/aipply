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
import { auth, saveUserProfile, getUserProfile } from "@/lib/firebaseConfig/firebaseConfig";
import { UserDetails } from "@/lib/types";

interface SkillsProps {
  isEditing: boolean;
  userDetails: UserDetails;
}

const Skills: React.FC<SkillsProps> = ({ isEditing, userDetails }) => {
  const [skills, setSkills] = useState<string[]>(userDetails.skills || []);
  const [skillInput, setSkillInput] = useState("");

const addSkill = async () => {
  if (skillInput && !skills.includes(skillInput)) {
    const updatedSkills = [...skills, skillInput];
    setSkills(updatedSkills);
    setSkillInput("");
    await handleSave();
  }
};

  const removeSkill = async (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
    const user = auth.currentUser;
    if (user) {
      const userDetails = await getUserProfile(user.uid);
      const updatedSkills = (userDetails.skills ?? []).filter((s: string) => s !== skill);
      await saveUserProfile(user.uid, { skills: updatedSkills });
    }


  };

  const handleSave = async () => {
    const user = auth.currentUser;
    if (user) {
      const userDetails = {
        skills,
      };
      await saveUserProfile(user.uid, userDetails);
    }
  };

  return (
    <Card className="grid grid-cols-7 max-w-[100%] py-10 text-white border-b border-gray rounded-none">
      <CardHeader className="col-span-2">
        <CardTitle>Skills</CardTitle>
        <CardDescription>Add your key skills.</CardDescription>
      </CardHeader>

      {isEditing ? (
        <CardContent className="flex flex-col gap-6 col-span-5">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <div
                  key={skill}
                  className="border-[1px] border-slate-700 px-4 py-2 rounded flex items-center gap-2"
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
          </div>
          <div className="flex gap-4">
            <Button
              onClick={addSkill}
              className="w-fit px-8 bg-transparent border border-gray hover:bg-gray-700"
            >
              Add Skill
            </Button>
            <Button
              className="w-fit px-8 text-white bg-transparent border border-gray"
              onClick={handleSave}
            >
              Save
            </Button>
          </div>
        </CardContent>
      ) : (
        <CardContent className="col-span-5">
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <div
                key={skill}
                className="bg-gray-700 flex items-center gap-2 border-[1px] border-[#371b7e] px-4 py-2 rounded"
              >
                {skill}
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default Skills;