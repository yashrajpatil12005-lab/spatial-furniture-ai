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
      const res = validatePassword('SpatialPass123!');
      expect(res.isValid).toBe(true);
      expect(res.error).toBeUndefined();
      expect(res.requirements.minLength).toBe(true);
      expect(res.requirements.hasUppercase).toBe(true);
      expect(res.requirements.hasLowercase).toBe(true);
      expect(res.requirements.hasNumber).toBe(true);
      expect(res.requirements.hasSpecial).toBe(true);
    });

    it('rejects passwords shorter than 8 characters', () => {
      const res = validatePassword('Short1!');
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('at least 8 characters');
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
      const res = validatePassword('NoNumbersSpecial!');
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('number');
    });

    it('rejects passwords missing special characters', () => {
      const res = validatePassword('AlphaNumeric1234');
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('special character');
    });

    it('enforces 8 to 64 character boundary without silent truncation', () => {
      expect(PASSWORD_MIN_LENGTH).toBe(8);
      expect(PASSWORD_MAX_LENGTH).toBe(64);

      // Exactly 64 characters (3 + 61)
      const exact64 = 'A1!' + 'x'.repeat(61);
      expect(exact64.length).toBe(64);
      const res64 = validatePassword(exact64);
      expect(res64.isValid).toBe(true);
      expect(res64.requirements.maxLength).toBe(true);

      // 65 characters (3 + 62)
      const exact65 = 'A1!' + 'x'.repeat(62);
      expect(exact65.length).toBe(65);
      const res65 = validatePassword(exact65);
      expect(res65.isValid).toBe(false);
      expect(res65.requirements.maxLength).toBe(false);
      expect(res65.error).toBe('Password cannot exceed 64 characters.');

      // 80 characters: verifies string is never truncated silently
      const longInput = 'A1!' + 'x'.repeat(77);
      expect(longInput.length).toBe(80);
      const resLong = validatePassword(longInput);
      expect(resLong.isValid).toBe(false);
      expect(resLong.error).toBe('Password cannot exceed 64 characters.');
    });
  });

  describe('validateConfirmPassword', () => {
    it('validates matching passwords', () => {
      const res = validateConfirmPassword('SecretPass123!', 'SecretPass123!');
      expect(res.isValid).toBe(true);
      expect(res.error).toBeUndefined();
    });

    it('rejects empty confirmation password', () => {
      const res = validateConfirmPassword('SecretPass123!', '');
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('Please confirm your password');
    });

    it('rejects mismatched confirmation password', () => {
      const res = validateConfirmPassword('SecretPass123!', 'SecretPass999!');
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

    it('scores 10+ character passwords with all 4 types as Strong', () => {
      expect(getPasswordStrength('SpatialDesign2026!').label).toBe('Strong');
    });

    it('rewards long passphrases with Strong score', () => {
      expect(getPasswordStrength('correct-Horse-battery-staple').label).toBe('Strong');
    });
  });
});
