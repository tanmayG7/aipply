/**
 * Input sanitization utilities for onboarding forms
 * Provides security against XSS, SQL injection, and other input-based attacks
 */

export type SanitizationType = 'text' | 'email' | 'phone' | 'url' | 'name' | 'jobTitle' | 'skill';

/**
 * Configuration for different sanitization types
 */
const SANITIZATION_CONFIG = {
  text: {
    maxLength: 1000,
    allowedChars: /^[a-zA-Z0-9\s\-._@#$%&*()+=:;,.'"\/?!]*$/,
    stripHtml: true,
    trimWhitespace: true,
  },
  email: {
    maxLength: 254,
    allowedChars: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    stripHtml: true,
    trimWhitespace: true,
    toLowerCase: true,
  },
  phone: {
    maxLength: 15,
    allowedChars: /^[\+\-\s\d()]*$/,
    stripHtml: true,
    trimWhitespace: true,
  },
  url: {
    maxLength: 2048,
    allowedChars: /^https?:\/\/[a-zA-Z0-9\-._~:/?#[\]@!$&'()*+,;=]+$/,
    stripHtml: true,
    trimWhitespace: true,
    toLowerCase: false,
  },
  name: {
    maxLength: 50,
    allowedChars: /^[a-zA-Z\s\-']*$/,
    stripHtml: true,
    trimWhitespace: true,
  },
  jobTitle: {
    maxLength: 100,
    allowedChars: /^[a-zA-Z0-9\s\-._/()&]*$/,
    stripHtml: true,
    trimWhitespace: true,
  },
  skill: {
    maxLength: 50,
    allowedChars: /^[a-zA-Z0-9\s\-._#+]*$/,
    stripHtml: true,
    trimWhitespace: true,
  },
} as const;

/**
 * Common XSS patterns to remove
 */
const XSS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
  /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
  /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
  /<link\b[^<]*>/gi,
  /<meta\b[^<]*>/gi,
  /on\w+\s*=\s*["'][^"']*["']/gi, // Event handlers
  /javascript:/gi,
  /data:(?!image\/)/gi, // Data URLs except images
  /vbscript:/gi,
];

/**
 * SQL injection patterns to detect
 */
const SQL_INJECTION_PATTERNS = [
  /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b)/gi,
  /(--|\/\*|\*\/|;)/gi,
  /(\b(or|and)\b\s+\d+\s*=\s*\d+)/gi,
  /(\b(or|and)\b\s+['"].*['"])/gi,
];

/**
 * Result of sanitization operation
 */
export interface SanitizationResult {
  sanitized: string;
  isValid: boolean;
  errors: string[];
  warnings: string[];
  originalLength: number;
  sanitizedLength: number;
}

/**
 * HTML entity encoding map
 */
const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;',
};

/**
 * Encodes HTML entities to prevent XSS
 */
function encodeHtmlEntities(input: string): string {
  return input.replace(/[&<>"'`=\/]/g, (match) => HTML_ENTITIES[match] || match);
}

/**
 * Strips HTML tags from input
 */
function stripHtmlTags(input: string): string {
  return input.replace(/<[^>]*>/g, '');
}

/**
 * Removes XSS patterns from input
 */
function removeXssPatterns(input: string): string {
  let cleaned = input;
  XSS_PATTERNS.forEach(pattern => {
    cleaned = cleaned.replace(pattern, '');
  });
  return cleaned;
}

/**
 * Detects potential SQL injection attempts
 */
function detectSqlInjection(input: string): boolean {
  return SQL_INJECTION_PATTERNS.some(pattern => pattern.test(input));
}

/**
 * Validates URL format and safety
 */
function validateUrl(url: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  try {
    const urlObj = new URL(url);

    // Only allow HTTP/HTTPS
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      errors.push('Only HTTP and HTTPS URLs are allowed');
    }

    // Check for suspicious patterns
    if (urlObj.hostname.includes('..') || urlObj.pathname.includes('..')) {
      errors.push('URL contains suspicious path traversal patterns');
    }

    // Validate LinkedIn URL specifically
    if (url.includes('linkedin.com')) {
      if (!urlObj.hostname.endsWith('linkedin.com')) {
        errors.push('Invalid LinkedIn domain');
      }
      if (!urlObj.pathname.startsWith('/in/')) {
        errors.push('LinkedIn URL must be a profile URL starting with /in/');
      }
    }

  } catch (error) {
    errors.push('Invalid URL format');
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Main sanitization function
 */
export function sanitizeInput(
  input: string,
  type: SanitizationType
): SanitizationResult {
  const config = SANITIZATION_CONFIG[type];
  const errors: string[] = [];
  const warnings: string[] = [];
  const originalLength = input.length;

  let sanitized = input;

  // Basic validation
  if (typeof input !== 'string') {
    return {
      sanitized: '',
      isValid: false,
      errors: ['Input must be a string'],
      warnings: [],
      originalLength: 0,
      sanitizedLength: 0,
    };
  }

  // Trim whitespace if configured
  if (config.trimWhitespace) {
    sanitized = sanitized.trim();
  }

  // Convert to lowercase if configured
  if ('toLowerCase' in config && config.toLowerCase) {
    sanitized = sanitized.toLowerCase();
  }

  // Check length
  if (sanitized.length > config.maxLength) {
    errors.push(`Input exceeds maximum length of ${config.maxLength} characters`);
    sanitized = sanitized.substring(0, config.maxLength);
    warnings.push(`Input was truncated to ${config.maxLength} characters`);
  }

  // Strip HTML if configured
  if (config.stripHtml) {
    const beforeStrip = sanitized;
    sanitized = stripHtmlTags(sanitized);
    if (beforeStrip !== sanitized) {
      warnings.push('HTML tags were removed from input');
    }
  }

  // Remove XSS patterns
  const beforeXss = sanitized;
  sanitized = removeXssPatterns(sanitized);
  if (beforeXss !== sanitized) {
    warnings.push('Potentially malicious patterns were removed');
  }

  // Detect SQL injection
  if (detectSqlInjection(sanitized)) {
    errors.push('Input contains potential SQL injection patterns');
  }

  // Validate against allowed characters
  if (!config.allowedChars.test(sanitized) && sanitized.length > 0) {
    errors.push(`Input contains invalid characters for type: ${type}`);
  }

  // Type-specific validation
  if (type === 'url' && sanitized.length > 0) {
    const urlValidation = validateUrl(sanitized);
    if (!urlValidation.isValid) {
      errors.push(...urlValidation.errors);
    }
  }

  // Additional validation for email
  if (type === 'email' && sanitized.length > 0) {
    if (!sanitized.includes('@') || sanitized.split('@').length !== 2) {
      errors.push('Invalid email format');
    }
  }

  // Encode remaining special characters for extra safety
  sanitized = encodeHtmlEntities(sanitized);

  return {
    sanitized,
    isValid: errors.length === 0,
    errors,
    warnings,
    originalLength,
    sanitizedLength: sanitized.length,
  };
}

/**
 * Sanitizes an array of strings (useful for skills)
 */
export function sanitizeStringArray(
  inputs: string[],
  type: SanitizationType
): {
  sanitized: string[];
  results: SanitizationResult[];
  isValid: boolean;
  totalErrors: number;
  totalWarnings: number;
} {
  const results = inputs.map(input => sanitizeInput(input, type));
  const sanitized = results
    .filter(result => result.isValid && result.sanitized.length > 0)
    .map(result => result.sanitized);

  return {
    sanitized,
    results,
    isValid: results.every(result => result.isValid),
    totalErrors: results.reduce((sum, result) => sum + result.errors.length, 0),
    totalWarnings: results.reduce((sum, result) => sum + result.warnings.length, 0),
  };
}

/**
 * Batch sanitization for form data
 */
export function sanitizeFormData(formData: Record<string, unknown>): {
  sanitized: Record<string, unknown>;
  results: Record<string, SanitizationResult>;
  isValid: boolean;
} {
  const sanitized: Record<string, unknown> = {};
  const results: Record<string, SanitizationResult> = {};

  // Define field types for onboarding form
  const fieldTypes: Record<string, SanitizationType> = {
    firstName: 'name',
    lastName: 'name',
    email: 'email',
    mobileNumber: 'phone',
    jobTitle: 'jobTitle',
    expectedCTC: 'text',
    linkedinProfile: 'url',
  };

  Object.entries(formData).forEach(([key, value]) => {
    if (typeof value === 'string') {
      const type = fieldTypes[key] || 'text';
      const result = sanitizeInput(value, type);
      results[key] = result;
      sanitized[key] = result.sanitized;
    } else if (Array.isArray(value) && key === 'skills') {
      const arrayResult = sanitizeStringArray(value as string[], 'skill');
      sanitized[key] = arrayResult.sanitized;
      results[key] = {
        sanitized: arrayResult.sanitized.join(', '),
        isValid: arrayResult.isValid,
        errors: arrayResult.totalErrors > 0 ? [`${arrayResult.totalErrors} errors in skills`] : [],
        warnings: arrayResult.totalWarnings > 0 ? [`${arrayResult.totalWarnings} warnings in skills`] : [],
        originalLength: value.length,
        sanitizedLength: arrayResult.sanitized.length,
      };
    } else {
      // Pass through non-string values unchanged
      sanitized[key] = value;
    }
  });

  const isValid = Object.values(results).every(result => result.isValid);

  return { sanitized, results, isValid };
}

/**
 * Quick sanitization helpers for common cases
 */
export const sanitize = {
  name: (input: string) => sanitizeInput(input, 'name').sanitized,
  email: (input: string) => sanitizeInput(input, 'email').sanitized,
  phone: (input: string) => sanitizeInput(input, 'phone').sanitized,
  url: (input: string) => sanitizeInput(input, 'url').sanitized,
  text: (input: string) => sanitizeInput(input, 'text').sanitized,
  jobTitle: (input: string) => sanitizeInput(input, 'jobTitle').sanitized,
  skill: (input: string) => sanitizeInput(input, 'skill').sanitized,
};