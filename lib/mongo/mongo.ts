/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import { MongoClient, Db, WithId } from "mongodb";
import { Job, UserDetails } from "../types";

const MONGODB_URI = process.env.MONGODB_URI as string; // MongoDB Connection String
const MONGODB_DB = process.env.MONGODB_DB as string; // Database Name

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

if (!MONGODB_DB) {
  throw new Error("Please define the MONGODB_DB environment variable");
}

let cachedDb: Db | null = null;

export const connectToMongoDB = async (): Promise<Db> => {
  if (cachedDb) {
    return cachedDb;
  }


  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  console.log('Db connected');
  cachedDb = client.db(MONGODB_DB);

  return cachedDb;


};

export const getJobs = async (limit: number = 20) => {
  const db = await connectToMongoDB();
  return await db.collection("jobs").find().limit(limit).toArray();
};

export const getJobsByPreferences = async (location: string, role: string) => {
  const db = await connectToMongoDB();
  return await db
    .collection("jobs")
    .find({ location, role })
    .limit(20)
    .toArray();
};



export const getJobByTitleandSkills = async(userProfile:UserDetails) => {
  const db = await connectToMongoDB();
    const results = await db.collection('jobs')
    .find({ tags: { $in: userProfile.skills } }) // Match array values
    .limit(20) // Limit number of documents returned
    .toArray();

  
    return  JSON.parse(JSON.stringify(results));
}


export const getJobsByTitle = async (
  jobTitle: string,
  limit: number = 20,
  page: number = 0
) => {
  const db = await connectToMongoDB();
  const data = JSON.parse(
    JSON.stringify(
      await db
        .collection(`test-${jobTitle}`)
        .find()
        .skip(page * limit)
        .limit(limit)
        .toArray()
    )
  );
  return data.map((job: any) => ({
    ...job,
    id: job._id.toString(),
    jobId: job.id,
    postedDate: job.postedDate?.toISOString?.(),
  }));
};

export const getFilteredJobsByTitle = async (
  jobTitle: any,
  excludedJobs: Set<string>,
  userProfile:any
) => {

  
 
  const db = await connectToMongoDB();


  // Convert Set to an array for MongoDB query
  const excludedArray = Array.from(excludedJobs);

  
  // Fetch random job IDs from jobMap collection using aggregation
  const jobMap = await db
    .collection("jobMap")
    .aggregate([
      { $match: { keyword: jobTitle } },
      { $unwind: "$jobIds" },
      { $match: { jobIds: { $nin: excludedArray } } },
      { $sample: { size: 20 } },
      { $group: { _id: "$_id", jobIds: { $push: "$jobIds" } } },
    ])
    .toArray();



  
  if (jobMap.length === 0) {
    const results = await db.collection('jobs')
    .find({ tags: { $in: userProfile.skills } }) // Match array values
    .limit(20) // Limit number of documents returned
    .toArray();

    if(results.length > 0){

    return results.map((job: any) => ({
      ...job,
      id: job._id.toString(),
      jobId: job.id,
    }));
  }
  else {
    return [];
  }
  }

  const jobIds = jobMap[0].jobIds;

  // Fetch job details from jobs collection
  const jobs = await db
    .collection("jobs")
    .find({ id: { $in: jobIds } })
    .toArray();

  return jobs.map((job: any) => ({
    ...job,
    id: job._id.toString(),
    jobId: job.id,
  }));
};

export const getJobDetailsByIds = async (jobIds: string[]) => {
  const db = await connectToMongoDB();
  const jobs = await db
    .collection("jobs")
    .find({ id: { $in: jobIds } })
    .toArray();

  return jobs.map((job) => ({
    _id: job._id.toString(), // Include _id in the mapped object
    id: job.id,
    jobId: job.id,
    title: job.title,
    company: job.company,
    salary: job.salary,
    location: job.location,
    role: job.role,
    description: job.description,
    requirements: job.requirements,
    benefits: job.benefits,
    postedDate: job.postedDate,
    applyLink: job.applyLink,
    experience: job.experience,
    recruiter: job.recruiter,
    jobUrl: job.jobUrl,
    platform: job.platform,
    logoUrl: job.logoUrl,
    tags: job.tags,
    type: job.type,
  })) as Job[];
};

export const getJobsByIds = async (
  jobIds: string[],
  jobTitle?: string,
  expectedCTC?: string,
  workexperience?: string
) => {
  const db = await connectToMongoDB();
  let jobs = await db
    .collection("jobs")
    .find({ id: { $in: jobIds } })
    .toArray();

  jobs = Array.from(new Map(jobs.map(job => [job.id, job])).values());
 

  const filterJobs = (jobs: any[], filterFn: (job: any) => boolean) => 
    jobs.filter(filterFn);

  // Filter by jobTitle
  if (jobTitle) {
    const titleLower = jobTitle.toLowerCase();
    jobs = filterJobs(jobs, (job) =>
      job.title?.toLowerCase().includes(titleLower) ||
      job.description?.toLowerCase().includes(titleLower) ||
      job.keywords?.some((keyword: string) => keyword.toLowerCase().includes(titleLower)) ||
      job.tags?.some((tag: string) => tag.toLowerCase().includes(titleLower))
    );
  }

  // Filter by expectedCTC
  if (jobs.length < 20 && expectedCTC) {
    const expectedCTCValue = parseInt(expectedCTC.replace(/[^\d]/g, ""), 10);
    if (!isNaN(expectedCTCValue)) {
      const salaryFilteredJobs = await db
        .collection("jobs")
        .find({
          id: { $in: jobIds },
          salary: { $elemMatch: { $regex: `^(\\d+)-(\\d+)`, $options: "i" } },
        })
        .toArray();

      jobs = [
        ...jobs,
        ...filterJobs(salaryFilteredJobs, (job) =>
          job.salary.some((range: string) => {
            const [min, max] = range.replace(/[^\d-]/g, "").split("-").map(Number);
            return expectedCTCValue >= min && expectedCTCValue <= max;
          })
        ).filter((job) => !jobs.some((j) => j.id === job.id)),
      ];
    }
  }

  // Filter by workexperience
  if (jobs.length < 20 && workexperience) {
    const experienceValue = parseInt(workexperience, 10);
    if (!isNaN(experienceValue)) {
      jobs = filterJobs(jobs, (job) => {
        const parseRange = (range: string) =>
          range.replace(/[^\d-]/g, "").split("-").map(Number);
        if (Array.isArray(job.experience)) {
          return job.experience.some((range: string) => {
            const [min, max] = parseRange(range);
            return experienceValue >= min && experienceValue <= max;
          });
        } else if (typeof job.experience === "string") {
          const [min, max] = parseRange(job.experience);
          return experienceValue >= min && experienceValue <= max;
        }
        return false;
      });
    }
  }

  // Fetch random jobs if the total jobs are still below 20
 if (jobs.length < 20) {
   const randomJobs = (await db
     .collection("jobs")
     .aggregate([{ $sample: { size: 20 - jobs.length } }])
     .toArray()) as WithId<Document>[]; 

   jobs = [
     ...jobs,
     ...randomJobs.filter((job) => !jobs.some((j) => j.id === job._id.toString())),
   ];
 }

  return jobs.slice(0, 20).map((job) => ({
    _id: job._id.toString(),
    id: job.id.toString(),
    jobId: job.id,
    title: job.title,
    company: job.company,
    salary: job.salary,
    location: job.location,
    role: job.role,
    description: job.description,
    requirements: job.requirements,
    benefits: job.benefits,
    postedDate: job.postedDate,
    applyLink: job.applyLink,
    experience: job.experience,
    recruiter: job.recruiter,
    jobUrl: job.jobUrl,
    platform: job.platform,
    logoUrl: job.logoUrl,
    tags: job.tags,
    type: job.type,
  })) as Job[];
};
