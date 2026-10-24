import nodemailer from 'nodemailer';
import { 
  generateVerificationEmailHtml, 
  generateVerificationEmailText 
} from './verificationEmail';

/**
 * Spatial Furniture AI — Custom Mailer Service
 * 
 * Dispatches branded verification emails via SMTP (Gmail SMTP by default).
 * Features:
 * - 100% free with standard Gmail App Passwords
 * - Uses responsive HTML email with amber CTA button
 * - Never logs credentials or sensitive verification tokens
 */

export interface SendVerificationEmailPayload {
  to: string;
  name?: string;
  actionLink: string;
}

export interface MailerResult {
  success: boolean;
  messageId?: string;
  error?: string;
  isTimeout?: boolean;
}

/**
 * Trims whitespace and removes wrapping double or single quotes.
 */
export function cleanEnvVar(val: string | undefined): string {
  if (!val) return '';
  let str = val.trim();
  if ((str.startsWith('"') && str.endsWith('"')) || (str.startsWith("'") && str.endsWith("'"))) {
    str = str.slice(1, -1).trim();
  }
  return str;
}

/**
 * Normalizes Google App Passwords.
 * Removes all internal spaces (e.g., "abcd efgh ijkl mnop" -> "abcdefghijklmnop")
 * and strips any wrapping quotes.
 */
export function cleanAppPassword(val: string | undefined): string {
  if (!val) return '';
  const str = cleanEnvVar(val);
  return str.replace(/\s+/g, '');
}

export function getMailerConfigStatus(): {
  isConfigured: boolean;
  hasHost: boolean;
  hasPort: boolean;
  hasUser: boolean;
  hasPass: boolean;
} {
  const user = cleanEnvVar(process.env.SMTP_USER || process.env.GMAIL_USER);
  const pass = cleanAppPassword(process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD);
  const host = cleanEnvVar(process.env.SMTP_HOST) || 'smtp.gmail.com';
  const port = cleanEnvVar(process.env.SMTP_PORT) || '465';

  return {
    isConfigured: Boolean(user && pass),
    hasHost: Boolean(host),
    hasPort: Boolean(port),
    hasUser: Boolean(user),
    hasPass: Boolean(pass),
  };
}

export function isMailerConfigured(): boolean {
  return getMailerConfigStatus().isConfigured;
}

export function createMailTransporter() {
  const host = cleanEnvVar(process.env.SMTP_HOST) || 'smtp.gmail.com';
  const portStr = cleanEnvVar(process.env.SMTP_PORT) || '465';
  const port = parseInt(portStr, 10) || 465;
  const secure = port === 465;
  const user = cleanEnvVar(process.env.SMTP_USER || process.env.GMAIL_USER);
  const pass = cleanAppPassword(process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD);

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
}

/**
 * Dispatches a branded verification email to the user.
 */
export async function sendCustomVerificationEmail(
  payload: SendVerificationEmailPayload
): Promise<MailerResult> {
  const { to, name, actionLink } = payload;

  if (!to || !actionLink) {
    return {
      success: false,
      error: 'Missing recipient email or verification link.',
    };
  }

  const transporter = createMailTransporter();
  if (!transporter) {
    return {
      success: false,
      error: 'SMTP credentials are not configured on the server.',
    };
  }

  const senderUser = cleanEnvVar(process.env.SMTP_USER || process.env.GMAIL_USER);
  const fromAddress = cleanEnvVar(process.env.SMTP_FROM) || `"Spatial Furniture AI" <${senderUser}>`;

  const html = generateVerificationEmailHtml({
    actionLink,
    recipientEmail: to,
    recipientName: name,
    appName: 'Spatial Furniture AI',
  });

  const text = generateVerificationEmailText({
    actionLink,
    recipientName: name,
    appName: 'Spatial Furniture AI',
  });

  try {
    const info = await transporter.sendMail({
      from: fromAddress,
      to,
      subject: 'Verify Your Email Address | Spatial Furniture AI',
      text,
      html,
    });

    console.info(`[mailer] Verification email successfully sent: recipientPrefix=${to.substring(0, 3)}***, messageId=${info.messageId}`);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown mailer error';
    const isTimeout = /timeout|ETIMEDOUT|ESOCKETTIMEDOUT|ECONNRESET/i.test(errorMsg) ||
      (err && typeof err === 'object' && 'code' in err && ['ETIMEDOUT', 'ESOCKETTIMEDOUT', 'ECONNRESET'].includes((err as { code: string }).code));

    console.error(`[mailer] Failed to send verification email: isTimeout=${Boolean(isTimeout)}, error=${errorMsg}`);

    return {
      success: false,
      error: errorMsg,
      isTimeout: Boolean(isTimeout),
    };
  }
}
