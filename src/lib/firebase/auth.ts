import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  sendEmailVerification,
  applyActionCode,
  ActionCodeSettings,
  User,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from './config';
import { 
  normalizeFullName, 
  validateFullName, 
  validatePassword 
} from '@/lib/utils/validation';
import { 
  checkResendRateLimit,
  recordSuccessfulResend, 
  recordThrottleCooldown 
} from '@/lib/utils/resendRateLimiter';

export type AllowedRegistrationRole = 'customer' | 'retailer';

/**
 * Returns the canonical base URL for the current environment.
 * Ensures localhost works in development and the deployed domain works in production.
 */
export function getAppBaseUrl(): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  const envUrl = process.env.NEXT_PUBLIC_APP_URL || 
                 (process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : undefined) ||
                 (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined);
  if (envUrl) {
    return envUrl.replace(/\/$/, '');
  }
  return 'http://localhost:3000';
}

/**
 * Constructs Firebase ActionCodeSettings for email verification with a dynamic return URL.
 */
export function getActionCodeSettings(continuePath: string = '/auth/action'): ActionCodeSettings {
  const baseUrl = getAppBaseUrl();
  return {
    url: `${baseUrl}${continuePath}`,
    handleCodeInApp: true,
  };
}

/**
 * Maps Firebase Auth error codes to safe, informative user-facing messages.
 * Never leaks internal configuration or sensitive server details.
 */
export function getFriendlyAuthErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'code' in error) {
    const code = (error as { code: string }).code;
    switch (code) {
      case 'auth/no-current-user':
        return 'No authenticated user session found. Please sign in to verify your email.';
      case 'auth/email-already-in-use':
        return 'An account with this email address already exists.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/weak-password':
        return 'Password does not meet the minimum security requirements.';
      case 'auth/invalid-credential':
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-login-credentials':
        return 'Invalid email or password. Please try again.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Firebase has temporarily throttled email requests for this account. Please wait a moment before trying again.';
      case 'auth/user-disabled':
        return 'This account has been disabled. Please contact support.';
      case 'auth/network-request-failed':
        return 'Network connection issue. Please check your internet connection.';
      case 'auth/requires-recent-login':
        return 'Please sign in again to verify your identity.';
      case 'auth/expired-action-code':
        return 'This verification link has expired. Please request a new verification email.';
      case 'auth/invalid-action-code':
        return 'This verification link is invalid or has already been used. Please check if your email is already verified, or request a new verification link.';
      case 'auth/unauthorized-continue-uri':
        return 'The domain is not authorized in Firebase Console settings. Please add your domain (e.g. your Vercel deployment URL) under Authentication -> Settings -> Authorized domains in the Firebase Console.';
      case 'auth/invalid-continue-uri':
        return 'The verification continue URL provided is invalid.';
      case 'auth/quota-exceeded':
        return 'Daily email verification quota exceeded. Please try again later or contact support.';
      default:
        break;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected authentication error occurred. Please try again.';
}

// 1. Register with email/password
export const registerUser = async (
  email: string, 
  password: string, 
  name: string,
  role: AllowedRegistrationRole = 'customer'
) => {
  // Validate name
  const normalizedName = normalizeFullName(name);
  const nameVal = validateFullName(normalizedName);
  if (!nameVal.isValid) {
    throw new Error(nameVal.error || 'Invalid full name.');
  }

  // Validate password
  const passVal = validatePassword(password);
  if (!passVal.isValid) {
    throw new Error(passVal.error || 'Password does not meet security requirements.');
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
    const user = userCredential.user;

    const now = new Date().toISOString();

    // SECURITY: strictly whitelist role to 'customer' or 'retailer'. Admin cannot be self-assigned.
    const safeRole: AllowedRegistrationRole = role === 'retailer' ? 'retailer' : 'customer';

    // 2. Create user profile in Firestore
    const userData = {
      uid: user.uid,
      name: normalizedName,
      email: email.trim(),
      role: safeRole,
      createdAt: now,
      updatedAt: now,
    };

    await setDoc(doc(db, 'users', user.uid), userData);

    // 3. Send Firebase email verification with ActionCodeSettings immediately after successful registration
    try {
      await sendVerificationEmail(user);
      recordSuccessfulResend(user.uid, Date.now(), user.email || undefined);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('initial_verification_sent', 'true');
        sessionStorage.removeItem('initial_verification_error');
      }
    } catch (emailErr: unknown) {
      const errCode = (emailErr && typeof emailErr === 'object' && 'code' in emailErr) ? (emailErr as { code: string }).code : 'unknown';
      console.warn(`[auth] Initial verification dispatch encountered error: operation=registerUser, timestamp=${new Date().toISOString()}, code=${errCode}`);
      if (errCode === 'auth/too-many-requests') {
        recordThrottleCooldown(user.uid, 60, user.email || undefined);
      }
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('initial_verification_sent', 'false');
        sessionStorage.setItem('initial_verification_error', getFriendlyAuthErrorMessage(emailErr));
      }
    }

    return userCredential;
  } catch (error: unknown) {
    const errorCode = (error && typeof error === 'object' && 'code' in error) ? (error as { code: string }).code : 'unknown';
    console.error(`[auth] registerUser failed: operation=registerUser, timestamp=${new Date().toISOString()}, code=${errorCode}`);
    throw error;
  }
};

// 2. Send / resend email verification with ActionCodeSettings and graceful fallback
export const sendVerificationEmail = async (
  user?: User | null, 
  actionCodeSettings?: ActionCodeSettings
): Promise<void> => {
  // Resolve the authoritative Firebase User object
  const targetUser = user || auth.currentUser;
  if (!targetUser) {
    const error = new Error('No authenticated user session found. Please sign in to verify your email.');
    (error as unknown as { code: string }).code = 'auth/no-current-user';
    console.error(`[auth] sendVerificationEmail aborted: operation=sendVerificationEmail, timestamp=${new Date().toISOString()}, reason=no-active-user-session`);
    throw error;
  }

  // If already verified, do not re-send
  if (targetUser.emailVerified) {
    console.info(`[auth] User is already verified. Skipping email verification dispatch: operation=sendVerificationEmail, timestamp=${new Date().toISOString()}`);
    return;
  }

  // Pre-dispatch Rate Limit Check: Enforce rate limits before ANY network attempt
  const preCheck = checkResendRateLimit(targetUser.uid, Date.now(), targetUser.email || undefined);
  if (!preCheck.allowed) {
    const error = new Error(
      preCheck.reason === 'hourly_limit'
        ? `Rate limit reached. Please wait ${Math.ceil(preCheck.retryAfterSeconds / 60)} minute(s) before requesting another email.`
        : `Please wait ${preCheck.cooldownSeconds || preCheck.retryAfterSeconds} seconds before requesting another email.`
    );
    (error as unknown as { code: string }).code = 'auth/too-many-requests';
    throw error;
  }

  const settings = actionCodeSettings ?? getActionCodeSettings();
  const uidPrefix = targetUser.uid.substring(0, 6);
  console.info(`[auth] Initiating sendEmailVerification: operation=sendVerificationEmail, timestamp=${new Date().toISOString()}, uidPrefix=${uidPrefix}, hasCustomSettings=${Boolean(settings)}`);

  let serverReservationId: string | undefined;

  // 1. Attempt server-side custom email dispatch (Nodemailer / Gmail SMTP with professional branded template)
  if (typeof window !== 'undefined' && targetUser.email) {
    try {
      let idToken: string | undefined;
      if (typeof targetUser.getIdToken === 'function') {
        try {
          idToken = await targetUser.getIdToken();
        } catch {
          // Token might not be ready yet upon immediate registration
        }
      }

      if (idToken) {
        const response = await fetch('/api/auth/send-verification', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            name: targetUser.displayName || undefined,
          }),
        });

        // If server responded with 429 Too Many Requests, DO NOT fall back to native sender
        if (response.status === 429) {
          const rateData = await response.json().catch(() => ({}));
          const error = new Error(rateData.error || 'Rate limit exceeded. Please wait before requesting another verification email.');
          (error as unknown as { code: string }).code = 'auth/too-many-requests';
          throw error;
        }

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            console.info(`[auth] Custom branded verification email sent via /api/auth/send-verification: uidPrefix=${uidPrefix}`);
            return;
          }
        } else {
          const errorData = await response.json().catch(() => ({}));
          serverReservationId = errorData.reservationId;
        }
      }
    } catch (apiErr: unknown) {
      // If throttled by server rate limiter, re-throw immediately and block native fallback
      const errCode = (apiErr && typeof apiErr === 'object' && 'code' in apiErr) ? (apiErr as { code: string }).code : '';
      if (errCode === 'auth/too-many-requests') {
        throw apiErr;
      }
      // Otherwise, allow fallback to client SDK dispatch below
    }
  }

  // 2. Client SDK fallback: Sends email via Firebase native mailer if custom mailer is not configured or in tests
  // CRITICAL: Check rate limit AGAIN before native dispatch to ensure fallback cannot silently bypass rate limits!
  const fallbackCheck = checkResendRateLimit(targetUser.uid, Date.now(), targetUser.email || undefined);
  if (!fallbackCheck.allowed) {
    if (serverReservationId && typeof targetUser.getIdToken === 'function') {
      targetUser.getIdToken().then((tok) => {
        if (tok) {
          fetch('/api/auth/send-verification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tok}` },
            body: JSON.stringify({ action: 'release', reservationId: serverReservationId }),
          }).catch(() => {});
        }
      }).catch(() => {});
    }
    const error = new Error(
      fallbackCheck.reason === 'hourly_limit'
        ? `Rate limit reached. Please wait ${Math.ceil(fallbackCheck.retryAfterSeconds / 60)} minute(s) before requesting another email.`
        : `Please wait ${fallbackCheck.cooldownSeconds || fallbackCheck.retryAfterSeconds} seconds before requesting another email.`
    );
    (error as unknown as { code: string }).code = 'auth/too-many-requests';
    throw error;
  }

  try {
    await sendEmailVerification(targetUser, settings);
    console.info(`[auth] sendEmailVerification succeeded: operation=sendVerificationEmail, timestamp=${new Date().toISOString()}, uidPrefix=${uidPrefix}`);

    // Commit server-side reservation if native send succeeded
    if (serverReservationId && typeof targetUser.getIdToken === 'function') {
      targetUser.getIdToken().then((tok) => {
        if (tok) {
          fetch('/api/auth/send-verification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tok}` },
            body: JSON.stringify({ action: 'commit', reservationId: serverReservationId }),
          }).catch(() => {});
        }
      }).catch(() => {});
    }
  } catch (error: unknown) {
    // Release server reservation if native send failed
    if (serverReservationId && typeof targetUser.getIdToken === 'function') {
      const errCode = (error && typeof error === 'object' && 'code' in error) ? (error as { code: string }).code : '';
      const isTimeout = errCode === 'auth/network-request-failed';
      targetUser.getIdToken().then((tok) => {
        if (tok) {
          fetch('/api/auth/send-verification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tok}` },
            body: JSON.stringify({ action: 'release', reservationId: serverReservationId, isTimeout }),
          }).catch(() => {});
        }
      }).catch(() => {});
    }

    const errorCode = (error && typeof error === 'object' && 'code' in error) ? (error as { code: string }).code : 'unknown';
    console.error(`[auth] sendEmailVerification failed: operation=sendVerificationEmail, timestamp=${new Date().toISOString()}, code=${errorCode}`);

    // If throttled by Firebase, record throttle cooldown locally and do NOT retry
    if (errorCode === 'auth/too-many-requests') {
      recordThrottleCooldown(targetUser.uid, 60, targetUser.email || undefined);
    }

    // Do NOT perform automatic retries on failure (e.g. auth/unauthorized-continue-uri or auth/too-many-requests).
    // Rapid back-to-back retries violate Firebase rate limits and trigger anti-abuse throttling (auth/too-many-requests).
    throw error;
  }
};

// 3. Custom Action Handler: Apply out-of-band verification code
export const applyVerificationCode = async (oobCode: string): Promise<void> => {
  try {
    await applyActionCode(auth, oobCode);
  } catch (error: unknown) {
    const errorCode = (error && typeof error === 'object' && 'code' in error) ? (error as { code: string }).code : 'unknown';
    console.error(`[auth] applyVerificationCode failed: operation=applyVerificationCode, timestamp=${new Date().toISOString()}, code=${errorCode}`);
    throw error;
  }
};

// 4. Refresh user token and verify status
export const checkEmailVerification = async (user: User): Promise<boolean> => {
  try {
    await user.reload();
    if (user.emailVerified) {
      // Force refresh the Firebase ID token so new token claims contain email_verified: true
      await user.getIdToken(true);
    }
    return user.emailVerified;
  } catch (error) {
    console.error("Error checking email verification status:", error);
    throw error;
  }
};

// 4. Login with email/password
export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
    return userCredential;
  } catch (error: unknown) {
    const errorCode = (error && typeof error === 'object' && 'code' in error) ? (error as { code: string }).code : 'unknown';
    console.error("Error logging in with code:", errorCode);
    throw error;
  }
};

// 5. Logout
export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error logging out:", error);
    throw error;
  }
};
