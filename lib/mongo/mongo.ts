/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import { MongoClient, Db, WithId } from "mongodb";
import { Job, UserDetails } from "../types";
import { getSkillsForJobTitle } from '../enhanced-skill-tree';
/*just commenting*/

const MONGODB_URI = process.env.MONGODB_URI as string || "mongodb+srv://chauhankanishk990:kanishk123@aipply-main.prfha.mongodb.net/main?retryWrites=true&w=majority&appName=aipply-main"; // MongoDB Connection String
const MONGODB_DB = process.env.MONGODB_DB as string || "main" // Database Name

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

export const getJobByTitleandSkills = async(userProfile: UserDetails) => {
  const db = await connectToMongoDB();

  // Get enhanced skills for user's job title (now using 703 job titles!)
  const enhancedSkills = getSkillsForJobTitle(userProfile.jobTitle || '');
  const userSkills = userProfile.skills || [];
  const allSkills = [...new Set([...enhancedSkills, ...userSkills])];

  console.log(`🎯 Enhanced job search for "${userProfile.jobTitle}"`);
  console.log(`📊 Using ${enhancedSkills.length} job-specific skills + ${userSkills.length} user skills = ${allSkills.length} total`);

  const results = await db.collection('jobs')
    .find({ 
      $or: [
        // Enhanced skills matching (much broader now!)
        { tags: { $in: allSkills } },
        { keywords: { $in: allSkills } },
        // Title matching
        { title: { $regex: userProfile.jobTitle, $options: 'i' } }
      ]
    })
    .sort({ postedDate: -1 }) // Recent jobs first!
    .limit(20)
    .toArray();

  console.log(`✅ Found ${results.length} jobs with enhanced matching`);
  return JSON.parse(JSON.stringify(results));
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
  return data.map((job: any) => {
    const jobIdValue = job.id || job._id?.toString();
    return {
      ...job,
      _id: job._id?.toString(),
      id: jobIdValue,
      jobId: jobIdValue,
      postedDate: job.postedDate?.toISOString?.(),
    };
  });
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
    return results.map((job: any) => {
      const jobIdValue = job.id || job._id?.toString();
      return {
        ...job,
        _id: job._id?.toString(),
        id: jobIdValue,
        jobId: jobIdValue,
      };
    });
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

  return jobs.map((job: any) => {
    const jobIdValue = job.id || job._id?.toString();
    return {
      ...job,
      _id: job._id?.toString(),
      id: jobIdValue,
      jobId: jobIdValue,
    };
  });
};

// NEW PAGINATED VERSION OF getFilteredJobsByTitle
export const getFilteredJobsByTitlePaginated = async (
  jobTitle: any,
  excludedJobs: Set<string>,
  userProfile: any,
  page: number = 1,
  limit: number = 20
) => {
  console.log('[getFilteredJobsByTitlePaginated] function called');
  const db = await connectToMongoDB();
  const skip = (page - 1) * limit;

  // Convert Set to an array for MongoDB query
  const excludedArray = Array.from(excludedJobs);

  // First try to get jobs from jobMap collection
  const jobMapAggregation = [
    { $match: { keyword: jobTitle } },
    { $unwind: "$jobIds" },
    { $match: { jobIds: { $nin: excludedArray } } },
  ];

  // Get total count first
  const totalCountPipeline = [
    ...jobMapAggregation,
    { $count: "total" }
  ];
  
  const totalCountResult = await db
    .collection("jobMap")
    .aggregate(totalCountPipeline)
    .toArray();

  const totalFromJobMap = totalCountResult.length > 0 ? totalCountResult[0].total : 0;
  // const totalFromJobMap=0; // TEMP CODE : added to ensure we enter the next if block, need to uncomment the above line
  // console.log(`Before Enhanced fallback search for "${userProfile.jobTitle}"`);
  // console.log(`totalFromJobMap "${totalFromJobMap}"`);

  if (totalFromJobMap === 0) {
  // ENHANCED: Use comprehensive skill tree for better matching
      console.log('about to perform Enhanced fallback search');
      const enhancedSkills = getSkillsForJobTitle(userProfile.jobTitle || '');
      const userSkills = userProfile.skills || [];
      const allSkills = [...new Set([...enhancedSkills, ...userSkills])];
      
      console.log(`🎯 Enhanced fallback search for "${userProfile.jobTitle}"`);
      console.log(`📊 Using ${enhancedSkills.length} enhanced skills + ${userSkills.length} user skills = ${allSkills.length} total`);
    
      const skillsQuery = { 
        $or: [
          { tags: { $in: allSkills } },
          { keywords: { $in: allSkills } },
          { title: { $regex: userProfile.jobTitle || '', $options: 'i' } }
        ],
        id: { $nin: excludedArray }
      };

    // Get total count for skills-based search
    const skillsTotal = await db.collection('jobs').countDocuments(skillsQuery);

    const results = await db.collection('jobs')
      .find(skillsQuery)
      .skip(skip)
      .limit(limit)
      .toArray();

    return {
      jobs: results.map((job: any) => {
        const jobIdValue = job.id || job._id?.toString();
        return {
          ...job,
          _id: job._id?.toString(),
          id: jobIdValue,
          jobId: jobIdValue,
        };
      }),
      hasMore: skip + limit < skillsTotal,
      totalCount: skillsTotal,
      currentPage: page,
      totalPages: Math.ceil(skillsTotal / limit)
    };
  }

  // Get paginated job IDs from jobMap collection
  const jobMapPaginated = await db
    .collection("jobMap")
    .aggregate([
      ...jobMapAggregation,
      { $skip: skip },
      { $limit: limit },
      { $group: { _id: null, jobIds: { $push: "$jobIds" } } },
    ])
    .toArray();

  if (jobMapPaginated.length === 0) {
    return {
      jobs: [],
      hasMore: false,
      totalCount: 0,
      currentPage: page,
      totalPages: 0
    };
  }

  const jobIds = jobMapPaginated[0].jobIds;

  // Fetch job details from jobs collection
  const jobs = await db
    .collection("jobs")
    .find({ id: { $in: jobIds } })
    .toArray();

  const mappedJobs = jobs.map((job: any) => {
    const jobIdValue = job.id || job._id?.toString();
    return {
      ...job,
      _id: job._id?.toString(),
      id: jobIdValue,
      jobId: jobIdValue,
    };
  });

  return {
    jobs: mappedJobs,
    hasMore: skip + limit < totalFromJobMap,
    totalCount: totalFromJobMap,
    currentPage: page,
    totalPages: Math.ceil(totalFromJobMap / limit)
  };
};

// Helper function to get total count for job title (used by Firebase functions)
export const getTotalJobCountForTitle = async (
  jobTitle: string, 
  excludedJobs: Set<string>, 
  userProfile: any
) => {
  const db = await connectToMongoDB();
  const excludedArray = Array.from(excludedJobs);

  // First try jobMap
  const jobMapCount = await db
    .collection("jobMap")
    .aggregate([
      { $match: { keyword: jobTitle } },
      { $unwind: "$jobIds" },
      { $match: { jobIds: { $nin: excludedArray } } },
      { $count: "total" }
    ])
    .toArray();

  if (jobMapCount.length > 0) {
    return jobMapCount[0].total;
  }

  // Fallback to skills-based count
  const skillsCount = await db.collection('jobs').countDocuments({ 
    tags: { $in: userProfile.skills },
    id: { $nin: excludedArray }
  });

  return skillsCount;
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
  console.log("🔍 MongoDB: Searching for jobs with IDs:", jobIds);
  const db = await connectToMongoDB();
  
  // Try searching by jobId field instead of id field
  let jobs = await db
    .collection("jobs")
    .find({ jobId: { $in: jobIds } })
    .toArray();
  console.log("💾 MongoDB: Found jobs:", jobs.length);
  if (jobs.length > 0) {
    console.log("🔍 Sample MongoDB job structure:", jobs[0]);
  }

  jobs = Array.from(new Map(jobs.map(job => [job.id, job])).values());

  const filterJobs = (jobs: any[], filterFn: (job: any) => boolean) => 
    jobs.filter(filterFn);

  // Filter by jobTitle
  if (jobTitle) {
    const titleLower = jobTitle.toLowerCase();
    jobs = filterJobs(jobs, (job) => {
      // Handle location - check if it's array or string
      const locationMatch = Array.isArray(job.location) 
        ? job.location.some((loc: string) => loc.toLowerCase().includes(titleLower))
        : job.location?.toLowerCase().includes(titleLower);
      
      return (
        job.title?.toLowerCase().includes(titleLower) ||
        job.description?.toLowerCase().includes(titleLower) ||
        job.keywords?.some((keyword: string) => keyword.toLowerCase().includes(titleLower)) ||
        job.tags?.some((tag: string) => tag.toLowerCase().includes(titleLower)) ||
        locationMatch
      );
    });
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
    _id: job._id?.toString() || '',
    id: job.id?.toString() || job._id?.toString() || '',
    jobId: job.id || job._id?.toString() || '',
    title: job.title || 'No Title',
    company: job.company || 'Unknown Company',
    salary: job.salary || [],
    location: job.location || 'Remote',
    role: job.role || '',
    description: job.description || '',
    requirements: job.requirements || [],
    benefits: job.benefits || [],
    postedDate: job.postedDate || new Date().toISOString(),
    applyLink: job.applyLink || '',
    experience: job.experience || [],
    recruiter: job.recruiter || '',
    jobUrl: job.jobUrl || '',
    platform: job.platform || 'Unknown',
    logoUrl: job.logoUrl || '',
    tags: job.tags || [],
    type: job.type || 'Full-time',
    fuzzyScore: job.fuzzyScore || 0,
    matchedSkills: job.matchedSkills || [],
    matchType: job.matchType || 'exact'
  })).filter(job => job.id && job.jobId); // Remove jobs with missing IDs
};

// NEW PAGINATED VERSION OF getJobsByIds
export const getJobsByIdsPaginated = async (
  jobIds: string[],
  page: number = 1,
  limit: number = 20,
  jobTitle?: string,
  expectedCTC?: string,
  workexperience?: string
) => {
  const db = await connectToMongoDB();
  const skip = (page - 1) * limit;
  
  // Get paginated job IDs
  const paginatedJobIds = jobIds.slice(skip, skip + limit);
  
  let jobs = await db
    .collection("jobs")
    .find({ id: { $in: paginatedJobIds } })
    .toArray();

  // Remove duplicates
  jobs = Array.from(new Map(jobs.map(job => [job.id, job])).values());

  const filterJobs = (jobs: any[], filterFn: (job: any) => boolean) => 
    jobs.filter(filterFn);

  // Apply your existing filtering logic
  if (jobTitle) {
    const titleLower = jobTitle.toLowerCase();
    jobs = filterJobs(jobs, (job) =>
      job.title?.toLowerCase().includes(titleLower) ||
      job.description?.toLowerCase().includes(titleLower) ||
      job.keywords?.some((keyword: string) => keyword.toLowerCase().includes(titleLower)) ||
      job.tags?.some((tag: string) => tag.toLowerCase().includes(titleLower))
    );
  }

  // Apply other filters as needed...
  if (expectedCTC) {
    const expectedCTCValue = parseInt(expectedCTC.replace(/[^\d]/g, ""), 10);
    if (!isNaN(expectedCTCValue)) {
      jobs = filterJobs(jobs, (job) =>
        job.salary?.some((range: string) => {
          const [min, max] = range.replace(/[^\d-]/g, "").split("-").map(Number);
          return expectedCTCValue >= min && expectedCTCValue <= max;
        })
      );
    }
  }

  if (workexperience) {
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

  return {
    jobs: jobs.map((job) => {
      const jobIdValue = job.id || job._id?.toString();
      return {
        _id: job._id?.toString(),
        id: jobIdValue,
        jobId: jobIdValue,
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
      };
    }) as Job[],
    hasMore: skip + limit < jobIds.length,
    totalCount: jobIds.length,
    currentPage: page,
    totalPages: Math.ceil(jobIds.length / limit)
  };
};
