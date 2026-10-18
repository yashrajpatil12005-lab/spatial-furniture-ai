import { describe, it, expect } from 'vitest';
import {
  validateFullName,
  normalizeFullName,
  validatePassword,
  validateConfirmPassword,
  getPasswordStrength,
  FULL_NAME_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
} from '@/lib/utils/validation';

describe('User Validation Utilities', () => {
  describe('validateFullName', () => {
    it('accepts valid standard English names with spaces, hyphens, and apostrophes', () => {
      expect(validateFullName('John Doe').isValid).toBe(true);
      expect(validateFullName("Jane O'Connor").isValid).toBe(true);
      expect(validateFullName('Jean-Luc Picard').isValid).toBe(true);
      expect(validateFullName('Dr. A. P. J. Abdul Kalam').isValid).toBe(true);
    });

    it('accepts valid multilingual and Indic Unicode names', () => {
      expect(validateFullName('यशराज पाटिल').isValid).toBe(true);
      expect(validateFullName('राजेश कुमार').isValid).toBe(true);
      expect(validateFullName('François Müller').isValid).toBe(true);
    });

    it('rejects empty, null, or undefined inputs', () => {
      expect(validateFullName('').isValid).toBe(false);
      expect(validateFullName('   ').isValid).toBe(false);
      // @ts-expect-error testing invalid argument types
      expect(validateFullName(null).isValid).toBe(false);
      // @ts-expect-error testing invalid argument types
      expect(validateFullName(undefined).isValid).toBe(false);
    });

    it('rejects names with numbers or forbidden special characters', () => {
      const numRes = validateFullName('John2 Doe');
      expect(numRes.isValid).toBe(false);
      expect(numRes.error).toContain('cannot contain numbers');

      const symRes = validateFullName('John@Doe');
      expect(symRes.isValid).toBe(false);
      expect(symRes.error).toContain('can only contain letters');

      const emojiRes = validateFullName('John 😀 Doe');
      expect(emojiRes.isValid).toBe(false);
    });

    it('enforces length constraints between 2 and 50 characters', () => {
      expect(validateFullName('A').isValid).toBe(false);
      expect(validateFullName('A'.repeat(51)).isValid).toBe(false);
      expect(validateFullName('Al').isValid).toBe(true);
      expect(validateFullName('A'.repeat(FULL_NAME_MAX_LENGTH)).isValid).toBe(true);
    });

    it('rejects names made purely of punctuation', () => {
      expect(validateFullName('...').isValid).toBe(false);
      expect(validateFullName('---').isValid).toBe(false);
    });
  });

  describe('normalizeFullName', () => {
    it('trims leading/trailing whitespace and collapses multiple consecutive spaces', () => {
      expect(normalizeFullName('  John   Doe  ')).toBe('John Doe');
      expect(normalizeFullName(' Jane    Mary   Watson ')).toBe('Jane Mary Watson');
    });

    it('handles falsy or non-string gracefully', () => {
      expect(normalizeFullName('')).toBe('');
      // @ts-expect-error testing invalid argument type
      expect(normalizeFullName(null)).toBe('');
    });
  });

  describe('validatePassword and getPasswordRequirements', () => {
    it('accepts compliant passwords meeting all 4 criteria', () => {
      const res = validatePassword('Spatial123!');
      expect(res.isValid).toBe(true);
      expect(res.error).toBeUndefined();
      expect(res.requirements.minLength).toBe(true);
      expect(res.requirements.maxLength).toBe(true);
      expect(res.requirements.hasUppercase).toBe(true);
      expect(res.requirements.hasLowercase).toBe(true);
      expect(res.requirements.hasNumber).toBe(true);
      expect(res.requirements.hasSpecial).toBe(true);
    });

    it('rejects empty or missing password', () => {
      const res = validatePassword('');
      expect(res.isValid).toBe(false);
      expect(res.error).toBe('Password must be between 8 and 12 characters.');
      expect(res.requirements.minLength).toBe(false);
    });

    it('rejects passwords shorter than 8 characters', () => {
      const res = validatePassword('Short1!');
      expect(res.isValid).toBe(false);
      expect(res.error).toBe('Password must be between 8 and 12 characters.');
    });

    it('rejects passwords missing lowercase letters', () => {
      const res = validatePassword('ALLCAPS123!');
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('lowercase letter');
    });

    it('rejects passwords missing uppercase letters', () => {
      const res = validatePassword('alllower123!');
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('uppercase letter');
    });

    it('rejects passwords missing numbers', () => {
      const res = validatePassword('NoNumber!');
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('number');
    });

    it('rejects passwords missing special characters', () => {
      const res = validatePassword('AlphaNum123');
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('special character');
    });

    it('enforces 8 to 12 character boundary without silent truncation', () => {
      expect(PASSWORD_MIN_LENGTH).toBe(8);
      expect(PASSWORD_MAX_LENGTH).toBe(12);

      // Boundary: Exactly 8 characters
      const exact8 = 'Pass1!ab';
      expect(exact8.length).toBe(8);
      const res8 = validatePassword(exact8);
      expect(res8.isValid).toBe(true);
      expect(res8.requirements.minLength).toBe(true);
      expect(res8.requirements.maxLength).toBe(true);

      // Boundary: Exactly 12 characters
      const exact12 = 'Pass123!Safe';
      expect(exact12.length).toBe(12);
      const res12 = validatePassword(exact12);
      expect(res12.isValid).toBe(true);
      expect(res12.requirements.minLength).toBe(true);
      expect(res12.requirements.maxLength).toBe(true);

      // 7 characters: below minimum
      const exact7 = 'Pass1!a';
      expect(exact7.length).toBe(7);
      const res7 = validatePassword(exact7);
      expect(res7.isValid).toBe(false);
      expect(res7.requirements.minLength).toBe(false);
      expect(res7.error).toBe('Password must be between 8 and 12 characters.');

      // 13 characters: above maximum
      const exact13 = 'Pass123!Long1';
      expect(exact13.length).toBe(13);
      const res13 = validatePassword(exact13);
      expect(res13.isValid).toBe(false);
      expect(res13.requirements.maxLength).toBe(false);
      expect(res13.error).toBe('Password must be between 8 and 12 characters.');

      // 24 characters: verifies string is never truncated silently
      const longInput = 'VeryLongPassword123!Over';
      expect(longInput.length).toBe(24);
      const resLong = validatePassword(longInput);
      expect(resLong.isValid).toBe(false);
      expect(resLong.requirements.maxLength).toBe(false);
      expect(resLong.error).toBe('Password must be between 8 and 12 characters.');
    });
  });

  describe('validateConfirmPassword', () => {
    it('validates matching passwords', () => {
      const res = validateConfirmPassword('Secret123!', 'Secret123!');
      expect(res.isValid).toBe(true);
      expect(res.error).toBeUndefined();
    });

    it('rejects empty confirmation password', () => {
      const res = validateConfirmPassword('Secret123!', '');
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('Please confirm your password');
    });

    it('rejects mismatched confirmation password', () => {
      const res = validateConfirmPassword('Secret123!', 'Secret999!');
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('Passwords do not match');
    });
  });

  describe('getPasswordStrength', () => {
    it('scores empty or very short passwords as Weak', () => {
      expect(getPasswordStrength('').label).toBe('Weak');
      expect(getPasswordStrength('abc').label).toBe('Weak');
    });

    it('scores passwords with 3 character types as Fair', () => {
      expect(getPasswordStrength('Password123').label).toBe('Fair');
    });

    it('scores 8-9 character passwords with all 4 types as Good', () => {
      expect(getPasswordStrength('Pass12!a').label).toBe('Good');
    });

    it('scores 10-12 character passwords with all 4 types as Strong', () => {
      expect(getPasswordStrength('Spatial123!').label).toBe('Strong');
    });

    it('rewards long passphrases with Strong score', () => {
      expect(getPasswordStrength('correct-Horse-battery-staple').label).toBe('Strong');
    });
  });
});
