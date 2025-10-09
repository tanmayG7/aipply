/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  UserSubscription,
  PLAN_FEATURES,
  GRACE_PERIOD_DAYS,
  INDIA_TIMEZONE,
  FeatureAccess,
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
  fetchSignInMethodsForEmail,
  linkWithCredential,
  linkWithPopup,
  EmailAuthProvider,
  updatePassword,
  reauthenticateWithPopup,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  addDoc,
  collection,
  getDocs,
  query,
  orderBy,
  where,
} from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { Job, UserDetails, DashboardData } from "../types";
import { getFilteredJobsByTitlePaginatedWithFuzzy } from "@/lib/mongo/fuzzy-matcher";
import {
  getJobsByIds,
  getFilteredJobsByTitle,
  getJobByTitleandSkills,
  getFilteredJobsByTitlePaginated,
} from "@/lib/mongo/mongo";
import {
  mapSalaryToRange,
  mapExperienceToRange,
  determineJobType,
} from "../utils";
import {
  areCredentialsEncrypted,
  decryptPlatformCredentials,
  encryptPlatformCredentials,
  generateUserSalt,
} from "../security/encryptionUtils";

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

/**
 * Safely encrypt platform credentials before saving to Firebase
 */
const encryptCredentialsForStorage = (
  userId: string,
  credentials: Record<string, { email: string; password: string }>
): Record<string, any> => {
  try {
    // Generate user-specific salt
    const userSalt = generateUserSalt(userId);

    // Encrypt the credentials
    return encryptPlatformCredentials(credentials, userSalt);
  } catch (error) {
    console.error("Error encrypting credentials for storage:", error);
    throw new Error("Failed to encrypt credentials");
  }
};

//  * Safely decrypt platform credentials after retrieving from Firebase
const decryptCredentialsFromStorage = (
  encryptedCredentials: Record<string, any>
): Record<string, { email: string; password: string }> => {
  try {
    if (!areCredentialsEncrypted(encryptedCredentials)) {
      console.warn(
        "Credentials are not encrypted - this should not happen in production"
      );
      return encryptedCredentials as Record<
        string,
        { email: string; password: string }
      >;
    }

    return decryptPlatformCredentials(encryptedCredentials);
  } catch (error) {
    console.error("Error decrypting credentials from storage:", error);
    throw new Error("Failed to decrypt credentials");
  }
};

// ========== SUBSCRIPTION HELPER FUNCTIONS ==========

// Utility functions for date handling in IST
const getCurrentDateIST = (): string => {
  const now = new Date();
  const istDate = new Date(
    now.toLocaleString("en-US", { timeZone: INDIA_TIMEZONE })
  );
  return istDate.toISOString().split("T")[0]; // YYYY-MM-DD
};

const getCurrentMonthIST = (): string => {
  const now = new Date();
  const istDate = new Date(
    now.toLocaleString("en-US", { timeZone: INDIA_TIMEZONE })
  );
  return istDate.toISOString().substring(0, 7); // YYYY-MM
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
const resetUsageIfNeeded = (
  subscription: UserSubscription
): UserSubscription => {
  const currentDateIST = getCurrentDateIST();
  const currentMonthIST = getCurrentMonthIST();

  const updatedUsage = { ...subscription.usage };
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

  return hasChanged
    ? {
        ...subscription,
        usage: updatedUsage,
        updatedAt: new Date().toISOString(),
      }
    : subscription;
};

// Get effective subscription status considering grace period
const getEffectiveSubscriptionStatus = (
  subscription: UserSubscription
): string => {
  const now = new Date();
  const renewalDate = subscription.renewalDate
    ? new Date(subscription.renewalDate)
    : null;
  const gracePeriodEnd = subscription.gracePeriodEndDate
    ? new Date(subscription.gracePeriodEndDate)
    : null;

  // If subscription is active and renewal date hasn't passed
  if (
    subscription.subscriptionStatus === "premium" &&
    renewalDate &&
    now < renewalDate
  ) {
    return "premium";
  }

  // If subscription expired but still in grace period
  if (
    subscription.subscriptionStatus === "grace_period" &&
    gracePeriodEnd &&
    now < gracePeriodEnd
  ) {
    return "grace_period";
  }

  // If grace period ended or subscription cancelled
  if (
    subscription.subscriptionStatus === "expired" ||
    subscription.subscriptionStatus === "cancelled" ||
    (gracePeriodEnd && now >= gracePeriodEnd)
  ) {
    return "free";
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
    subscriptionStatus: "free",
    planType: null,
    planTier: "free",
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
    planCurrency: "INR",
    features: PLAN_FEATURES.free,
    usage: {
      autoApplyToday: 0,
      autoApplyThisMonth: 0,
      lastResetDate: currentDateIST,
      lastMonthlyResetDate: currentMonthIST,
      timezone: "Asia/Kolkata",
    },
    createdAt: currentDate,
    updatedAt: currentDate,
  };
};

// ========== MAIN SUBSCRIPTION FUNCTIONS ==========

// Create a new subscription for a user
const createUserSubscription = async (
  userId: string
): Promise<UserSubscription> => {
  try {
    const subscription = createDefaultSubscription(userId);
    await setDoc(doc(firestore, "subscriptions", userId), subscription);
    console.log(`Created default subscription for user: ${userId}`);
    return subscription;
  } catch (error: any) {
    console.error("Error creating user subscription:", error);
    throw new Error(`Failed to create subscription: ${error.message}`);
  }
};

// Get user subscription
const getUserSubscription = async (
  userId: string
): Promise<UserSubscription> => {
  try {
    const subscriptionDoc = await getDoc(
      doc(firestore, "subscriptions", userId)
    );

    if (subscriptionDoc.exists()) {
      const subscription = subscriptionDoc.data() as UserSubscription;
      // Always reset usage if needed when fetching
      const updatedSubscription = resetUsageIfNeeded(subscription);

      // Save back to DB if usage was reset
      if (updatedSubscription.updatedAt !== subscription.updatedAt) {
        await setDoc(
          doc(firestore, "subscriptions", userId),
          updatedSubscription
        );
      }

      return updatedSubscription;
    } else {
      // Create default subscription if doesn't exist
      console.log(`No subscription found for user ${userId}, creating default`);
      return await createUserSubscription(userId);
    }
  } catch (error: any) {
    console.error("Error getting user subscription:", error);
    throw new Error(`Failed to get subscription: ${error.message}`);
  }
};

// Update user subscription
const updateUserSubscription = async (
  userId: string,
  updates: Partial<UserSubscription>
): Promise<void> => {
  try {
    const currentSubscription = await getUserSubscription(userId);
    const updatedSubscription = {
      ...currentSubscription,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await setDoc(doc(firestore, "subscriptions", userId), updatedSubscription);
    console.log(`Updated subscription for user: ${userId}`);
  } catch (error: any) {
    console.error("Error updating user subscription:", error);
    throw new Error(`Failed to update subscription: ${error.message}`);
  }
};

// Check if user can use a specific feature
const canUseFeature = async (
  userId: string,
  feature: keyof UserSubscription["features"]
): Promise<FeatureAccess> => {
  try {
    const subscription = await getUserSubscription(userId);
    const effectiveStatus = getEffectiveSubscriptionStatus(subscription);

    // For auto-apply, check usage limits
    if (feature === "autoApply") {
      if (effectiveStatus === "free") {
        return { allowed: false, reason: "upgrade_required" };
      }

      if (effectiveStatus === "premium" || effectiveStatus === "grace_period") {
        if (
          subscription.usage.autoApplyToday >=
          subscription.features.maxAutoApplyPerDay
        ) {
          return { allowed: false, reason: "daily_limit_reached" };
        }

        if (
          subscription.usage.autoApplyThisMonth >=
          subscription.features.maxAutoApplyPerMonth
        ) {
          return { allowed: false, reason: "monthly_limit_reached" };
        }

        return { allowed: true };
      }
    }

    // For boolean features, check if enabled
    if (typeof subscription.features[feature] === "boolean") {
      const hasFeature = subscription.features[feature] as boolean;
      if (!hasFeature && effectiveStatus === "free") {
        return { allowed: false, reason: "upgrade_required" };
      }
      return { allowed: hasFeature };
    }

    // For number features (like maxAutoApplyPerDay), they're always "allowed" if > 0
    if (typeof subscription.features[feature] === "number") {
      const featureValue = subscription.features[feature] as number;
      if (featureValue === 0 && effectiveStatus === "free") {
        return { allowed: false, reason: "upgrade_required" };
      }
      return { allowed: featureValue > 0 };
    }

    // Default case
    return { allowed: false, reason: "unknown_error" };
  } catch (error: any) {
    console.error(`Error checking feature access for ${feature}:`, error);
    return { allowed: false, reason: "unknown_error" };
  }
};

// Increment auto-apply usage
const incrementAutoApplyUsage = async (userId: string): Promise<boolean> => {
  try {
    const subscription = await getUserSubscription(userId);

    // Check if user can use auto-apply
    const canUse = await canUseFeature(userId, "autoApply");
    if (!canUse.allowed) {
      console.log(`User ${userId} cannot use auto-apply: ${canUse.reason}`);
      return false;
    }

    // Increment usage
    const updatedUsage = {
      ...subscription.usage,
      autoApplyToday: subscription.usage.autoApplyToday + 1,
      autoApplyThisMonth: subscription.usage.autoApplyThisMonth + 1,
    };

    await updateUserSubscription(userId, { usage: updatedUsage });
    console.log(`Incremented auto-apply usage for user ${userId}`);
    return true;
  } catch (error: any) {
    console.error("Error incrementing auto-apply usage:", error);
    return false;
  }
};

// Get subscription status with warnings
const getSubscriptionStatusWithWarnings = async (userId: string) => {
  try {
    const subscription = await getUserSubscription(userId);
    const effectiveStatus = getEffectiveSubscriptionStatus(subscription);
    const warnings: string[] = [];

    if (effectiveStatus === "grace_period") {
      const gracePeriodEnd = subscription.gracePeriodEndDate
        ? new Date(subscription.gracePeriodEndDate)
        : null;
      if (gracePeriodEnd) {
        const daysLeft = Math.ceil(
          (gracePeriodEnd.getTime() - new Date().getTime()) /
            (1000 * 60 * 60 * 24)
        );
        warnings.push(
          `Your subscription expired. You have ${daysLeft} days left to renew and keep your premium features.`
        );
      }
    }

    return {
      subscription,
      effectiveStatus,
      warnings,
      usage: subscription.usage,
    };
  } catch (error: any) {
    console.error("Error getting subscription status:", error);
    throw new Error(`Failed to get subscription status: ${error.message}`);
  }
};

// Check subscription status (simplified version)
const checkSubscriptionStatus = async (
  userId: string
): Promise<"free" | "premium" | "grace_period"> => {
  try {
    const subscription = await getUserSubscription(userId);
    return getEffectiveSubscriptionStatus(subscription) as
      | "free"
      | "premium"
      | "grace_period";
  } catch (error: any) {
    console.error("Error checking subscription status:", error);
    return "free"; // Default to free on error
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
  status: "new" | "read" | "responded";
};

const CONTACT_SUBMISSIONS_COLLECTION = "contactSubmissions";
const INITIAL_SUBMISSION_STATUS = "new";

// Helper function to create submission data
const createSubmissionData = (
  formData: ContactFormData
): ContactSubmissionData => {
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
    const contactSubmissionsRef = collection(
      firestore,
      CONTACT_SUBMISSIONS_COLLECTION
    );

    // Add the document to Firestore
    const docRef = await addDoc(contactSubmissionsRef, submissionData);

    // Return success response with document ID
    const response = {
      success: true,
      id: docRef.id,
    };

    return response;
  } catch (error: any) {
    // Log the error for debugging
    console.error("Error saving contact form:", error);

    // Throw a new error with the message
    const errorMessage =
      error.message || "Failed to save contact form submission";
    throw new Error(errorMessage);
  }
};

// Get all contact submissions (for admin panel)
const getContactSubmissions = async () => {
  try {
    const querySnapshot = await getDocs(
      query(
        collection(firestore, CONTACT_SUBMISSIONS_COLLECTION),
        orderBy("submittedAt", "desc")
      )
    );

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error: any) {
    console.error("Error fetching contact submissions:", error);
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

// ========== UNIFIED AUTHENTICATION SYSTEM ==========

// Helper functions for account linking memory
const setAccountLinkingFlag = (email: string, hasPassword: boolean) => {
  try {
    const linkingData = JSON.parse(localStorage.getItem('aipply_account_linking') || '{}');
    linkingData[email] = { hasPassword, timestamp: Date.now() };
    localStorage.setItem('aipply_account_linking', JSON.stringify(linkingData));
  } catch (error) {
    console.warn("Could not save account linking data:", error);
  }
};

const getAccountLinkingFlag = (email: string): { hasPassword: boolean } | null => {
  try {
    const linkingData = JSON.parse(localStorage.getItem('aipply_account_linking') || '{}');
    const data = linkingData[email];
    // Consider data valid for 24 hours
    if (data && (Date.now() - data.timestamp) < 24 * 60 * 60 * 1000) {
      return { hasPassword: data.hasPassword };
    }
  } catch (error) {
    console.warn("Could not read account linking data:", error);
  }
  return null;
};

// Check what sign-in methods are available for an email
const checkEmailSignInMethods = async (email: string) => {
  try {
    console.log("🔍 Checking sign-in methods for email:", email);
    
    // First check our local storage cache
    const cachedData = getAccountLinkingFlag(email);
    if (cachedData) {
      console.log("💾 Using cached account linking data:", cachedData);
    }
    
    const signInMethods = await fetchSignInMethodsForEmail(auth, email);
    console.log("🔍 Raw Firebase signInMethods:", signInMethods);
    
    const result = {
      hasPassword: signInMethods.includes("password") || (cachedData?.hasPassword ?? false),
      hasGoogle: signInMethods.includes("google.com"),
      methods: signInMethods,
      exists: signInMethods.length > 0
    };
    
    // If we have cached data indicating password exists but Firebase API doesn't show it,
    // trust our cache since Firebase API is unreliable for linked accounts
    if (cachedData?.hasPassword && !signInMethods.includes("password")) {
      console.log("💾 Firebase API missing password method, using cached data");
      result.hasPassword = true;
      result.exists = true;
    }
    
    console.log("🔍 Final processed result:", result);
    return result;
  } catch (error) {
    console.error("❌ Error checking email methods:", error);
    return { hasPassword: false, hasGoogle: false, methods: [], exists: false };
  }
};

// Link email/password to existing Google account
const linkEmailPasswordToAccount = async (email: string, password: string) => {
  const user = auth.currentUser;
  if (!user) throw new Error("No user is currently signed in");
  
  try {
    const credential = EmailAuthProvider.credential(email, password);
    await linkWithCredential(user, credential);
    return { success: true, message: "Email/password linked successfully" };
  } catch (error: any) {
    if (error.code === "auth/credential-already-in-use") {
      throw new Error("This email is already in use with another account");
    } else if (error.code === "auth/email-already-in-use") {
      throw new Error("This email is already associated with another account");
    } else if (error.code === "auth/weak-password") {
      throw new Error("Password should be at least 6 characters");
    }
    throw new Error(error.message);
  }
};

// Link Google account to existing email/password account
const linkGoogleToAccount = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error("No user is currently signed in");
  
  try {
    await linkWithPopup(user, provider);
    return { success: true, message: "Google account linked successfully" };
  } catch (error: any) {
    if (error.code === "auth/credential-already-in-use") {
      throw new Error("This Google account is already linked to another user");
    } else if (error.code === "auth/popup-closed-by-user") {
      throw new Error("Google sign-in was cancelled");
    }
    throw new Error(error.message);
  }
};

// Setup password for Google-only accounts
const setupPasswordForGoogleAccount = async (password: string) => {
  const user = auth.currentUser;
  if (!user) throw new Error("No user is currently signed in");
  
  try {
    const credential = EmailAuthProvider.credential(user.email!, password);
    await linkWithCredential(user, credential);
    return { success: true, message: "Password set up successfully" };
  } catch (error: any) {
    if (error.code === "auth/weak-password") {
      throw new Error("Password should be at least 6 characters");
    } else if (error.code === "auth/credential-already-in-use") {
      throw new Error("This email already has a password set up");
    }
    throw new Error(error.message);
  }
};

// Enhanced unified authentication function
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
      // Google Sign-in
      userCredential = await signInWithPopup(auth, provider);
    } else {
      // Email/Password flow - Try sign in first, then create account
      try {
        // First attempt: Try to sign in with existing account
        userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log("✅ Sign in successful for existing user");
      } catch (signInError: any) {
        console.log("📝 Sign in failed, checking error:", signInError.code);

        // Handle different sign-in errors
        try {
          await handleSignInError(signInError, email, password, setError, navigate);
          return; // Early return since handleSignInError will handle navigation
        } catch (handleError: any) {
          console.error("❌ Error in handleSignInError:", handleError.message);
          // Let the error propagate to be caught by the outer catch block
          throw handleError;
        }
      }
    }

    // Common post-authentication logic
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
    console.error("❌ Authentication error:", error.message || error);

    // Don't re-wrap GOOGLE_ONLY_ACCOUNT errors
    if (error.message === "GOOGLE_ONLY_ACCOUNT") {
      throw error;
    }

    // For other errors, ensure we have a meaningful error message
    if (!error.message || error.message === "undefined") {
      console.error("❌ Caught error with no message:", error);
      setError("An unexpected error occurred. Please try again or contact support.");
      throw new Error("Authentication failed");
    }

    // Log the error for debugging
    console.error("❌ Full authentication error details:", {
      message: error.message,
      code: error.code,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });

    throw new Error(error.message);
  }
};

// Helper function to handle sign-in errors
const handleSignInError = async (
  signInError: any,
  email: string,
  password: string,
  setError: (message: string) => void,
  navigate: (path: string) => void
) => {
  if (signInError.code === "auth/user-not-found" || signInError.code === "auth/invalid-credential") {
    // Could be: user doesn't exist OR wrong password OR Google-only account
    const emailMethods = await checkEmailSignInMethods(email);
    
    if (!emailMethods.exists) {
      // User doesn't exist, create new account
      console.log("👤 Creating new user account for:", email);
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        // New user - redirect to profile setup
        const user = userCredential.user;
        console.log("✅ User account created successfully:", user.uid);

        const token = await user.getIdToken();
        localStorage.setItem("firebaseToken", token);
        console.log("✅ Token saved, navigating to profile setup");

        navigate("/dashboard/onboarding/profile-setup");
        return user;
      } catch (createError: any) {
        console.error("❌ Error creating user account:", createError.code, createError.message);

        if (createError.code === "auth/email-already-in-use") {
          // Email exists but createUserWithEmailAndPassword failed
          // This means it's likely a Google-only account
          console.log("🔍 Email already in use - checking for Google-only account");
          const emailMethods = await checkEmailSignInMethods(email);
          console.log("📧 Email methods result:", emailMethods);

          if (emailMethods.hasGoogle && !emailMethods.hasPassword) {
            console.log("✅ Confirmed Google-only account - showing password setup");
            setError("🔍 This email is registered with Google only");
            throw new Error("GOOGLE_ONLY_ACCOUNT");
          } else if (emailMethods.hasGoogle && emailMethods.hasPassword) {
            console.log("🔗 Account has both Google and password - wrong password");
            setError("Incorrect password. Please try again.");
            throw new Error("Incorrect password");
          } else if (!emailMethods.exists || emailMethods.methods.length === 0) {
            // Firebase fetchSignInMethodsForEmail is unreliable for OAuth accounts
            // We need a more sophisticated approach to determine the account type
            console.log("🔧 Firebase API returned empty methods but email exists");

            // Strategy: Try to differentiate between wrong password and Google-only account
            // by attempting a secondary verification

            // For now, we'll err on the side of assuming wrong password for better UX
            // since the user is trying to use email/password login
            console.log("🤔 Assuming wrong password since user is attempting email/password login");
            setError("Incorrect password. If this email was registered with Google, please use 'Sign in with Google' instead.");
            throw new Error("Incorrect password");
          } else {
            console.log("❓ Unknown email state:", emailMethods);
            setError("An account with this email already exists. Please try signing in.");
            throw new Error("Email already in use");
          }
        } else if (createError.code === "auth/weak-password") {
          console.log("❌ Weak password error");
          setError("Password should be at least 6 characters.");
          throw new Error("Weak password");
        } else if (createError.code === "auth/invalid-email") {
          console.log("❌ Invalid email error");
          setError("Please enter a valid email address.");
          throw new Error("Invalid email");
        } else if (createError.code === "auth/operation-not-allowed") {
          console.log("❌ Operation not allowed error");
          setError("Email/password accounts are not enabled. Please contact support.");
          throw new Error("Operation not allowed");
        } else if (createError.code === "auth/network-request-failed") {
          console.log("❌ Network error");
          setError("Network error. Please check your internet connection and try again.");
          throw new Error("Network error");
        } else {
          // Log the unexpected error for debugging
          console.error("❌ Unexpected error during account creation:", {
            code: createError.code,
            message: createError.message,
            email: email,
            timestamp: new Date().toISOString()
          });
          setError(`Unable to create account: ${createError.message}. Please try again or contact support.`);
          throw new Error(createError.message || "Account creation failed");
        }
      }
    } else if (emailMethods.hasGoogle && !emailMethods.hasPassword) {
      // Email exists with Google only
      console.log("🔍 Google-only account detected");
      setError("🔍 This email is registered with Google only");
      throw new Error("GOOGLE_ONLY_ACCOUNT");
    } else if (emailMethods.hasPassword) {
      // Email exists with password, so it's wrong password
      console.log("🔑 Wrong password for existing account");
      setError("Incorrect password. Please try again.");
      throw new Error("Incorrect password");
    } else {
      setError("Unable to sign in. Please check your credentials.");
      throw new Error("Unknown authentication state");
    }
  } else if (signInError.code === "auth/wrong-password") {
    setError("Incorrect password. Please try again.");
    throw new Error("Incorrect password");
  } else if (signInError.code === "auth/invalid-email") {
    setError("Please enter a valid email address.");
    throw new Error("Invalid email");
  } else if (signInError.code === "auth/user-disabled") {
    setError("This account has been disabled.");
    throw new Error("Account disabled");
  } else {
    // Check if it's a Google-only account
    const emailMethods = await checkEmailSignInMethods(email);
    if (emailMethods.hasGoogle && !emailMethods.hasPassword) {
      setError("🔍 This email is registered with Google only");
      throw new Error("GOOGLE_ONLY_ACCOUNT");
    } else {
      setError(signInError.message);
      throw new Error(signInError.message);
    }
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
    const processedProfileData = { ...profileData };

    // If platformCredentials are being saved, encrypt them
    if (profileData.platformCredentials) {
      console.log("Encrypting platform credentials before saving...");

      // Check if credentials are already encrypted
      if (!areCredentialsEncrypted(profileData.platformCredentials)) {
        // Convert to the format expected by encryption function
        const credentialsToEncrypt: Record<
          string,
          { email: string; password: string }
        > = {};

        Object.entries(profileData.platformCredentials).forEach(
          ([platform, creds]: [string, any]) => {
            if (creds && creds.email && creds.password) {
              credentialsToEncrypt[platform] = {
                email: creds.email,
                password: creds.password,
              };
            }
          }
        );

        // Encrypt the credentials
        const encryptedCredentials = encryptCredentialsForStorage(
          userId,
          credentialsToEncrypt
        );
        processedProfileData.platformCredentials = encryptedCredentials;

        console.log("Platform credentials encrypted successfully");
      } else {
        console.log("Credentials already encrypted, skipping encryption");
      }
    }

    await setDoc(
      doc(firestore, "users", userId),
      {
        ...processedProfileData,
        onboardingCompleted: processedProfileData.onboardingCompleted || false,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    console.log("User profile saved successfully with encrypted credentials");
  } catch (error: any) {
    console.error("Error saving user profile:", error);
    throw new Error(`Failed to save profile: ${error.message}`);
  }
};

const getUserProfile = async (userId?: string): Promise<UserDetails> => {
  try {
    if (!userId) {
      const user = auth.currentUser;
      if (!user) throw new Error("No user is currently signed in");
      userId = user.uid;
    }

    const userDoc = await getDoc(doc(firestore, "users", userId));
    if (userDoc.exists()) {
      const userData = userDoc.data() as UserDetails;
      userData.userId = userId;

      // Decrypt platform credentials if they exist and are encrypted
      if (
        userData.platformCredentials &&
        areCredentialsEncrypted(userData.platformCredentials)
      ) {
        try {
          console.log("Decrypting platform credentials...");
          const decryptedCredentials = decryptCredentialsFromStorage(
            userData.platformCredentials
          );
          userData.platformCredentials = decryptedCredentials;
          console.log("Platform credentials decrypted successfully");
        } catch (decryptError) {
          console.error("Error decrypting credentials:", decryptError);
          // If decryption fails, clear the credentials to prevent app crashes
          userData.platformCredentials = {};
          console.warn(
            "Cleared corrupted credentials due to decryption failure"
          );
        }
      }

      return userData;
    } else {
      throw new Error("User profile not found");
    }
  } catch (error: any) {
    console.error("Error getting user profile:", error);
    throw new Error(`Failed to get profile: ${error.message}`);
  }
};

const updateUserProfile = async (userId: string, profileData: any) => {
  try {
    const currentDate = new Date().toISOString();
    const processedProfileData = { ...profileData };

    // If platformCredentials are being updated, encrypt them
    if (profileData.platformCredentials) {
      console.log("Encrypting platform credentials for update...");

      if (!areCredentialsEncrypted(profileData.platformCredentials)) {
        const credentialsToEncrypt: Record<
          string,
          { email: string; password: string }
        > = {};

        Object.entries(profileData.platformCredentials).forEach(
          ([platform, creds]: [string, any]) => {
            if (creds && creds.email && creds.password) {
              credentialsToEncrypt[platform] = {
                email: creds.email,
                password: creds.password,
              };
            }
          }
        );

        const encryptedCredentials = encryptCredentialsForStorage(
          userId,
          credentialsToEncrypt
        );
        processedProfileData.platformCredentials = encryptedCredentials;
      }
    }

    const updatedProfileData = {
      ...processedProfileData,
      lastPreferenceChangedDate: currentDate,
      updatedDate: currentDate,
      createdDate: profileData.createdDate || currentDate,
    };

    await setDoc(doc(firestore, "users", userId), updatedProfileData, {
      merge: true,
    });

    console.log("User profile updated successfully with encrypted credentials");
  } catch (error: any) {
    console.error("Error updating user profile:", error);
    throw new Error(`Failed to update profile: ${error.message}`);
  }
};

// ========== NEW FUNCTIONS FOR CREDENTIAL MANAGEMENT ==========

/**
 * Save only platform credentials (with encryption)
 */
const savePlatformCredentials = async (
  userId: string,
  credentials: Record<string, { email: string; password: string }>
): Promise<void> => {
  try {
    console.log("Saving platform credentials...");

    // Encrypt credentials before saving
    const encryptedCredentials = encryptCredentialsForStorage(
      userId,
      credentials
    );

    await setDoc(
      doc(firestore, "users", userId),
      {
        platformCredentials: encryptedCredentials,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    console.log("Platform credentials saved and encrypted successfully");
  } catch (error: any) {
    console.error("Error saving platform credentials:", error);
    throw new Error(`Failed to save credentials: ${error.message}`);
  }
};

/**
 * Get only platform credentials (with decryption)
 */
const getPlatformCredentials = async (
  userId: string
): Promise<Record<string, { email: string; password: string }>> => {
  try {
    const userDoc = await getDoc(doc(firestore, "users", userId));

    if (userDoc.exists()) {
      const userData = userDoc.data();

      if (userData.platformCredentials) {
        if (areCredentialsEncrypted(userData.platformCredentials)) {
          console.log("Decrypting platform credentials...");
          return decryptCredentialsFromStorage(userData.platformCredentials);
        } else {
          console.warn("Platform credentials are not encrypted");
          return userData.platformCredentials as Record<
            string,
            { email: string; password: string }
          >;
        }
      }
    }

    return {}; // Return empty object if no credentials found
  } catch (error: any) {
    console.error("Error getting platform credentials:", error);
    throw new Error(`Failed to get credentials: ${error.message}`);
  }
};

/**
 * Delete platform credentials for a specific platform
 */
const deletePlatformCredential = async (
  userId: string,
  platform: string
): Promise<void> => {
  try {
    const userProfile: any = await getUserProfile(userId);

    if (
      userProfile.platformCredentials &&
      userProfile.platformCredentials[platform]
    ) {
      // Remove the platform credentials
      const updatedCredentials = { ...userProfile.platformCredentials };
      delete updatedCredentials[platform];

      // Save updated credentials (will be encrypted automatically)
      await savePlatformCredentials(userId, updatedCredentials);

      console.log(`Deleted credentials for platform: ${platform}`);
    }
  } catch (error: any) {
    console.error(`Error deleting credentials for ${platform}:`, error);
    throw new Error(`Failed to delete credentials: ${error.message}`);
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

const getCurrentJobsByJobTitle = async (
  userId: string,
  userProfile: UserDetails
) => {
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
        userProfile.workexperience
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

      const fetchedJobs: any = (await getFilteredJobsByTitle(
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

// IMPROVED PAGINATED VERSION FOR INFINITE JOBS WITH ACCURATE FILTERING
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
  }
) => {
  try {
    console.log(
      `[getUpdatedJobsPaginated] Starting infinite pagination - Page: ${page}, PageSize: ${pageSize}`
    );

    if (!userProfile.jobTitle) {
      throw new Error("Primary role not found in user profile");
    }

    // Get excluded jobs
    const archivedJobs = await getArchivedJobs(userId);
    const hiddenJobs = await getHiddenJobs(userId);
    const excludedJobs = new Set([...archivedJobs, ...hiddenJobs]);

    console.log(
      `[getUpdatedJobsPaginated] Excluded jobs - Archived: ${archivedJobs.length}, Hidden: ${hiddenJobs.length}`
    );

    // Check if we have filters/search applied
    const hasFilters =
      (searchTerm && searchTerm.trim()) ||
      (filters?.salaryRange && filters.salaryRange.length > 0) ||
      (filters?.experience && filters.experience.length > 0) ||
      (filters?.jobType && filters.jobType.length > 0) ||
      (filters?.platform && filters.platform.length > 0);

    console.log(`[getUpdatedJobsPaginated] Has filters/search: ${hasFilters}`);

    if (!hasFilters) {
      // NO FILTERS: Use database-level pagination for infinite jobs
      console.log(
        `[getUpdatedJobsPaginated] No filters - using direct database pagination`
      );

      // Get jobs directly from database with pagination
      const result = await getFilteredJobsByTitlePaginatedWithFuzzy(
        userProfile.jobTitle,
        excludedJobs,
        userProfile,
        page,
        pageSize,
        0.6 // minSimilarity
      );

      if (!result || !result.jobs) {
        console.error(
          `[getUpdatedJobsPaginated] Invalid result from database:`,
          result
        );
        return {
          jobs: [],
          currentPage: page,
          totalPages: 0,
          totalJobs: 0,
          hasMore: false,
          debugInfo: null,
        };
      }

      console.log(
        `[getUpdatedJobsPaginated] Database returned: ${
          result.jobs.length
        } jobs, total: ${result.totalCount || "unknown"}`
      );

      // Sanitize and return jobs
      console.log(`[DEBUG] Before sanitization: ${result.jobs.length} jobs`);
      result.jobs.forEach((job: any, index: number) => {
        console.log(
          `[DEBUG] Job ${index}: jobId="${job.jobId}", _id="${
            job._id
          }", hasJobId=${!!job.jobId}`
        );
      });

      const sanitizedJobs = result.jobs
        .map((job: any) => ({
          ...job,
          _id: job._id?.toString(),
        }))
        .filter((job) => {
          const isValid = job && job.jobId;
          if (!isValid) {
            console.log(
              `[DEBUG] Filtered out job: jobId="${job?.jobId}", _id="${job?._id}"`
            );
          }
          return isValid;
        });

      console.log(`[DEBUG] After sanitization: ${sanitizedJobs.length} jobs`);

      // Calculate pagination info
      const totalJobs = result.totalCount || 0;
      const totalPages = totalJobs > 0 ? Math.ceil(totalJobs / pageSize) : 0;

      const finalResult = {
        jobs: sanitizedJobs,
        currentPage: page,
        totalPages: totalPages,
        totalJobs: totalJobs,
        hasMore: page < totalPages,
        debugInfo: result.debugInfo || null,
      };

      console.log(`[getUpdatedJobsPaginated] No-filter result:`, {
        jobCount: finalResult.jobs.length,
        currentPage: finalResult.currentPage,
        totalPages: finalResult.totalPages,
        totalJobs: finalResult.totalJobs,
        hasMore: finalResult.hasMore,
      });

      console.log(
        `[DEBUG] Final jobs sample:`,
        finalResult.jobs.slice(0, 2).map((j) => ({
          jobId: j.jobId,
          title: j.title,
          _id: j._id,
        }))
      );

      // Update dashboard with jobs shown
      if (sanitizedJobs.length > 0 && page === 1) {
        const dashboardData = await getDashboardData(userId);
        dashboardData.totalJobsShown += sanitizedJobs.length;
        await updateDashboardData(userId, dashboardData);
      }

      return finalResult;
    }

    // WITH FILTERS: We need to fetch more data and apply client-side filtering
    console.log(
      `[getUpdatedJobsPaginated] Filters detected - fetching larger dataset for accurate filtering`
    );

    // TODO: Implement server-side filtering to avoid large client-side batches.
    // For now, reduce batch size to 2 pages worth to reduce client-side load
    const batchSize = pageSize * 2; // Fetch 2 pages worth to reduce client-side load
    const batchPage = 1; // Always start from page 1 when filtering

    const result = await getFilteredJobsByTitlePaginatedWithFuzzy(
      userProfile.jobTitle,
      excludedJobs,
      userProfile,
      batchPage,
      batchSize,
      0.6 // minSimilarity
    );

    if (!result || !result.jobs) {
      console.error(
        `[getUpdatedJobsPaginated] Invalid result for filtering:`,
        result
      );
      return {
        jobs: [],
        currentPage: page,
        totalPages: 0,
        totalJobs: 0,
        hasMore: false,
        debugInfo: null,
      };
    }

    let allJobs = result.jobs;
    console.log(
      `[getUpdatedJobsPaginated] Retrieved ${allJobs.length} jobs for filtering`
    );

    // Apply search filter
    if (searchTerm && searchTerm.trim()) {
      const originalLength = allJobs.length;
      allJobs = allJobs.filter((job: Job) => {
        if (!job) return false;

        const searchLower = searchTerm.toLowerCase();

        const locationMatch = Array.isArray(job.location)
          ? job.location.some(
              (loc: string) => loc && loc.toLowerCase().includes(searchLower)
            )
          : job.location?.toLowerCase().includes(searchLower);

        return (
          (job.title && job.title.toLowerCase().includes(searchLower)) ||
          (job.company && job.company.toLowerCase().includes(searchLower)) ||
          locationMatch ||
          (job.tags &&
            job.tags.some(
              (tag: string) => tag && tag.toLowerCase().includes(searchLower)
            ))
        );
      });

      console.log(
        `[getUpdatedJobsPaginated] Search filtered: ${originalLength} -> ${allJobs.length}`
      );
    }

    // Apply salary filter
    if (filters?.salaryRange && filters.salaryRange.length > 0) {
      const originalLength = allJobs.length;
      allJobs = allJobs.filter((job: Job) => {
        if (!job.salary || !Array.isArray(job.salary)) return false;

        const jobSalaryRanges = job.salary.map((salaryStr: string) => {
          const cleanSalary = salaryStr.toLowerCase().trim();
          let min = 0,
            max = 0;

          if (
            cleanSalary.includes("lakhs") ||
            cleanSalary.includes("lacs") ||
            cleanSalary.includes("lpa")
          ) {
            const numbers = cleanSalary.match(/\d+\.?\d*/g);
            if (numbers) {
              if (
                cleanSalary.includes("+") ||
                cleanSalary.includes("above") ||
                cleanSalary.includes(">")
              ) {
                min = parseFloat(numbers[0]) * 100000;
                max = Infinity;
              } else if (numbers.length >= 2) {
                min = parseFloat(numbers[0]) * 100000;
                max = parseFloat(numbers[1]) * 100000;
              } else {
                min = parseFloat(numbers[0]) * 100000;
                max = min;
              }
            }
          }

          return [min, max] as [number, number];
        });

        return jobSalaryRanges.some(([jobMin, jobMax]) =>
          filters.salaryRange!.some(([filterMin, filterMax]) => {
            return jobMin <= filterMax && jobMax >= filterMin;
          })
        );
      });
      console.log(
        `[getUpdatedJobsPaginated] Salary filter: ${originalLength} -> ${allJobs.length}`
      );
    }

    // Apply experience filter
    if (filters?.experience && filters.experience.length > 0) {
      const originalLength = allJobs.length;
      allJobs = allJobs.filter((job: Job) => {
        if (!job.experience) return false;

        const expStr = job.experience.toLowerCase().trim();
        let jobExpMin = 0,
          jobExpMax = 0;

        const numbers = expStr.match(/\d+\.?\d*/g);
        if (numbers) {
          if (numbers.length >= 2) {
            jobExpMin = parseFloat(numbers[0]);
            jobExpMax = parseFloat(numbers[1]);
          } else {
            jobExpMin = parseFloat(numbers[0]);
            jobExpMax = jobExpMin;
          }
        }

        return filters.experience!.some(([filterMin, filterMax]) => {
          return jobExpMin <= filterMax && jobExpMax >= filterMin;
        });
      });
      console.log(
        `[getUpdatedJobsPaginated] Experience filter: ${originalLength} -> ${allJobs.length}`
      );
    }

    // Apply job type filter
    if (filters?.jobType && filters.jobType.length > 0) {
      const originalLength = allJobs.length;
      allJobs = allJobs.filter((job: Job) => {
        let normalizedJobType = "";
        if (job.type) {
          normalizedJobType = job.type.toLowerCase().trim();
        } else {
          normalizedJobType = determineJobType(job.description || "")
            .toLowerCase()
            .trim();
        }

        return filters.jobType!.includes(normalizedJobType);
      });
      console.log(
        `[getUpdatedJobsPaginated] Job type filter: ${originalLength} -> ${allJobs.length}`
      );
    }

    // Apply platform filter
    if (filters?.platform && filters.platform.length > 0) {
      const originalLength = allJobs.length;
      allJobs = allJobs.filter((job: Job) => {
        return filters.platform?.includes(job.platform || "Unknown");
      });
      console.log(
        `[getUpdatedJobsPaginated] Platform filter: ${originalLength} -> ${allJobs.length}`
      );
    }

    // Calculate pagination from filtered results
    const totalFiltered = allJobs.length;
    const totalPages = Math.ceil(totalFiltered / pageSize);

    // Get current page slice
    const start = (page - 1) * pageSize;
    const end = Math.min(start + pageSize, totalFiltered);
    const pageJobs = allJobs.slice(start, end);

    console.log(
      `[getUpdatedJobsPaginated] Filtered pagination - Total: ${totalFiltered}, Pages: ${totalPages}, Current: ${pageJobs.length}`
    );

    // Sanitize jobs
    const sanitizedJobs = pageJobs
      .map((job: any) => ({
        ...job,
        _id: job._id?.toString(),
      }))
      .filter((job) => job && job.jobId);

    const finalResult = {
      jobs: sanitizedJobs,
      currentPage: page,
      totalPages: totalPages,
      totalJobs: totalFiltered,
      hasMore: page < totalPages,
      debugInfo: result.debugInfo || null,
    };

    console.log(`[getUpdatedJobsPaginated] Filtered result:`, {
      jobCount: finalResult.jobs.length,
      currentPage: finalResult.currentPage,
      totalPages: finalResult.totalPages,
      totalJobs: finalResult.totalJobs,
      hasMore: finalResult.hasMore,
    });

    return finalResult;
  } catch (error: any) {
    console.error(`[getUpdatedJobsPaginated] Error:`, error);
    throw new Error("Error fetching paginated jobs: " + error.message);
  }
};

// Function to get total job count
const getTotalJobCount = async (userId: string, userProfile: UserDetails) => {
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
      userProfile.jobTitle || "",
      excludedJobs,
      userProfile,
      1,
      1
    );

    return result.totalCount || 0;
  } catch (error: any) {
    console.error("Error getting job count:", error);
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
    const jobsRef = collection(firestore, "appliedJobs");
    const jobsQuery = query(jobsRef, where("userId", "==", userId));
    const jobsSnapshot = await getDocs(jobsQuery);

    const jobs = jobsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return jobs;
  } catch (error: any) {
    throw new Error("Error fetching applied jobs: " + error.message);
  }
}


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
    const jobsRef = collection(firestore, "appliedJobs");
    const jobsQuery = query(jobsRef, where("userId", "==", userId));
    const jobsSnapshot = await getDocs(jobsQuery);

    const appliedJobs: any[] = [];
    const personalArchive: any[] = [];
    const followUp: any[] = [];
    const noReply: any[] = [];


       const jobs = jobsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return jobs;
 


    // return {
    //   appliedJobs,
    //   personalArchive,
    //   followUp,
    //   noReply,
    // };
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

  // New encryption functions
  savePlatformCredentials,
  getPlatformCredentials,
  deletePlatformCredential,
  encryptCredentialsForStorage,
  decryptCredentialsFromStorage,
  
  // New unified authentication functions
  checkEmailSignInMethods,
  linkEmailPasswordToAccount,
  linkGoogleToAccount,
  setupPasswordForGoogleAccount,
  handleSignInError,
};

// Export types if needed elsewhere
export type { ContactFormData, ContactSubmissionData };