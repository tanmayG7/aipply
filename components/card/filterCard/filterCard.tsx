"use client";
import React, { useRef } from "react";
import { X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { experienceOptions, jobTypes, salaryRanges } from "@/lib/staticData";

interface FilterCardProps {
  onApply: () => void;
  onClear: () => void;
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
  onApply,
  onClear,
  salaryRange,
  setSalaryRange,
  experience,
  setExperience,
  jobType,
  setJobType,
  onClose,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const handleApply = () => {
    onApply();
  };

  const handleClear = () => {
    setSalaryRange([]);
    setExperience([]);
    setJobType([]);
    onClear();
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

  // Remove auto-apply effect - now using explicit Apply button

  return (
    <div>
      <div
        ref={modalRef}
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
        {/* Action buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleClear}
            className="flex-1 px-4 py-3 text-gray-400 bg-gray-800 hover:bg-gray-700 rounded-md font-medium transition-colors"
          >
            Clear
          </button>
          <button
            onClick={handleApply}
            className="flex-1 px-4 py-3 text-white bg-blue-600 hover:bg-blue-700 rounded-md font-medium transition-colors"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterCard;
