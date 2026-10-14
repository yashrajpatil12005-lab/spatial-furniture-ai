import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from './config';
import { normalizeFullName } from '@/lib/utils/validation';

export type AllowedRegistrationRole = 'customer' | 'retailer';

// 1. Register with email/password
export const registerUser = async (
  email: string, 
  password: string, 
  name: string,
  role: AllowedRegistrationRole = 'customer'
) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const now = new Date().toISOString();
    const normalizedName = normalizeFullName(name);

    // SECURITY: strictly whitelist role to 'customer' or 'retailer'. Admin cannot be self-assigned.
    const safeRole: AllowedRegistrationRole = role === 'retailer' ? 'retailer' : 'customer';

    // 2. Create a user data structure in Firestore
    const userData = {
      uid: user.uid,
      name: normalizedName,
      email,
      role: safeRole,
      createdAt: now,
      updatedAt: now,
    };

    await setDoc(doc(db, 'users', user.uid), userData);

    return userCredential;
  } catch (error: unknown) {
    const errorCode = (error && typeof error === 'object' && 'code' in error) ? (error as { code: string }).code : 'unknown';
    console.error("Error registering user with code:", errorCode);
    throw error;
  }
};

// 3. Login with email/password
export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential;
  } catch (error: unknown) {
    const errorCode = (error && typeof error === 'object' && 'code' in error) ? (error as { code: string }).code : 'unknown';
    console.error("Error logging in with code:", errorCode);
    throw error;
  }
};

// 4. Logout
export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error logging out:", error);
    throw error;
  }
};
