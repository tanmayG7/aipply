import { MongoClient, Db } from "mongodb";

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


export const saveJobForUser = async (userId: string, jobId: string) => {
  const db = await connectToMongoDB();
  return await db.collection("saved_jobs").updateOne(
    { userId },
    { $addToSet: { jobs: jobId } },
    { upsert: true }
  );
};


export const getSavedJobs = async (userId: string) => {
  const db = await connectToMongoDB();
  const savedJobs = await db.collection("saved_jobs").findOne({ userId });

  if (!savedJobs) return [];
  return await db.collection("jobs").find({ jobId: { $in: savedJobs.jobs } }).toArray();
};
