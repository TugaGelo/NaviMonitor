import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../app/lib/firebase';

interface AuthContextType {
  user: any | null;
  loading: boolean;
  signInWithGoogle: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
    setUser((prevUser: any) => prevUser ? prevUser : firebaseUser);
    setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signInWithGoogle = () => {
    console.log("🚀 DEV BYPASS: Instantly logging in as Admin...");
    setUser({
      uid: 'dev-bypass-123',
      email: 'admin@navi.enterprise',
      displayName: 'Fleet Manager',
    });
  };

  const logout = () => {
    setUser(null);
    signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
