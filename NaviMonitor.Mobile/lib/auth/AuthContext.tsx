import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { auth } from './firebase';
import { purgeLocalDatabase } from '../database/database';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    });

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const jwt = await firebaseUser.getIdToken();
        setUser(firebaseUser);
        setToken(jwt);
      } else {
        setUser(null);
        setToken(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await purgeLocalDatabase();
      
      await AsyncStorage.clear();
      
      try {
        await GoogleSignin.signOut();
      } catch (googleError) {
        console.warn('Google native signout skipped or already clean:', googleError);
      }
      
      await signOut(auth);
      
      console.log('✅ User securely logged out and local cache destroyed.');
    } catch (error) {
      console.error('🚨 Logout sequence failed:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
