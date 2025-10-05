"use client";

import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef, useMemo } from 'react';
import { auth, saveUserProfile, getUserProfile } from '@/lib/firebaseConfig/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { mapOnboardingToUserDetails, mapUserDetailsToOnboarding } from '@/lib/interface-mappers';
import { ONBOARDING_CONFIG, getValidationMessage, calculateProgress as calculateProgressHelper, shouldSanitizeInput } from '@/lib/onboarding-config';
import { createOnboardingError, handleOnboardingError } from '@/lib/onboarding-errors';
import { useOnboardingError } from './OnboardingErrorContext';
import { sanitizeFormData, sanitizeInput, type SanitizationResult } from '@/lib/input-sanitization';

export interface OnboardingFormData {
  firstName: string;
  lastName: string;
  mobileNumber: string;
  email: string;
  jobTitle: string;
  expectedCTC: string;
  linkedinProfile: string;
  skills: string[];
  lastPreferenceChangedDate: string;
  createdDate: string;
  updatedDate: string;
  onboardingCompleted: boolean;
}

export interface OnboardingState {
  formData: OnboardingFormData;
  currentPage: number;
  isLoading: boolean;
  isSaving: boolean;
  errors: Record<string, boolean>;
  authLoading: boolean;
  isGoogleUser: boolean;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  lastSavedAt: Date | null;
  isDirty: boolean;
  progress: number;
  sanitizationWarnings: Record<string, string[]>;
}

type OnboardingAction =
  | { type: 'SET_FORM_DATA'; payload: Partial<OnboardingFormData> }
  | { type: 'SET_CURRENT_PAGE'; payload: number }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SAVING'; payload: boolean }
  | { type: 'SET_ERRORS'; payload: Record<string, boolean> }
  | { type: 'SET_AUTH_LOADING'; payload: boolean }
  | { type: 'SET_IS_GOOGLE_USER'; payload: boolean }
  | { type: 'SET_SAVE_STATUS'; payload: 'idle' | 'saving' | 'saved' | 'error' }
  | { type: 'SET_LAST_SAVED_AT'; payload: Date | null }
  | { type: 'SET_DIRTY'; payload: boolean }
  | { type: 'SET_SKILLS'; payload: string[] }
  | { type: 'SET_SANITIZATION_WARNINGS'; payload: Record<string, string[]> }
  | { type: 'RESET_FORM' }
  | { type: 'LOAD_SAVED_DATA'; payload: Partial<OnboardingFormData> };

interface OnboardingContextType {
  state: OnboardingState;
  dispatch: React.Dispatch<OnboardingAction>;
  updateFormData: (data: Partial<OnboardingFormData>) => void;
  updateSkills: (skills: string[]) => void;
  nextPage: () => boolean;
  previousPage: () => void;
  setCurrentPage: (page: number) => void;
  saveProgress: () => Promise<void>;
  validateCurrentPage: () => boolean;
  isFormValid: (page?: number) => boolean;
  calculateProgress: () => number;
  resetForm: () => void;
  formCompletionStatus: {
    totalFields: number;
    completedFieldsCount: number;
    hasSkills: boolean;
    progressPercentage: number;
  };
}

const initialFormData: OnboardingFormData = {
  firstName: '',
  lastName: '',
  mobileNumber: '',
  email: '',
  jobTitle: '',
  expectedCTC: '',
  linkedinProfile: '',
  skills: [],
  lastPreferenceChangedDate: '',
  createdDate: '',
  updatedDate: '',
  onboardingCompleted: false,
};

const initialState: OnboardingState = {
  formData: initialFormData,
  currentPage: ONBOARDING_CONFIG.INITIAL_PAGE,
  isLoading: false,
  isSaving: false,
  errors: {},
  authLoading: true,
  isGoogleUser: false,
  saveStatus: 'idle',
  lastSavedAt: null,
  isDirty: false,
  progress: 0,
  sanitizationWarnings: {},
};

function onboardingReducer(state: OnboardingState, action: OnboardingAction): OnboardingState {
  switch (action.type) {
    case 'SET_FORM_DATA':
      return {
        ...state,
        formData: { ...state.formData, ...action.payload },
        isDirty: true,
      };
    case 'SET_CURRENT_PAGE':
      return { ...state, currentPage: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_SAVING':
      return { ...state, isSaving: action.payload };
    case 'SET_ERRORS':
      return { ...state, errors: action.payload };
    case 'SET_AUTH_LOADING':
      return { ...state, authLoading: action.payload };
    case 'SET_IS_GOOGLE_USER':
      return { ...state, isGoogleUser: action.payload };
    case 'SET_SAVE_STATUS':
      return { ...state, saveStatus: action.payload };
    case 'SET_LAST_SAVED_AT':
      return { ...state, lastSavedAt: action.payload };
    case 'SET_DIRTY':
      return { ...state, isDirty: action.payload };
    case 'SET_SKILLS':
      return {
        ...state,
        formData: { ...state.formData, skills: action.payload },
        isDirty: true,
      };
    case 'SET_SANITIZATION_WARNINGS':
      return { ...state, sanitizationWarnings: action.payload };
    case 'RESET_FORM':
      return { ...initialState, authLoading: false };
    case 'LOAD_SAVED_DATA':
      return {
        ...state,
        formData: { ...state.formData, ...action.payload },
        isDirty: false,
        saveStatus: 'saved',
      };
    default:
      return state;
  }
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw createOnboardingError('CONTEXT_ERROR', new Error('useOnboarding must be used within an OnboardingProvider'));
  }
  return context;
};

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(onboardingReducer, initialState);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSaveDataRef = useRef<string>('');
  const { setSystemError, incrementRetryCount, resetRetryCount, state: errorState } = useOnboardingError();

  // Validation rules for each page with error dispatch
  const validatePage = useCallback((page: number): boolean => {
    const newErrors: Record<string, boolean> = {};
    const { PHONE_NUMBER_REGEX, CTC_REGEX, LINKEDIN_URL_REGEX, PAGES } = ONBOARDING_CONFIG;

    if (page === PAGES.PERSONAL_INFO) {
      newErrors.firstName = !state.formData.firstName;
      newErrors.lastName = !state.formData.lastName;
      newErrors.mobileNumber = !state.formData.mobileNumber || !PHONE_NUMBER_REGEX.test(state.formData.mobileNumber);
      newErrors.email = !state.formData.email;
    } else if (page === PAGES.JOB_TITLE) {
      newErrors.jobTitle = !state.formData.jobTitle;
    } else if (page === PAGES.SKILLS) {
      newErrors.skills = state.formData.skills.length === 0;
    } else if (page === PAGES.EXPECTED_CTC) {
      newErrors.expectedCTC = !state.formData.expectedCTC || !CTC_REGEX.test(state.formData.expectedCTC);
    } else if (page === PAGES.LINKEDIN_PROFILE) {
      newErrors.linkedinProfile = !state.formData.linkedinProfile || !LINKEDIN_URL_REGEX.test(state.formData.linkedinProfile);
    }

    const isValid = !Object.values(newErrors).some((error) => error);
    dispatch({ type: 'SET_ERRORS', payload: isValid ? {} : newErrors });
    return isValid;
  }, [state.formData]);

  // Memoize progress calculation with granular dependencies
  const progress = useMemo((): number => {
    return calculateProgressHelper(state.formData);
  }, [
    state.formData.firstName,
    state.formData.lastName,
    state.formData.mobileNumber,
    state.formData.email,
    state.formData.jobTitle,
    state.formData.expectedCTC,
    state.formData.linkedinProfile,
    state.formData.skills.length,
  ]);

  // Calculate progress percentage (kept for backward compatibility)
  const calculateProgress = useCallback((): number => {
    return progress;
  }, [progress]);

  // Debounced auto-save function
  const debouncedSave = useCallback(async () => {
    if (!state.isDirty) return;

    const user = auth.currentUser;
    if (!user) return;

    // Check if data has actually changed since last save
    const currentDataString = JSON.stringify(state.formData);
    if (currentDataString === lastSaveDataRef.current) return;

    try {
      dispatch({ type: 'SET_SAVE_STATUS', payload: 'saving' });

      const currentDate = new Date().toISOString();
      const updatedFormData = {
        ...state.formData,
        updatedDate: currentDate,
        createdDate: state.formData.createdDate || currentDate,
      };

      const userDetailsData = mapOnboardingToUserDetails(updatedFormData);
      await saveUserProfile(user.uid, userDetailsData);

      lastSaveDataRef.current = currentDataString;
      dispatch({ type: 'SET_SAVE_STATUS', payload: 'saved' });
      dispatch({ type: 'SET_LAST_SAVED_AT', payload: new Date() });
      dispatch({ type: 'SET_DIRTY', payload: false });

      // Auto-hide saved status
      setTimeout(() => {
        dispatch({ type: 'SET_SAVE_STATUS', payload: 'idle' });
      }, ONBOARDING_CONFIG.SAVE_STATUS_DISPLAY_DURATION);
    } catch (error) {
      const onboardingError = handleOnboardingError(error, {
        operation: 'auto-save',
        userId: user?.uid,
        formData: state.formData,
      });

      dispatch({ type: 'SET_SAVE_STATUS', payload: 'error' });
      setSystemError(onboardingError);

      // Auto-retry based on error configuration
      if (onboardingError.retryable && errorState.retryCount < 3) {
        incrementRetryCount();
        setTimeout(() => {
          dispatch({ type: 'SET_SAVE_STATUS', payload: 'idle' });
          debouncedSave();
        }, onboardingError.retryDelay || ONBOARDING_CONFIG.ERROR_RETRY_DELAY);
      } else {
        // For non-retryable errors or max retries reached, just reset status
        setTimeout(() => {
          dispatch({ type: 'SET_SAVE_STATUS', payload: 'idle' });
        }, ONBOARDING_CONFIG.ERROR_RETRY_DELAY);
      }
    }
  }, [state.formData, state.isDirty]);

  // Memoize frequently used computed values
  const formCompletionStatus = useMemo(() => {
    const { PROGRESS_FIELDS } = ONBOARDING_CONFIG;
    return {
      totalFields: PROGRESS_FIELDS.length + 1, // +1 for skills
      completedFieldsCount: PROGRESS_FIELDS.filter(field =>
        state.formData[field as keyof OnboardingFormData]
      ).length,
      hasSkills: state.formData.skills.length > 0,
      progressPercentage: progress,
    };
  }, [
    state.formData.firstName,
    state.formData.lastName,
    state.formData.mobileNumber,
    state.formData.email,
    state.formData.jobTitle,
    state.formData.expectedCTC,
    state.formData.linkedinProfile,
    state.formData.skills.length,
    progress,
  ]);

  // Set up debounced auto-save
  useEffect(() => {
    if (state.isDirty && auth.currentUser) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        debouncedSave();
      }, ONBOARDING_CONFIG.AUTO_SAVE_DELAY);
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [state.isDirty, debouncedSave]);

  // Auth state listener and data recovery
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Detect Google user
        const hasGoogleProvider = user.providerData.some(provider =>
          provider.providerId === 'google.com'
        );
        dispatch({ type: 'SET_IS_GOOGLE_USER', payload: hasGoogleProvider });

        // Pre-fill basic data from auth
        const authData: Partial<OnboardingFormData> = {
          email: user.email || '',
          firstName: user.displayName?.split(' ')[0] || '',
          lastName: user.displayName?.split(' ')[1] || '',
        };

        // Try to load existing profile data
        try {
          const existingProfile = await getUserProfile(user.uid);
          if (existingProfile) {
            // Map UserDetails interface fields to OnboardingFormData
            const mappedProfile = mapUserDetailsToOnboarding(existingProfile, state.formData);
            dispatch({ type: 'LOAD_SAVED_DATA', payload: mappedProfile });

            // Calculate which page user should be on based on completed data
            const { PAGES, PAGE_PROGRESSION } = ONBOARDING_CONFIG;
            let targetPage: number = PAGES.PERSONAL_INFO;

            if (PAGE_PROGRESSION.MIN_FIELDS_FOR_PAGE_2.every(field => existingProfile[field])) {
              targetPage = PAGES.JOB_TITLE;
            }
            if (existingProfile.jobTitle) {
              targetPage = PAGES.SKILLS;
            }
            if (existingProfile.skills && existingProfile.skills.length > 0) {
              targetPage = PAGES.EXPECTED_CTC;
            }
            if (existingProfile.expectedCTC) {
              targetPage = PAGES.LINKEDIN_PROFILE;
            }
            if (existingProfile.socialMediaLinks?.linkedin && existingProfile.onboardingCompleted) {
              // User has completed onboarding, redirect them
              window.location.href = '/dashboard/home';
              return;
            }

            dispatch({ type: 'SET_CURRENT_PAGE', payload: targetPage });
          } else {
            // No existing profile, start with auth data
            dispatch({ type: 'SET_FORM_DATA', payload: authData });
          }
        } catch (error) {
          const onboardingError = handleOnboardingError(error, {
            operation: 'profile-load',
            userId: user?.uid,
          });

          setSystemError(onboardingError);

          // For profile load errors, fall back to auth data
          if (onboardingError.code === 'PROFILE_LOAD_ERROR' || onboardingError.recoverable) {
            dispatch({ type: 'SET_FORM_DATA', payload: authData });
            // Clear error after fallback
            setTimeout(() => {
              setSystemError(null);
            }, 3000);
          }
        }
      }
      dispatch({ type: 'SET_AUTH_LOADING', payload: false });
    });

    return () => unsubscribe();
  }, []);


  // Context methods with sanitization
  const updateFormData = useCallback((data: Partial<OnboardingFormData>) => {
    if (shouldSanitizeInput()) {
      const { sanitized, results } = sanitizeFormData(data);

      // Extract warnings for user feedback
      const warnings: Record<string, string[]> = {};
      Object.entries(results).forEach(([key, result]) => {
        if (result.warnings.length > 0) {
          warnings[key] = result.warnings;
        }
      });

      // Log security violations if enabled
      if (ONBOARDING_CONFIG.SECURITY.LOG_SECURITY_VIOLATIONS) {
        Object.entries(results).forEach(([key, result]) => {
          if (result.errors.length > 0) {
            console.warn(`Security violation in field '${key}':`, result.errors);
          }
        });
      }

      dispatch({ type: 'SET_SANITIZATION_WARNINGS', payload: warnings });
      dispatch({ type: 'SET_FORM_DATA', payload: sanitized as Partial<OnboardingFormData> });
    } else {
      dispatch({ type: 'SET_FORM_DATA', payload: data });
    }
  }, []);

  const updateSkills = useCallback((skills: string[]) => {
    if (shouldSanitizeInput()) {
      const sanitizedSkills = skills
        .map(skill => sanitizeInput(skill, 'skill'))
        .filter(result => result.isValid && result.sanitized.length > 0)
        .map(result => result.sanitized);

      dispatch({ type: 'SET_SKILLS', payload: sanitizedSkills });
    } else {
      dispatch({ type: 'SET_SKILLS', payload: skills });
    }
  }, []);

  const nextPage = useCallback((): boolean => {
    if (validatePage(state.currentPage)) {
      dispatch({ type: 'SET_CURRENT_PAGE', payload: state.currentPage + 1 });
      return true;
    }
    return false;
  }, [state.currentPage, validatePage]);

  const previousPage = useCallback(() => {
    if (state.currentPage > ONBOARDING_CONFIG.MIN_PAGE) {
      dispatch({ type: 'SET_CURRENT_PAGE', payload: state.currentPage - 1 });
    }
  }, [state.currentPage]);

  const setCurrentPage = useCallback((page: number) => {
    dispatch({ type: 'SET_CURRENT_PAGE', payload: page });
  }, []);

  const saveProgress = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) return;

    dispatch({ type: 'SET_SAVING', payload: true });
    try {
      const currentDate = new Date().toISOString();
      const updatedFormData = {
        ...state.formData,
        updatedDate: currentDate,
        createdDate: state.formData.createdDate || currentDate,
      };

      const userDetailsData = mapOnboardingToUserDetails(updatedFormData);
      await saveUserProfile(user.uid, userDetailsData);
      dispatch({ type: 'SET_DIRTY', payload: false });
      dispatch({ type: 'SET_LAST_SAVED_AT', payload: new Date() });
    } catch (error) {
      const onboardingError = handleOnboardingError(error, {
        operation: 'manual-save',
        userId: user?.uid,
        formData: state.formData,
      });

      // Re-throw as typed error for calling code to handle
      throw onboardingError;
    } finally {
      dispatch({ type: 'SET_SAVING', payload: false });
    }
  }, [state.formData]);

  // Memoize user data string for efficient comparison
  const userDataString = useMemo(() => {
    return JSON.stringify({
      firstName: state.formData.firstName,
      lastName: state.formData.lastName,
      mobileNumber: state.formData.mobileNumber,
      email: state.formData.email,
      jobTitle: state.formData.jobTitle,
      expectedCTC: state.formData.expectedCTC,
      linkedinProfile: state.formData.linkedinProfile,
      skills: state.formData.skills,
    });
  }, [
    state.formData.firstName,
    state.formData.lastName,
    state.formData.mobileNumber,
    state.formData.email,
    state.formData.jobTitle,
    state.formData.expectedCTC,
    state.formData.linkedinProfile,
    state.formData.skills,
  ]);

  const validateCurrentPage = useCallback((): boolean => {
    return validatePage(state.currentPage);
  }, [state.currentPage, validatePage]);

  const isFormValid = useCallback((page?: number): boolean => {
    const targetPage = page ?? state.currentPage;
    const { PHONE_NUMBER_REGEX, CTC_REGEX, LINKEDIN_URL_REGEX, PAGES } = ONBOARDING_CONFIG;
    const newErrors: Record<string, boolean> = {};

    if (targetPage === PAGES.PERSONAL_INFO) {
      newErrors.firstName = !state.formData.firstName;
      newErrors.lastName = !state.formData.lastName;
      newErrors.mobileNumber = !state.formData.mobileNumber || !PHONE_NUMBER_REGEX.test(state.formData.mobileNumber);
      newErrors.email = !state.formData.email;
    } else if (targetPage === PAGES.JOB_TITLE) {
      newErrors.jobTitle = !state.formData.jobTitle;
    } else if (targetPage === PAGES.SKILLS) {
      newErrors.skills = state.formData.skills.length === 0;
    } else if (targetPage === PAGES.EXPECTED_CTC) {
      newErrors.expectedCTC = !state.formData.expectedCTC || !CTC_REGEX.test(state.formData.expectedCTC);
    } else if (targetPage === PAGES.LINKEDIN_PROFILE) {
      newErrors.linkedinProfile = !state.formData.linkedinProfile || !LINKEDIN_URL_REGEX.test(state.formData.linkedinProfile);
    }

    return !Object.values(newErrors).some((error) => error);
  }, [state.currentPage, state.formData]);

  const resetForm = useCallback(() => {
    dispatch({ type: 'RESET_FORM' });
  }, []);


  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo<OnboardingContextType>(() => ({
    state,
    dispatch,
    updateFormData,
    updateSkills,
    nextPage,
    previousPage,
    setCurrentPage,
    saveProgress,
    validateCurrentPage,
    isFormValid,
    calculateProgress,
    resetForm,
    formCompletionStatus,
  }), [
    state,
    updateFormData,
    updateSkills,
    nextPage,
    previousPage,
    setCurrentPage,
    saveProgress,
    validateCurrentPage,
    isFormValid,
    calculateProgress,
    resetForm,
    formCompletionStatus,
  ]);

  return (
    <OnboardingContext.Provider value={contextValue}>
      {children}
    </OnboardingContext.Provider>
  );
};