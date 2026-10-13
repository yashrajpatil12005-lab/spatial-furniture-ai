export const FULL_NAME_MIN_LENGTH = 2;
export const FULL_NAME_MAX_LENGTH = 50;

// Matches any Unicode letter (including Latin, Devanagari, Tamil, Telugu, Hindi, Marathi, etc.)
const HAS_LETTER_REGEX = /[\p{L}]/u;

// Matches any Unicode digit / number
const DIGIT_REGEX = /\p{N}/u;

// Allows Unicode letters (\p{L}), Unicode marks (\p{M} for Indic vowel signs / combining diacritics),
// spaces, hyphens (-), apostrophes (' and typographic ’), and periods (.)
const INVALID_CHARS_REGEX = /[^\p{L}\p{M}\s.'’-]/u;

export interface FullNameValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates a user's Full Name according to professional application standards:
 * - Minimum length: 2 characters after trimming whitespace.
 * - Maximum length: 50 characters.
 * - Allows letters from different languages (English, Indian names in Devanagari/regional scripts, accented letters).
 * - Allows spaces, hyphens (-), apostrophes ('), and periods (.) for legitimate names.
 * - Disallows numbers, symbols (@, #, $, etc.), and emojis.
 * - Does not force every name to contain exactly two words (single and multiple names accepted).
 */
export function validateFullName(name: string): FullNameValidationResult {
  if (name === undefined || name === null || typeof name !== 'string') {
    return { isValid: false, error: 'Full Name is required.' };
  }

  const trimmed = name.trim();

  if (trimmed.length === 0) {
    return { isValid: false, error: 'Full Name is required.' };
  }

  // Check for numbers
  if (DIGIT_REGEX.test(name)) {
    return { isValid: false, error: 'Full Name cannot contain numbers.' };
  }

  // Check for emojis or unsupported symbols
  if (INVALID_CHARS_REGEX.test(name)) {
    return {
      isValid: false,
      error: "Full Name can only contain letters, spaces, hyphens (-), apostrophes ('), and periods (.).",
    };
  }

  // Check minimum length after trimming whitespace
  if (trimmed.length < FULL_NAME_MIN_LENGTH) {
    return {
      isValid: false,
      error: `Full Name must be at least ${FULL_NAME_MIN_LENGTH} characters.`,
    };
  }

  // Check maximum length (both trimmed and raw)
  if (trimmed.length > FULL_NAME_MAX_LENGTH || name.length > FULL_NAME_MAX_LENGTH) {
    return {
      isValid: false,
      error: `Full Name cannot exceed ${FULL_NAME_MAX_LENGTH} characters.`,
    };
  }

  // Must contain at least one letter (prevents names made purely of punctuation e.g. "..." or "--")
  if (!HAS_LETTER_REGEX.test(trimmed)) {
    return {
      isValid: false,
      error: 'Full Name must contain at least one letter.',
    };
  }

  return { isValid: true };
}

/**
 * Normalizes a full name before saving:
 * - Trims leading and trailing whitespace
 * - Prevents multiple consecutive spaces by collapsing them to a single space
 */
export function normalizeFullName(name: string): string {
  if (!name || typeof name !== 'string') return '';
  return name.trim().replace(/\s+/g, ' ');
}

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

export type PasswordStrengthLabel = 'Weak' | 'Fair' | 'Good' | 'Strong';

export interface PasswordRequirements {
  minLength: boolean;
  maxLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

export interface PasswordStrength {
  score: number;
  label: PasswordStrengthLabel;
  percent: number;
  color: string;
}

export interface PasswordValidationResult {
  isValid: boolean;
  error?: string;
  requirements: PasswordRequirements;
}

/**
 * Evaluates which password requirements are currently satisfied.
 * Never trims or modifies the password string.
 */
export function getPasswordRequirements(password: string): PasswordRequirements {
  const p = typeof password === 'string' ? password : '';
  return {
    minLength: p.length >= PASSWORD_MIN_LENGTH,
    maxLength: p.length <= PASSWORD_MAX_LENGTH && p.length > 0,
    hasUppercase: /[A-Z]/.test(p),
    hasLowercase: /[a-z]/.test(p),
    hasNumber: /[0-9]/.test(p),
    hasSpecial: /[^A-Za-z0-9]/.test(p),
  };
}

/**
 * Calculates live password strength: Weak, Fair, Good, or Strong.
 * - Weak (0-25%): length < 8 or meets <= 2 character classes
 * - Fair (50%): length >= 8 and meets 3 character classes
 * - Good (75%): length >= 8 and meets all 4 character classes
 * - Strong (100%): length >= 10 and meets all 4 character classes, or long passphrase (>= 16 chars)
 */
export function getPasswordStrength(password: string): PasswordStrength {
  if (!password || typeof password !== 'string' || password.length === 0) {
    return { score: 0, label: 'Weak', percent: 0, color: '#EF4444' };
  }

  const reqs = getPasswordRequirements(password);
  const len = password.length;

  if (len < PASSWORD_MIN_LENGTH) {
    return { score: 1, label: 'Weak', percent: 25, color: '#EF4444' };
  }

  let charTypesCount = 0;
  if (reqs.hasUppercase) charTypesCount++;
  if (reqs.hasLowercase) charTypesCount++;
  if (reqs.hasNumber) charTypesCount++;
  if (reqs.hasSpecial) charTypesCount++;

  // Long passphrase bonus: >= 16 characters with at least 3 character types gets Strong
  if (len >= 16 && charTypesCount >= 3) {
    return { score: 4, label: 'Strong', percent: 100, color: '#10B981' };
  }

  if (charTypesCount <= 2) {
    return { score: 1, label: 'Weak', percent: 25, color: '#EF4444' };
  } else if (charTypesCount === 3) {
    return { score: 2, label: 'Fair', percent: 50, color: '#F59E0B' };
  } else {
    // All 4 character classes met
    if (len >= 10) {
      return { score: 4, label: 'Strong', percent: 100, color: '#10B981' };
    }
    return { score: 3, label: 'Good', percent: 75, color: '#3B82F6' };
  }
}

/**
 * Validates password against the registration password policy:
 * - 8 to 128 characters
 * - Uppercase, Lowercase, Number, and Special character
 * Never trims or modifies the password string.
 */
export function validatePassword(password: string): PasswordValidationResult {
  if (!password || typeof password !== 'string' || password.length === 0) {
    return {
      isValid: false,
      error: 'Password is required.',
      requirements: getPasswordRequirements(''),
    };
  }

  const requirements = getPasswordRequirements(password);

  if (password.length < PASSWORD_MIN_LENGTH) {
    return {
      isValid: false,
      error: `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`,
      requirements,
    };
  }

  if (password.length > PASSWORD_MAX_LENGTH) {
    return {
      isValid: false,
      error: `Password cannot exceed ${PASSWORD_MAX_LENGTH} characters.`,
      requirements,
    };
  }

  if (!requirements.hasLowercase) {
    return {
      isValid: false,
      error: 'Password must include at least one lowercase letter.',
      requirements,
    };
  }

  if (!requirements.hasUppercase) {
    return {
      isValid: false,
      error: 'Password must include at least one uppercase letter.',
      requirements,
    };
  }

  if (!requirements.hasNumber) {
    return {
      isValid: false,
      error: 'Password must include at least one number.',
      requirements,
    };
  }

  if (!requirements.hasSpecial) {
    return {
      isValid: false,
      error: 'Password must include at least one special character.',
      requirements,
    };
  }

  return {
    isValid: true,
    requirements,
  };
}

/**
 * Validates confirm password against the original password.
 */
export function validateConfirmPassword(
  password: string,
  confirmPassword: string
): { isValid: boolean; error?: string } {
  if (!confirmPassword || confirmPassword.length === 0) {
    return { isValid: false, error: 'Please confirm your password.' };
  }
  if (password !== confirmPassword) {
    return { isValid: false, error: 'Passwords do not match.' };
  }
  return { isValid: true };
}

