/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import { MongoClient, Db, ObjectId } from "mongodb";
import { Job } from "../types";

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
  console.log("Connected to MongoDB");
  cachedDb = client.db(MONGODB_DB);

  return cachedDb;
};


export const getJobs = async (limit: number = 20) => {
  const db = await connectToMongoDB();
  return await db.collection("jobs").find().limit(limit).toArray();
};

export const getJobsByPreferences = async (location: string, role: string) => {
  const db = await connectToMongoDB();
  return await db.collection("jobs").find({ location, role }).limit(20).toArray();
};

export const getJobsByTitle = async (jobTitle: string, limit: number = 20, page: number = 0) => {
  const db = await connectToMongoDB();
  const data = JSON.parse(JSON.stringify(await db.collection(`test-${jobTitle}`).find().skip(page * limit).limit(limit).toArray()));
  return data.map((job: any) => ({
    ...job,
    jobId: job._id
  }));
};

export const getFilteredJobsByTitle = async (jobTitle: string, excludedJobs: Set<string>) => {
  const db = await connectToMongoDB();

  // Convert Set to an array for MongoDB query
  const excludedArray = Array.from(excludedJobs).map(id => new ObjectId(id));

  const data = JSON.parse(JSON.stringify(
    await db.collection(`test-${jobTitle}`)
      .find({ _id: { $nin: excludedArray as ObjectId[] } }) // Exclude jobs present in the set
      .limit(20)
      .toArray()
  ));

  return data.map((job: any) => ({
    ...job,
    jobId: job._id
  }));
};


export const getJobsByIds = async (jobIds: string[]) => {
  const db = await connectToMongoDB();
  const objectIds = jobIds.map(id => new ObjectId(id));
  const jobs = await db.collection("jobs").find({ _id: { $in: objectIds } }).toArray();
  return jobs.map(job => ({
    jobId: job._id.toString(),
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
    platform: job.platform
  })) as Job[];
};
