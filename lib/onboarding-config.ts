/**
 * Onboarding configuration constants
 * Centralizes all hardcoded values used throughout the onboarding process
 */

export const ONBOARDING_CONFIG = {
  // Timing configurations
  AUTO_SAVE_DELAY: 15000, // Save after 15 seconds of inactivity
  SAVE_STATUS_DISPLAY_DURATION: 2000, // Auto-hide saved status after 2 seconds
  ERROR_RETRY_DELAY: 5000, // Auto-retry after 5 seconds on error

  // Onboarding flow
  TOTAL_STEPS: 5, // Total number of onboarding steps
  INITIAL_PAGE: 1, // Starting page number
  MIN_PAGE: 1, // Minimum page number
  MAX_PAGE: 5, // Maximum page number

  // Progress calculation
  REQUIRED_FIELDS_COUNT: 7, // Number of required fields for progress calculation
  SKILLS_FIELD_WEIGHT: 1, // Weight of skills field in progress calculation
  PROGRESS_PERCENTAGE_PRECISION: 0, // Decimal places for progress percentage

  // Validation regex patterns
  PHONE_NUMBER_REGEX: /^\+91-\d{10}$/, // Indian phone number format
  CTC_REGEX: /^\d+LPA$/, // Expected CTC format (e.g., "10LPA")
  LINKEDIN_URL_REGEX: /^https:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+\/?$/, // LinkedIn profile URL format

  // UI configurations
  MOBILE_NUMBER_PREFIX: '+91-', // Default mobile number prefix
  MAX_DROPDOWN_HEIGHT: 288, // max-h-72 in pixels (18rem * 16px)

  // Field validation messages
  VALIDATION_MESSAGES: {
    FIRST_NAME_REQUIRED: 'First Name is required',
    LAST_NAME_REQUIRED: 'Last Name is required',
    MOBILE_NUMBER_REQUIRED: 'Mobile Number is required and should be in the format +91-XXXXXXXXXX',
    EMAIL_REQUIRED: 'Email is required',
    JOB_TITLE_REQUIRED: 'Aiming Job Title is required',
    SKILLS_REQUIRED: 'Skills required',
    EXPECTED_CTC_REQUIRED: 'Expected CTC is required and should be in the format XLPA (e.g., 10LPA)',
    LINKEDIN_PROFILE_REQUIRED: 'LinkedIn Profile is required and should be a valid URL',
  },

  // Page-specific configurations
  PAGES: {
    PERSONAL_INFO: 1,
    JOB_TITLE: 2,
    SKILLS: 3,
    EXPECTED_CTC: 4,
    LINKEDIN_PROFILE: 5,
  },

  // Auto-progression rules (which page to go to based on completed data)
  PAGE_PROGRESSION: {
    MIN_FIELDS_FOR_PAGE_2: ['firstName', 'lastName', 'phone', 'email'] as const,
    MIN_FIELDS_FOR_PAGE_3: ['jobTitle'] as const,
    MIN_FIELDS_FOR_PAGE_4: ['skills'] as const,
    MIN_FIELDS_FOR_PAGE_5: ['expectedCTC'] as const,
  },

  // Form field names for progress calculation
  PROGRESS_FIELDS: [
    'firstName',
    'lastName',
    'mobileNumber',
    'email',
    'jobTitle',
    'expectedCTC',
    'linkedinProfile'
  ] as const,

  // Security configurations
  SECURITY: {
    ENABLE_INPUT_SANITIZATION: true,
    ENABLE_XSS_PROTECTION: true,
    ENABLE_SQL_INJECTION_DETECTION: true,
    LOG_SECURITY_VIOLATIONS: true,
  },

  // CSS class configurations
  CSS_CLASSES: {
    ERROR_BORDER: 'border-red-500',
    ERROR_TEXT: 'text-red-500',
    DISABLED_BACKGROUND: 'bg-gray-800/50 cursor-not-allowed',
    DROPDOWN_ITEM_HOVER: 'hover:bg-[#7960c2]',
    DROPDOWN_BACKGROUND: 'bg-[#4423a8]',
  },

  // Image dimensions for UI elements
  LOGO_DIMENSIONS: {
    DEFAULT: { width: 168, height: 57 },
    SM: { width: 200, height: 68 },
    LG: { width: 224, height: 76 },
  },

  ICON_DIMENSIONS: {
    SMALL: { width: 24, height: 24 },
    MEDIUM: { width: 32, height: 32 },
  },

  // Responsive breakpoint helpers
  RESPONSIVE: {
    TOP_POSITION_THRESHOLD: 700, // Inner height threshold for top positioning
    TOP_POSITIONS: {
      LARGE: 'top-0',
      SMALL: 'top-[45px]',
    },
  },
} as const;

/**
 * Type-safe configuration getters
 */
export const getValidationMessage = (field: keyof typeof ONBOARDING_CONFIG.VALIDATION_MESSAGES): string => {
  return ONBOARDING_CONFIG.VALIDATION_MESSAGES[field];
};

export const getPageNumber = (page: keyof typeof ONBOARDING_CONFIG.PAGES): number => {
  return ONBOARDING_CONFIG.PAGES[page];
};

export const getCSSClass = (className: keyof typeof ONBOARDING_CONFIG.CSS_CLASSES): string => {
  return ONBOARDING_CONFIG.CSS_CLASSES[className];
};

/**
 * Helper functions for common operations
 */
export const isValidPhoneNumber = (phoneNumber: string): boolean => {
  return ONBOARDING_CONFIG.PHONE_NUMBER_REGEX.test(phoneNumber);
};

export const isValidCTC = (ctc: string): boolean => {
  return ONBOARDING_CONFIG.CTC_REGEX.test(ctc);
};

export const isValidLinkedInURL = (url: string): boolean => {
  return ONBOARDING_CONFIG.LINKEDIN_URL_REGEX.test(url);
};

export const formatPhoneNumber = (phoneNumber: string): string => {
  const cleaned = phoneNumber.replace(/^0/, '');
  if (!cleaned.startsWith(ONBOARDING_CONFIG.MOBILE_NUMBER_PREFIX)) {
    return `${ONBOARDING_CONFIG.MOBILE_NUMBER_PREFIX}${cleaned}`;
  }
  return cleaned;
};

export const calculateProgress = (formData: {
  firstName?: string;
  lastName?: string;
  mobileNumber?: string;
  email?: string;
  jobTitle?: string;
  expectedCTC?: string;
  linkedinProfile?: string;
  skills?: string[];
}): number => {
  const { PROGRESS_FIELDS, SKILLS_FIELD_WEIGHT, REQUIRED_FIELDS_COUNT } = ONBOARDING_CONFIG;

  const completedFields = PROGRESS_FIELDS.filter(field => {
    const value = formData[field as keyof typeof formData];
    return value && (typeof value === 'string' ? value.trim().length > 0 : true);
  }).length;

  const skillsCompleted = (formData.skills && Array.isArray(formData.skills) && formData.skills.length > 0) ? SKILLS_FIELD_WEIGHT : 0;
  const totalFields = REQUIRED_FIELDS_COUNT + SKILLS_FIELD_WEIGHT;

  return Math.round(((completedFields + skillsCompleted) / totalFields) * 100);
};

/**
 * Security helper to check if sanitization is enabled
 */
export const shouldSanitizeInput = (): boolean => {
  return ONBOARDING_CONFIG.SECURITY.ENABLE_INPUT_SANITIZATION;
};

/**
 * Security helper to check if XSS protection is enabled
 */
export const isXssProtectionEnabled = (): boolean => {
  return ONBOARDING_CONFIG.SECURITY.ENABLE_XSS_PROTECTION;
};