import { NextRequest, NextResponse } from 'next/server';
import {
  getAdminAuth,
  isFirebaseAdminReady,
  getAdminConfigStatus,
} from '@/lib/firebase/admin';
import {
  sendCustomVerificationEmail,
  getMailerConfigStatus,
} from '@/lib/email/mailer';
import { verifyAuthToken } from '@/lib/firebase/serverAuth';
import {
  reserveResendSlot,
  commitResendSlot,
  releaseResendSlot,
} from '@/lib/firebase/firestoreRateLimiter';
import { recordSuccessfulResend } from '@/lib/utils/resendRateLimiter';

/**
 * Canonical production URL used for Firebase email verification.
 * The hostname must be listed in Firebase Authentication
 * > Settings > Authorized domains.
 */
const APP_BASE_URL = 'https://spatial-furniture-ai.vercel.app';
const EMAIL_ACTION_URL = `${APP_BASE_URL}/auth/action`;

/**
 * Resolves and verifies the authenticated Firebase user from
 * the Authorization header.
 *
 * First attempts verification using Firebase Admin SDK.
 * If that fails, falls back to Identity Toolkit verification.
 */
export async function resolveVerifiedUser(
  req: NextRequest,
): Promise<{
  uid: string;
  email?: string;
  emailVerified: boolean;
} | null> {
  const authHeader = req.headers.get('authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.slice('Bearer '.length).trim();

  if (!token) {
    return null;
  }

  // 1. Verify through Firebase Admin when available.
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
        const errCode =
          err && typeof err === 'object' && 'code' in err
            ? (err as { code: string }).code
            : 'unknown';

        console.warn(
          `[sendVerificationApi] Admin token verification failed: code=${errCode}`,
        );
      }
    }
  }

  // 2. Fall back to Identity Toolkit token verification.
  return await verifyAuthToken(req);
}

/**
 * POST /api/auth/send-verification
 *
 * Generates a Firebase email verification link and sends it
 * through the configured custom email service.
 */
export async function POST(req: NextRequest) {
  let targetUid: string | undefined;
  let reservationId: string | undefined;

  try {
    // 1. Authenticate the user.
    const verifiedUser = await resolveVerifiedUser(req);

    if (!verifiedUser) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Unauthorized: A valid Firebase authentication token is required.',
        },
        { status: 401 },
      );
    }

    targetUid = verifiedUser.uid;

    // Parse optional request body.
    let body: {
      action?: string;
      reservationId?: string;
      isTimeout?: boolean;
      name?: string;
    } = {};

    try {
      body = await req.json();
    } catch {
      // An empty body is permitted.
    }

    // Handle reservation commit/release operations.
    if (body.action === 'commit' && body.reservationId) {
      const result = await commitResendSlot(
        targetUid,
        body.reservationId,
      );

      if (!result.success) {
        return NextResponse.json(
          {
            success: false,
            error: result.error || 'Invalid or expired reservation.',
          },
          { status: 400 },
        );
      }

      return NextResponse.json({
        success: true,
        rateStatus: result,
      });
    }

    if (body.action === 'release' && body.reservationId) {
      await releaseResendSlot(targetUid, body.reservationId, {
        isTimeout: Boolean(body.isTimeout),
      });

      return NextResponse.json({ success: true });
    }

    // 2. Get the email only from the verified token.
    const targetEmail = verifiedUser.email?.trim() || '';

    if (!targetEmail) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authenticated user account has no associated email address.',
        },
        { status: 400 },
      );
    }

    if (verifiedUser.emailVerified) {
      return NextResponse.json({
        success: true,
        alreadyVerified: true,
        message: 'User email is already verified.',
      });
    }

    const targetName = body.name?.trim() || undefined;

    // 3. Reserve a rate-limit slot.
    const reservation = await reserveResendSlot(targetUid);

    if (!reservation.allowed) {
      const retryMsg =
        reservation.reason === 'hourly_limit'
          ? `Rate limit reached. Please wait ${Math.ceil(
            reservation.retryAfterSeconds / 60,
          )} minute(s) before requesting another email.`
          : reservation.reason === 'in_flight'
            ? 'A verification request is currently in progress. Please wait a moment.'
            : `Please wait ${reservation.cooldownSeconds ||
            reservation.retryAfterSeconds
            } seconds before requesting another email.`;

      return NextResponse.json(
        {
          success: false,
          error: retryMsg,
          rateStatus: reservation,
        },
        { status: 429 },
      );
    }

    reservationId = reservation.reservationId!;

    // 4. Verify server configuration.
    const adminStatus = getAdminConfigStatus();
    const mailerStatus = getMailerConfigStatus();

    if (!adminStatus.isReady || !mailerStatus.isConfigured) {
      await releaseResendSlot(targetUid, reservationId, {
        isTimeout: false,
        failureReason: 'unconfigured_server',
      });

      reservationId = undefined;

      return NextResponse.json(
        {
          success: false,
          error:
            'Email verification service is not fully configured on the server. Check the Firebase Admin and SMTP environment variables in Vercel.',
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
        { status: 503 },
      );
    }

    const adminAuth = getAdminAuth();

    if (!adminAuth) {
      await releaseResendSlot(targetUid, reservationId, {
        isTimeout: false,
        failureReason: 'admin_init_failed',
      });

      reservationId = undefined;

      return NextResponse.json(
        {
          success: false,
          error:
            'Firebase Admin Auth could not be initialized. Check the Firebase Admin environment configuration.',
        },
        { status: 500 },
      );
    }

    // 5. Generate the Firebase verification link using the
    // exact production continue URL.
    const actionCodeSettings = {
      url: 'https://spatial-furniture-ai.vercel.app/verify-email?verified=1',
      handleCodeInApp: true,
    };

    let actionLink: string;

    try {
      actionLink = await adminAuth.generateEmailVerificationLink(
        targetEmail,
        actionCodeSettings,
      );
    } catch (genErr: unknown) {
      const errCode =
        genErr && typeof genErr === 'object' && 'code' in genErr
          ? (genErr as { code: string }).code
          : 'unknown';

      console.error(
        `[sendVerificationApi] Link generation failed: code=${errCode}`,
      );

      await releaseResendSlot(targetUid, reservationId, {
        isTimeout: false,
        failureReason: 'link_generation_failed',
      });

      reservationId = undefined;

      return NextResponse.json(
        {
          success: false,
          error: `Failed to generate email verification link from Firebase Admin (code: ${errCode}).`,
        },
        { status: 500 },
      );
    }

    // 6. Send the branded verification email.
    const mailResult = await sendCustomVerificationEmail({
      to: targetEmail,
      name: targetName,
      actionLink,
    });

    if (!mailResult.success) {
      console.error('[sendVerificationApi] Mail dispatch failed');

      await releaseResendSlot(targetUid, reservationId, {
        isTimeout: Boolean(mailResult.isTimeout),
        failureReason: mailResult.error,
      });

      reservationId = undefined;

      return NextResponse.json(
        {
          success: false,
          error: 'Failed to dispatch verification email. Please try again later.',
        },
        { status: 500 },
      );
    }

    // 7. Commit the successful send.
    const commitStatus = await commitResendSlot(
      targetUid,
      reservationId,
    );

    reservationId = undefined;

    recordSuccessfulResend(targetUid, Date.now(), targetEmail);

    // 8. Never expose the generated action link or verification code.
    return NextResponse.json({
      success: true,
      message: 'Verification email dispatched successfully.',
      rateStatus: commitStatus,
    });
  } catch (error: unknown) {
    const errCode =
      error && typeof error === 'object' && 'code' in error
        ? (error as { code: string }).code
        : 'unknown';

    console.error(
      `[sendVerificationApi] Unexpected server error: code=${errCode}`,
    );

    // Release any reservation left by an unexpected failure.
    if (targetUid && reservationId) {
      try {
        await releaseResendSlot(targetUid, reservationId, {
          isTimeout: false,
          failureReason: 'unexpected_server_error',
        });
      } catch {
        console.error(
          '[sendVerificationApi] Failed to release resend reservation.',
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error while processing verification.',
      },
      { status: 500 },
    );
  }
}