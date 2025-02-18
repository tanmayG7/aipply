export interface Job {
    jobId: string;
    title: string;
    company: string;
    salary: string;
    experience: string;
    location: string;
    description: string;
    recruiter: string;
    jobUrl: string;
    platform: string;
    postedDate: string;
}

export interface Education {
    college: string;
    graduationYear: string;
    degree: string;
    endDate: string;
    description: string;
    gpa: string;
    maxGpa: string;
}

export interface Experience {
    company: string;
    title: string;
    startDate: string;
    endDate: string;
    current: boolean;
    type: string;
    description: string;
}

export interface UserDetails {
    userId?: string;
    primaryRole?: string;
    coverLetter?: string;
    preferences?: {
        jobSearchStatus?: boolean;
        jobType?: string;
        additionalTypes?: {
            contractor?: boolean;
            intern?: boolean;
            freelance?: boolean;
        };
    };
    achievements?: string;
    experience?: Experience[];
    workexperience?: string;
    uploadFile?: string;
    role?: string;
    current?: boolean;
    cv?: string;
    bio?: string;
    email?: string;
    socialMediaLinks?: {
        github?: string;
        linkedin?: string;
        website?: string;
        twitter?: string;
    };
    skills?: string[];
    education?: Education[];
    whereYouBased?: string;
    locations?: string[];
    endDate?: string;
    firstName?: string;
    lastName?: string;
}

export interface DashboardData {
  averageExperience: number;
  averagePackage: number;
  experienceAppliedTo: {
    [key: string]: number;
  };
  jobsApplied: number;
  location: {
    [key: string]: number;
  };
  packageAppliedTo: {
    [key: string]: number;
  };
  totalJobsShown: number;
  updatedAt: string;
}