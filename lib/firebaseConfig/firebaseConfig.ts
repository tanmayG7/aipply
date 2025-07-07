/* eslint-disable @typescript-eslint/no-explicit-any */
import { 
  UserSubscription, 
  PLAN_FEATURES, 
  GRACE_PERIOD_DAYS, 
  INDIA_TIMEZONE,
  FeatureAccess 
} from "../types";
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  setPersistence,
  browserLocalPersistence,
  signOut,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, addDoc, collection, getDocs, query, orderBy } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { Job, UserDetails, DashboardData } from "../types";
import { getJobsByIds, getFilteredJobsByTitle, getJobByTitleandSkills, getFilteredJobsByTitlePaginated } from "@/lib/mongo/mongo";
import { mapSalaryToRange, mapExperienceToRange } from "../utils";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app);

const provider = new GoogleAuthProvider();

// Ensure authentication persistence across page refreshes
setPersistence(auth, browserLocalPersistence).catch(console.error);

// ========== SUBSCRIPTION HELPER FUNCTIONS ==========

// Utility functions for date handling in IST
const getCurrentDateIST = (): string => {
  const now = new Date();
  const istDate = new Date(now.toLocaleString("en-US", {timeZone: INDIA_TIMEZONE}));
  return istDate.toISOString().split('T')[0]; // YYYY-MM-DD
};

const getCurrentMonthIST = (): string => {
  const now = new Date();
  const istDate = new Date(now.toLocaleString("en-US", {timeZone: INDIA_TIMEZONE}));
  return istDate.toISOString().substring(0, 7); // YYYY-MM
};

const calculateGracePeriodEnd = (expiryDate: string): string => {
  const expiry = new Date(expiryDate);
  expiry.setDate(expiry.getDate() + GRACE_PERIOD_DAYS);
  return expiry.toISOString();
};

// Check if usage needs to be reset
const shouldResetDailyUsage = (subscription: UserSubscription): boolean => {
  const currentDateIST = getCurrentDateIST();
  return subscription.usage.lastResetDate !== currentDateIST;
};

const shouldResetMonthlyUsage = (subscription: UserSubscription): boolean => {
  const currentMonthIST = getCurrentMonthIST();
  return subscription.usage.lastMonthlyResetDate !== currentMonthIST;
};

// Reset usage if needed (daily/monthly)
const resetUsageIfNeeded = (subscription: UserSubscription): UserSubscription => {
  const currentDateIST = getCurrentDateIST();
  const currentMonthIST = getCurrentMonthIST();
  
  let updatedUsage = { ...subscription.usage };
  let hasChanged = false;
  
  // Reset daily usage if date changed
  if (shouldResetDailyUsage(subscription)) {
    updatedUsage.autoApplyToday = 0;
    updatedUsage.lastResetDate = currentDateIST;
    hasChanged = true;
  }
  
  // Reset monthly usage if month changed
  if (shouldResetMonthlyUsage(subscription)) {
    updatedUsage.autoApplyThisMonth = 0;
    updatedUsage.lastMonthlyResetDate = currentMonthIST;
    hasChanged = true;
  }
  
  return hasChanged ? {
    ...subscription,
    usage: updatedUsage,
    updatedAt: new Date().toISOString()
  } : subscription;
};

// Get effective subscription status considering grace period
const getEffectiveSubscriptionStatus = (subscription: UserSubscription): string => {
  const now = new Date();
  const renewalDate = subscription.renewalDate ? new Date(subscription.renewalDate) : null;
  const gracePeriodEnd = subscription.gracePeriodEndDate ? new Date(subscription.gracePeriodEndDate) : null;
  
  // If subscription is active and renewal date hasn't passed
  if (subscription.subscriptionStatus === 'premium' && renewalDate && now < renewalDate) {
    return 'premium';
  }
  
  // If subscription expired but still in grace period
  if (subscription.subscriptionStatus === 'grace_period' && gracePeriodEnd && now < gracePeriodEnd) {
    return 'grace_period';
  }
  
  // If grace period ended or subscription cancelled
  if (subscription.subscriptionStatus === 'expired' || 
      subscription.subscriptionStatus === 'cancelled' ||
      (gracePeriodEnd && now >= gracePeriodEnd)) {
    return 'free';
  }
  
  return subscription.subscriptionStatus;
};

// Create default subscription for new users
const createDefaultSubscription = (userId: string): UserSubscription => {
  const currentDate = new Date().toISOString();
  const currentDateIST = getCurrentDateIST();
  const currentMonthIST = getCurrentMonthIST();
  
  return {
    userId,
    subscriptionStatus: 'free',
    planType: null,
    planTier: 'free',
    razorpaySubscriptionId: null,
    razorpayCustomerId: null,
    razorpayPlanId: null,
    subscriptionStartDate: currentDate,
    renewalDate: null,
    lastPaymentDate: null,
    nextBillingDate: null,
    cancelledDate: null,
    expiredDate: null,
    gracePeriodEndDate: null,
    planPrice: null,
    planCurrency: 'INR',
    features: PLAN_FEATURES.free,
    usage: {
      autoApplyToday: 0,
      autoApplyThisMonth: 0,
      lastResetDate: currentDateIST,
      lastMonthlyResetDate: currentMonthIST,
      timezone: 'Asia/Kolkata'
    },
    createdAt: currentDate,
    updatedAt: currentDate
  };
};

// ========== MAIN SUBSCRIPTION FUNCTIONS ==========

// Create a new subscription for a user
const createUserSubscription = async (userId: string): Promise<UserSubscription> => {
  try {
    const subscription = createDefaultSubscription(userId);
    await setDoc(doc(firestore, "subscriptions", userId), subscription);
    console.log(`Created default subscription for user: ${userId}`);
    return subscription;
  } catch (error: any) {
    console.error('Error creating user subscription:', error);
    throw new Error(`Failed to create subscription: ${error.message}`);
  }
};

// Get user subscription
const getUserSubscription = async (userId: string): Promise<UserSubscription> => {
  try {
    const subscriptionDoc = await getDoc(doc(firestore, "subscriptions", userId));
    
    if (subscriptionDoc.exists()) {
      const subscription = subscriptionDoc.data() as UserSubscription;
      // Always reset usage if needed when fetching
      const updatedSubscription = resetUsageIfNeeded(subscription);
      
      // Save back to DB if usage was reset
      if (updatedSubscription.updatedAt !== subscription.updatedAt) {
        await setDoc(doc(firestore, "subscriptions", userId), updatedSubscription);
      }
      
      return updatedSubscription;
    } else {
      // Create default subscription if doesn't exist
      console.log(`No subscription found for user ${userId}, creating default`);
      return await createUserSubscription(userId);
    }
  } catch (error: any) {
    console.error('Error getting user subscription:', error);
    throw new Error(`Failed to get subscription: ${error.message}`);
  }
};

// Update user subscription
const updateUserSubscription = async (userId: string, updates: Partial<UserSubscription>): Promise<void> => {
  try {
    const currentSubscription = await getUserSubscription(userId);
    const updatedSubscription = {
      ...currentSubscription,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    await setDoc(doc(firestore, "subscriptions", userId), updatedSubscription);
    console.log(`Updated subscription for user: ${userId}`);
  } catch (error: any) {
    console.error('Error updating user subscription:', error);
    throw new Error(`Failed to update subscription: ${error.message}`);
  }
};

// Check if user can use a specific feature
const canUseFeature = async (userId: string, feature: keyof UserSubscription['features']): Promise<FeatureAccess> => {
  try {
    const subscription = await getUserSubscription(userId);
    const effectiveStatus = getEffectiveSubscriptionStatus(subscription);
    
    // For auto-apply, check usage limits
    if (feature === 'autoApply') {
      if (effectiveStatus === 'free') {
        return { allowed: false, reason: 'upgrade_required' };
      }
      
      if (effectiveStatus === 'premium' || effectiveStatus === 'grace_period') {
        if (subscription.usage.autoApplyToday >= subscription.features.maxAutoApplyPerDay) {
          return { allowed: false, reason: 'daily_limit_reached' };
        }
        
        if (subscription.usage.autoApplyThisMonth >= subscription.features.maxAutoApplyPerMonth) {
          return { allowed: false, reason: 'monthly_limit_reached' };
        }
        
        return { allowed: true };
      }
    }
    
    // For other features, just check if enabled
    const hasFeature = subscription.features[feature];
    if (!hasFeature && effectiveStatus === 'free') {
      return { allowed: false, reason: 'upgrade_required' };
    }
    
    return { allowed: hasFeature };
  } catch (error: any) {
    console.error(`Error checking feature access for ${feature}:`, error);
    return { allowed: false, reason: 'unknown_error' };
  }
};

// Increment auto-apply usage
const incrementAutoApplyUsage = async (userId: string): Promise<boolean> => {
  try {
    const subscription = await getUserSubscription(userId);
    
    // Check if user can use auto-apply
    const canUse = await canUseFeature(userId, 'autoApply');
    if (!canUse.allowed) {
      console.log(`User ${userId} cannot use auto-apply: ${canUse.reason}`);
      return false;
    }
    
    // Increment usage
    const updatedUsage = {
      ...subscription.usage,
      autoApplyToday: subscription.usage.autoApplyToday + 1,
      autoApplyThisMonth: subscription.usage.autoApplyThisMonth + 1
    };
    
    await updateUserSubscription(userId, { usage: updatedUsage });
    console.log(`Incremented auto-apply usage for user ${userId}`);
    return true;
  } catch (error: any) {
    console.error('Error incrementing auto-apply usage:', error);
    return false;
  }
};

// Get subscription status with warnings
const getSubscriptionStatusWithWarnings = async (userId: string) => {
  try {
    const subscription = await getUserSubscription(userId);
    const effectiveStatus = getEffectiveSubscriptionStatus(subscription);
    const warnings: string[] = [];
    
    if (effectiveStatus === 'grace_period') {
      const gracePeriodEnd = subscription.gracePeriodEndDate ? new Date(subscription.gracePeriodEndDate) : null;
      if (gracePeriodEnd) {
        const daysLeft = Math.ceil((gracePeriodEnd.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        warnings.push(`Your subscription expired. You have ${daysLeft} days left to renew and keep your premium features.`);
      }
    }
    
    return {
      subscription,
      effectiveStatus,
      warnings,
      usage: subscription.usage
    };
  } catch (error: any) {
    console.error('Error getting subscription status:', error);
    throw new Error(`Failed to get subscription status: ${error.message}`);
  }
};

// Check subscription status (simplified version)
const checkSubscriptionStatus = async (userId: string): Promise<'free' | 'premium' | 'grace_period'> => {
  try {
    const subscription = await getUserSubscription(userId);
    return getEffectiveSubscriptionStatus(subscription) as 'free' | 'premium' | 'grace_period';
  } catch (error: any) {
    console.error('Error checking subscription status:', error);
    return 'free'; // Default to free on error
  }
};

// ========== EXISTING FUNCTIONS (keeping all your current functions) ==========

// Contact Form Types and Constants
type ContactFormData = {
  name: string;
  email: string;
  subject: string;
  message: string;
  inquiryType: string;
};

type ContactSubmissionData = ContactFormData & {
  submittedAt: string;
  status: 'new' | 'read' | 'responded';
};

const CONTACT_SUBMISSIONS_COLLECTION = 'contactSubmissions';
const INITIAL_SUBMISSION_STATUS = 'new';

// Helper function to create submission data
const createSubmissionData = (formData: ContactFormData): ContactSubmissionData => {
  const currentTimestamp = new Date().toISOString();
  
  const submissionData: ContactSubmissionData = {
    ...formData,
    submittedAt: currentTimestamp,
    status: INITIAL_SUBMISSION_STATUS,
  };
  
  return submissionData;
};

// Save contact form submission
const saveContactFormSubmission = async (formData: ContactFormData) => {
  try {
    // Create the submission data object
    const submissionData = createSubmissionData(formData);
    
    // Get reference to the contact submissions collection
    const contactSubmissionsRef = collection(firestore, CONTACT_SUBMISSIONS_COLLECTION);
    
    // Add the document to Firestore
    const docRef = await addDoc(contactSubmissionsRef, submissionData);
    
    // Return success response with document ID
    const response = { 
      success: true, 
      id: docRef.id 
    };
    
    return response;
    
  } catch (error: any) {
    // Log the error for debugging
    console.error('Error saving contact form:', error);
    
    // Throw a new error with the message
    const errorMessage = error.message || 'Failed to save contact form submission';
    throw new Error(errorMessage);
  }
};

// Get all contact submissions (for admin panel)
const getContactSubmissions = async () => {
  try {
    const querySnapshot = await getDocs(
      query(collection(firestore, CONTACT_SUBMISSIONS_COLLECTION), orderBy('submittedAt', 'desc'))
    );
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error: any) {
    console.error('Error fetching contact submissions:', error);
    throw new Error(error.message);
  }
};

const listenToAuthChanges = (setUser: (user: any) => void) => {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      setUser(user);
    } else {
      setUser(null);
    }
  });
};

const checkAuthToken = (navigate: (path: string) => void) => {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const userDoc = await getDoc(doc(firestore, "users", user.uid));
      if (userDoc.exists()) {
        navigate("/");
      } else {
        navigate("/onboarding/profile-setup");
      }
    } else {
      navigate("/onboarding/login");
    }
  });
};

const authenticateUser = async (
  email: string,
  password: string,
  navigate: (path: string) => void,
  isGoogleSignIn = false,
  setError: (message: string) => void
) => {
  try {
    let userCredential;

    if (isGoogleSignIn) {
      userCredential = await signInWithPopup(auth, provider);
    } else {
      try {
        // Attempt to create a new user
        userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        navigate("/dashboard/onboarding/profile-setup");
        return userCredential.user;
      } catch (error: any) {
        if (error.code === "auth/email-already-in-use") {
          // Email already exists, attempt to sign in
          try {
            userCredential = await signInWithEmailAndPassword(
              auth,
              email,
              password
            );
          } catch (signInError: any) {
            if (signInError.code === "auth/wrong-password") {
              setError("Incorrect password. Please try again.");
              throw new Error("Incorrect password");
            } else {
              setError(signInError.message);
              throw new Error(signInError.message);
            }
          }
        } else {
          setError(error.message);
          throw new Error(error.message);
        }
      }
    }

    const user = userCredential.user;
    const token = await user.getIdToken();
    localStorage.setItem("firebaseToken", token);

    const userDoc = await getDoc(doc(firestore, "users", user.uid));
    if (userDoc.exists()) {
      navigate("/dashboard/home");
    } else {
      navigate("/dashboard/onboarding/profile-setup");
    }
    return user;
  } catch (error: any) {
    console.error(error);
    throw new Error(error.message);
  }
};

const logoutUser = async (navigate: (path: string) => void) => {
  try {
    await signOut(auth);
    localStorage.removeItem("firebaseToken");
    navigate("/onboarding/login");
  } catch (error) {
    console.error("Logout Error:", error);
  }
};

const saveUserProfile = async (userId: string, profileData: any) => {
  try {
    await setDoc(
      doc(firestore, "users", userId),
      {
        ...profileData,
        onboardingCompleted: profileData.onboardingCompleted || false,
      },
      { merge: true }
    );
  } catch (error: any) {
    throw new Error(error.message);
  }
};

const getUserProfile = async (userId?: string) => {
  try {
    if (!userId) {
      const user = auth.currentUser;
      if (!user) throw new Error("No user is currently signed in");
      userId = user.uid;
    }
    const userDoc = await getDoc(doc(firestore, "users", userId));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      userData.userId = userId;
      return userDoc.data() as UserDetails;
    } else {
      throw new Error("User profile not found");
    }
  } catch (error: any) {
    throw new Error(error.message);
  }
};

const updateUserProfile = async (userId: string, profileData: any) => {
  try {
    const currentDate = new Date().toISOString();
    const updatedProfileData = {
      ...profileData,
      lastPreferenceChangedDate: currentDate,
      updatedDate: currentDate,
      createdDate: profileData.createdDate || currentDate,
    };
    await setDoc(doc(firestore, "users", userId), updatedProfileData, {
      merge: true,
    });
  } catch (error: any) {
    throw new Error(error.message);
  }
};

const getUserDetails = async (userId: string) => {
  try {
    const userDoc = await getDoc(doc(firestore, "userDetails", userId));
    if (userDoc.exists()) {
      return userDoc.data();
    } else {
      throw new Error("User details not found");
    }
  } catch (error: any) {
    throw new Error(error.message);
  }
};

const setHideJob = async (userId: string, jobId: string) => {
  try {
    const currentDate = new Date().toISOString();
    const hiddenJobsDoc = await getDoc(doc(firestore, "hiddenJobs", userId));
    const hiddenJobs = hiddenJobsDoc.exists() ? hiddenJobsDoc.data().jobs : [];
    if (!hiddenJobs.includes(jobId)) {
      hiddenJobs.push(jobId);
    }

    await setDoc(
      doc(firestore, "hiddenJobs", userId),
      {
        jobs: hiddenJobs,
        updatedAt: currentDate,
      },
      { merge: true }
    );

    // Remove the job from current jobs
    const currentJobsDoc = await getDoc(doc(firestore, "currentJobs", userId));
    if (currentJobsDoc.exists()) {
      let currentJobs = currentJobsDoc.data().jobs;
      currentJobs = currentJobs.filter((id: string) => id !== jobId);
      await setDoc(
        doc(firestore, "currentJobs", userId),
        {
          jobs: currentJobs,
          lastFetchedDate: currentJobsDoc.data().lastFetchedDate,
        },
        { merge: true }
      );
    }
  } catch (error: any) {
    throw new Error("Error hiding job: " + error.message);
  }
};

const saveCurrentJobs = async (userId: string, jobIds: string[]) => {
  try {
    const currentDate = new Date().toISOString();

    await setDoc(
      doc(firestore, "currentJobs", userId),
      {
        jobs: jobIds,
        lastFetchedDate: currentDate,
      },
      { merge: true }
    );
  } catch (error: any) {
    throw new Error(error.message);
  }
};

const saveArchivedJobs = async (userId: string, jobIds: string[]) => {
  try {
    const currentDate = new Date().toISOString();

    const archivedJobs = (await getArchivedJobs(userId)) ?? [];
    const newArchivedJobs = new Set([...archivedJobs, ...jobIds]);
    const newArchivedJobsArray = Array.from(newArchivedJobs);

    await setDoc(
      doc(firestore, "archiveJobs", userId),
      {
        jobs: newArchivedJobsArray,
        updatedAt: currentDate,
      },
      { merge: true }
    );
  } catch (error: any) {
    console.log(error);

    throw new Error(error.message);
  }
};

const getCurrentJobs = async (userId: string) => {
  try {
    const currentJobsDoc = await getDoc(doc(firestore, "currentJobs", userId));
    if (currentJobsDoc?.exists()) {
      return currentJobsDoc.data();
    } else {
      return null;
    }
  } catch (error: any) {
    throw new Error(error.message);
  }
};

const getCurrentJobsByJobTitle = async (userId: string, userProfile: UserDetails) => {
  try {
    const currentJobsDoc = await getJobByTitleandSkills(userProfile);
    console.log(currentJobsDoc);
    return currentJobsDoc;

    // if (currentJobsDoc?.exists()) {
    //   return currentJobsDoc.data();
    // } else {
    //   return null;
    // }
  } catch (error: any) {
    throw new Error(error.message);
  }
};

const getArchivedJobs = async (userId: string) => {
  try {
    const archivedJobsDoc = await getDoc(doc(firestore, "archiveJobs", userId));
    if (archivedJobsDoc.exists()) {
      return archivedJobsDoc.data().jobs || [];
    } else {
      return [];
    }
  } catch (error: any) {
    throw new Error(error.message);
  }
};

const getHiddenJobs = async (userId: string) => {
  try {
    const hiddenJobsDoc = await getDoc(doc(firestore, "hiddenJobs", userId));
    if (hiddenJobsDoc.exists()) {
      return hiddenJobsDoc.data().jobs || [];
    } else {
      return [];
    }
  } catch (error: any) {
    throw new Error(error.message);
  }
};

const getUpdatedJobs = async (userId: string, userProfile: UserDetails) => {
  try {
    const currentJobsData = await getCurrentJobsByJobTitle(userId, userProfile);
    const currentDate = new Date().toISOString().split("T")[0];
    if (!userProfile.jobTitle) {
      throw new Error("Primary role not found");
    }
   
    return currentJobsData.map((job: any) => ({
      ...job,
      _id: job._id?.toString(), // Convert _id to a string
    }));
    

    if (
      currentJobsData &&
      currentJobsData.jobs.length > 0 &&
      currentJobsData.lastFetchedDate.split("T")[0] === currentDate
    ) {
      const jobIds = currentJobsData.jobs;

      const jobs = await getJobsByIds(
        jobIds,
        userProfile.jobTitle,
        userProfile.expectedCTC,
        userProfile.workexperience,   
      );


      // Sanitize jobs before returning
      return jobs.map((job) => ({
        ...job,
        _id: job._id?.toString(), // Convert _id to a string
      }));
    } else {
      const archivedJobs = await getArchivedJobs(userId);
      const hiddenJobs = await getHiddenJobs(userId);
      const excludedJobs = new Set([...archivedJobs, ...hiddenJobs]);
     

      const fetchedJobs: any= (await getFilteredJobsByTitle(
        userProfile.jobTitle,
        excludedJobs,
        userProfile
      )) as any;


      const sanitizedJobs = fetchedJobs.map((job: any) => ({
        ...job,
        _id: job._id?.toString(), // Convert _id to a string
      }));

      const jobIds = sanitizedJobs.map((job: any) => job.jobId);
      await saveCurrentJobs(userId, jobIds);
      await saveArchivedJobs(userId, jobIds);
      const dashboardData = await getDashboardData(userId);
      dashboardData.totalJobsShown += jobIds.length;
      await updateDashboardData(userId, dashboardData);
      return sanitizedJobs;
    }
  } catch (error: any) {
    throw new Error("Error fetching updated jobs: " + error.message);
  }
};

// IMPROVED PAGINATED VERSION WITH JOB LIMIT AND BETTER ERROR HANDLING
const getUpdatedJobsPaginated = async (
  userId: string, 
  userProfile: UserDetails,
  page: number = 1,
  pageSize: number = 20,
  searchTerm?: string,
  filters?: {
    salaryRange?: [number, number][];
    experience?: [number, number][];
    jobType?: string[];
    platform?: string[]; 
  },
  maxTotalJobs: number = 100 // NEW: Job limit parameter
) => {
  try {
    console.log(`[getUpdatedJobsPaginated] Starting fetch - Page: ${page}, PageSize: ${pageSize}, MaxJobs: ${maxTotalJobs}`);
    
    const currentDate = new Date().toISOString().split("T")[0];
    
    if (!userProfile.jobTitle) {
      throw new Error("Primary role not found in user profile");
    }

    // Get cached jobs data
    const currentJobsData = await getCurrentJobs(userId);
    let allJobIds: string[] = [];
    let useCache = false;

    console.log(`[getUpdatedJobsPaginated] Cached data exists: ${!!currentJobsData}`);

    // Check if we can use cached data (from today)
    if (
      currentJobsData &&
      currentJobsData.jobs &&
      currentJobsData.jobs.length > 0 &&
      currentJobsData.lastFetchedDate &&
      currentJobsData.lastFetchedDate.split("T")[0] === currentDate
    ) {
      allJobIds = currentJobsData.jobs;
      useCache = true;
      console.log(`[getUpdatedJobsPaginated] Using cached data with ${allJobIds.length} jobs`);
    }

    // If no cache or cache is old, fetch new jobs
    if (!useCache) {
      console.log(`[getUpdatedJobsPaginated] Fetching fresh jobs from database`);
      
      const archivedJobs = await getArchivedJobs(userId);
      const hiddenJobs = await getHiddenJobs(userId);
      const excludedJobs = new Set([...archivedJobs, ...hiddenJobs]);

      console.log(`[getUpdatedJobsPaginated] Excluded jobs - Archived: ${archivedJobs.length}, Hidden: ${hiddenJobs.length}`);

      // Get jobs from MongoDB using the paginated function
      const result = await getFilteredJobsByTitlePaginated(
        userProfile.jobTitle,
        excludedJobs,
        userProfile,
        1, // Always start from page 1 when fetching fresh data
        maxTotalJobs // Use the job limit here instead of 1000
      );
      // In getUpdatedJobsPaginated, add this after the getFilteredJobsByTitlePaginated call:
      console.log('[getUpdatedJobsPaginated] Result from getFilteredJobsByTitlePaginated:', result);

      if (!result || !result.jobs) {
        console.error(`[getUpdatedJobsPaginated] Invalid result from getFilteredJobsByTitlePaginated:`, result);
        throw new Error('Invalid response from job search service');
      }

      const fetchedJobs = result.jobs;
      allJobIds = fetchedJobs.map((job: any) => job.jobId).filter(Boolean); // Filter out null/undefined jobIds
      
      console.log(`[getUpdatedJobsPaginated] Fetched ${fetchedJobs.length} jobs,
