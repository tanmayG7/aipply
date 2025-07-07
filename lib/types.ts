/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Job {
  _id: any;
  id: string;
  jobId: string;
  title: string;
  company: string;
  salary: string[];
  experience: string;
  location: string | string[];
  description: string;
  recruiter: string;
  jobUrl: string;
  platform: string;
  postedDate: string;
  logoUrl: string;
  tags: string[];
  type?: string;
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
  jobTitle?: string;
  expectedCTC?: string;
  coverLetter?: string;
  preferences?: {
    jobSearchStatus?: boolean;
    jobType?: string;
    additionalTypes?: {
      contractor?: boolean;
      intern?: boolean;
      freelance?: boolean;
    };
    openToRemote?: boolean;
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

// ========== SUBSCRIPTION TYPES ==========
// Add these interfaces to the end of your lib/types.ts file

export interface UserSubscription {
  userId: string;
  subscriptionStatus: 'free' | 'premium' | 'expired' | 'cancelled' | 'grace_period';
  planType: 'monthly' | 'quarterly' | 'yearly' | null;
  planTier: 'free' | 'premium';
  
  // Razorpay details
  razorpaySubscriptionId: string | null;
  razorpayCustomerId: string | null;
  razorpayPlanId: string | null;
  
  // Dates
  subscriptionStartDate: string | null;
  renewalDate: string | null;
  lastPaymentDate: string | null;
  nextBillingDate: string | null;
  cancelledDate: string | null;
  expiredDate: string | null;
  gracePeriodEndDate: string | null;
  
  // Plan details
  planPrice: number | null;
  planCurrency: 'INR';
  
  // Feature access & limits
  features: {
    autoApply: boolean;
    unlimitedJobListings: boolean;
    aiResumeBuilder: boolean;
    aiMockInterviews: boolean;
    prioritySupport: boolean;
    maxAutoApplyPerDay: number;
    maxAutoApplyPerMonth: number;
    hasManualApply: boolean;
  };
  
  // Usage tracking (resets at midnight IST)
  usage: {
    autoApplyToday: number;
    autoApplyThisMonth: number;
    lastResetDate: string; // YYYY-MM-DD format (IST)
    lastMonthlyResetDate: string; // YYYY-MM format (IST)
    timezone: 'Asia/Kolkata';
  };
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

export interface PaymentHistory {
  userId: string;
  razorpayPaymentId: string;
  razorpaySubscriptionId: string;
  amount: number;
  currency: 'INR';
  status: 'success' | 'failed' | 'pending' | 'refunded';
  planType: 'monthly' | 'quarterly' | 'yearly';
  paymentDate: string;
  failureReason?: string;
  createdAt: string;
}

export interface PlanConfig {
  type: 'monthly' | 'quarterly' | 'yearly';
  price: number;
  duration: number; // days
  name: string;
}

export interface FeatureAccess {
  allowed: boolean;
  reason?: 'upgrade_required' | 'daily_limit_reached' | 'monthly_limit_reached' | 'unknown_error';
}

// Update this in your lib/types.ts file - replace the existing RAZORPAY_PLAN_MAPPING

export const RAZORPAY_PLAN_MAPPING: Record<string, PlanConfig> = {
  // Test mode plan IDs
  'pl_QqIH3ysYHYPnEP': { 
    type: 'monthly', 
    price: 666, 
    duration: 30,
    name: 'Premium Monthly'
  },
  
  // Keep your old live mode plan IDs as well (for when you switch back)
  'pl_Qpqiazi0S9XVVD': { 
    type: 'monthly', 
    price: 666, 
    duration: 30,
    name: 'Premium Monthly'
  },
  'pl_QqBpW1j6IzLa1M': { 
    type: 'quarterly', 
    price: 499, 
    duration: 90,
    name: 'Premium Quarterly'
  },
  'pl_QqCnmIE8a89Pst': { 
    type: 'yearly', 
    price: 349, 
    duration: 365,
    name: 'Premium Yearly'
  }
};

export const PLAN_FEATURES = {
  free: {
    autoApply: false,
    unlimitedJobListings: true,
    aiResumeBuilder: false,
    aiMockInterviews: false,
    prioritySupport: false,
    maxAutoApplyPerDay: 0,
    maxAutoApplyPerMonth: 0,
    hasManualApply: true
  },
  premium: {
    autoApply: true,
    unlimitedJobListings: true,
    aiResumeBuilder: true,
    aiMockInterviews: true,
    prioritySupport: true,
    maxAutoApplyPerDay: 20,
    maxAutoApplyPerMonth: 600,
    hasManualApply: true
  }
};

export const GRACE_PERIOD_DAYS = 7;
export const INDIA_TIMEZONE = 'Asia/Kolkata';
