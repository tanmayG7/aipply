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

const getCurrentJobsByJobTitle = async (userId: string,userProfile:UserDetails) => {
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
    const currentJobsData = await getCurrentJobsByJobTitle(userId,userProfile);
    const currentDate = new Date().toISOString().split("T")[0];
    if (!userProfile.jobTitle) {
      throw new Error("Primary role not found");
    }
   
         return currentJobsData.map((job:any) => ({
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


      const sanitizedJobs = fetchedJobs.map((job:any) => ({
        ...job,
        _id: job._id?.toString(), // Convert _id to a string
      }));

      const jobIds = sanitizedJobs.map((job:any) => job.jobId);
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

// NEW PAGINATED VERSION OF getUpdatedJobs
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
  }
) => {
  try {
    const currentDate = new Date().toISOString().split("T")[0];
    
    if (!userProfile.jobTitle) {
      throw new Error("Primary role not found");
    }

    // Get cached jobs data
    const currentJobsData = await getCurrentJobs(userId);
    let allJobIds: string[] = [];
    let useCache = false;

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
    }

    // If no cache or cache is old, fetch new jobs
    if (!useCache) {
      const archivedJobs = await getArchivedJobs(userId);
      const hiddenJobs = await getHiddenJobs(userId);
      const excludedJobs = new Set([...archivedJobs, ...hiddenJobs]);

      // Get jobs from MongoDB using the paginated function
      const result = await getFilteredJobsByTitlePaginated(
        userProfile.jobTitle,
        excludedJobs,
        userProfile,
        1, // Always start from page 1 when fetching fresh data
        1000 // Get a large number to cache locally
      );

      const fetchedJobs = result.jobs;
      allJobIds = fetchedJobs.map((job: any) => job.jobId);
      
      // Save to cache
      await saveCurrentJobs(userId, allJobIds);
      await saveArchivedJobs(userId, allJobIds);
      
      // Update dashboard
      const dashboardData = await getDashboardData(userId);
      dashboardData.totalJobsShown += allJobIds.length;
      await updateDashboardData(userId, dashboardData);
    }

    // Apply pagination to cached job IDs
    const startIndex = (page - 1) * pageSize;
    const paginatedJobIds = allJobIds.slice(startIndex, startIndex + pageSize);

    // Get job details for this page
    let jobs = await getJobsByIds(
      paginatedJobIds,
      userProfile.jobTitle,
      userProfile.expectedCTC,
      userProfile.workexperience
    );

    // Apply search filter if provided
    if (searchTerm && searchTerm.trim()) {
      jobs = jobs.filter((job: Job) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          job.title.toLowerCase().includes(searchLower) ||
          job.company.toLowerCase().includes(searchLower) ||
          job.location.some((loc: string) => 
            loc.toLowerCase().includes(searchLower)
          ) ||
          job.tags?.some((tag: string) => 
            tag.toLowerCase().includes(searchLower)
          )
        );
      });
    }

    // Apply additional filters
    if (filters?.salaryRange?.length) {
      jobs = jobs.filter((job: Job) => {
        // Add your salary filtering logic here
        return true; // Placeholder
      });
    }

    if (filters?.experience?.length) {
      jobs = jobs.filter((job: Job) => {
        // Add your experience filtering logic here
        return true; // Placeholder
      });
    }

    if (filters?.jobType?.length) {
      jobs = jobs.filter((job: Job) => {
        return filters.jobType?.includes(job.type || 'Full-time');
      });
    }

    // Sanitize jobs before returning
    const sanitizedJobs = jobs.map((job: any) => ({
      ...job,
      _id: job._id?.toString(),
    }));

    // Calculate total jobs after search/filter
    let totalJobsAfterFilter = allJobIds.length;
    
    if (searchTerm || filters?.salaryRange?.length || filters?.experience?.length || filters?.jobType?.length) {
      // If filters are applied, we need to count all filtered jobs
      // For now, we'll use the current page results, but ideally you'd count all filtered results
      totalJobsAfterFilter = sanitizedJobs.length > 0 ? Math.ceil(sanitizedJobs.length * allJobIds.length / paginatedJobIds.length) : 0;
    }

    return {
      jobs: sanitizedJobs,
      currentPage: page,
      totalPages: Math.ceil(totalJobsAfterFilter / pageSize),
      totalJobs: totalJobsAfterFilter,
      hasMore: startIndex + pageSize < totalJobsAfterFilter
    };

  } catch (error: any) {
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
  getUpdatedJobsPaginated, // NEW PAGINATED FUNCTION
  getTotalJobCount, // NEW COUNT FUNCTION
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
