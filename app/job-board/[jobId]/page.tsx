// import { htmlToMarkdown } from "@/helpers/parser";

import JobCard from "@/components/card/jobCard/jobCard";
import JobDescription from "@/components/jobdescription/jobDescription";
import { jobBoardData } from "@/lib/staticData";
import Head from "next/head";

type Jobs = {
  id: string;
  jobTitle: string;
  companyName: string;
  jobPackage: string;
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
  
};

type AboutJobs = {
  [key: string]: Jobs;
};

export async function generateStaticParams() {
  const jobIds = [
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "11",
  ];

  return jobIds.map((jobId) => ({
    jobId,
  }));
}

const JobBoardPage = async ({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) => {
  const { jobId } = await params;

  const job = (jobBoardData as unknown as AboutJobs)[jobId];

  if (!job) {
    return <div>Job not found</div>;
  }

  // const pageContent = htmlToMarkdown(treatment.content);

  return (
    <>
      <Head>
        <title>{job.jobTitle} - Aipply Job Board</title>
        <meta name="description" content={`Apply for ${job.jobTitle} at ${job.companyName} on Aipply.`} />
      </Head>
      {job && (
        <div className=" flex flex-col gap-6 px-8 py-8">
          <div>
            <h4 className="flex font-inter font-semibold text-white text-[18px]">Job Description</h4>
          </div>
          <JobCard job={job} />
          <JobDescription job={job} isVisible={true} />
        </div>
      )}
    </>
  );
};

export default JobBoardPage;
