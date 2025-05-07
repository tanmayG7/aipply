"use client";

// import { TrendingUp } from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
import { getJobDataByLocation } from "@/lib/staticData";

import {
  Card,
  CardContent,
  // CardDescription,
  // CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const locationData = getJobDataByLocation();

const chartConfig = {
  count: {
    label: "Job Count",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function DashboardLineChart() {
  return (
    <Card>
      <CardHeader className="items-start m-5">
        <CardTitle className="text-white ">Location Based</CardTitle>
        {/* <CardDescription>Job distribution across locations</CardDescription> */}
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={locationData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="location"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Line
              dataKey="count"
              type="monotone"
              stroke="#8884d8"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      {/* <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              Job distribution by location
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              Showing total job counts for each location
            </div>
          </div>
        </div>
      </CardFooter> */}
    </Card>
  );
}
