import React from "react";
import { X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { experienceOptions, jobTypes, salaryRanges } from "@/lib/staticData";

interface FilterCardProps {
  salaryRange: [number, number][];
  setSalaryRange: (
    range:
      | [number, number][]
      | ((prev: [number, number][]) => [number, number][])
  ) => void;
  experience: [number, number][];
  setExperience: (
    experience:
      | [number, number][]
      | ((prev: [number, number][]) => [number, number][])
  ) => void;
  jobType: string[];
  setJobType: (jobType: string[] | ((prev: string[]) => string[])) => void;
  handleFilterCancel: () => void;
  handleFilterSubmit: () => void;
}

const FilterCard: React.FC<FilterCardProps> = ({
  salaryRange,
  setSalaryRange,
  experience,
  setExperience,
  jobType,
  setJobType,
  handleFilterCancel,
  handleFilterSubmit,
}) => {

  
  const handleSalaryCheckboxChange = (range: [number, number]) => {
    setSalaryRange((prev) =>
      prev.some((r) => r[0] === range[0] && r[1] === range[1])
        ? prev.filter((r) => r[0] !== range[0] || r[1] !== range[1])
        : [...prev, range]
    );
  };

  const handleExperienceCheckboxChange = (range: [number, number]) => {
    setExperience((prev) =>
      prev.some((r) => r[0] === range[0] && r[1] === range[1])
        ? prev.filter((r) => r[0] !== range[0] || r[1] !== range[1])
        : [...prev, range]
    );
  };

  const handleJobTypeCheckboxChange = (value: string) => {
    setJobType((prev) =>
      prev.includes(value)
        ? prev.filter((type) => type !== value)
        : [...prev, value]
    );
  };

  return (
    <div>
      <div
        className="fixed top-0 right-0 w-[300px] h-full bg-[#0C111D] shadow-lg min-w-[443px] px-8 py-8 z-50 flex flex-col gap-8"
        style={{
          borderTopLeftRadius: "40px",
          borderBottomLeftRadius: "40px",
          borderLeft: "2px solid rgba(255, 255, 255, 0.6)",
        }}
      >
        <div className="flex justify-between items-center">
          <h2 className="text-[18px] font-semibold font-inter text-white">
            Filter Jobs
          </h2>
          <X
            size={40}
            className="cursor-pointer rounded-md text-white bg-white bg-opacity-10"
            onClick={handleFilterCancel}
          />
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-8">
            <div className="flex flex-row justify-between">
              <div className="flex flex-col gap-4">
                <label className="block text-[16px] text-white font-inter font-bold">
                  Salary Range
                </label>
                <div className="flex flex-col gap-2">
                  {salaryRanges.map((salaryRangeOption) => (
                    <div
                      key={salaryRangeOption.label}
                      className="flex items-center gap-2"
                    >
                      <Checkbox
                        checked={salaryRange.some(
                          (r) =>
                            r[0] === salaryRangeOption.range[0] &&
                            r[1] === salaryRangeOption.range[1]
                        )}
                        onCheckedChange={() =>
                          handleSalaryCheckboxChange(
                            salaryRangeOption.range as [number, number]
                          )
                        }
                      />

                      <label className="text-text-lg-medium text-[#CECFD2] font-inter">
                        {salaryRangeOption.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <label className="block text-[16px] text-white font-inter font-bold">
                  Experience (years)
                </label>
                <div className="flex flex-col gap-2">
                  {experienceOptions.map((experienceOption) => (
                    <div
                      key={experienceOption.label}
                      className="flex items-center gap-2"
                    >
                      <Checkbox
                        checked={experience.some(
                          (r) =>
                            r[0] === experienceOption.range[0] &&
                            r[1] === experienceOption.range[1]
                        )}
                        onCheckedChange={() =>
                          handleExperienceCheckboxChange(
                            experienceOption.range as [number, number]
                          )
                        }
                      />
                      <label className="text-text-lg-medium text-[#CECFD2] font-inter">
                        {experienceOption.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <label className="block text-[16px] text-white font-inter font-bold">
                Job Type
              </label>
              <div className="flex flex-col gap-3">
                {jobTypes.map((jobTypeOption) => (
                  <div
                    key={jobTypeOption.value}
                    className="flex items-center gap-2"
                  >
                    <Checkbox
                      checked={jobType.includes(jobTypeOption.value)}
                      onCheckedChange={() =>
                        handleJobTypeCheckboxChange(jobTypeOption.value)
                      }
                    />
                    <label className="text-text-lg-medium text-[#CECFD2] font-inter">
                      {jobTypeOption.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="absolute z-50 bottom-7 justify-end gap-2 w-full">
            <div className="flex flex-row gap-4 mr-16">
              <Button
                onClick={handleFilterCancel}
                className="bg-gray text-white py-1 px-4 rounded-md w-full"
              >
                Cancel
              </Button>
              <Button
                onClick={handleFilterSubmit}
                className="bg-gradient-to-b from-[#6033F5] to-[#A061F1] text-white py-1 px-4 rounded-md w-full"
              >
                Submit
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterCard;
