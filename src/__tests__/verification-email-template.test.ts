import { describe, it, expect } from 'vitest';
import { 
  generateVerificationEmailHtml, 
  generateVerificationEmailText, 
  getFirebaseConsoleTemplateConfig 
} from '@/lib/email/verificationEmail';

describe('Verification Email Template & Rendering Suite', () => {
  const sampleLink = 'https://spatial-furniture-ai.vercel.app/auth/action?mode=verifyEmail&oobCode=secure-token-12345';
  const recipientEmail = 'designer@spatialstudio.com';
  const recipientName = 'Elena Rostova';

  describe('HTML Email Template Generation', () => {
    it('includes Spatial Furniture AI branding', () => {
      const html = generateVerificationEmailHtml({
        actionLink: sampleLink,
        recipientEmail,
        recipientName,
      });

      expect(html).toContain('Spatial Furniture AI');
      expect(html).toContain('Spatial Computing &amp; Retail AI');
    });

    it('contains the exact required heading: "Verify your email address"', () => {
      const html = generateVerificationEmailHtml({
        actionLink: sampleLink,
        recipientEmail,
        recipientName,
      });

      expect(html).toContain('Verify your email address');
      // Should be in an h1 tag
      expect(html).toMatch(/<h1[^>]*>[\s\S]*?Verify your email address[\s\S]*?<\/h1>/i);
    });

    it('contains the exact required message: "Welcome to Spatial Furniture AI! Please verify your email address to secure your account and get started."', () => {
      const html = generateVerificationEmailHtml({
        actionLink: sampleLink,
        recipientEmail,
        recipientName,
      });

      expect(html).toContain('Welcome to Spatial Furniture AI! Please verify your email address to secure your account and get started.');
    });

    it('renders one prominent amber button labeled "Verify Email Address" with the actual action link', () => {
      const html = generateVerificationEmailHtml({
        actionLink: sampleLink,
        recipientEmail,
        recipientName,
      });

      // Contains prominent button text
      expect(html).toContain('Verify Email Address');

      // Uses amber color #F59E0B
      expect(html).toContain('#F59E0B');

      // Button links to the actual Firebase verification action link (with HTML-safe ampersands)
      expect(html).toContain('href="https://spatial-furniture-ai.vercel.app/auth/action?mode=verifyEmail&amp;oobCode=secure-token-12345"');

      // Includes bulletproof Outlook VML roundrect markup
      expect(html).toContain('v:roundrect');
      expect(html).toContain('fillcolor="#F59E0B"');
    });

    it('contains the exact required footer text: "If you didn\'t create this account, you can safely ignore this email."', () => {
      const html = generateVerificationEmailHtml({
        actionLink: sampleLink,
        recipientEmail,
        recipientName,
      });

      expect(html).toContain("If you didn't create this account, you can safely ignore this email.");
    });

    it('renders a visually secondary fallback link without making the raw URL the dominant visual content', () => {
      const html = generateVerificationEmailHtml({
        actionLink: sampleLink,
        recipientEmail,
        recipientName,
      });

      // Secondary guidance text
      expect(html).toContain('Button not working? Use this link instead:');
      expect(html).toContain('auth/action?mode=verifyEmail&amp;oobCode=secure-token-12345');

      // Kept visually secondary with small font styling
      expect(html).toContain('font-size: 11px');
    });

    it('sanitizes user input to prevent XSS injection in HTML emails', () => {
      const maliciousName = '"><script>alert(1)</script>';
      const maliciousEmail = '"><img src=x onerror=alert(1)>';

      const html = generateVerificationEmailHtml({
        actionLink: sampleLink,
        recipientEmail: maliciousEmail,
        recipientName: maliciousName,
      });

      expect(html).not.toContain('<script>');
      expect(html).not.toContain('<img src=x');
      expect(html).toContain('&quot;&gt;&lt;script&gt;alert(1)&lt;/script&gt;');
    });

    it('supports greeting without recipient name if omitted', () => {
      const html = generateVerificationEmailHtml({
        actionLink: sampleLink,
      });

      expect(html).toContain('Hello,');
      expect(html).toContain('Verify Email Address');
    });
  });

  describe('Plain Text Email Template Generation', () => {
    it('generates compliant plain-text format with required sections', () => {
      const text = generateVerificationEmailText({
        actionLink: sampleLink,
        recipientEmail,
        recipientName,
      });

      expect(text).toContain('SPATIAL FURNITURE AI');
      expect(text).toContain('Verify your email address');
      expect(text).toContain('Welcome to Spatial Furniture AI! Please verify your email address to secure your account and get started.');
      expect(text).toContain('Verify Email Address:');
      expect(text).toContain(sampleLink);
      expect(text).toContain("If you didn't create this account, you can safely ignore this email.");
    });
  });

  describe('Firebase Console Setup Configuration', () => {
    it('provides correct template settings for Firebase Console setup', () => {
      const config = getFirebaseConsoleTemplateConfig();

      expect(config.senderName).toBe('Spatial Furniture AI');
      expect(config.subject).toContain('Verify your email address');
      expect(config.recommendedConsoleBody).toContain('Welcome to Spatial Furniture AI!');
      expect(config.recommendedConsoleBody).toContain('%LINK%');
      expect(config.actionUrlPath).toBe('/auth/action');
    });
  });
});
