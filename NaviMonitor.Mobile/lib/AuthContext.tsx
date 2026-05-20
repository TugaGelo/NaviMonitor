import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'firebase_jwt_token';

interface AuthContextType {
  token: string | null;
  isLoading: boolean;
  login: (newToken: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    SecureStore.getItemAsync(TOKEN_KEY).then(savedToken => {
      if (savedToken) setToken(savedToken);
      setIsLoading(false);
    });
  }, []);

  const login = async (newToken: string) => {
    await SecureStore.setItemAsync(TOKEN_KEY, newToken);
    setToken(newToken);
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
