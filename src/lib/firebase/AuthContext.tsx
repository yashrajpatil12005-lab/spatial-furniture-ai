'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
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
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

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
    <AuthContext.Provider value={{ user, userData, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
