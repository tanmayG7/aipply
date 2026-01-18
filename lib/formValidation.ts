/**
 * Comprehensive Form Validation Utilities
 * Handles validation for: Names, Email, Phone (country-aware)
 */

// ============== NAME VALIDATION ==============

/**
 * Blocks non-alphabetic characters from being typed (for name fields)
 * Allows: letters, spaces, hyphens, apostrophes
 */
export const blockNonAlpha = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow control keys (backspace, delete, arrow keys, etc.)
    if (
        e.key === 'Backspace' ||
        e.key === 'Delete' ||
        e.key === 'Tab' ||
        e.key === 'Escape' ||
        e.key === 'Enter' ||
        e.key.startsWith('Arrow') ||
        e.ctrlKey ||
        e.metaKey
    ) {
        return; // Allow these keys
    }

    // Block digits (0-9)
    if (/[0-9]/.test(e.key)) {
        e.preventDefault();
    }

    // Block special characters except space, hyphen, apostrophe
    if (!/^[a-zA-Z\s'\-]$/.test(e.key)) {
        e.preventDefault();
    }
};

/**
 * Validates a name field (first name or last name)
 */
export const validateName = (value: string): { valid: boolean; error?: string } => {
    const trimmed = value.trim();

    if (!trimmed) {
        return { valid: false, error: 'This field is required' };
    }

    if (trimmed.length < 2) {
        return { valid: false, error: 'Must be at least 2 characters' };
    }

    if (trimmed.length > 50) {
        return { valid: false, error: 'Must be less than 50 characters' };
    }

    // Only allow letters, spaces, hyphens, apostrophes
    if (!/^[a-zA-Z\s'\-]+$/.test(trimmed)) {
        return { valid: false, error: 'Only letters, spaces, hyphens allowed' };
    }

    return { valid: true };
};

// ============== EMAIL VALIDATION ==============

/**
 * Validates email format (RFC 5322 simplified)
 */
export const validateEmail = (value: string): { valid: boolean; error?: string } => {
    const trimmed = value.trim().toLowerCase();

    if (!trimmed) {
        return { valid: false, error: 'Email is required' };
    }

    // RFC 5322 simplified regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

    if (!emailRegex.test(trimmed)) {
        return { valid: false, error: 'Please enter a valid email address' };
    }

    return { valid: true };
};

// ============== PHONE VALIDATION ==============

/**
 * Country-specific phone validation rules
 * NSN = National Subscriber Number (without country code)
 */
const COUNTRY_RULES: Record<string, {
    minLen: number;
    maxLen: number;
    pattern?: RegExp;
    name: string;
}> = {
    '91': {
        minLen: 10,
        maxLen: 10,
        pattern: /^[6-9]\d{9}$/,
        name: 'India'
    },
    '1': {
        minLen: 10,
        maxLen: 10,
        name: 'USA/Canada'
    },
    '44': {
        minLen: 10,
        maxLen: 11,
        name: 'UK'
    },
    '61': {
        minLen: 9,
        maxLen: 9,
        name: 'Australia'
    },
    '971': {
        minLen: 9,
        maxLen: 9,
        name: 'UAE'
    },
    '65': {
        minLen: 8,
        maxLen: 8,
        name: 'Singapore'
    },
    '49': {
        minLen: 10,
        maxLen: 11,
        name: 'Germany'
    },
    '86': {
        minLen: 11,
        maxLen: 11,
        name: 'China'
    },
    '81': {
        minLen: 10,
        maxLen: 11,
        name: 'Japan'
    },
};

// Fallback for unlisted countries
const DEFAULT_RULE = { minLen: 7, maxLen: 12, name: 'International' };

/**
 * Validates phone number based on country code
 * @param countryCode - The country dialing code (e.g., "91" for India)
 * @param phoneNumber - The subscriber number (without country code)
 */
export const validatePhone = (
    countryCode: string,
    phoneNumber: string
): { valid: boolean; error?: string } => {
    // Clean the inputs
    const cleanCode = countryCode.replace(/[^0-9]/g, '');
    const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');

    if (!cleanNumber) {
        return { valid: false, error: 'Phone number is required' };
    }

    // Get country-specific rules or use default
    const rule = COUNTRY_RULES[cleanCode] || DEFAULT_RULE;

    // Check length
    if (cleanNumber.length < rule.minLen) {
        return {
            valid: false,
            error: `${rule.name} numbers must be at least ${rule.minLen} digits`
        };
    }

    if (cleanNumber.length > rule.maxLen) {
        return {
            valid: false,
            error: `${rule.name} numbers must be at most ${rule.maxLen} digits`
        };
    }

    // Check country-specific pattern (if exists)
    if (rule.pattern && !rule.pattern.test(cleanNumber)) {
        if (cleanCode === '91') {
            return {
                valid: false,
                error: 'Indian mobile numbers must start with 6, 7, 8, or 9'
            };
        }
        return { valid: false, error: 'Invalid phone number format' };
    }

    return { valid: true };
};

/**
 * Formats phone number for display/storage (E.164 format)
 */
export const formatPhoneE164 = (countryCode: string, phoneNumber: string): string => {
    const cleanCode = countryCode.replace(/[^0-9]/g, '');
    const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
    return `+${cleanCode} ${cleanNumber}`;
};
