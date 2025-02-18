/* eslint-disable @typescript-eslint/no-explicit-any */
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { Job, UserDetails, DashboardData } from "../types";
import { getJobsByIds, getFilteredJobsByTitle } from "@/lib/mongo/mongo";
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

const checkAuthToken = (navigate: (path: string) => void) => {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const userDoc = await getDoc(doc(firestore, "users", user.uid));
      if (userDoc.exists()) {
        navigate("/home");
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
      const user = userCredential.user;
      const usersRef = collection(firestore, "users");
      const q = query(usersRef, where("email", "==", user.email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        if (userDoc.id !== user.uid) {
          setError("Please use email method with password to login.");
          return;
        }
      }
    } else {
      const usersRef = collection(firestore, "users");
      const q = query(usersRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      } else {
        const userDoc = querySnapshot.docs[0];
        if (userDoc.data().provider === "google") {
          setError("Please use Google method to login.");
          return;
        }
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      }
    }

    const user = userCredential.user;
    const token = await user.getIdToken();
    localStorage.setItem("firebaseToken", token);

    const userDoc = await getDoc(doc(firestore, "users", user.uid));
    if (userDoc.exists()) {
      navigate("/home");
    } else {
      navigate("/onboarding/profile-setup");
    }
    return user;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

const saveUserProfile = async (userId: string, profileData: any) => {
  try {
    await setDoc(doc(firestore, "users", userId), profileData, { merge: true });
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
    await setDoc(doc(firestore, "users", userId), updatedProfileData, { merge: true });
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

    await setDoc(doc(firestore, "hiddenJobs", userId), {
      jobs: hiddenJobs,
      updatedAt: currentDate,
    }, { merge: true });

    // Remove the job from current jobs
    const currentJobsDoc = await getDoc(doc(firestore, "currentJobs", userId));
    if (currentJobsDoc.exists()) {
      let currentJobs = currentJobsDoc.data().jobs;
      currentJobs = currentJobs.filter((id: string) => id !== jobId);
      await setDoc(doc(firestore, "currentJobs", userId), {
        jobs: currentJobs,
        lastFetchedDate: currentJobsDoc.data().lastFetchedDate,
      }, { merge: true });
    }
  } catch (error: any) {
    throw new Error("Error hiding job: " + error.message);
  }
};

const saveCurrentJobs = async (userId: string, jobIds: string[]) => {
  try {
    const currentDate = new Date().toISOString();

    await setDoc(doc(firestore, "currentJobs", userId), {
      jobs: jobIds,
      lastFetchedDate: currentDate,
    }, { merge: true });
  } catch (error: any) {
    throw new Error(error.message);
  }
};

const saveArchivedJobs = async (userId: string, jobIds: string[]) => {
  try {
    const currentDate = new Date().toISOString();

    const archivedJobs = await getArchivedJobs(userId) ?? [];
    const newArchivedJobs = new Set([...archivedJobs, ...jobIds]);
    const newArchivedJobsArray = Array.from(newArchivedJobs);
    
    await setDoc(doc(firestore, "archiveJobs", userId), {
      jobs: newArchivedJobsArray,
      updatedAt: currentDate,
    }, { merge: true });
  } catch (error: any) {
    console.log(error);
    
    throw new Error(error.message);
  }
}

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
}

const getUpdatedJobs = async (userId: string, userProfile: UserDetails) => {
  try {
    const currentJobsData = await getCurrentJobs(userId);
    const currentDate = new Date().toISOString().split("T")[0];

    if (
      currentJobsData &&
      currentJobsData.lastFetchedDate.split("T")[0] === currentDate
    ) {
      const jobIds = currentJobsData.jobs;
      return await getJobsByIds(jobIds, userProfile.primaryRole);
    } else {
      const archivedJobs = await getArchivedJobs(userId);
      const hiddenJobs = await getHiddenJobs(userId);
      const excludedJobs = new Set([...archivedJobs, ...hiddenJobs]);

      const fetchedJobs: Job[] = (await getFilteredJobsByTitle(userProfile.primaryRole, excludedJobs)) as Job[];

      const jobIds = fetchedJobs.map(job => job.jobId);
      await saveCurrentJobs(userId, jobIds);
      await saveArchivedJobs(userId, jobIds);
      const dashboardData = await getDashboardData(userId);
      dashboardData.totalJobsShown += jobIds.length;
      await updateDashboardData(userId, dashboardData);
      return fetchedJobs;
    }
  } catch (error: any) {
    throw new Error("Error fetching updated jobs: " + error.message);
  }
};

const getDashboardData = async (userId: string): Promise<DashboardData> => {
  try {
    const dashboardDataDoc = await getDoc(doc(firestore, "dashboardData", userId));
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

const setAppliedJob = async (userId: string, jobId: string, appliedDate: string) => {
  try {
    const appliedJobsDoc = await getDoc(doc(firestore, "appliedJobs", userId));
    const appliedJobs = appliedJobsDoc.exists() ? appliedJobsDoc.data().appliedJobs : [];
    if (!appliedJobs.some((job: { jobId: string }) => job.jobId === jobId)) {
      appliedJobs.push({ jobId, appliedDate });
    }

    await setDoc(doc(firestore, "appliedJobs", userId), {
      appliedJobs: appliedJobs,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (error: any) {
    throw new Error("Error applying job: " + error.message);
  }
};

const updateJobStatus = async (userId: string, jobId: string, newStatus: string, currentStatus: string) => {
  try {
    console.log("Details: ", userId, jobId, newStatus, currentStatus);
    
    const jobTrackerDoc = await getDoc(doc(firestore, "appliedJobs", userId));
    if (jobTrackerDoc.exists()) {
      const jobTrackerData = jobTrackerDoc.data();
      const currentStatusJobs = jobTrackerData[currentStatus];
      const newStatusJobs = jobTrackerData[newStatus] ?? [];
      const jobIndex = currentStatusJobs.findIndex((job: { jobId: string }) => job.jobId === jobId);
      if (jobIndex !== -1) {
        const job = currentStatusJobs[jobIndex];
        currentStatusJobs.splice(jobIndex, 1);
        newStatusJobs.push(job);
      }
      await setDoc(doc(firestore, "appliedJobs", userId), {
        ...jobTrackerData,
        [currentStatus]: currentStatusJobs,
        [newStatus]: newStatusJobs,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
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

const updateDashboardOnJobApplied = async (userId: string, packageRange: string, locations: string, experienceRange: string) => {
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
    dashboardData.packageAppliedTo[generalPackageRange] = (dashboardData.packageAppliedTo[generalPackageRange] || 0) + 1;

    // Split locations and increment count for each
    const locationList = locations.split(",").map(location => location.trim());
    locationList.forEach(location => {
      dashboardData.location[location] = (dashboardData.location[location] || 0) + 1;
    });

    // Handle experience ranges
    const generalExperienceRanges = mapExperienceToRange(experienceRange);
    generalExperienceRanges.forEach(range => {
      dashboardData.experienceAppliedTo[range] = (dashboardData.experienceAppliedTo[range] || 0) + 1;
    });

    // Calculate averagePackage
    let totalPackages = 0;
    let totalJobs = 0;
    for (const [range, count] of Object.entries(dashboardData.packageAppliedTo)) {
      if (range !== "Unknown" && averageSalaryValues[range as keyof typeof averageSalaryValues] !== undefined) {
        totalPackages += averageSalaryValues[range as keyof typeof averageSalaryValues] * (count as number);
        totalJobs += count as number;
      }
    }
    dashboardData.averagePackage = totalJobs > 0 ? totalPackages / totalJobs : 0;

    // Calculate averageExperience
    let totalExperience = 0;
    let totalExperienceJobs = 0;
    for (const [range, count] of Object.entries(dashboardData.experienceAppliedTo)) {
      if (range !== "Unknown" && averageExperienceValues[range as keyof typeof averageExperienceValues] !== undefined) {
        totalExperience += averageExperienceValues[range as keyof typeof averageExperienceValues] * (count as number);
        totalExperienceJobs += count as number;
      }
    }
    dashboardData.averageExperience = totalExperienceJobs > 0 ? Math.round(totalExperience / totalExperienceJobs) : 0;

    await updateDashboardData(userId, dashboardData);
  } catch (error: any) {
    console.log(error);
    
    throw new Error("Error updating dashboard data: " + error.message);
  }
};

const getAppliedJobs = async(userId: string) => {
  try {
    const archivedJobsDoc = await getDoc(doc(firestore, "appliedJobs", userId));
    if(archivedJobsDoc.exists()) {
      return archivedJobsDoc.data().appliedJobs || [];
    } else {
      return [];
    }
  } catch (error: any) {
    throw new Error("Error fetching applied jobs: " + error.message);
  }
}

const updateDashboardData = async (userId: string, data: any) => {
  try {
    const currentDate = new Date().toISOString();
    const dashboardDataDoc = await getDoc(doc(firestore, "dashboardData", userId));
    const existingData = dashboardDataDoc.exists() ? dashboardDataDoc.data() : {};

    const updatedData = {
      ...existingData,
      ...data,
      updatedAt: currentDate,
    };

    await setDoc(doc(firestore, "dashboardData", userId), updatedData, { merge: true });
  } catch (error: any) {
    throw new Error(error.message);
  }
};

const getJobTrackerData = async (userId: string) => {
  try {
    const jobTrackerDoc = await getDoc(doc(firestore, "appliedJobs", userId));
    if (jobTrackerDoc.exists()) {
      return jobTrackerDoc.data();
    } else {
      throw new Error("Job tracker data not found");
    }
  } catch (error: any) {
    throw new Error("Error fetching job tracker data: " + error.message);
  }
};

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
  getHiddenJobs,
  setHideJob,
  getDashboardData,
  updateDashboardData,
  setAppliedJob,
  getAppliedJobs,
  updateDashboardOnJobApplied,
  updateJobStatus,
  getJobTrackerData,
};