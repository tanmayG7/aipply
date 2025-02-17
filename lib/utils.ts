import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const generalSalaryRanges = [
  { min: 0, max: 3, label: "0-3 LPA" },
  { min: 3, max: 6, label: "3-6 LPA" },
  { min: 6, max: 10, label: "6-10 LPA" },
  { min: 10, max: 15, label: "10-15 LPA" },
  { min: 15, max: 25, label: "15-25 LPA" },
  { min: 25, max: Infinity, label: "25+ LPA" },
];

const generalExperienceRanges = [
  { min: 0, max: 2, label: "0-2 Years" },
  { min: 2, max: 4, label: "2-4 Years" },
  { min: 4, max: 8, label: "4-8 Years" },
  { min: 8, max: 12, label: "8-12 Years" },
  { min: 12, max: Infinity, label: "12 Years+" },
];

export function mapSalaryToRange(salaryLabel: string): string {
  // Handle ranges like "12-18 Lacs PA"
  const rangeMatch = salaryLabel.match(/(\d+)-(\d+)/);
  if (rangeMatch) {
    const minSalary = parseFloat(rangeMatch[1]);
    const maxSalary = parseFloat(rangeMatch[2]);
    const averageSalary = (minSalary + maxSalary) / 2;
    return getGeneralRange(averageSalary);
  }

  // Handle single values like "3-6 Lakhs"
  const salaryValue = parseFloat(salaryLabel.replace(/[^0-9.]/g, ""));
  return getGeneralRange(salaryValue);
}

export function mapExperienceToRange(experienceLabel: string): string[] {
  console.log(experienceLabel);
  
  if (!experienceLabel || typeof experienceLabel !== "string") {
    return ["Unknown"];
  }

  const rangeMatch = experienceLabel.match(/(\d+)[^\d]+(\d+)/);
  if (rangeMatch) {
    const minExperience = parseFloat(rangeMatch[1]);
    const maxExperience = parseFloat(rangeMatch[2]);
    const averageExperience = (minExperience + maxExperience) / 2;
    return getGeneralExperienceRange(averageExperience);
  }

  const experienceValue = parseFloat(experienceLabel.replace(/[^0-9.]/g, ""));
  return getGeneralExperienceRange(experienceValue);
}

function getGeneralRange(salaryValue: number): string {
  for (const range of generalSalaryRanges) {
    if (salaryValue >= range.min && salaryValue < range.max) {
      return range.label;
    }
  }
  return "Unknown";
}

function getGeneralExperienceRange(experienceValue: number): string[] {
  for (const range of generalExperienceRanges) {
    if (experienceValue >= range.min && experienceValue < range.max) {
      return [range.label];
    }
  }
  return ["Unknown"];
}
