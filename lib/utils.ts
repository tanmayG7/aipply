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

export const mergeSalaryRanges = (salaries: string[]): string => {
  if (!salaries || salaries.length === 0) {
    return "Not Disclosed";
  }

  const ranges = salaries.map((salary) => {
    let min = 0, max = 0;
    const cleanSalary = salary.toLowerCase().trim();
    
    // Helper function to extract first number from text
    const extractNumber = (text: string): number => {
      const match = text.match(/\d+\.?\d*/);
      return match ? parseFloat(match[0]) : 0;
    };
    
    // Helper function to extract two numbers from text
    const extractTwoNumbers = (text: string): [number, number] => {
      const matches = text.match(/\d+\.?\d*/g);
      if (matches && matches.length >= 2) {
        return [parseFloat(matches[0]), parseFloat(matches[1])];
      } else if (matches && matches.length === 1) {
        const num = parseFloat(matches[0]);
        return [num, num];
      }
      return [0, 0];
    };
    
    if (cleanSalary.includes("up to")) {
      max = extractNumber(salary);
      min = 0;
    } else if (cleanSalary.includes(" to ")) {
      [min, max] = extractTwoNumbers(salary);
    } else if (cleanSalary.includes(">")) {
      min = extractNumber(salary);
      max = Infinity;
    } else if (cleanSalary.includes("+")) {
      min = extractNumber(salary);
      max = Infinity;
    } else if (cleanSalary.includes("-")) {
      [min, max] = extractTwoNumbers(salary);
    } else {
      // Single number
      min = max = extractNumber(salary);
    }
    
    // Validation: Ensure realistic salary ranges
    if (min > 500 || max > 500) {
      console.warn(`Unrealistic salary detected: "${salary}" -> min:${min}, max:${max}. Capping values.`);
      // If values seem to be in thousands, convert to lakhs
      if (min >= 100000) min = min / 100000;
      if (max >= 100000 && max !== Infinity) max = max / 100000;
      // Cap at reasonable maximum (50 lakhs)
      if (min > 50) min = 50;
      if (max > 50 && max !== Infinity) max = 50;
    }
    
    return { min, max };
  });
  
  const validRanges = ranges.filter(range => range.min >= 0 && (range.max >= 0 || range.max === Infinity));
  
  if (validRanges.length === 0) {
    return "Not Disclosed";
  }
  
  const minSalary = Math.min(...validRanges.map((range) => range.min));
  const maxSalary = Math.max(...validRanges.map((range) => range.max === Infinity ? range.min : range.max));
  
  // Handle the case where maximum is infinity
  if (validRanges.some(range => range.max === Infinity)) {
    return `${minSalary}+ Lakhs`;
  }
  
  // Format the result
  if (minSalary === maxSalary) {
    return `${minSalary} Lakhs`;
  }
  
  return `${minSalary}-${maxSalary} Lakhs`;
};

// Updated to handle both string and array locations
export const determineJobLocation = (
  location: string | string[]
): { type: string; color: string } => {
  // Convert to string if it's an array
  const locationString = Array.isArray(location) 
    ? location.join(", ").toLowerCase() 
    : location.toLowerCase();
    
  if (locationString.includes("remote")) {
    if (
      locationString.includes("on-site") ||
      locationString.includes("onsite")
    ) {
      return { type: "Hybrid", color: "#FFB946" };
    }
    return { type: "Remote", color: "#4CD964" };
  } else {
    return { type: "On-site", color: "#FF4D4F" };
  }
};

export const determineJobType = (description: string): string => {
  const lowerCaseDescription = description.toLowerCase();
  if (
    lowerCaseDescription.includes("intern") ||
    lowerCaseDescription.includes("internship")
  ) {
    return "Internship";
  } else if (
    lowerCaseDescription.includes("part-time") ||
    lowerCaseDescription.includes("part time")
  ) {
    return "Part-time";
  } else  {
    return "Full-time";
  }
};
