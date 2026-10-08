import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from './config';

// 1. Register with email/password
export const registerUser = async (email: string, password: string, name: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const now = new Date().toISOString();

    // 2. Create a user data structure in Firestore
    // SECURITY REQUIREMENT: role must always be "customer"
    const userData = {
      uid: user.uid,
      name,
      email,
      role: 'customer',
      createdAt: now,
      updatedAt: now,
    };

    await setDoc(doc(db, 'users', user.uid), userData);

    return userCredential;
  } catch (error) {
    console.error("Error registering user:", error);
    throw error;
  }
};

// 3. Login with email/password
export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential;
  } catch (error) {
    console.error("Error logging in:", error);
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
