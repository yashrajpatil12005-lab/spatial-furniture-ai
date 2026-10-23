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
import { recordSuccessfulResend } from '@/lib/utils/resendRateLimiter';

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
        return 'The verification continue URL domain is not authorized in Firebase Console settings.';
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
      recordSuccessfulResend(user.uid);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('initial_verification_sent', 'true');
        sessionStorage.removeItem('initial_verification_error');
      }
    } catch (emailErr: unknown) {
      console.warn('[auth] Could not dispatch initial verification email automatically:', emailErr);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('initial_verification_sent', 'false');
        sessionStorage.setItem('initial_verification_error', getFriendlyAuthErrorMessage(emailErr));
      }
    }

    return userCredential;
  } catch (error: unknown) {
    const errorCode = (error && typeof error === 'object' && 'code' in error) ? (error as { code: string }).code : 'unknown';
    console.error("Error registering user with code:", errorCode);
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
    throw error;
  }

  // If already verified, do not re-send
  if (targetUser.emailVerified) {
    return;
  }

  const settings = actionCodeSettings ?? getActionCodeSettings();
  try {
    await sendEmailVerification(targetUser, settings);
  } catch (error: unknown) {
    const errorCode = (error && typeof error === 'object' && 'code' in error) ? (error as { code: string }).code : '';
    
    // Graceful fallback if continue URL domain is not yet authorized in Firebase Console,
    // or if actionCodeSettings encounters continue URL or dynamic link configuration issues.
    const isSettingsRelatedError = 
      errorCode === 'auth/unauthorized-continue-uri' ||
      errorCode === 'auth/invalid-continue-uri' ||
      errorCode === 'auth/missing-continue-uri' ||
      errorCode === 'auth/argument-error' ||
      errorCode === 'auth/dynamic-link-not-activated';

    if (isSettingsRelatedError) {
      console.warn(`[auth] Continue URL / actionCodeSettings rejected with code ${errorCode}. Retrying default sendEmailVerification...`);
      await sendEmailVerification(targetUser);
      return;
    }

    const errCode = errorCode || 'unknown';
    console.error("Error sending verification email with code:", errCode);
    throw error;
  }
};

// 3. Custom Action Handler: Apply out-of-band verification code
export const applyVerificationCode = async (oobCode: string): Promise<void> => {
  try {
    await applyActionCode(auth, oobCode);
  } catch (error: unknown) {
    const errorCode = (error && typeof error === 'object' && 'code' in error) ? (error as { code: string }).code : 'unknown';
    console.error("Error applying verification action code:", errorCode);
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
