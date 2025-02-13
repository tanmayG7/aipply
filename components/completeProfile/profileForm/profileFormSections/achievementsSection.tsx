import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth, saveUserProfile } from "@/lib/firebaseConfig/firebaseConfig";

const handleSave = () => {
  const user = auth.currentUser;
  if (user) {
    const achievements = (document.getElementById("achievementsTextarea") as HTMLTextAreaElement).value;
    saveUserProfile(user.uid, { achievements });
    alert("Achievements saved successfully!");
  }
}

const AchievementsSection = () => {
  return (
    <Card className="grid grid-cols-7 max-w-[828px] py-6 text-white border-b border-gray rounded-none">
      <CardHeader className="col-span-2">
        <CardTitle>Achievements</CardTitle>
        <CardDescription>
          Sharing more details about yourself will help you srand out more.
        </CardDescription>
      </CardHeader>
      <CardContent className="col-span-5">
        <textarea
          id="achievementsTextarea"
          className="bg-gray px-3 pt-3 pb-12 rounded-md w-full"
          placeholder="Describe your achievements..."
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
    </Card>
  );
};

export default AchievementsSection;
