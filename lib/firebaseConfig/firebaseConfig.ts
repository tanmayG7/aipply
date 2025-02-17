/* eslint-disable @typescript-eslint/no-explicit-any */
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { Job, UserDetails } from "../types";
import { getJobsByTitle, getJobsByIds } from "@/lib/mongo/mongo";

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

const hiddenJob = async (userId: string, jobId: string) => {
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
    const hiddenJobsDoc = await getDoc(doc(firestore, "hiddenJobs", userId));
    const hiddenJobs = hiddenJobsDoc.exists() ? hiddenJobsDoc.data().jobs : [];
    const filteredJobIds = jobIds.filter((jobId) => !hiddenJobs.includes(jobId));

    await setDoc(doc(firestore, "currentJobs", userId), {
      jobs: filteredJobIds,
      lastFetchedDate: currentDate,
    }, { merge: true });

    const archivedJobs = await getArchivedJobs(userId);
    const newArchivedJobs = [...archivedJobs, ...filteredJobIds];
    await setDoc(doc(firestore, "archiveJobs", userId), {
      jobs: newArchivedJobs,
      updatedAt: currentDate,
    }, { merge: true });
  } catch (error: any) {
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

const getUpdatedJobs = async (userId: string, userProfile: UserDetails) => {
  try {
    const currentJobsData = await getCurrentJobs(userId);
    const currentDate = new Date().toISOString().split("T")[0];

    if (
      currentJobsData &&
      currentJobsData.lastFetchedDate.split("T")[0] === currentDate
    ) {
      const jobIds = currentJobsData.jobs;
      return await getJobsByIds(jobIds);
    } else {
      const archivedJobs = await getArchivedJobs(userId);
      const hiddenJobsDoc = await getDoc(doc(firestore, "hiddenJobs", userId));
      const hiddenJobs = hiddenJobsDoc.exists() ? hiddenJobsDoc.data().jobs : [];
      const excludedJobs = new Set([...archivedJobs, ...hiddenJobs]);

      let newJobs: Job[] = [];
      let fetchedJobs: Job[] = [];
      let page = 0;
      const limit = 20;

      do {
        fetchedJobs = (await getJobsByTitle(userProfile.primaryRole, limit, page)) as Job[];
        newJobs = fetchedJobs.filter(job => !excludedJobs.has(job.jobId));
        page++;
      } while (newJobs.length === 0 && fetchedJobs.length === limit);

      const jobIds = newJobs.map(job => job.jobId);
      await saveCurrentJobs(userId, jobIds);
      return newJobs;
    }
  } catch (error: any) {
    throw new Error("Error fetching updated jobs: " + error.message);
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
  hiddenJob 
};