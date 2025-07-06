/* eslint-disable @typescript-eslint/no-explicit-any */
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
        hasMore: false
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
  if (filters?.platform && filters.platform.length > 0) 
  {
  const originalLength = jobs.length;
  jobs = jobs.filter((job: Job) => 
    {
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
      hasMore: (page * pageSize) < Math.min(totalJobsAfterFilter, maxTotalJobs)
    };

    console.log(`[getUpdatedJobsPaginated] Final result:`, {
      jobCount: result.jobs.length,
      currentPage: result.currentPage,
      totalPages: result.totalPages,
      totalJobs: result.totalJobs,
      hasMore: result.hasMore
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
  getUpdatedJobsPaginated, // IMPROVED PAGINATED FUNCTION WITH JOB LIMIT
  getTotalJobCount, // COUNT FUNCTION
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
};

// Export types if needed elsewhere
export type { ContactFormData, ContactSubmissionData };
//test
