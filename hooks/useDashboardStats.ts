// hooks/useDashboardStats.ts
import { useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy,
  limit
} from 'firebase/firestore';
import { firestore } from '@/lib/firebaseConfig/firebaseConfig';

export interface DashboardStats {
  todayAppliedJobs: number;
  todayAutoAppliedJobs: number;  // New: Today's auto-applied jobs
  thisMonthAppliedJobs: number;
  thisMonthAutoAppliedJobs: number;  // New: This month's auto-applied jobs
  totalJobsApplied: number;
  totalJobsShown: number;
  averageExperience: number;
  averagePackage: number;
  locationData: { [key: string]: number };
  packageAppliedTo: { [key: string]: number };
  recentApplications: any[];
  autoApplyStatus: {
    isEnabled: boolean;
    todayCount: number;
    monthlyCount: number;
    lastRunDate: string | null;
  };
}

export const useDashboardStats = (userId: string) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardStats = useCallback(async () => {
    if (!userId) {
      setError('User ID is required');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get today's date range
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

      // Get this month's date range
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);

      // Fetch applied jobs data
      const appliedJobsRef = collection(firestore, 'appliedJobs');
      const appliedJobsQuery = query(appliedJobsRef, where('userId', '==', userId));
      const appliedJobsSnapshot = await getDocs(appliedJobsQuery);

      const appliedJobsData :any= appliedJobsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Calculate today's applications (total and auto-applied)
      const todayApplied = appliedJobsData.filter((job:any) => {
        const appliedAt = job.appliedAt?.toDate?.() || new Date(job.appliedAt);
        return appliedAt >= todayStart && appliedAt < todayEnd;
      });

      const todayAutoApplied = todayApplied.filter((job:any) => job.autoApplied === true);

      // Calculate this month's applications (total and auto-applied)
      const thisMonthApplied = appliedJobsData.filter((job:any) => {
        const appliedAt = job.appliedAt?.toDate?.() || new Date(job.appliedAt);
        return appliedAt >= monthStart && appliedAt <= monthEnd;
      });

      const thisMonthAutoApplied = thisMonthApplied.filter((job:any) => job.autoApplied === true);

      // Calculate location distribution
      const locationData: { [key: string]: number } = {};
      appliedJobsData.forEach((job:any) => {
        if (job.location) {
          locationData[job.location] = (locationData[job.location] || 0) + 1;
        }
      });

      // Calculate package distribution
      const packageAppliedTo: { [key: string]: number } = {};
      appliedJobsData.forEach((job:any) => {
        if (job.package || job.salary) {
          const packageRange = categorizePackage(job.package || job.salary);
          packageAppliedTo[packageRange] = (packageAppliedTo[packageRange] || 0) + 1;
        }
      });

      // Calculate averages
      const totalExperience = appliedJobsData.reduce((sum:any, job:any) => {
        const experience = parseExperience(job.experience);
        return sum + experience;
      }, 0);
      const averageExperience = appliedJobsData.length > 0 ? totalExperience / appliedJobsData.length : 0;

      const totalPackage = appliedJobsData.reduce((sum:any, job:any) => {
        const packageValue = parsePackage(job.package || job.salary);
        return sum + packageValue;
      }, 0);
      const averagePackage = appliedJobsData.length > 0 ? totalPackage / appliedJobsData.length : 0;

      // Get total jobs shown (from currentJobs collection)
      const currentJobsRef = collection(firestore, 'currentJobs');
      const currentJobsSnapshot = await getDocs(currentJobsRef);
      const totalJobsShown = currentJobsSnapshot.size;

      // Get recent applications (last 10)
      const recentApplicationsQuery = query(
        appliedJobsRef,
        where('userId', '==', userId),
        orderBy('appliedAt', 'desc'),
        limit(10)
      );
      const recentApplicationsSnapshot = await getDocs(recentApplicationsQuery);
      const recentApplications = recentApplicationsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Get auto-apply status from subscription
      const autoApplyStatus = await getAutoApplyStatus(userId);

      const dashboardStats: DashboardStats = {
        todayAppliedJobs: todayApplied.length,
        todayAutoAppliedJobs: todayAutoApplied.length,
        thisMonthAppliedJobs: thisMonthApplied.length,
        thisMonthAutoAppliedJobs: thisMonthAutoApplied.length,
        totalJobsApplied: appliedJobsData.length,
        totalJobsShown,
        averageExperience: Math.round(averageExperience * 10) / 10,
        averagePackage: Math.round(averagePackage * 10) / 10,
        locationData,
        packageAppliedTo,
        recentApplications,
        autoApplyStatus
      };

      setStats(dashboardStats);
    } catch (error: any) {
      console.error('Error fetching dashboard stats:', error);
      setError(`Failed to fetch dashboard data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchDashboardStats();
    }
  }, [userId, fetchDashboardStats]);

  const refreshStats = useCallback(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  return { stats, loading, error, refreshStats };
};

// Helper function to get auto-apply status
const getAutoApplyStatus = async (userId: string) => {
  try {
    const subscriptionsRef = collection(firestore, 'subscriptions');
    const subscriptionQuery = query(subscriptionsRef, where('userId', '==', userId));
    const subscriptionSnapshot = await getDocs(subscriptionQuery);

    if (subscriptionSnapshot.empty) {
      return {
        isEnabled: false,
        todayCount: 0,
        monthlyCount: 0,
        lastRunDate: null
      };
    }

    const subscriptionData = subscriptionSnapshot.docs[0].data();
    
    // Check both the feature flag AND valid subscription status (premium or grace_period)
    const hasValidStatus = subscriptionData.subscriptionStatus === 'premium' ||
                          subscriptionData.subscriptionStatus === 'grace_period';
    const hasAutoApplyFeature = subscriptionData.features?.autoApply === true;

    return {
      isEnabled: hasValidStatus && hasAutoApplyFeature,
      todayCount: subscriptionData.usage?.autoApplyToday || subscriptionData.autoApplyToday || 0,
      monthlyCount: subscriptionData.usage?.autoApplyThisMonth || subscriptionData.autoApplyThisMonth || 0,
      lastRunDate: subscriptionData.usage?.lastAutoApplyDate || subscriptionData.lastAutoApplyDate || null
    };
  } catch (error) {
    console.error('Error getting auto-apply status:', error);
    return {
      isEnabled: false,
      todayCount: 0,
      monthlyCount: 0,
      lastRunDate: null
    };
  }
};

// Helper function to parse experience
const parseExperience = (experienceStr: string): number => {
  if (!experienceStr) return 0;
  
  const match = experienceStr.match(/(\d+)/);
  if (match) {
    return parseInt(match[1]);
  }
  
  if (experienceStr.toLowerCase().includes('fresher')) {
    return 0;
  }
  
  return 0;
};

// Helper function to parse package/salary
const parsePackage = (packageStr: string): number => {
  if (!packageStr) return 0;
  
  const numberMatch = packageStr.match(/(\d+\.?\d*)/);
  if (numberMatch) {
    const number = parseFloat(numberMatch[1]);
    
    if (packageStr.includes('$')) {
      return number * 0.83 / 100000;
    } else if (packageStr.includes('₹') && !packageStr.includes('LPA')) {
      return number / 100000;
    }
    
    return number;
  }
  
  return 0;
};

// Helper function to categorize package ranges
const categorizePackage = (packageStr: string): string => {
  const packageValue = parsePackage(packageStr);
  
  if (packageValue < 3) return '0-3 LPA';
  if (packageValue < 5) return '3-5 LPA';
  if (packageValue < 8) return '5-8 LPA';
  if (packageValue < 12) return '8-12 LPA';
  if (packageValue < 20) return '12-20 LPA';
  return '20+ LPA';
};