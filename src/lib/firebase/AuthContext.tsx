'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from './config';

interface UserData {
  uid: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  reloadUser: () => Promise<User | null>;
  authVersion?: number;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  reloadUser: async () => null,
  authVersion: 0,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [authVersion, setAuthVersion] = useState(0);

  const reloadUser = async (): Promise<User | null> => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      await currentUser.reload();
      if (currentUser.emailVerified) {
        // Force refresh the Firebase ID token so new token claims contain email_verified: true
        await currentUser.getIdToken(true);
      }
      setUser(currentUser);
      setAuthVersion((v) => v + 1);
      return currentUser;
    }
    return null;
  };

  useEffect(() => {
    let unsubscribeDoc: () => void;
    
    console.log("[AuthContext] Setting up onAuthStateChanged listener...");

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      console.log("[AuthContext] Auth state changed. User:", firebaseUser ? firebaseUser.uid : "null");
      setUser(firebaseUser);
      
      if (firebaseUser) {
        console.log(`[AuthContext] Setting up onSnapshot for users/${firebaseUser.uid}...`);
        const docRef = doc(db, 'users', firebaseUser.uid);
        
        unsubscribeDoc = onSnapshot(docRef, (docSnap) => {
          if (docSnap.exists()) {
            console.log(`[AuthContext] Document found for users/${firebaseUser.uid}`);
            setUserData(docSnap.data() as UserData);
          } else {
            console.warn(`[AuthContext] WARNING: Document users/${firebaseUser.uid} does NOT exist!`);
            setUserData(null);
          }
          setLoading(false);
        }, (error) => {
          console.error("[AuthContext] Firestore onSnapshot error:", error.code, error.message);
          setUserData(null);
          setLoading(false);
        });
        
      } else {
        setUserData(null);
        setLoading(false);
        if (unsubscribeDoc) unsubscribeDoc();
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeDoc) unsubscribeDoc();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, userData, loading, reloadUser, authVersion }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
