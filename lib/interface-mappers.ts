import { OnboardingFormData } from '@/contexts/OnboardingContext';
import { UserDetails } from '@/lib/types';

/**
 * Maps OnboardingFormData to UserDetails format for database storage
 */
export function mapOnboardingToUserDetails(
  onboardingData: OnboardingFormData,
  existingUserDetails?: Partial<UserDetails>
): UserDetails {
  return {
    ...existingUserDetails,
    firstName: onboardingData.firstName,
    lastName: onboardingData.lastName,
    phone: onboardingData.mobileNumber,
    email: onboardingData.email,
    jobTitle: onboardingData.jobTitle,
    expectedCTC: onboardingData.expectedCTC,
    skills: onboardingData.skills,
    socialMediaLinks: {
      ...existingUserDetails?.socialMediaLinks,
      linkedin: onboardingData.linkedinProfile,
    },
    onboardingCompleted: onboardingData.onboardingCompleted,
    // Preserve any additional UserDetails fields that aren't in OnboardingFormData
  };
}

/**
 * Maps UserDetails to OnboardingFormData format for form state
 */
export function mapUserDetailsToOnboarding(
  userDetails: UserDetails,
  existingOnboardingData?: Partial<OnboardingFormData>
): OnboardingFormData {
  const currentDate = new Date().toISOString();

  return {
    firstName: userDetails.firstName || '',
    lastName: userDetails.lastName || '',
    mobileNumber: userDetails.phone || '',
    email: userDetails.email || '',
    jobTitle: userDetails.jobTitle || '',
    expectedCTC: userDetails.expectedCTC || '',
    linkedinProfile: userDetails.socialMediaLinks?.linkedin || '',
    skills: userDetails.skills || [],
    lastPreferenceChangedDate: existingOnboardingData?.lastPreferenceChangedDate || currentDate,
    createdDate: existingOnboardingData?.createdDate || currentDate,
    updatedDate: currentDate,
    onboardingCompleted: userDetails.onboardingCompleted || false,
  };
}

/**
 * Type-safe field mapping configuration
 */
export const FIELD_MAPPINGS = {
  // OnboardingFormData field -> UserDetails field
  mobileNumber: 'phone',
  linkedinProfile: 'socialMediaLinks.linkedin',
} as const;

/**
 * Helper to get the UserDetails field name for an OnboardingFormData field
 */
export function getUserDetailsFieldName(onboardingField: keyof OnboardingFormData): string {
  return FIELD_MAPPINGS[onboardingField as keyof typeof FIELD_MAPPINGS] || onboardingField;
}