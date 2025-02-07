import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const AchievementsSection = () => {
  return (
    <Card className="grid grid-cols-7 max-w-[828px] py-6 text-white">
      <CardHeader className="col-span-2">
        <CardTitle>Achievements</CardTitle>
        <CardDescription>
          Sharing more details about yourself will help you srand out more.
        </CardDescription>
      </CardHeader>
      <CardContent className="col-span-5">
        <textarea
          className="bg-gray px-3 pt-3 pb-12 rounded-md w-full"
          placeholder="Describe your achievements..."
        />
      </CardContent>
    </Card>
  );
};

export default AchievementsSection;
