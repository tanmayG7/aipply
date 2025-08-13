"use client";
import React, { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { experienceOptions, jobTypes, salaryRanges } from "@/lib/staticData";
import { Job } from "@/lib/types";
import { determineJobType } from "@/lib/utils";

interface FilterCardProps {
  jobs: Job[];
  setFilteredJobs: (jobs: Job[]) => void;
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
  onClose: () => void;
}

const FilterCard: React.FC<FilterCardProps> = ({
  jobs,
  setFilteredJobs,
  salaryRange,
  setSalaryRange,
  experience,
  setExperience,
  jobType,
  setJobType,
  onClose,
}) => {
  const [isSalaryChecked, setIsSalaryChecked] = useState(false);
  const [isExperienceChecked, setIsExperienceChecked] = useState(false);
  const [isJobTypeChecked, setIsJobTypeChecked] = useState(false);
  const [noJobsFound, setNoJobsFound] = useState(false);
  const didMount = useRef(false);

  // Update state variables based on the current filter arrays
  useEffect(() => {
    setIsSalaryChecked(salaryRange.length > 0);
  }, [salaryRange]);

  useEffect(() => {
    setIsExperienceChecked(experience.length > 0);
  }, [experience]);

  useEffect(() => {
    setIsJobTypeChecked(jobType.length > 0);
  }, [jobType]);

  const applyFilters = () => {
    // Dynamically adjust salaryRange and experience based on checked ranges
    if (!isSalaryChecked) setSalaryRange([]);
    if (!isExperienceChecked) setExperience([]);
    if (!isJobTypeChecked) setJobType([]);

    const filteredJobs = jobs.filter((job) => {
      const jobSalaryRanges: [number, number][] = job.salary?.map(
        (value: string) => {
          const [minStr, maxStr] = value
            .replace(/\s*Lakhs\s*/gi, "")
            .split("-")
            .map((v) => parseFloat(v));
          return [minStr * 100000, maxStr * 100000];
        }
      ) || [[0, 0]];

      const isWithinSalaryRange =
        !isSalaryChecked ||
        jobSalaryRanges.some(([jobMin, jobMax]) =>
          salaryRange.some(([filterMin, filterMax]) => {
            return (
              (jobMin >= filterMin && jobMin <= filterMax) ||
              (jobMax >= filterMin && jobMax <= filterMax) ||
              (jobMin <= filterMin && jobMax >= filterMax)
            );
          })
        );

      const [jobExpMin, jobExpMax] = job.experience
        ? job.experience
            .replace(/[^\d\-]/g, "")
            .split("-")
            .map((v) => parseInt(v, 10))
        : [0, 0];

      const isWithinExperience =
        !isExperienceChecked ||
        experience.some(([filterMin, filterMax]) => {
          return (
            (jobExpMin >= filterMin && jobExpMin <= filterMax) ||
            (jobExpMax >= filterMin && jobExpMax <= filterMax) ||
            (jobExpMin <= filterMin && jobExpMax >= filterMax)
          );
        });

      // Determine the job type based on the description
      const jobTypeFromDescription = determineJobType(job.description)
        .toLowerCase()
        .trim();

      const isJobTypeMatch =
        jobType.length === 0 || jobType.includes(jobTypeFromDescription);

      const conditions = [];
      if (isSalaryChecked) conditions.push(isWithinSalaryRange);
      if (isExperienceChecked) conditions.push(isWithinExperience);
      if (isJobTypeChecked) conditions.push(isJobTypeMatch);

      // Ensure all conditions are true
      return conditions.length === 0 || conditions.every((condition) => condition);
    });

    if (filteredJobs.length === 0) {
      setNoJobsFound(true);
    } else {
      setNoJobsFound(false);
      setFilteredJobs(filteredJobs);
    }
  };

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
    setJobType((prev) => {
      const updatedJobType = prev.includes(value)
        ? prev.filter((type) => type !== value)
        : [...prev, value];
      return updatedJobType;
    });
  };

  // Auto-apply filters when any filter value changes (skip first mount)
  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true;
      return;
    }
    applyFilters();
  }, [salaryRange, experience, jobType]);

  return (
    <div>
      <div
        className="fixed top-0 right-0 w-[320px] sm:w-[400px] h-full bg-[#0C111D] shadow-xl px-6 py-8 flex flex-col gap-6 border-l border-[#454545] z-[9999]"
        style={{
          borderTopLeftRadius: "24px",
          borderBottomLeftRadius: "24px",
        }}
      >
        <div className="flex justify-between items-center">
          <h2 className="text-[18px] font-semibold font-inter text-white">
            Filter Jobs
          </h2>
          <X
            size={40}
            className="cursor-pointer rounded-md text-white bg-white bg-opacity-10"
            onClick={onClose}
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
        </div>
        {noJobsFound && (
          <div className="text-center text-red-600/90 mt-4">
            <p className="text-text-lg-semibold font-inter">
              No jobs found matching your criteria. Please try adjusting the filters.
            </p>
          </div>
        )}
        <div className="mt-auto pt-4">
          <Button 
            onClick={onClose}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-inter"
          >
            Apply Filters & Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FilterCard;
