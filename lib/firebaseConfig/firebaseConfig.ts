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
import { getFilteredJobsByTitlePaginatedWithFuzzy } from "@/lib/mongo/fuzzy-matcher";
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
    
    // For boolean features, check if enabled
    if (typeof subscription.features[feature] === 'boolean') {
      const hasFeature = subscription.features[feature] as boolean;
      if (!hasFeature && effectiveStatus === 'free') {
        return { allowed: false, reason: 'upgrade_required' };
      }
      return { allowed: hasFeature };
    }
    
    // For number features (like maxAutoApplyPerDay), they're always "allowed" if > 0
    if (typeof subscription.features[feature] === 'number') {
      const featureValue = subscription.features[feature] as number;
      if (featureValue === 0 && effectiveStatus === 'free') {
        return { allowed: false, reason: 'upgrade_required' };
      }
      return { allowed: featureValue > 0 };
    }
    
    // Default case
    return { allowed: false, reason: 'unknown_error' };
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

// ========== EXISTING FUNCTIONS ==========

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
    
    // TEMPORARY: Force cache clear to fix 500 error
    console.log('🔧 Temporarily forcing cache clear');
    const currentJobsData = null;
    let useCache = false;
    
    if (!userProfile.jobTitle) {
      throw new Error("Primary role not found in user profile");
    }

    // // Get cached jobs data
    // const currentJobsData = await getCurrentJobs(userId);
    // let allJobIds: string[] = [];
    // let useCache = false;
    let debugInfo = null;

    // console.log(`[getUpdatedJobsPaginated] Cached data exists: ${!!currentJobsData}`);

    // // Check if we can use cached data (from today)
    // if (
    //   currentJobsData &&
    //   currentJobsData.jobs &&
    //   currentJobsData.jobs.length > 0 &&
    //   currentJobsData.lastFetchedDate &&
    //   currentJobsData.lastFetchedDate.split("T")[0] === currentDate
    // ) {
    //   allJobIds = currentJobsData.jobs;
    //   useCache = true;
    //   console.log(`[getUpdatedJobsPaginated] Using cached data with ${allJobIds.length} jobs`);
    // }

    // If no cache or cache is old, fetch new jobs
    if (!useCache) {
      console.log(`[getUpdatedJobsPaginated] Fetching fresh jobs from database`);
      
      const archivedJobs = await getArchivedJobs(userId);
      const hiddenJobs = await getHiddenJobs(userId);
      const excludedJobs = new Set([...archivedJobs, ...hiddenJobs]);

      console.log(`[getUpdatedJobsPaginated] Excluded jobs - Archived: ${archivedJobs.length}, Hidden: ${hiddenJobs.length}`);

      // Get jobs from MongoDB using the paginated function
      // const result = await getFilteredJobsByTitlePaginated(
      //   userProfile.jobTitle,
      //   excludedJobs,
      //   userProfile,
      //   1, // Always start from page 1 when fetching fresh data
      //   maxTotalJobs // Use the job limit here instead of 1000
      // );

      const result = await getFilteredJobsByTitlePaginatedWithFuzzy(
        userProfile.jobTitle,
        excludedJobs,
        userProfile,
        1, // Always start from page 1 when fetching fresh data
        maxTotalJobs, // Use the job limit here instead of 1000
        0.6 // minSimilarity - adjust between 0.5-0.8 as needed
      );
      // Log which search method was used
      console.log(`Search completed using: ${result.searchMethod}`);
      
      // In getUpdatedJobsPaginated, add this after the getFilteredJobsByTitlePaginated call:
      console.log('[getUpdatedJobsPaginated] Result from getFilteredJobsByTitlePaginated:', result);

      if (!result || !result.jobs) {
        console.error(`[getUpdatedJobsPaginated] Invalid result from getFilteredJobsByTitlePaginated:`, result);
        throw new Error('Invalid response from job search service');
      }

      debugInfo = result.debugInfo;
      const fetchedJobs = result.jobs;
      allJobIds = fetchedJobs.map((job: any) => {
        const jobId = job.jobId || job.id || job._id?.toString();
        if (!jobId) {
          console.warn('Job missing ID:', job);
        }
        return jobId;
      }).filter(Boolean);
      
      console.log(`[DEBUG] Extracted ${allJobIds.length} job IDs from ${fetchedJobs.length} jobs`);
      
      console.log(`[getUpdatedJobsPaginated] Fetched ${fetchedJobs.length} jobs, got ${allJobIds.length} job IDs`);
      
      // Limit the job IDs to maxTotalJobs
      if (allJobIds.length > maxTotalJobs) {
        allJobIds = allJobIds.slice(0, maxTotalJobs);
        console.log(`[getUpdatedJobsPaginated] Limited job IDs to ${maxTotalJobs}`);
      }
      
      // Save to cache only if we have jobs
      if (allJobIds.length > 0) {
        await saveCurrentJobs(userId, allJobIds);
        await saveArchivedJobs(userId, allJobIds);
        
        // Update dashboard
        const dashboardData = await getDashboardData(userId);
        dashboardData.totalJobsShown += allJobIds.length;
        await updateDashboardData(userId, dashboardData);
        
        console.log(`[getUpdatedJobsPaginated] Saved ${allJobIds.length} jobs to cache`);
      } else {
        console.warn(`[getUpdatedJobsPaginated] No jobs to cache`);
      }
    }

    // Apply job limit to cached data as well
    if (allJobIds.length > maxTotalJobs) {
      allJobIds = allJobIds.slice(0, maxTotalJobs);
      console.log(`[getUpdatedJobsPaginated] Limited cached job IDs to ${maxTotalJobs}`);
    }

    // Calculate pagination boundaries
    const totalAvailableJobs = allJobIds.length;
    const totalPages = Math.ceil(totalAvailableJobs / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalAvailableJobs);
    
    console.log(`[getUpdatedJobsPaginated] Pagination - Total: ${totalAvailableJobs}, Pages: ${totalPages}, Range: ${startIndex}-${endIndex}`);

    // Get job IDs for this page
    const paginatedJobIds = allJobIds.slice(startIndex, endIndex);

    if (paginatedJobIds.length === 0) {
      console.log(`[getUpdatedJobsPaginated] No jobs for page ${page}`);
      return {
        jobs: [],
        currentPage: page,
        totalPages: totalPages,
        totalJobs: totalAvailableJobs,
        hasMore: false,
        debugInfo: debugInfo || null
      };
    }

    // Get job details for this page
    console.log(`[getUpdatedJobsPaginated] Fetching details for ${paginatedJobIds.length} jobs`);
    
    let jobs = await getJobsByIds(
      paginatedJobIds,
      userProfile.jobTitle,
      userProfile.expectedCTC,
      userProfile.workexperience
    );

    if (!jobs || !Array.isArray(jobs)) {
      console.error(`[getUpdatedJobsPaginated] Invalid jobs response:`, jobs);
      jobs = [];
    }

    console.log(`[getUpdatedJobsPaginated] Retrieved ${jobs.length} job details`);

    // Apply search filter if provided
    if (searchTerm && searchTerm.trim()) {
      const originalLength = jobs.length;
      jobs = jobs.filter((job: Job) => {
        if (!job) return false;
        
        const searchLower = searchTerm.toLowerCase();
        
        // Handle location - check if it's array or string
        const locationMatch = Array.isArray(job.location) 
          ? job.location.some((loc: string) => loc && loc.toLowerCase().includes(searchLower))
          : job.location?.toLowerCase().includes(searchLower);
        
        return (
          (job.title && job.title.toLowerCase().includes(searchLower)) ||
          (job.company && job.company.toLowerCase().includes(searchLower)) ||
          locationMatch ||
          (job.tags && job.tags.some((tag: string) => 
            tag && tag.toLowerCase().includes(searchLower)
          ))
        );
      });
      
      console.log(`[getUpdatedJobsPaginated] Search filtered jobs from ${originalLength} to ${jobs.length}`);
    }

    // Apply additional filters
    if (filters?.salaryRange && filters.salaryRange.length > 0) {
      const originalLength = jobs.length;
      jobs = jobs.filter((job: Job) => {
        // Implement salary filtering logic based on your salary structure
        // This is a placeholder - you'll need to implement based on your data structure
        return true; 
      });
      console.log(`[getUpdatedJobsPaginated] Salary filter applied: ${originalLength} -> ${jobs.length}`);
    }

    if (filters?.experience && filters.experience.length > 0) {
      const originalLength = jobs.length;
      jobs = jobs.filter((job: Job) => {
        // Implement experience filtering logic
        // This is a placeholder - you'll need to implement based on your data structure
        return true;
      });
      console.log(`[getUpdatedJobsPaginated] Experience filter applied: ${originalLength} -> ${jobs.length}`);
    }

    if (filters?.jobType && filters.jobType.length > 0) {
      const originalLength = jobs.length;
      jobs = jobs.filter((job: Job) => {
        return filters.jobType?.includes(job.type || 'Full-time');
      });
      console.log(`[getUpdatedJobsPaginated] Job type filter applied: ${originalLength} -> ${jobs.length}`);
    }
    
    if (filters?.platform && filters.platform.length > 0) {
      const originalLength = jobs.length;
      jobs = jobs.filter((job: Job) => {
        return filters.platform?.includes(job.platform || 'Unknown');
      });
      console.log(`[getUpdatedJobsPaginated] Platform filter applied: ${originalLength} -> ${jobs.length}`);
    }

    // Sanitize jobs before returning
    const sanitizedJobs = jobs.map((job: any) => ({
      ...job,
      _id: job._id?.toString(),
    })).filter(job => job && job.jobId); // Remove any null/undefined jobs

    console.log(`[getUpdatedJobsPaginated] Returning ${sanitizedJobs.length} sanitized jobs`);

    // For filtered results, we need to handle totalJobs differently
    // When filters are applied, totalJobs should reflect the filtered count across all pages
    let totalJobsAfterFilter = totalAvailableJobs;
    
    if (searchTerm || filters?.salaryRange?.length || filters?.experience?.length || filters?.jobType?.length) {
      // If filters are applied, the actual total would require filtering all jobs
      // For performance, we'll estimate based on current page ratio
      // In a production app, you might want to do this filtering at the database level
      if (paginatedJobIds.length > 0) {
        const filterRatio = sanitizedJobs.length / Math.min(paginatedJobIds.length, jobs.length || 1);
        totalJobsAfterFilter = Math.ceil(totalAvailableJobs * filterRatio);
      } else {
        totalJobsAfterFilter = sanitizedJobs.length;
      }
      
      console.log(`[getUpdatedJobsPaginated] Estimated total after filters: ${totalJobsAfterFilter}`);
    }

    const result = {
      jobs: sanitizedJobs,
      currentPage: page,
      totalPages: Math.ceil(totalJobsAfterFilter / pageSize),
      totalJobs: Math.min(totalJobsAfterFilter, maxTotalJobs), // Ensure we don't exceed the limit
      hasMore: (page * pageSize) < Math.min(totalJobsAfterFilter, maxTotalJobs),
      debugInfo: debugInfo || null
    };

    console.log(`[getUpdatedJobsPaginated] Final result:`, {
      jobCount: result.jobs.length,
      currentPage: result.currentPage,
      totalPages: result.totalPages,
      totalJobs: result.totalJobs,
      hasMore: result.hasMore,
      debugInfo: result.debugInfo
    });

    return result;

  } catch (error: any) {
    console.error(`[getUpdatedJobsPaginated] Error:`, error);
    throw new Error("Error fetching paginated jobs: " + error.message);
  }
};

// Function to get total job count
const getTotalJobCount = async (
  userId: string,
  userProfile: UserDetails,
  searchTerm?: string,
  filters?: any
) => {
  try {
    // Get current jobs or fetch new ones
    const currentJobsData = await getCurrentJobs(userId);
    
    if (currentJobsData && currentJobsData.jobs) {
      return currentJobsData.jobs.length;
    }

    // If no cached data, get fresh count
    const archivedJobs = await getArchivedJobs(userId);
    const hiddenJobs = await getHiddenJobs(userId);
    const excludedJobs = new Set([...archivedJobs, ...hiddenJobs]);

    const result = await getFilteredJobsByTitlePaginated(
      userProfile.jobTitle || '',
      excludedJobs,
      userProfile,
      1,
      1
    );

    return result.totalCount || 0;

  } catch (error: any) {
    console.error('Error getting job count:', error);
    return 0;
  }
};

const getDashboardData = async (userId: string): Promise<DashboardData> => {
  try {
    const dashboardDataDoc = await getDoc(
      doc(firestore, "dashboardData", userId)
    );
    if (dashboardDataDoc.exists()) {
      return dashboardDataDoc.data() as DashboardData;
    } else {
      return {
        averageExperience: 0,
        averagePackage: 0,
        experienceAppliedTo: {},
        jobsApplied: 0,
        location: {},
        packageAppliedTo: {},
        totalJobsShown: 0,
        updatedAt: new Date().toISOString(),
      };
    }
  } catch (error: any) {
    throw new Error(error.message);
  }
};

const setAppliedJob = async (
  userId: string,
  jobId: string,
  appliedDate: string
) => {
  try {
    const appliedJobsDoc = await getDoc(doc(firestore, "appliedJobs", userId));
    const appliedJobs = appliedJobsDoc.exists()
      ? appliedJobsDoc.data().appliedJobs
      : [];
    if (!appliedJobs.some((job: { jobId: string }) => job.jobId === jobId)) {
      appliedJobs.push({ jobId, appliedDate });
    }

    await setDoc(
      doc(firestore, "appliedJobs", userId),
      {
        appliedJobs: appliedJobs,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error: any) {
    throw new Error("Error applying job: " + error.message);
  }
};

const updateJobStatus = async (
  userId: string,
  jobId: string,
  newStatus: string,
  currentStatus: string
) => {
  try {
    const jobTrackerDoc = await getDoc(doc(firestore, "appliedJobs", userId));
    if (jobTrackerDoc.exists()) {
      const jobTrackerData = jobTrackerDoc.data();
      const currentStatusJobs = jobTrackerData[currentStatus];
      const newStatusJobs = jobTrackerData[newStatus] ?? [];
      const jobIndex = currentStatusJobs.findIndex(
        (job: { jobId: string }) => job.jobId === jobId
      );
      if (jobIndex !== -1) {
        const job = currentStatusJobs[jobIndex];
        currentStatusJobs.splice(jobIndex, 1);
        newStatusJobs.push(job);
      }
      await setDoc(
        doc(firestore, "appliedJobs", userId),
        {
          ...jobTrackerData,
          [currentStatus]: currentStatusJobs,
          [newStatus]: newStatusJobs,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    }
  } catch (error: any) {
    throw new Error("Error updating job status: " + error.message);
  }
};

const averageSalaryValues = {
  "0-3 LPA": 1.5,
  "3-6 LPA": 4.5,
  "6-10 LPA": 8,
  "10-15 LPA": 12.5,
  "15-25 LPA": 20,
  "25+ LPA": 30,
};

const averageExperienceValues = {
  "0-2 Years": 1,
  "2-4 Years": 3,
  "4-8 Years": 6,
  "8-12 Years": 10,
  "12 Years+": 15,
};

const updateDashboardOnJobApplied = async (
  userId: string,
  packageRange: string,
  locations: string,
  experienceRange: string
) => {
  try {
    const dashboardData = await getDashboardData(userId);

    // Initialize experienceAppliedTo and location if they don't exist
    if (!dashboardData.experienceAppliedTo) {
      dashboardData.experienceAppliedTo = {};
    }
    if (!dashboardData.location) {
      dashboardData.location = {};
    }

    const generalPackageRange = mapSalaryToRange(packageRange);
    dashboardData.jobsApplied += 1;
    dashboardData.packageAppliedTo[generalPackageRange] =
      (dashboardData.packageAppliedTo[generalPackageRange] || 0) + 1;

    // Split locations and increment count for each
    const locationList = locations
      .split(",")
      .map((location) => location.trim());
    locationList.forEach((location) => {
      dashboardData.location[location] =
        (dashboardData.location[location] || 0) + 1;
    });

    // Handle experience ranges
    const generalExperienceRanges = mapExperienceToRange(experienceRange);
    generalExperienceRanges.forEach((range) => {
      dashboardData.experienceAppliedTo[range] =
        (dashboardData.experienceAppliedTo[range] || 0) + 1;
    });

    // Calculate averagePackage
    let totalPackages = 0;
    let totalJobs = 0;
    for (const [range, count] of Object.entries(
      dashboardData.packageAppliedTo
    )) {
      if (
        range !== "Unknown" &&
        averageSalaryValues[range as keyof typeof averageSalaryValues] !==
          undefined
      ) {
        totalPackages +=
          averageSalaryValues[range as keyof typeof averageSalaryValues] *
          (count as number);
        totalJobs += count as number;
      }
    }
    dashboardData.averagePackage =
      totalJobs > 0 ? totalPackages / totalJobs : 0;

    // Calculate averageExperience
    let totalExperience = 0;
    let totalExperienceJobs = 0;
    for (const [range, count] of Object.entries(
      dashboardData.experienceAppliedTo
    )) {
      if (
        range !== "Unknown" &&
        averageExperienceValues[
          range as keyof typeof averageExperienceValues
        ] !== undefined
      ) {
        totalExperience +=
          averageExperienceValues[
            range as keyof typeof averageExperienceValues
          ] * (count as number);
        totalExperienceJobs += count as number;
      }
    }
    dashboardData.averageExperience =
      totalExperienceJobs > 0
        ? Math.round(totalExperience / totalExperienceJobs)
        : 0;

    await updateDashboardData(userId, dashboardData);
  } catch (error: any) {
    console.log(error);

    throw new Error("Error updating dashboard data: " + error.message);
  }
};

const getAppliedJobs = async (userId: string) => {
  try {
    const archivedJobsDoc = await getDoc(doc(firestore, "appliedJobs", userId));
    if (archivedJobsDoc.exists()) {
      return archivedJobsDoc.data().appliedJobs || [];
    } else {
      return [];
    }
  } catch (error: any) {
    throw new Error("Error fetching applied jobs: " + error.message);
  }
};

const updateDashboardData = async (userId: string, data: any) => {
  try {
    const currentDate = new Date().toISOString();
    const dashboardDataDoc = await getDoc(
      doc(firestore, "dashboardData", userId)
    );
    const existingData = dashboardDataDoc.exists()
      ? dashboardDataDoc.data()
      : {};

    const updatedData = {
      ...existingData,
      ...data,
      updatedAt: currentDate,
    };

    await setDoc(doc(firestore, "dashboardData", userId), updatedData, {
      merge: true,
    });
  } catch (error: any) {
    throw new Error(error.message);
  }
};

const getJobTrackerData = async (userId: string) => {
  try {
    const jobTrackerDoc = await getDoc(doc(firestore, "appliedJobs", userId));
    console.log(jobTrackerDoc.data(),"job");
    if (jobTrackerDoc.exists()) {
      const data = jobTrackerDoc.data();
      return {
        appliedJobs: data.appliedJobs || [],
        personalArchive: data.personalArchive || [],
        followUp: data.followUp || [],
        noReply: data.noReply || [],
      };
    } else {
      return {
        appliedJobs: [],
        personalArchive: [],
        followUp: [],
        noReply: [],
      };
    }
  } catch (error: any) {
    throw new Error("Error fetching job tracker data: " + error.message);
  }
};

// Export all functions
export {
  auth,
  firestore,
  storage,
  checkAuthToken,
  authenticateUser,
  saveUserProfile,
  provider,
  getUserProfile,
  updateUserProfile,
  getUserDetails,
  saveCurrentJobs,
  getCurrentJobs,
  getArchivedJobs,
  getUpdatedJobs,
  getUpdatedJobsPaginated,
  getTotalJobCount,
  getHiddenJobs,
  setHideJob,
  getDashboardData,
  updateDashboardData,
  setAppliedJob,
  getAppliedJobs,
  updateDashboardOnJobApplied,
  updateJobStatus,
  getJobTrackerData,
  listenToAuthChanges,
  logoutUser,
  saveContactFormSubmission,
  getContactSubmissions,
  // New subscription functions
  createUserSubscription,
  getUserSubscription,
  updateUserSubscription,
  canUseFeature,
  incrementAutoApplyUsage,
  getSubscriptionStatusWithWarnings,
  checkSubscriptionStatus,
};

// Export types if needed elsewhere
export type { ContactFormData, ContactSubmissionData };
