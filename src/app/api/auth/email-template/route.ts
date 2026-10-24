import { NextRequest, NextResponse } from 'next/server';
import { 
  generateVerificationEmailHtml, 
  generateVerificationEmailText, 
  getFirebaseConsoleTemplateConfig 
} from '@/lib/email/verificationEmail';
import { getAppBaseUrl } from '@/lib/firebase/auth';

/**
 * GET /api/auth/email-template
 * 
 * Query Parameters:
 * - format: 'html' (default) | 'text' | 'json'
 * - email: recipient email (optional)
 * - name: recipient name (optional)
 * - link: custom action link (optional, defaults to local /auth/action preview link)
 */
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const format = searchParams.get('format') || 'html';
  const email = searchParams.get('email') || 'alex.chen@example.com';
  const name = searchParams.get('name') || 'Alex Chen';
  
  const baseUrl = getAppBaseUrl();
  const sampleLink = searchParams.get('link') || 
    `${baseUrl}/auth/action?mode=verifyEmail&oobCode=sample_oob_verification_code_spatial_ai&apiKey=AIzaSyDummyKeyForPreview&continueUrl=${encodeURIComponent(`${baseUrl}/customer`)}`;

  const templateOptions = {
    actionLink: sampleLink,
    recipientEmail: email,
    recipientName: name,
    appName: 'Spatial Furniture AI',
  };

  if (format === 'text') {
    const textContent = generateVerificationEmailText(templateOptions);
    return new NextResponse(textContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
  }

  if (format === 'json') {
    const htmlContent = generateVerificationEmailHtml(templateOptions);
    const textContent = generateVerificationEmailText(templateOptions);
    const consoleConfig = getFirebaseConsoleTemplateConfig();

    return NextResponse.json({
      subject: 'Verify Your Email Address | Spatial Furniture AI',
      recipientEmail: email,
      recipientName: name,
      actionLink: sampleLink,
      html: htmlContent,
      text: textContent,
      firebaseConsoleConfig: consoleConfig,
    });
  }

  // Default: Return raw HTML with text/html content-type for direct browser preview
  const htmlContent = generateVerificationEmailHtml(templateOptions);
  return new NextResponse(htmlContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}
