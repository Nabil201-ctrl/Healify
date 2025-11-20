import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthService } from '../services/AuthService';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isSignedIn: boolean;
  isLoading: boolean;
  signIn: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (userData: Omit<User, 'id'>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for an existing session on app startup
  useEffect(() => {
    const checkSession = async () => {
      try {
        const sessionUser = await AuthService.getCurrentUser();
        if (sessionUser) {
          setUser(sessionUser);
        }
      } catch (e) {
        console.error('[AuthContext] Error checking session:', e);
      } finally {
        setIsLoading(false);
      }
    };
    checkSession();
  }, []);

  const signIn = useCallback(async (email: string) => {
    // Note: In a real app, you would also pass the password
    const { token, user } = await AuthService.signIn(email);
    await AuthService.saveSession(token);
    setUser(user);
  }, []);

  const signUp = useCallback(async (userData: Omit<User, 'id'>) => {
    const { token, user } = await AuthService.signUp(userData);
    await AuthService.saveSession(token);
    setUser(user);
  }, []);

  const signOut = useCallback(async () => {
    await AuthService.signOut();
    setUser(null);
  }, []);

  const value = {
    user,
    isSignedIn: !!user,
    isLoading,
    signIn,
    signOut,
    signUp,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};