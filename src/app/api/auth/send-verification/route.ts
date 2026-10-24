import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, isFirebaseAdminReady, getAdminConfigStatus } from '@/lib/firebase/admin';
import { sendCustomVerificationEmail, getMailerConfigStatus } from '@/lib/email/mailer';
import { verifyAuthToken } from '@/lib/firebase/serverAuth';
import { 
  reserveResendSlot, 
  commitResendSlot, 
  releaseResendSlot 
} from '@/lib/firebase/firestoreRateLimiter';
import { recordSuccessfulResend } from '@/lib/utils/resendRateLimiter';

/**
 * Returns the canonical base URL for the verification link.
 */
function getActionBaseUrl(req: NextRequest): string {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : undefined) ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined);

  if (envUrl) {
    return envUrl.replace(/\/$/, '');
  }

  const host = req.headers.get('host');
  const proto = req.headers.get('x-forwarded-proto') || 'http';
  if (host) {
    return `${proto}://${host}`;
  }

  return 'http://localhost:3000';
}

/**
 * Resolves and verifies the authenticated Firebase user from the Authorization header.
 * First attempts server-side cryptographic verification via Firebase Admin SDK.
 * If Admin SDK is unavailable or token verification fails via Admin SDK, falls back
 * to Google Identity Toolkit REST API verification.
 */
export async function resolveVerifiedUser(req: NextRequest): Promise<{ uid: string; email?: string; emailVerified: boolean } | null> {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split('Bearer ')[1]?.trim();
  if (!token) return null;

  // 1. If Firebase Admin is ready, verify token cryptographically server-side
  if (isFirebaseAdminReady()) {
    const adminAuth = getAdminAuth();
    if (adminAuth) {
      try {
        const decoded = await adminAuth.verifyIdToken(token);
        return {
          uid: decoded.uid,
          email: decoded.email,
          emailVerified: Boolean(decoded.email_verified),
        };
      } catch (err: unknown) {
        const errCode = (err && typeof err === 'object' && 'code' in err) ? (err as { code: string }).code : 'unknown';
        console.warn(`[sendVerificationApi] Admin token verification error: code=${errCode}`);
      }
    }
  }

  // 2. Identity Toolkit REST API verification fallback
  return await verifyAuthToken(req);
}

/**
 * POST /api/auth/send-verification
 * 
 * Generates an authentic Firebase verification link on the server via Firebase Admin SDK
 * and dispatches a branded HTML email using Nodemailer / Gmail SMTP.
 * 
 * Security & Serverless Persistence:
 * - Strictly verifies Firebase ID tokens server-side (returns 401 if unauthenticated).
 * - Recipient email derived strictly from verified token claims; body.email overrides are ignored.
 * - Enforces rolling 1-hour limit (max 5) and 60-second cooldown in Firestore ('email_rate_limits').
 * - Two-phase reservation/commit/release protocol prevents race conditions across Vercel instances.
 * - Definitively failed dispatches release the reservation without consuming quota.
 * - Ambiguous timeouts enforce cooldown to prevent spam while preserving hourly quota.
 * - Verification URLs and credentials are never logged or exposed in API responses.
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Strictly verify user authentication via Firebase ID token
    const verifiedUser = await resolveVerifiedUser(req);
    if (!verifiedUser) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Unauthorized: A valid Firebase authentication token is required.' 
        },
        { status: 401 }
      );
    }

    // Parse body safely
    let body: { action?: string; reservationId?: string; isTimeout?: boolean; name?: string } = {};
    try {
      body = await req.json();
    } catch {
      // Body is optional
    }

    const targetUid = verifiedUser.uid;
    const targetEmail = verifiedUser.email?.trim() || '';

    // Handle auxiliary reservation management actions (e.g. for tracked fallback commits/releases)
    if (body.action === 'commit' && body.reservationId) {
      const commitRes = await commitResendSlot(targetUid, body.reservationId);
      if (!commitRes.success) {
        return NextResponse.json(
          { success: false, error: commitRes.error || 'Invalid or expired reservation.' },
          { status: 400 }
        );
      }
      return NextResponse.json({ success: true, rateStatus: commitRes });
    }

    if (body.action === 'release' && body.reservationId) {
      await releaseResendSlot(targetUid, body.reservationId, { isTimeout: Boolean(body.isTimeout) });
      return NextResponse.json({ success: true });
    }

    // 2. Extract recipient strictly from verified ID token to prevent unauthorized email dispatch
    if (!targetEmail) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Authenticated user account has no associated email address.' 
        },
        { status: 400 }
      );
    }

    // If user is already verified, do not re-send
    if (verifiedUser.emailVerified) {
      return NextResponse.json({
        success: true,
        alreadyVerified: true,
        message: 'User email is already verified.',
      });
    }

    const targetName = body.name?.trim() || undefined;

    // 3. Phase 1: Atomically reserve a dispatch slot in Firestore across all serverless instances
    const reservation = await reserveResendSlot(targetUid);
    if (!reservation.allowed) {
      const retryMsg = reservation.reason === 'hourly_limit'
        ? `Rate limit reached. Please wait ${Math.ceil(reservation.retryAfterSeconds / 60)} minute(s) before requesting another email.`
        : reservation.reason === 'in_flight'
        ? 'A verification request is currently in progress. Please wait a moment.'
        : `Please wait ${reservation.cooldownSeconds || reservation.retryAfterSeconds} seconds before requesting another email.`;

      return NextResponse.json(
        {
          success: false,
          error: retryMsg,
          rateStatus: reservation,
        },
        { status: 429 }
      );
    }

    const reservationId = reservation.reservationId!;

    // 4. Verify server-side dependencies are ready
    const adminStatus = getAdminConfigStatus();
    const mailerStatus = getMailerConfigStatus();

    if (!adminStatus.isReady || !mailerStatus.isConfigured) {
      await releaseResendSlot(targetUid, reservationId, { isTimeout: false, failureReason: 'unconfigured_server' });
      return NextResponse.json(
        {
          success: false,
          error: 'Email verification service is not fully configured on the server. Please verify environment variables (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY, SMTP_USER, SMTP_PASS) in Vercel.',
          configStatus: {
            adminReady: adminStatus.isReady,
            hasProjectId: adminStatus.hasProjectId,
            hasClientEmail: adminStatus.hasClientEmail,
            hasPrivateKey: adminStatus.hasPrivateKey,
            mailerConfigured: mailerStatus.isConfigured,
            hasSmtpUser: mailerStatus.hasUser,
            hasSmtpPass: mailerStatus.hasPass,
          },
        },
        { status: 503 }
      );
    }

    const adminAuth = getAdminAuth();
    if (!adminAuth) {
      await releaseResendSlot(targetUid, reservationId, { isTimeout: false, failureReason: 'admin_init_failed' });
      return NextResponse.json(
        {
          success: false,
          error: 'Firebase Admin Auth could not be initialized. Please verify the FIREBASE_PRIVATE_KEY format on the server.',
        },
        { status: 500 }
      );
    }

    // 5. Generate genuine Firebase email verification link via Admin SDK
    const baseUrl = getActionBaseUrl(req);
    const actionCodeSettings = {
      url: `${baseUrl}/auth/action`,
      handleCodeInApp: true,
    };

    let actionLink: string;
    try {
      actionLink = await adminAuth.generateEmailVerificationLink(targetEmail, actionCodeSettings);
    } catch (genErr: unknown) {
      const errCode = (genErr && typeof genErr === 'object' && 'code' in genErr)
        ? (genErr as { code: string }).code
        : 'unknown';
      console.error(`[sendVerificationApi] Link generation failed: code=${errCode}`);

      // Release reserved slot since link generation failed before sending
      await releaseResendSlot(targetUid, reservationId, { isTimeout: false, failureReason: 'link_generation_failed' });

      return NextResponse.json(
        {
          success: false,
          error: `Failed to generate email verification link from Firebase Admin (code: ${errCode}).`,
        },
        { status: 500 }
      );
    }

    // 6. Send custom branded email with amber button via SMTP
    const mailResult = await sendCustomVerificationEmail({
      to: targetEmail,
      name: targetName,
      actionLink,
    });

    if (!mailResult.success) {
      console.error('[sendVerificationApi] Mail dispatch failed');

      // Phase 3: Release slot with ambiguous timeout awareness
      const isTimeout = Boolean(mailResult.isTimeout);
      await releaseResendSlot(targetUid, reservationId, { 
        isTimeout, 
        failureReason: mailResult.error 
      });

      return NextResponse.json(
        {
          success: false,
          error: 'Failed to dispatch verification email. Please try again later.',
        },
        { status: 500 }
      );
    }

    // 7. Phase 2: Commit successful dispatch in Firestore & update local memory cache
    const commitStatus = await commitResendSlot(targetUid, reservationId);
    recordSuccessfulResend(targetUid, Date.now(), targetEmail);

    // 8. Return sanitized success response (NEVER return actionLink, oobCode, or secrets)
    return NextResponse.json({
      success: true,
      message: 'Verification email dispatched successfully.',
      rateStatus: commitStatus,
    });
  } catch (error: unknown) {
    const errCode = (error && typeof error === 'object' && 'code' in error) ? (error as { code: string }).code : 'unknown';
    console.error(`[sendVerificationApi] Unexpected server error: code=${errCode}`);
    return NextResponse.json(
      { success: false, error: 'Internal server error while processing verification.' },
      { status: 500 }
    );
  }
}
