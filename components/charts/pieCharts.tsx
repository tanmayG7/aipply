"use client";

import * as React from "react";
import { Pie, PieChart } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";

interface DashboardChartProps {
  packageAppliedTo: Record<string, number>;
}

export function DashboardChart({ packageAppliedTo }: DashboardChartProps) {
  const COLORS = ["#53389E", "#6941C6", "#7F56D9", "#9E77ED", "#B692F6"];

  const chartData = React.useMemo(() => {
    return Object.entries(packageAppliedTo)
      .map(([label, value], index) => ({
        label,
        value,
        fill: COLORS[index % COLORS.length],
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 4);
  }, [packageAppliedTo]);

  const chartConfig = React.useMemo(() => {
    return chartData.reduce((acc, { label, fill }) => {
      acc[label] = { label, color: fill };
      return acc;
    }, {} as ChartConfig);
  }, [chartData]);

  if (chartData.length === 0) {
    return null; // Hide the chart if no data is available
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center m-5">
        <CardTitle className="text-white">Package Applied Breakdown</CardTitle>
        {/* <CardDescription>January - June 2024</CardDescription> */}
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[300px]"
        >
          <PieChart>
            <Pie data={chartData} dataKey="value" />
            <ChartLegend
              content={<ChartLegendContent nameKey="label" />}
              className=" text-white flex-wrap gap-5"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
