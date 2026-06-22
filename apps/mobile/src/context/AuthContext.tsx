import React, { createContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';

type User = {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  image: string | null;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored token and user on app load
    const loadStoredData = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync('auth_token');
        const storedUserStr = await SecureStore.getItemAsync('auth_user');

        if (storedToken && storedUserStr) {
          setToken(storedToken);
          setUser(JSON.parse(storedUserStr));
        }
      } catch (e) {
        console.error('Failed to load auth data', e);
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredData();
  }, []);

  const login = async (newToken: string, newUser: User) => {
    try {
      await SecureStore.setItemAsync('auth_token', newToken);
      await SecureStore.setItemAsync('auth_user', JSON.stringify(newUser));
      setToken(newToken);
      setUser(newUser);
    } catch (e) {
      console.error('Failed to save auth data', e);
    }
  };

  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync('auth_token');
      await SecureStore.deleteItemAsync('auth_user');
      setToken(null);
      setUser(null);
    } catch (e) {
      console.error('Failed to clear auth data', e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
