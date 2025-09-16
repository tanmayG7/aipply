"use client";

import { Bar, BarChart, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface DashboardBarChartProps {
  locationData: { [key: string]: number };
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#FF6384"];

const chartConfig = {
  count: {
    label: "Job Count",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function DashboardBarChart({ locationData }: DashboardBarChartProps) {
  const data = Object.keys(locationData)
    .map((location, index) => ({
      location,
      count: locationData[location],
      fill: COLORS[index % COLORS.length],
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const hasEnoughData = data.length >= 3;

  if (!hasEnoughData) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="items-center lg:items-start m-5 my-10">
        <CardTitle className="text-white">Top Locations Applied</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={data}
            layout="vertical"
            margin={{
              left: 20,
            }}
          >
            <YAxis
              dataKey="location"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              width={150}
            />
            <XAxis dataKey="count" type="number" hide />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Bar dataKey="count" layout="vertical" radius={5} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
