import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth, saveUserProfile } from "@/lib/firebaseConfig/firebaseConfig";
import { UserDetails } from "@/lib/types";
import { useState } from "react";

interface AchievementsSectionProps {
  userDetails: UserDetails;
  isEditing: boolean;
}

const AchievementsSection: React.FC<AchievementsSectionProps> = ({
  userDetails,
  isEditing,
}) => {
  const [achievements, setAchievements] = useState<string>(
    userDetails.achievements || ""
  );

  const handleSave = async () => {
    const user = auth.currentUser;
    if (user) {
      await saveUserProfile(user.uid, { achievements });
    }
  };

  return (
    <Card className="grid grid-cols-7 max-w-[100%] py-10 text-white border-b border-gray rounded-none">
      <CardHeader className="col-span-2">
        <CardTitle>Achievements</CardTitle>
        <CardDescription>
          Sharing more details about yourself will help you srand out more.
        </CardDescription>
      </CardHeader>
      {isEditing ? (
        <CardContent className="flex flex-col gap-6 col-span-5">
          <textarea
            id="achievementsTextarea"
            className="bg-gray px-3 pt-3 pb-12 rounded-md w-full"
            placeholder="Describe your achievements..."
            value={achievements}
            onChange={(e) => setAchievements(e.target.value)}
          />

          <div className="flex gap-4">
            <Button
              className="w-fit px-8 text-white bg-transparent border border-gray"
              onClick={handleSave}
            >
              Save
            </Button>
          </div>
        </CardContent>
      ) : (
        <>
          <CardContent className="col-span-5">
            <p className="text-text-md-medium opacity-65">{userDetails.achievements}</p>
          </CardContent>
        </>
      )}
    </Card>
  );
};

export default AchievementsSection;
