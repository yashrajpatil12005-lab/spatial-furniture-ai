import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  sendEmailVerification,
  User,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from './config';
import { 
  normalizeFullName, 
  validateFullName, 
  validatePassword 
} from '@/lib/utils/validation';

export type AllowedRegistrationRole = 'customer' | 'retailer';

/**
 * Maps Firebase Auth error codes to safe, informative user-facing messages.
 * Never leaks internal configuration or sensitive server details.
 */
export function getFriendlyAuthErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'code' in error) {
    const code = (error as { code: string }).code;
    switch (code) {
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
        return 'Too many attempts. Please wait a moment before trying again.';
      case 'auth/user-disabled':
        return 'This account has been disabled. Please contact support.';
      case 'auth/network-request-failed':
        return 'Network connection issue. Please check your internet connection.';
      case 'auth/requires-recent-login':
        return 'Please sign in again to verify your identity.';
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

    // 3. Send Firebase email verification immediately after successful registration
    try {
      await sendEmailVerification(user);
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

// 2. Send / resend email verification
export const sendVerificationEmail = async (user: User): Promise<void> => {
  try {
    await sendEmailVerification(user);
  } catch (error: unknown) {
    const errorCode = (error && typeof error === 'object' && 'code' in error) ? (error as { code: string }).code : 'unknown';
    console.error("Error sending verification email with code:", errorCode);
    throw error;
  }
};

// 3. Refresh user token and verify status
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
