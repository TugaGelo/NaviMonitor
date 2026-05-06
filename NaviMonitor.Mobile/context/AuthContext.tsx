import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, signInWithCredential, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from '../app/lib/firebase';
import * as Google from 'expo-auth-session/providers/google';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  loading: true, 
  signInWithGoogle: () => {},
  logout: async () => {} 
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [, response, promptAsync] = Google.useIdTokenAuthRequest({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    redirectUri: 'https://auth.expo.io/@bamburat/NaviMonitor.Mobile',
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential).catch(console.error);
    } else if (response?.type === 'error') {
      console.error("Google Auth Error:", response.error);
    }
  }, [response]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signInWithGoogle = () => {
    promptAsync();
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
