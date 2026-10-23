/**
 * Spatial Furniture AI — Professional Verification Email Template
 * 
 * Provides production-ready, fully responsive HTML and plain-text email templates
 * compatible with Gmail (Desktop, iOS, Android), Apple Mail, Outlook (Windows/Mac/Web),
 * Yahoo, and modern mobile clients.
 * 
 * Features:
 * - Prominent amber button labeled "Verify Email Address"
 * - Spatial Furniture AI luxury dark-theme branding
 * - Bulletproof Outlook VML roundrect markup
 * - Visually secondary fallback link (avoids dominant raw URL)
 * - Required security footer text
 * - Clean mobile responsiveness
 */

export interface VerificationEmailOptions {
  actionLink: string;
  recipientEmail?: string;
  recipientName?: string;
  appName?: string;
  expiresInHours?: number;
}

/**
 * Sanitizes input to prevent HTML injection in emails.
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Generates a production-ready, bulletproof HTML verification email.
 */
export function generateVerificationEmailHtml(options: VerificationEmailOptions): string {
  const {
    actionLink,
    recipientEmail,
    recipientName,
    appName = 'Spatial Furniture AI',
    expiresInHours = 24,
  } = options;

  const safeLink = escapeHtml(actionLink);
  const safeName = recipientName ? escapeHtml(recipientName) : '';
  const safeEmail = recipientEmail ? escapeHtml(recipientEmail) : '';
  const greeting = safeName ? `Hello ${safeName},` : 'Hello,';

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="color-scheme" content="dark light">
  <meta name="supported-color-schemes" content="dark light">
  <title>Verify your email address — ${escapeHtml(appName)}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    /* CSS Reset */
    html, body {
      margin: 0 auto !important;
      padding: 0 !important;
      height: 100% !important;
      width: 100% !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #0B0F19;
      color: #E2E8F0;
      -webkit-font-smoothing: antialiased;
      -ms-text-size-adjust: 100%;
      -webkit-text-size-adjust: 100%;
    }
    div[style*="margin: 16px 0"] {
      margin: 0 !important;
    }
    table, td {
      mso-table-lspace: 0pt !important;
      mso-table-rspace: 0pt !important;
      border-collapse: collapse !important;
    }
    img {
      -ms-interpolation-mode: bicubic;
      border: 0;
      height: auto;
      line-height: 100%;
      outline: none;
      text-decoration: none;
    }
    a {
      text-decoration: none;
      color: #F59E0B;
    }
    /* Mobile responsive adjustments */
    @media screen and (max-width: 600px) {
      .email-container {
        width: 100% !important;
        margin: auto !important;
        padding: 16px 12px !important;
      }
      .card-body {
        padding: 28px 20px !important;
      }
      .mobile-button {
        width: 100% !important;
        max-width: 100% !important;
        display: block !important;
      }
      .heading-title {
        font-size: 22px !important;
        line-height: 28px !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #0B0F19; word-spacing: normal;">
  <!-- Hidden Preheader text for inbox preview -->
  <div style="display: none; font-size: 1px; color: #0B0F19; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all;">
    Verify your email address to access your Spatial Furniture AI workspace and begin room visualization.
    &#847; &zwnj; &nbsp; &#8199; &shy; &#847; &zwnj; &nbsp; &#8199; &shy;
  </div>

  <!-- Email Wrapper Canvas -->
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0B0F19; table-layout: fixed;">
    <tr>
      <td align="center" style="padding: 32px 16px;">
        
        <!-- Main Card Container (Max width: 580px) -->
        <table role="presentation" class="email-container" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; margin: 0 auto;">
          
          <!-- BRAND HEADER -->
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <!-- Monogram Logo Badge -->
                  <td valign="middle" style="padding-right: 12px;">
                    <div style="width: 40px; height: 40px; border-radius: 12px; background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); text-align: center; line-height: 40px; font-weight: 800; font-size: 20px; color: #0B0F19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; box-shadow: 0 4px 14px rgba(245, 158, 11, 0.3);">
                      S
                    </div>
                  </td>
                  <!-- Brand Name & Product Identifier -->
                  <td valign="middle" style="text-align: left;">
                    <span style="font-size: 19px; font-weight: 800; letter-spacing: -0.02em; color: #FFFFFF; display: block; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                      ${escapeHtml(appName)}
                    </span>
                    <span style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: #F59E0B; display: block;">
                      Spatial Computing &amp; Retail AI
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- MAIN CARD CONTENT -->
          <tr>
            <td style="background-color: #111827; border: 1px solid #1F2937; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.45);">
              
              <!-- Top Amber Hairline Accent -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td height="3" style="background: linear-gradient(90deg, #F59E0B 0%, #FBBF24 50%, #D97706 100%); font-size: 1px; line-height: 1px;">&nbsp;</td>
                </tr>
              </table>

              <!-- Inner Card Padding -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td class="card-body" style="padding: 40px 36px 36px 36px;">
                    
                    <!-- Decorative Verification Icon Badge -->
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                      <tr>
                        <td style="background-color: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.25); border-radius: 12px; padding: 10px 14px; text-align: center;">
                          <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #FBBF24; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                            &#9881; Action Required &bull; Account Security
                          </span>
                        </td>
                      </tr>
                    </table>

                    <!-- REQUIRED HEADING -->
                    <h1 class="heading-title" style="margin: 0 0 16px 0; font-size: 26px; font-weight: 800; line-height: 32px; color: #FFFFFF; letter-spacing: -0.02em; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                      Verify your email address
                    </h1>

                    <!-- GREETING & REQUIRED MESSAGE -->
                    <p style="margin: 0 0 12px 0; font-size: 15px; line-height: 24px; color: #CBD5E1; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                      ${greeting}
                    </p>
                    <p style="margin: 0 0 28px 0; font-size: 15px; line-height: 24px; color: #94A3B8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                      Welcome to Spatial Furniture AI! Please verify your email address to secure your account and get started.
                    </p>

                    ${safeEmail ? `
                    <!-- Registered Email Callout -->
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 28px;">
                      <tr>
                        <td style="background-color: #0F172A; border: 1px solid #1E293B; border-radius: 12px; padding: 12px 16px;">
                          <span style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #64748B; display: block; margin-bottom: 2px;">
                            Account email
                          </span>
                          <span style="font-size: 14px; font-weight: 600; color: #F1F5F9; font-family: monospace;">
                            ${safeEmail}
                          </span>
                        </td>
                      </tr>
                    </table>
                    ` : ''}

                    <!-- PROMINENT AMBER VERIFICATION BUTTON (Requirement 1 & 2) -->
                    <!-- Includes Microsoft Outlook VML Fallback & Clean CSS for Gmail/Apple/Yahoo -->
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 32px 0;">
                      <tr>
                        <td align="center">
                          <!--[if mso]>
                          <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${safeLink}" style="height:52px;v-text-anchor:middle;width:280px;" arcsize="24%" stroke="f" fillcolor="#F59E0B">
                            <w:anchorlock/>
                            <center style="color:#0B0F19;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:15px;font-weight:bold;">
                              Verify Email Address
                            </center>
                          </v:roundrect>
                          <![endif]-->
                          <!--[if !mso]><!-->
                          <a href="${safeLink}" target="_blank" class="mobile-button" style="display: inline-block; background-color: #F59E0B; background-image: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); color: #0B0F19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; font-weight: 800; line-height: 52px; text-align: center; text-decoration: none; padding: 0 32px; border-radius: 14px; box-shadow: 0 4px 18px rgba(245, 158, 11, 0.4); mso-hide: all; -webkit-text-size-adjust: none;">
                            Verify Email Address
                          </a>
                          <!--<![endif]-->
                        </td>
                      </tr>
                    </table>

                    <!-- Security Note -->
                    <p style="margin: 0 0 24px 0; font-size: 13px; line-height: 20px; color: #64748B; text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                      This verification link will expire in ${expiresInHours} hours. Once verified, you will have immediate access to your spatial workspace.
                    </p>

                    <!-- VISUALLY SECONDARY FALLBACK LINK (Requirement 1) -->
                    <!-- Avoids dominant, raw ugly URLs in the main body -->
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-top: 1px solid #1F2937; margin-top: 24px; padding-top: 20px;">
                      <tr>
                        <td>
                          <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 500; color: #64748B; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                            Button not working? Use this link instead:
                          </p>
                          <p style="margin: 0; font-size: 11px; line-height: 16px; word-break: break-all; color: #94A3B8; font-family: monospace;">
                            <a href="${safeLink}" target="_blank" style="color: #F59E0B; text-decoration: underline;">
                              ${safeLink}
                            </a>
                          </p>
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- EMAIL FOOTER (Requirement 1: Small footer text) -->
          <tr>
            <td style="padding: 24px 16px 0 16px; text-align: center;">
              <!-- REQUIRED FOOTER TEXT -->
              <p style="margin: 0 0 8px 0; font-size: 12px; line-height: 18px; color: #64748B; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                If you didn't create this account, you can safely ignore this email.
              </p>
              <p style="margin: 0; font-size: 11px; line-height: 16px; color: #475569; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                &copy; ${new Date().getFullYear()} ${escapeHtml(appName)}. All rights reserved.
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Generates a clean plain-text fallback version of the email for legacy or text-only mail readers.
 */
export function generateVerificationEmailText(options: VerificationEmailOptions): string {
  const {
    actionLink,
    recipientName,
    appName = 'Spatial Furniture AI',
    expiresInHours = 24,
  } = options;

  const greeting = recipientName ? `Hello ${recipientName},` : 'Hello,';

  return `========================================
${appName.toUpperCase()}
========================================

Verify your email address

${greeting}

Welcome to Spatial Furniture AI! Please verify your email address to secure your account and get started.

To verify your account, please visit the verification link below:

Verify Email Address:
${actionLink}

(This verification link expires in ${expiresInHours} hours)

----------------------------------------
If you didn't create this account, you can safely ignore this email.

© ${new Date().getFullYear()} ${appName}. All rights reserved.
`;
}

/**
 * Returns the exact configuration required in the Firebase Console
 * under Authentication -> Templates -> Email address verification.
 */
export function getFirebaseConsoleTemplateConfig() {
  return {
    senderName: 'Spatial Furniture AI',
    subject: 'Verify your email address for Spatial Furniture AI',
    // Message body for Firebase Console default template editor
    // Note: Firebase Console's standard template uses %DISPLAY_NAME%, %APP_NAME%, and %LINK%
    recommendedConsoleBody: `Hello %DISPLAY_NAME%,

Welcome to Spatial Furniture AI! Please verify your email address to secure your account and get started.

Click the link below to verify your email address:
%LINK%

If you didn't create this account, you can safely ignore this email.

Thanks,
The Spatial Furniture AI Team`,
    actionUrlPath: '/auth/action',
  };
}
