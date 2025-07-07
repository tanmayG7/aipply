/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import { connectToMongoDB } from './mongo';
import { Job, UserDetails } from '../types';
import { getSkillsForJobTitle } from '../enhanced-skill-tree';

// Types for fuzzy matching results
interface ScoredJob extends Job {
  fuzzyScore: number;
  matchedSkills: string[];
  matchType: 'exact' | 'fuzzy' | 'enhanced' | 'title';
}

interface FuzzyMatchResult {
  jobs: ScoredJob[];
  totalMatches: number;
  executionTime: number;
  searchStrategy: string;
}

interface FuzzyMatchOptions {
  limit?: number;
  minSimilarity?: number;
  candidateMultiplier?: number;
  page?: number;
  excludedJobs?: Set<string>;
}

class FuzzyJobMatcher {
  /**
   * Initialize text index for jobs collection
   * Call this once when setting up your database
   */
  static async initializeTextIndex(): Promise<void> {
    const db = await connectToMongoDB();
    try {
      await db.collection('jobs').createIndex({ 
        tags: 'text', 
        title: 'text', 
        keywords: 'text',
        description: 'text' 
      });
      console.log('✅ Fuzzy matching text index created successfully');
    } catch (error) {
      console.log('ℹ️ Text index might already exist:', error);
    }
  }

  /**
   * Main fuzzy matching function that integrates with your existing workflow
   * Time Complexity: O(n * m * k) where n = candidates, m = avg tags per job, k = user skills
   */
  static async findRelevantJobsWithFuzzyMatching(
    userProfile: UserDetails,
    options: FuzzyMatchOptions = {}
  ): Promise<FuzzyMatchResult> {
    const startTime = Date.now();
    
    const {
      limit = 20,
      minSimilarity = 0.6,
      candidateMultiplier = 3,
      page = 1,
      excludedJobs = new Set()
    } = options;

    const db = await connectToMongoDB();
    const skip = (page - 1) * limit;
    const excludedArray = Array.from(excludedJobs);

    // Get enhanced skills using your existing skill tree
    const enhancedSkills = getSkillsForJobTitle(userProfile.jobTitle || '');
    const userSkills = userProfile.skills || [];
    const allSkills = [...new Set([...enhancedSkills, ...userSkills])];

    console.log(`🎯 Fuzzy search for "${userProfile.jobTitle}"`);
    console.log(`📊 Using ${enhancedSkills.length} enhanced + ${userSkills.length} user skills = ${allSkills.length} total`);

    let candidates: any[] = [];
    let searchStrategy = '';

    // Stage 1: Get candidates using multiple strategies
    try {
      // Strategy 1: Text search (fastest)
      const textSearchCandidates = await db.collection('jobs')
        .find(
          { 
            $text: { $search: allSkills.join(' ') },
            id: { $nin: excludedArray }
          },
          { projection: { score: { $meta: 'textScore' } } }
        )
        .sort({ score: { $meta: 'textScore' } })
        .limit(limit * candidateMultiplier)
        .toArray();

      if (textSearchCandidates.length >= limit) {
        candidates = textSearchCandidates;
        searchStrategy = 'text_search';
      }
    } catch (error) {
      console.log('Text search failed, trying fallback strategies');
    }

    // Strategy 2: Enhanced skills matching (your existing approach)
    if (candidates.length < limit) {
      const enhancedCandidates = await db.collection('jobs')
        .find({ 
          $or: [
            { tags: { $in: allSkills } },
            { keywords: { $in: allSkills } },
            { title: { $regex: userProfile.jobTitle || '', $options: 'i' } }
          ],
          id: { $nin: excludedArray }
        })
        .sort({ postedDate: -1 })
        .limit(limit * candidateMultiplier)
        .toArray();

      candidates = [...candidates, ...enhancedCandidates];
      searchStrategy = candidates.length > 0 ? 'enhanced_skills' : 'fuzzy_fallback';
    }

    // Strategy 3: Pure fuzzy fallback (if still not enough candidates)
    if (candidates.length < limit) {
      const fuzzyCandidates = await db.collection('jobs')
        .find({ id: { $nin: excludedArray } })
        .limit(limit * candidateMultiplier * 2)
        .toArray();

      candidates = [...candidates, ...fuzzyCandidates];
      searchStrategy = 'fuzzy_fallback';
    }

    // Remove duplicates
    const uniqueCandidates = Array.from(
      new Map(candidates.map(job => [job.id, job])).values()
    );

    // Stage 2: Apply fuzzy matching and scoring
    const scoredJobs = this.scoreJobsWithFuzzyMatching(
      uniqueCandidates, 
      allSkills, 
      userProfile.jobTitle || '',
      minSimilarity
    );

    // Stage 3: Sort by fuzzy score and paginate
    const sortedJobs = scoredJobs
      .sort((a, b) => b.fuzzyScore - a.fuzzyScore)
      .slice(skip, skip + limit);

    const executionTime = Date.now() - startTime;

    console.log(`✅ Found ${sortedJobs.length} jobs using ${searchStrategy} in ${executionTime}ms`);

    return {
      jobs: sortedJobs,
      totalMatches: scoredJobs.length,
      executionTime,
      searchStrategy
    };
  }

  /**
   * Paginated version that works with your existing pagination pattern
   */
  static async findRelevantJobsPaginated(
    userProfile: UserDetails,
    page: number = 1,
    limit: number = 20,
    excludedJobs: Set<string> = new Set(),
    minSimilarity: number = 0.6
  ) {
    const result = await this.findRelevantJobsWithFuzzyMatching(userProfile, {
      limit,
      page,
      excludedJobs,
      minSimilarity
    });

    return {
      jobs: result.jobs.map(job => ({
        ...job,
        _id: job._id?.toString() || job.id,
        id: job.id?.toString() || job._id?.toString(),
        jobId: job.id || job._id,
      })),
      hasMore: result.totalMatches > page * limit,
      totalCount: result.totalMatches,
      currentPage: page,
      totalPages: Math.ceil(result.totalMatches / limit),
      executionTime: result.executionTime,
      searchStrategy: result.searchStrategy
    };
  }

  /**
   * Enhanced version of your existing getJobByTitleandSkills with fuzzy matching
   */
  static async getJobByTitleAndSkillsWithFuzzy(
    userProfile: UserDetails,
    options: { minSimilarity?: number; limit?: number } = {}
  ) {
    const { minSimilarity = 0.6, limit = 20 } = options;
    
    const result = await this.findRelevantJobsWithFuzzyMatching(userProfile, {
      limit,
      minSimilarity
    });

    // Format to match your existing return pattern
    return result.jobs.map(job => ({
      ...job,
      id: job._id?.toString() || job.id,
      jobId: job.id || job._id,
      postedDate: (() => {
        const date = job.postedDate;
        if (!date) return date;
        
        // Type guard: check if it's a Date object
        if (date && typeof date === 'object' && 'toISOString' in date) {
          return (date as Date).toISOString();
        }
        
        // If it's a string or other type, return as is
        return date;
      })(),
    }));
  }

  /**
   * Core fuzzy matching and scoring logic
   * Time Complexity: O(n * m * k) where n = jobs, m = avg tags per job, k = user skills
   */
  private static scoreJobsWithFuzzyMatching(
    jobs: any[],
    userSkills: string[],
    jobTitle: string,
    minSimilarity: number
  ): ScoredJob[] {
    return jobs.map(job => {
      let totalScore = 0;
      const matchedSkills: string[] = [];
      let matchType: 'exact' | 'fuzzy' | 'enhanced' | 'title' = 'fuzzy';

      // Score 1: Exact skill matches (highest weight)
      const jobTags = job.tags || [];
      const jobKeywords = job.keywords || [];
      const allJobSkills = [...jobTags, ...jobKeywords].map(s => s.toLowerCase());

      userSkills.forEach(skill => {
        const skillLower = skill.toLowerCase();
        
        // Exact match
        if (allJobSkills.includes(skillLower)) {
          totalScore += 1.0;
          matchedSkills.push(skill);
          matchType = 'exact';
          return;
        }

        // Fuzzy match on tags and keywords
        allJobSkills.forEach(jobSkill => {
          const similarity = this.calculateSimilarity(jobSkill, skillLower);
          if (similarity >= minSimilarity) {
            totalScore += similarity * 0.8; // Slightly lower weight for fuzzy matches
            if (!matchedSkills.includes(skill)) {
              matchedSkills.push(skill);
            }
          }
        });
      });

      // Score 2: Job title matching
      if (jobTitle && job.title) {
        const titleSimilarity = this.calculateSimilarity(
          job.title.toLowerCase(), 
          jobTitle.toLowerCase()
        );
        if (titleSimilarity >= minSimilarity) {
          totalScore += titleSimilarity * 0.6;
          if (matchType !== 'exact') {
            matchType = 'title';
          }
        }
      }

      // Score 3: Description fuzzy matching (lower weight)
      if (job.description && userSkills.length > 0) {
        const descriptionLower = job.description.toLowerCase();
        userSkills.forEach(skill => {
          if (descriptionLower.includes(skill.toLowerCase())) {
            totalScore += 0.3;
          }
        });
      }

      return {
        ...job,
        fuzzyScore: totalScore,
        matchedSkills,
        matchType
      } as ScoredJob;
    }).filter(job => job.fuzzyScore > 0); // Only return jobs with matches
  }

  /**
   * Calculate string similarity using optimized Levenshtein distance
   * Time Complexity: O(n * m) where n and m are string lengths
   */
  private static calculateSimilarity(str1: string, str2: string): number {
    // Handle exact matches first
    if (str1 === str2) return 1.0;
    
    // Handle substring matches (common in tech skills)
    if (str1.includes(str2) || str2.includes(str1)) {
      const longer = str1.length > str2.length ? str1 : str2;
      const shorter = str1.length > str2.length ? str2 : str1;
      return shorter.length / longer.length * 0.9; // High score for substring matches
    }

    // Skip fuzzy calculation for very different lengths (optimization)
    if (Math.abs(str1.length - str2.length) > Math.max(str1.length, str2.length) * 0.5) {
      return 0;
    }

    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  /**
   * Optimized Levenshtein distance calculation
   * Time Complexity: O(n * m), Space Complexity: O(min(n, m))
   */
  private static levenshteinDistance(str1: string, str2: string): number {
    if (str1.length < str2.length) {
      [str1, str2] = [str2, str1];
    }

    let previousRow = Array.from({ length: str2.length + 1 }, (_, i) => i);
    
    for (let i = 0; i < str1.length; i++) {
      const currentRow = [i + 1];
      
      for (let j = 0; j < str2.length; j++) {
        const insertCost = currentRow[j] + 1;
        const deleteCost = previousRow[j + 1] + 1;
        const replaceCost = previousRow[j] + (str1[i] !== str2[j] ? 1 : 0);
        
        currentRow.push(Math.min(insertCost, deleteCost, replaceCost));
      }
      
      previousRow = currentRow;
    }
    
    return previousRow[str2.length];
  }
}

// Export functions that integrate with your existing API
export const initializeFuzzyIndex = FuzzyJobMatcher.initializeTextIndex;

export const getJobsByTitleAndSkillsWithFuzzy = FuzzyJobMatcher.getJobByTitleAndSkillsWithFuzzy;

export const getRelevantJobsWithFuzzyMatching = FuzzyJobMatcher.findRelevantJobsWithFuzzyMatching;

export const getRelevantJobsPaginated = FuzzyJobMatcher.findRelevantJobsPaginated;

// Enhanced version that replaces getFilteredJobsByTitlePaginated
export const getFilteredJobsByTitlePaginatedWithFuzzy = async (
  jobTitle: any,
  excludedJobs: Set<string>,
  userProfile: any,
  page: number = 1,
  limit: number = 20,
  minSimilarity: number = 0.6
) => {
  console.log('[getFilteredJobsByTitlePaginatedWithFuzzy] Starting enhanced search');
  const db = await connectToMongoDB();
  const skip = (page - 1) * limit;
  const excludedArray = Array.from(excludedJobs);

  // Step 1: Try existing jobMap approach first (fastest)
  const jobMapAggregation = [
    { $match: { keyword: jobTitle } },
    { $unwind: "$jobIds" },
    { $match: { jobIds: { $nin: excludedArray } } },
  ];

  const totalCountPipeline = [
    ...jobMapAggregation,
    { $count: "total" }
  ];
  
  const totalCountResult = await db
    .collection("jobMap")
    .aggregate(totalCountPipeline)
    .toArray();

  const totalFromJobMap = totalCountResult.length > 0 ? totalCountResult[0].total : 0;

  // If jobMap has good results, use it
  if (totalFromJobMap >= limit) {
    console.log('✅ Using existing jobMap approach with good coverage');
    
    const jobMapPaginated = await db
      .collection("jobMap")
      .aggregate([
        ...jobMapAggregation,
        { $skip: skip },
        { $limit: limit },
        { $group: { _id: null, jobIds: { $push: "$jobIds" } } },
      ])
      .toArray();

    if (jobMapPaginated.length > 0) {
      const jobIds = jobMapPaginated[0].jobIds;
      const jobs = await db
        .collection("jobs")
        .find({ id: { $in: jobIds } })
        .toArray();

      const mappedJobs = jobs.map((job: any) => ({
        ...job,
        id: job._id.toString(),
        jobId: job.id,
      }));

      return {
        jobs: mappedJobs,
        hasMore: skip + limit < totalFromJobMap,
        totalCount: totalFromJobMap,
        currentPage: page,
        totalPages: Math.ceil(totalFromJobMap / limit),
        searchMethod: 'jobMap'
      };
    }
  }

  // Step 2: Enhanced fallback with fuzzy matching
  console.log('🔄 Falling back to enhanced fuzzy matching');
  
  const enhancedSkills = getSkillsForJobTitle(userProfile.jobTitle || '');
  const userSkills = userProfile.skills || [];
  const allSkills = [...new Set([...enhancedSkills, ...userSkills])];
  
  console.log(`🎯 Enhanced fuzzy search for "${userProfile.jobTitle}"`);
  console.log(`📊 Using ${enhancedSkills.length} enhanced skills + ${userSkills.length} user skills = ${allSkills.length} total`);

  let candidates: any[] = [];
  let searchStrategy = '';

  // Strategy 1: Text search (if index exists)
  try {
    const textSearchCandidates = await db.collection('jobs')
      .find(
        { 
          $text: { $search: allSkills.join(' ') },
          id: { $nin: excludedArray }
        },
        { projection: { score: { $meta: 'textScore' } } }
      )
      .sort({ score: { $meta: 'textScore' } })
      .skip(skip)
      .limit(limit * 3) // Get more candidates for fuzzy scoring
      .toArray();

    if (textSearchCandidates.length > 0) {
      candidates = textSearchCandidates;
      searchStrategy = 'text_search';
      console.log(`📝 Text search found ${candidates.length} candidates`);
    }
  } catch (error) {
    console.log('Text search not available, using skill matching');
  }

  // Strategy 2: Enhanced skills matching
  if (candidates.length < limit) {
    const skillMatchQuery = { 
      $or: [
        { tags: { $in: allSkills } },
        { keywords: { $in: allSkills } },
        { title: { $regex: userProfile.jobTitle || '', $options: 'i' } }
      ],
      id: { $nin: excludedArray }
    };

    // Get total count for skills-based search
    const skillsTotal = await db.collection('jobs').countDocuments(skillMatchQuery);

    const skillsCandidates = await db.collection('jobs')
      .find(skillMatchQuery)
      .sort({ postedDate: -1 })
      .skip(skip)
      .limit(limit * 2)
      .toArray();

    candidates = [...candidates, ...skillsCandidates];
    searchStrategy = candidates.length > 0 ? 'enhanced_skills' : 'fuzzy_fallback';
    
    console.log(`🔧 Skills matching found ${skillsCandidates.length} additional candidates`);
    
    // Return early if we have enough good matches
    if (skillsCandidates.length >= limit) {
      const mappedJobs = skillsCandidates.slice(0, limit).map((job: any) => ({
        ...job,
        id: job._id.toString(),
        jobId: job.id,
      }));

      return {
        jobs: mappedJobs,
        hasMore: skip + limit < skillsTotal,
        totalCount: skillsTotal,
        currentPage: page,
        totalPages: Math.ceil(skillsTotal / limit),
        searchMethod: 'enhanced_skills'
      };
    }
  }

  // Strategy 3: Apply fuzzy scoring to candidates
  if (candidates.length > 0) {
    console.log(`🧠 Applying fuzzy scoring to ${candidates.length} candidates`);
    
    // Remove duplicates
    const uniqueCandidates = Array.from(
      new Map(candidates.map(job => [job.id, job])).values()
    );

    // Apply fuzzy scoring
    const scoredJobs = FuzzyJobMatcher.scoreJobsWithFuzzyMatching(
      uniqueCandidates, 
      allSkills, 
      userProfile.jobTitle || '',
      minSimilarity
    );

    // Sort by fuzzy score and paginate
    const sortedJobs = scoredJobs
      .sort((a, b) => b.fuzzyScore - a.fuzzyScore)
      .slice(0, limit);

    const mappedJobs = sortedJobs.map((job: any) => ({
      ...job,
      id: job._id?.toString() || job.id,
      jobId: job.id,
    }));

    console.log(`✅ Fuzzy matching returned ${mappedJobs.length} scored jobs`);

    return {
      jobs: mappedJobs,
      hasMore: scoredJobs.length > limit,
      totalCount: scoredJobs.length,
      currentPage: page,
      totalPages: Math.ceil(scoredJobs.length / limit),
      searchMethod: 'fuzzy_enhanced'
    };
  }

  // Strategy 4: Last resort - pure fuzzy matching on recent jobs
  console.log('🆘 Last resort: pure fuzzy matching on recent jobs');
  
  const recentJobs = await db.collection('jobs')
    .find({ id: { $nin: excludedArray } })
    .sort({ postedDate: -1 })
    .limit(limit * 5) // Get more candidates for better fuzzy results
    .toArray();

  if (recentJobs.length > 0) {
    const scoredJobs = FuzzyJobMatcher.scoreJobsWithFuzzyMatching(
      recentJobs, 
      allSkills, 
      userProfile.jobTitle || '',
      minSimilarity * 0.8 // Lower threshold for last resort
    );

    const sortedJobs = scoredJobs
      .sort((a, b) => b.fuzzyScore - a.fuzzyScore)
      .slice(skip, skip + limit);

    const mappedJobs = sortedJobs.map((job: any) => ({
      ...job,
      id: job._id?.toString() || job.id,
      jobId: job.id,
    }));

    return {
      jobs: mappedJobs,
      hasMore: scoredJobs.length > skip + limit,
      totalCount: scoredJobs.length,
      currentPage: page,
      totalPages: Math.ceil(scoredJobs.length / limit),
      searchMethod: 'fuzzy_last_resort'
    };
  }

  // Absolute fallback
  console.log('❌ No matches found, returning empty result');
  return {
    jobs: [],
    hasMore: false,
    totalCount: 0,
    currentPage: page,
    totalPages: 0,
    searchMethod: 'no_matches'
  };
};

// Import the existing function to maintain compatibility
import { getFilteredJobsByTitlePaginated } from './mongo';

export { FuzzyJobMatcher, ScoredJob, FuzzyMatchResult };
