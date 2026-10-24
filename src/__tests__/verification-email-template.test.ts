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

    it('contains the exact title tag: "Verify Your Email Address | Spatial Furniture AI"', () => {
      const html = generateVerificationEmailHtml({
        actionLink: sampleLink,
        recipientEmail,
        recipientName,
      });

      expect(html).toContain('<title>Verify Your Email Address | Spatial Furniture AI</title>');
    });

    it('renders with dark navy background (#0B0F19) and white content card (#FFFFFF)', () => {
      const html = generateVerificationEmailHtml({
        actionLink: sampleLink,
        recipientEmail,
        recipientName,
      });

      // Dark navy canvas
      expect(html).toContain('background-color: #0B0F19');
      // White content card
      expect(html).toContain('background-color: #FFFFFF');
      // Top amber accent bar
      expect(html).toContain('linear-gradient(90deg, #F59E0B');
    });

    it('contains the exact required heading: "Verify Your Email Address" in an h1 tag', () => {
      const html = generateVerificationEmailHtml({
        actionLink: sampleLink,
        recipientEmail,
        recipientName,
      });

      expect(html).toMatch(/<h1[^>]*>[\s\S]*?Verify Your Email Address[\s\S]*?<\/h1>/i);
    });

    it('contains the exact required welcome message and body paragraphs', () => {
      const html = generateVerificationEmailHtml({
        actionLink: sampleLink,
        recipientEmail,
        recipientName,
      });

      expect(html).toContain('Welcome to Spatial Furniture AI!');
      expect(html).toContain("Thank you for creating your account. We're excited to help you discover furniture and visualize how it can fit into your space.");
      expect(html).toContain('To secure your account and unlock your personalized furniture experience, please verify your email address by clicking the button below.');
    });

    it('renders one prominent amber button labeled "Verify Email Address" with the actual action link', () => {
      const html = generateVerificationEmailHtml({
        actionLink: sampleLink,
        recipientEmail,
        recipientName,
      });

      // Button label
      expect(html).toContain('Verify Email Address');

      // Amber brand color
      expect(html).toContain('#F59E0B');

      // Real HTML anchor linking to the action link
      expect(html).toContain('href="https://spatial-furniture-ai.vercel.app/auth/action?mode=verifyEmail&amp;oobCode=secure-token-12345"');

      // Outlook VML roundrect markup for bulletproof email rendering
      expect(html).toContain('v:roundrect');
      expect(html).toContain('fillcolor="#F59E0B"');
    });

    it('does NOT expose the raw verification URL as visible text', () => {
      const html = generateVerificationEmailHtml({
        actionLink: sampleLink,
        recipientEmail,
        recipientName,
      });

      // The raw link must only exist within attribute values (href=...), never as plain text inside tags
      const withoutHrefs = html.replace(/href="[^"]*"/g, '').replace(/href='[^']*'/g, '');
      expect(withoutHrefs).not.toContain('https://spatial-furniture-ai.vercel.app/auth/action?mode=verifyEmail');
    });

    it('contains the exact required closing and footer text', () => {
      const html = generateVerificationEmailHtml({
        actionLink: sampleLink,
        recipientEmail,
        recipientName,
      });

      expect(html).toContain("If you didn't create this account, you can safely ignore this email.");
      expect(html).toContain('Thank you for joining us!');
      expect(html).toContain('Warm regards,');
      expect(html).toContain('The Spatial Furniture AI Team');
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
    it('generates compliant plain-text format with required sections and copy', () => {
      const text = generateVerificationEmailText({
        actionLink: sampleLink,
        recipientEmail,
        recipientName,
      });

      expect(text).toContain('SPATIAL FURNITURE AI');
      expect(text).toContain('Verify Your Email Address | Spatial Furniture AI');
      expect(text).toContain('Welcome to Spatial Furniture AI!');
      expect(text).toContain("Thank you for creating your account. We're excited to help you discover furniture and visualize how it can fit into your space.");
      expect(text).toContain('To secure your account and unlock your personalized furniture experience, please verify your email address by clicking the button below:');
      expect(text).toContain('Verify Email Address:');
      expect(text).toContain(sampleLink);
      expect(text).toContain("If you didn't create this account, you can safely ignore this email.");
      expect(text).toContain('Thank you for joining us!');
      expect(text).toContain('Warm regards,');
      expect(text).toContain('The Spatial Furniture AI Team');
    });
  });

  describe('Firebase Console Setup Configuration', () => {
    it('provides correct template settings for Firebase Console setup with %LINK%', () => {
      const config = getFirebaseConsoleTemplateConfig();

      expect(config.senderName).toBe('Spatial Furniture AI');
      expect(config.subject).toBe('Verify Your Email Address | Spatial Furniture AI');
      expect(config.actionUrlPath).toBe('/auth/action');
      expect(config.recommendedConsoleHtmlBody).toContain('Welcome to Spatial Furniture AI!');
      expect(config.recommendedConsoleHtmlBody).toContain('%LINK%');
      expect(config.recommendedConsoleHtmlBody).toContain('#0B0F19');
      expect(config.recommendedConsoleHtmlBody).toContain('#ffffff');
      expect(config.recommendedConsolePlainTextBody).toContain('Welcome to Spatial Furniture AI!');
      expect(config.recommendedConsolePlainTextBody).toContain('%LINK%');
      expect(config.recommendedConsolePlainTextBody).toContain('The Spatial Furniture AI Team');
    });
  });
});
