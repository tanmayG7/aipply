import React from "react";

interface Job {
  id: string;
  jobTitle: string;
  companyName: string;
  package: string;
  workType: string;
  experience: string;
  location: string;
  roleType: string;
  skills: string[];
  applyLink: string;
  jobDescription: string;
  keyResponsibilities: string[];
  requiredSkillsExperienceQualifications: string[];
  aboutCompany: string[];
}

interface JobCardProps {
  job: Job;
}

const JobDescription: React.FC<JobCardProps> = ({ job }) => {
  return (
    <div className=" text-white">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-6">
          <h2 className="font-inter text-[24px] text-white font-semibold">
            Job Description
          </h2>
          <p className="font-inter text-[16px] font-normal text-white opacity-[80%]">
            {job.jobDescription}
          </p>
        </div>
        <div className="flex flex-col gap-6">
          <h4 className="font-inter text-[16px] text-white font-bold">
            Key Responsibilities
          </h4>
          <ul className="list-disc list-inside font-inter text-[16px] font-normal text-white opacity-[80%]">
            {job.keyResponsibilities.map((responsibility, index) => (
              <li key={index}>{responsibility}</li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-6">
          <h4 className="font-inter text-[16px] text-white font-bold">
            Required Skills, Experience & Qualifications
          </h4>
          <ul className="list-disc list-inside font-inter text-[16px] font-normal text-white opacity-[80%]">
            {job.requiredSkillsExperienceQualifications.map(
              (requiredSkillsExperienceQualification, index) => (
                <li key={index}>{requiredSkillsExperienceQualification}</li>
              )
            )}
          </ul>
        </div>

        <div className="flex flex-col gap-6">
          <h4 className="font-inter text-[16px] text-white font-bold">
            Key Skills
          </h4>
          <div className="flex flex-row gap-2">
            {job.skills.map((skill, index) => (
              <span
                key={index}
                className="border border-gray-500 px-2 py-1 rounded-md text-white text-xs"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <h4 className="font-inter text-[16px] text-white font-bold">
            About Company
          </h4>
          <ul className="list-disc list-inside font-inter text-[16px] font-normal text-white opacity-[80%]">
            {job.aboutCompany.map((company, index) => (
              <li key={index}>{company}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default JobDescription;
