/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useRouter } from "next/navigation";
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { auth } from "@/lib/firebaseConfig/firebaseConfig";
import Head from "next/head";
import { jobRoles, roleBasedSkills } from "@/lib/jobRoles";
import { ChevronDown } from "lucide-react";
import { OnboardingProvider, useOnboarding } from "@/contexts/OnboardingContext";
import { OnboardingErrorProvider, useOnboardingError } from "@/contexts/OnboardingErrorContext";
import { useSkillsManager } from "@/hooks/useSkillsManager";
import { SaveStatus } from "@/components/ui/save-status";
import { ProgressIndicator } from "@/components/ui/progress-indicator";
import { useEffect, useState, useCallback } from "react";
import { ONBOARDING_CONFIG, formatPhoneNumber, getValidationMessage, shouldSanitizeInput } from "@/lib/onboarding-config";
import { handleOnboardingError } from "@/lib/onboarding-errors";
import { sanitizeInput } from "@/lib/input-sanitization";
import { ErrorDisplay, OnboardingErrorBoundary } from "@/components/ui/error-display";
import { SanitizationWarnings } from "@/components/ui/sanitization-warnings";

const ProfileSetupContent: React.FC = () => {
  const {
    state,
    updateFormData,
    nextPage,
    previousPage,
    saveProgress,
    validateCurrentPage,
    formCompletionStatus
  } = useOnboarding();

  const {
    state: errorState,
    clearSystemError,
    setLastOperation
  } = useOnboardingError();

  const retryLastOperation = useCallback(async () => {
    if (!errorState.systemError || !errorState.systemError.retryable) return;

    clearSystemError();

    // Retry the last operation based on context
    if (state.isDirty) {
      setLastOperation('save');
      // Trigger a save by calling saveProgress
      try {
        await saveProgress();
      } catch (error) {
        console.error('Retry failed:', error);
      }
    }
  }, [errorState.systemError, state.isDirty, clearSystemError, setLastOperation, saveProgress]);
  const { skills, skillsInput, removeSkill, handleSkillsInputChange, handleSkillsInputKeyDown } = useSkillsManager();
  const [jobRoleSearch, setJobRoleSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();

  // Auto-populate skills based on job title
  useEffect(() => {
    if (state.formData.jobTitle) {
      const suggestedSkills = roleBasedSkills[state.formData.jobTitle] || [];
      if (suggestedSkills.length > 0 && skills.length === 0) {
        // Only auto-populate if no skills are currently set
        updateFormData({ skills: suggestedSkills });
      }
    }
  }, [state.formData.jobTitle, skills.length, updateFormData]);

  const handleNext = () => {
    nextPage();
  };

  const handleBack = () => {
    previousPage();
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Apply formatting first
    if (name === "firstName" || name === "lastName") {
      formattedValue = value.charAt(0).toUpperCase() + value.slice(1);
    } else if (name === "mobileNumber") {
      formattedValue = formatPhoneNumber(value);
    }

    // Apply sanitization if enabled (context will handle this, but we can pre-sanitize for immediate feedback)
    if (shouldSanitizeInput()) {
      let sanitizationType: 'name' | 'email' | 'phone' | 'text' | 'jobTitle' = 'text';

      switch (name) {
        case 'firstName':
        case 'lastName':
          sanitizationType = 'name';
          break;
        case 'email':
          sanitizationType = 'email';
          break;
        case 'mobileNumber':
          sanitizationType = 'phone';
          break;
        case 'jobTitle':
          sanitizationType = 'jobTitle';
          break;
        default:
          sanitizationType = 'text';
      }

      const sanitizationResult = sanitizeInput(formattedValue, sanitizationType);

      // Show warnings to user if there are any
      if (sanitizationResult.warnings.length > 0) {
        console.warn(`Input sanitization warnings for ${name}:`, sanitizationResult.warnings);
      }

      // Use sanitized value if valid
      if (sanitizationResult.isValid) {
        formattedValue = sanitizationResult.sanitized;
      }
    }

    updateFormData({ [name]: formattedValue });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateCurrentPage()) {
      const currentDate = new Date().toISOString();
      const finalFormData = {
        userId: auth.currentUser?.uid || '',
        ...state.formData,
        phone: state.formData.mobileNumber, // Map mobileNumber to phone for UserDetails interface
        socialMediaLinks: {
          linkedin: state.formData.linkedinProfile,
        },
        skills,
        lastPreferenceChangedDate: currentDate,
        updatedDate: currentDate,
        createdDate: state.formData.createdDate || currentDate,
        onboardingCompleted: true,
      };

      try {
        const user = auth.currentUser;
        if (user) {
          updateFormData(finalFormData);
          await saveProgress();
          router.push("/dashboard/home");
        }
      } catch (error) {
        const onboardingError = handleOnboardingError(error, {
          operation: 'final-save',
          userId: auth.currentUser?.uid,
          formData: finalFormData,
        });

        // Handle different error types appropriately
        if (onboardingError.code === 'AUTH_ERROR') {
          // Redirect to login
          router.push('/dashboard/onboarding/login');
        } else if (onboardingError.recoverable) {
          // Show user-friendly error message
          // You could set an error state here to show in UI
          console.error('Recoverable error during final save:', onboardingError.userMessage);
        } else {
          // Critical error - might need to show error page
          console.error('Critical error during final save:', onboardingError);
        }
      }
    }
  };

  const [innerHeight, setInnerHeight] = useState(0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setInnerHeight(window.innerHeight);
      const handleResize = () => setInnerHeight(window.innerHeight);
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  const getTopPosition = () => {
    const { RESPONSIVE } = ONBOARDING_CONFIG;
    return innerHeight > RESPONSIVE.TOP_POSITION_THRESHOLD
      ? RESPONSIVE.TOP_POSITIONS.LARGE
      : RESPONSIVE.TOP_POSITIONS.SMALL;
  };

  return (
    <>
      <Head>
        <title>Profile Setup - Aipply</title>
        <meta
          name="description"
          content="Set up your profile to apply for jobs on Aipply."
        />
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-[#020218] p-4 overflow-x-hidden">
        <SaveStatus />

        {/* System Error Display */}
        {errorState.systemError && (
          <div className="fixed top-4 right-4 z-50 max-w-md">
            <ErrorDisplay
              error={errorState.systemError}
              onRetry={errorState.systemError.retryable ? retryLastOperation : undefined}
              onDismiss={clearSystemError}
            />
          </div>
        )}

        {/* Sanitization Warnings */}
        {Object.keys(state.sanitizationWarnings).length > 0 && (
          <div className="fixed top-4 left-4 z-50 max-w-md">
            <SanitizationWarnings
              warnings={state.sanitizationWarnings}
              className="mb-4"
            />
          </div>
        )}
        <div className="flex flex-col gap-8 sm:gap-12 lg:gap-[60px] w-full max-w-4xl mx-auto">
          <div className={`${getTopPosition()}`}>
            <ProgressIndicator />
          </div>
          <Card className="text-white flex flex-col gap-6 sm:gap-10 lg:gap-[80px] w-full">
            <CardHeader className="flex flex-col gap-6 sm:gap-10 text-center items-center w-full px-4 sm:px-6">
              <Image
                src={"/static/icons/aipplyLogo.svg"}
                alt="Aipply Logo"
                width={ONBOARDING_CONFIG.LOGO_DIMENSIONS.DEFAULT.width}
                height={ONBOARDING_CONFIG.LOGO_DIMENSIONS.DEFAULT.height}
                className="sm:w-[200px] sm:h-[68px] lg:w-[224px] lg:h-[76px]"
              />
              <div className="grid grid-cols-1 gap-3">
                <CardTitle className="text-lg sm:text-xl lg:text-display-sm-semibold font-inter">
                  Welcome! Let&apos;s create your profile
                </CardTitle>
                <div className="text-sm sm:text-base lg:text-text-md-regular font-inter text-[#94969C]">
                  Apply privately to thousands of tech companies and start-ups
                  with one profile.
                </div>
              </div>
            </CardHeader>
            <CardContent className="w-full px-4 sm:px-6 lg:w-[80%] lg:mx-auto">
              {state.authLoading ? (
                <div className="flex justify-center items-center py-8">
                  <p className="text-gray-400">Loading...</p>
                </div>
              ) : (
                <>
                <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                {state.currentPage === 1 && (
                  <div className="grid gap-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div className="grid gap-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          type="text"
                          placeholder="Enter your First Name"
                          value={state.formData.firstName}
                          onChange={handleChange}
 onKeyDown={(e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
    }
  }}
                          required
                          className={state.errors.firstName ? ONBOARDING_CONFIG.CSS_CLASSES.ERROR_BORDER : ""}
                        />
                        {state.errors.firstName && (
                          <p className={ONBOARDING_CONFIG.CSS_CLASSES.ERROR_TEXT}>
                            {getValidationMessage('FIRST_NAME_REQUIRED')}
                          </p>
                        )}
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          type="text"
                          placeholder="Enter your Last Name"
                          value={state.formData.lastName}
                          onChange={handleChange}
 onKeyDown={(e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
    }
  }}
                          required
                          className={state.errors.lastName ? ONBOARDING_CONFIG.CSS_CLASSES.ERROR_BORDER : ""}
                        />
                        {state.errors.lastName && (
                          <p className={ONBOARDING_CONFIG.CSS_CLASSES.ERROR_TEXT}>
                            {getValidationMessage('LAST_NAME_REQUIRED')}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="mobileNumber">Mobile Number</Label>
                      <Input
                        id="mobileNumber"
                        name="mobileNumber"
                        type="text"
                        placeholder="Enter your Mobile Number"
                        value={state.formData.mobileNumber}
                        onChange={handleChange}
 onKeyDown={(e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
    }
  }}
                        required
                        className={state.errors.mobileNumber ? ONBOARDING_CONFIG.CSS_CLASSES.ERROR_BORDER : ""}
                      />
                      {state.errors.mobileNumber && (
                        <p className={ONBOARDING_CONFIG.CSS_CLASSES.ERROR_TEXT}>
                          {getValidationMessage('MOBILE_NUMBER_REQUIRED')}
                        </p>
                      )}
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">
                        Email
                        {state.isGoogleUser && (
                          <span className="ml-2 text-xs text-blue-400 font-normal">
                            (from Google account)
                          </span>
                        )}
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Enter your Email"
                        value={state.formData.email}
                        onChange={handleChange}
 onKeyDown={(e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
    }
  }}
                        required
                        readOnly={state.isGoogleUser}
                        className={`${state.errors.email ? ONBOARDING_CONFIG.CSS_CLASSES.ERROR_BORDER : ""} ${
                          state.isGoogleUser ? ONBOARDING_CONFIG.CSS_CLASSES.DISABLED_BACKGROUND : ""
                        }`}
                      />
                      {state.errors.email && (
                        <p className={ONBOARDING_CONFIG.CSS_CLASSES.ERROR_TEXT}>
                          {getValidationMessage('EMAIL_REQUIRED')}
                        </p>
                      )}
                      {state.isGoogleUser && (
                        <p className="text-xs text-gray-400">
                          This email is from your Google account and cannot be changed
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {state.currentPage === 2 && (
                  <div className="grid gap-6">
                    <div className="grid gap-2 relative">
                      <Label htmlFor="jobTitle">Aiming Job Title</Label>
                      <div className="relative">
                        <div
                          className={`p-3 border border-[#333741] rounded-md cursor-pointer flex justify-between items-center ${
                            state.errors.jobTitle ? "border-red-500" : ""
                          }`}
                          onClick={() => setShowDropdown(!showDropdown)}
                        >
                          <span className="text-[#85888E] text-text-md-regular">
                            {state.formData.jobTitle ||
                              "Select your aiming job title"}
                          </span>
                          <ChevronDown className="w-5 h-5 text-[#85888E]" />
                        </div>
                        {showDropdown && (
                          <div className="absolute mt-2 w-full z-10 bg-[#020218]">
                            <Input
                              type="text"
                              placeholder="Search job roles"
                              value={jobRoleSearch}
                              onChange={(e) => setJobRoleSearch(e.target.value)}
  onKeyDown={(e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
    }
  }}
                              className="mb-2"
                            />
                            <div className="bg-[#4423a8] max-h-72 overflow-y-auto text-white w-full rounded-md shadow-lg">
                              {jobRoles
                                .filter((role) =>
                                  role
                                    .toLowerCase()
                                    .includes(jobRoleSearch.toLowerCase())
                                )
                                .map((role, index) => (
                                  <div
                                    key={index}
                                    className="p-2 hover:bg-[#7960c2] cursor-pointer text-text-md-regular"
                                    onClick={() => {
                                      updateFormData({ jobTitle: role });
                                      setShowDropdown(false);
                                    }}
                                  >
                                    {role}
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}
                      </div>
                      {state.errors.jobTitle && (
                        <p className="text-red-500">
                          Aiming Job Title is required
                        </p>
                      )}
                      <p className="text-text-sm-regular font-inter text-[#94969C]">
                        Ex: Marketing Manager, Software Engineer, Sales
                        Associate.
                      </p>
                    </div>
                  </div>
                )}
                {state.currentPage === 3 && (
                  <div className="grid gap-6">
                    <div className="grid gap-2">
                      <Label htmlFor="skills">Skills</Label>
                      <div className="flex flex-col gap-4 max-w-[640px]">
                        <div className="text-text-sm-regular font-inter text-[#94969C]">
                          Suggested skills based on your selected role:{" "}
                          {roleBasedSkills[state.formData.jobTitle]?.join(", ") ||
                            "None"}
                        </div>
                        <div className="flex flex-wrap gap-4">
                          {skills.map((skill) => (
                            <div
                              key={skill}
                              className="px-6 py-2 rounded-full flex items-center gap-2 text-text-md-semibold text-white font-inter border border-white/15"
                            >
                              {skill}
                              <button onClick={() => removeSkill(skill)}>
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>

                       <Input
  value={skillsInput}
  onChange={(e) => handleSkillsInputChange(e.target.value)}
  placeholder="Add Skills"
  onKeyDown={handleSkillsInputKeyDown}
/>
                        {state.errors.skills && (
                          <p className="text-red-500">Skills required</p>
                        )}
                        <p className="text-text-sm-regular font-inter text-[#94969C]">
                          Ex: Reactjs, NodeJs, C#, JavaScript ...
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {state.currentPage === 4 && (
                  <div className="grid gap-6">
                    <div className="grid gap-2">
                      <Label htmlFor="expectedCTC">Expected CTC</Label>
                      <Input
                        id="expectedCTC"
                        name="expectedCTC"
                        type="text"
                        placeholder="Enter your Expected CTC"
                        value={state.formData.expectedCTC}
                        onChange={handleChange}
 onKeyDown={(e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
    }
  }}
                        required
                        className={state.errors.expectedCTC ? "border-red-500" : ""}
                      />
                      {state.errors.expectedCTC && (
                        <p className="text-red-500">
                          Expected CTC is required and should be in the format X
                          LPA
                        </p>
                      )}
                      <p className="text-text-sm-regular font-inter text-[#94969C]">
                        Ex: 10LPA, 20LPA, 30LPA.
                      </p>
                    </div>
                  </div>
                )}
                {state.currentPage === 5 && (
                  <div className="grid gap-6">
                    <div className="grid gap-2">
                      <Label htmlFor="linkedinProfile">LinkedIn Profile</Label>
                      <Input
                        id="linkedinProfile"
                        name="linkedinProfile"
                        type="text"
                        placeholder="https://"
                        value={state.formData.linkedinProfile}
                        onChange={handleChange}
 onKeyDown={(e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
    }
  }}
                        required
                        className={
                          state.errors.linkedinProfile ? "border-red-500" : ""
                        }
                      />
                      {state.errors.linkedinProfile && (
                        <p className="text-red-500">
                          LinkedIn Profile is required and should be a valid URL
                          starting with https://
                        </p>
                      )}
                    </div>
                  </div>
                )}
                <div className="flex flex-col sm:flex-row justify-between gap-4 sm:gap-16">
                  {state.currentPage > 1 && (
                    <Button type="button" onClick={handleBack} className="w-full sm:w-auto h-12" disabled={state.isSaving}>
                      <Image
                        src="/static/icons/arrow-left.svg"
                        alt="Back"
                        width={24}
                        height={24}
                      />
                      Back
                    </Button>
                  )}
                  {state.currentPage < 5 ? (
                    <Button type="button" onClick={handleNext} className="w-full sm:w-auto h-12" disabled={state.isSaving}>
                      Next
                      <Image
                        src="/static/icons/arrow-right.svg"
                        alt="Next"
                        width={24}
                        height={24}
                      />
                    </Button>
                  ) : (
                    <Button type="submit" disabled={state.isSaving} className="w-full sm:w-auto h-12">
                      {state.isSaving ? "Completing..." : "Complete Setup"}
                    </Button>
                  )}
                </div>
              </form>

                <div className="font-inter text-center text-text-md-regular text-muted-foreground text-[#94969C] mt-5">
                  Already have an account, <Link href="/dashboard/onboarding/login" className="text-white hover:underline">sign-In</Link> now
                </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default function ProfileSetup() {
  return (
    <OnboardingErrorBoundary>
      <OnboardingErrorProvider>
        <OnboardingProvider>
          <ProfileSetupContent />
        </OnboardingProvider>
      </OnboardingErrorProvider>
    </OnboardingErrorBoundary>
  );
}