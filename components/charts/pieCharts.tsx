"use client";

import * as React from "react";
// import { TrendingUp } from "lucide-react";
import { Label, Pie, PieChart } from "recharts";

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
const chartData = [
  { status: "search", visitors: 275, fill: "purple" },
  { status: "applied", visitors: 200, fill: "#8F63AA" },
  { status: "pending", visitors: 287, fill: "white" },
  { status: "interview", visitors: 173, fill: "#8F63ff" },
  { status: "offer", visitors: 190, fill: "gray" },
];

const chartConfig = {
  Search: {
    label: "Visitors",
  },
  Applied: {
    label: "Applied",
    color: "hsl(var(--chart-1))",
  },
  Pending: {
    label: "Pending",
    color: "hsl(var(--chart-2))",
  },
  Interview: {
    label: "Interview",
    color: "hsl(var(--chart-3))",
  },
  Offer: {
    label: "Offer",
    color: "hsl(var(--chart-4))",
  },
} satisfies ChartConfig;

export function DashboardChart() {
  const totalVisitors = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.visitors, 0);
  }, []);

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-start m-5">
        <CardTitle className="text-white">Breakdown</CardTitle>
        {/* <CardDescription>January - June 2024</CardDescription> */}
      </CardHeader>
      <CardContent className="grid grid-cols-2 items-center w-full m-auto justify-center">
        <ChartContainer
          config={chartConfig}
          className="mx-auto w-full h-full max-h-[650px]"
        >
          <PieChart width={250} height={450}>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="visitors"
              nameKey="status"
              innerRadius={40}
              strokeWidth={6}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-white text-3xl font-bold"
                        >
                          {totalVisitors.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Visitors
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
        <ul>
          <li className="list-disc font-inter text-[#94969c] text-text-sm-semibold">
            Search
          </li>
          <li className="list-disc  text-[#94969c] text-text-sm-semibold font-inter">
            Applied
          </li>
          <li className="list-disc  text-[#94969c] text-text-sm-semibold font-inter">
            Pending
          </li>
          <li className="list-disc  text-[#94969c] text-text-sm-semibold font-inter">
            Interview
          </li>
          <li className="list-disc  text-[#94969c] text-text-sm-semibold font-inter">
            Offer
          </li>
        </ul>
      </CardContent>
      {/* <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing total visitors for the last 6 months
        </div>
      </CardFooter> */}
    </Card>
  );
}
