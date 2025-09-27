"use client";

import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import { auth, saveUserProfile, getUserProfile } from '@/lib/firebaseConfig/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

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
  currentPage: 1,
  isLoading: false,
  isSaving: false,
  errors: {},
  authLoading: true,
  isGoogleUser: false,
  saveStatus: 'idle',
  lastSavedAt: null,
  isDirty: false,
  progress: 0,
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
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(onboardingReducer, initialState);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSaveDataRef = useRef<string>('');

  // Validation rules for each page
  const validatePage = useCallback((page: number): boolean => {
    const newErrors: Record<string, boolean> = {};
    const phoneNumberRegex = /^\+91-\d{10}$/;
    const ctcRegex = /^\d+LPA$/;

    if (page === 1) {
      newErrors.firstName = !state.formData.firstName;
      newErrors.lastName = !state.formData.lastName;
      newErrors.mobileNumber = !state.formData.mobileNumber || !phoneNumberRegex.test(state.formData.mobileNumber);
      newErrors.email = !state.formData.email;
    } else if (page === 2) {
      newErrors.jobTitle = !state.formData.jobTitle;
    } else if (page === 3) {
      newErrors.skills = state.formData.skills.length === 0;
    } else if (page === 4) {
      newErrors.expectedCTC = !state.formData.expectedCTC || !ctcRegex.test(state.formData.expectedCTC);
    } else if (page === 5) {
      newErrors.linkedinProfile = !state.formData.linkedinProfile;
    }

    dispatch({ type: 'SET_ERRORS', payload: newErrors });
    return !Object.values(newErrors).some((error) => error);
  }, [state.formData]);

  // Calculate progress percentage
  const calculateProgress = useCallback((): number => {
    const fields = [
      'firstName', 'lastName', 'mobileNumber', 'email',
      'jobTitle', 'expectedCTC', 'linkedinProfile'
    ];
    const completedFields = fields.filter(field =>
      state.formData[field as keyof OnboardingFormData]
    ).length;
    const skillsCompleted = state.formData.skills.length > 0 ? 1 : 0;
    const totalFields = fields.length + 1; // +1 for skills

    return Math.round(((completedFields + skillsCompleted) / totalFields) * 100);
  }, [state.formData]);

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
        phone: state.formData.mobileNumber, // Map mobileNumber to phone for UserDetails interface
        socialMediaLinks: {
          linkedin: state.formData.linkedinProfile,
        },
        updatedDate: currentDate,
        createdDate: state.formData.createdDate || currentDate,
      };

      await saveUserProfile(user.uid, updatedFormData);

      lastSaveDataRef.current = currentDataString;
      dispatch({ type: 'SET_SAVE_STATUS', payload: 'saved' });
      dispatch({ type: 'SET_LAST_SAVED_AT', payload: new Date() });
      dispatch({ type: 'SET_DIRTY', payload: false });

      // Auto-hide saved status after 2 seconds
      setTimeout(() => {
        dispatch({ type: 'SET_SAVE_STATUS', payload: 'idle' });
      }, 2000);
    } catch (error) {
      console.error('Auto-save failed:', error);
      dispatch({ type: 'SET_SAVE_STATUS', payload: 'error' });

      // Auto-retry after 5 seconds on error
      setTimeout(() => {
        dispatch({ type: 'SET_SAVE_STATUS', payload: 'idle' });
      }, 5000);
    }
  }, [state.formData, state.isDirty]);

  // Set up debounced auto-save
  useEffect(() => {
    if (state.isDirty && auth.currentUser) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        debouncedSave();
      }, 1000); // Save after 1 second of inactivity
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
            const mappedProfile = {
              ...existingProfile,
              mobileNumber: existingProfile.phone || '', // Map phone to mobileNumber
              linkedinProfile: existingProfile.socialMediaLinks?.linkedin || '', // Map LinkedIn profile
            };
            dispatch({ type: 'LOAD_SAVED_DATA', payload: mappedProfile });

            // Calculate which page user should be on based on completed data
            let targetPage = 1;
            if (existingProfile.firstName && existingProfile.lastName && existingProfile.phone && existingProfile.email) {
              targetPage = 2;
            }
            if (existingProfile.jobTitle) {
              targetPage = 3;
            }
            if (existingProfile.skills && existingProfile.skills.length > 0) {
              targetPage = 4;
            }
            if (existingProfile.expectedCTC) {
              targetPage = 5;
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
          console.error('Error loading existing profile:', error);
          // Fall back to auth data if profile fetch fails
          dispatch({ type: 'SET_FORM_DATA', payload: authData });
        }
      }
      dispatch({ type: 'SET_AUTH_LOADING', payload: false });
    });

    return () => unsubscribe();
  }, []);

  // Update progress when form data changes
  useEffect(() => {
    const progress = calculateProgress();
    if (progress !== state.progress) {
      // We don't need to dispatch here as it would cause unnecessary re-renders
      // The progress can be calculated on-demand in the UI
    }
  }, [state.formData, calculateProgress, state.progress]);

  // Context methods
  const updateFormData = useCallback((data: Partial<OnboardingFormData>) => {
    dispatch({ type: 'SET_FORM_DATA', payload: data });
  }, []);

  const updateSkills = useCallback((skills: string[]) => {
    dispatch({ type: 'SET_SKILLS', payload: skills });
  }, []);

  const nextPage = useCallback((): boolean => {
    if (validatePage(state.currentPage)) {
      dispatch({ type: 'SET_CURRENT_PAGE', payload: state.currentPage + 1 });
      return true;
    }
    return false;
  }, [state.currentPage, validatePage]);

  const previousPage = useCallback(() => {
    if (state.currentPage > 1) {
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
        phone: state.formData.mobileNumber, // Map mobileNumber to phone for UserDetails interface
        socialMediaLinks: {
          linkedin: state.formData.linkedinProfile,
        },
        updatedDate: currentDate,
        createdDate: state.formData.createdDate || currentDate,
      };

      await saveUserProfile(user.uid, updatedFormData);
      dispatch({ type: 'SET_DIRTY', payload: false });
      dispatch({ type: 'SET_LAST_SAVED_AT', payload: new Date() });
    } catch (error) {
      console.error('Save failed:', error);
      throw error;
    } finally {
      dispatch({ type: 'SET_SAVING', payload: false });
    }
  }, [state.formData]);

  const validateCurrentPage = useCallback((): boolean => {
    return validatePage(state.currentPage);
  }, [state.currentPage, validatePage]);

  const isFormValid = useCallback((page?: number): boolean => {
    const targetPage = page ?? state.currentPage;
    return validatePage(targetPage);
  }, [state.currentPage, validatePage]);

  const resetForm = useCallback(() => {
    dispatch({ type: 'RESET_FORM' });
  }, []);

  const contextValue: OnboardingContextType = {
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
  };

  return (
    <OnboardingContext.Provider value={contextValue}>
      {children}
    </OnboardingContext.Provider>
  );
};