// context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth, useUser, useClerk } from '@clerk/clerk-expo';

interface AuthContextType {
  isLoading: boolean;
  isSignedIn: boolean;
  hasCompletedOnboarding: boolean;
  user: any;
  refreshAuth: () => void;
  forceCheckAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  isLoading: true,
  isSignedIn: false,
  hasCompletedOnboarding: false,
  user: null,
  refreshAuth: () => {},
  forceCheckAuth: async () => false,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { isLoaded, isSignedIn } = useAuth();
  const { user, isLoaded: userLoaded } = useUser();
  const clerk = useClerk();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refreshAuth = () => {
    console.log('🔄 Manual auth refresh triggered');
    setRefreshTrigger(prev => prev + 1);
  };

  const forceCheckAuth = async (): Promise<boolean> => {
    try {
      console.log('🔍 Force checking auth state...');
      const client = clerk.client;
      const hasActiveSession = !!clerk.session || (client?.sessions && client.sessions.length > 0);
      const hasUser = !!user || !!clerk.user;
      
      console.log('🔍 Auth check results:', {
        clerkSession: !!clerk.session,
        clientSessions: client?.sessions?.length || 0,
        hasActiveSession,
        hasUser,
        hookIsSignedIn: isSignedIn
      });
      
      return hasActiveSession || hasUser || isSignedIn;
    } catch (error) {
      console.error('Error force checking auth:', error);
      return isSignedIn;
    }
  };

  useEffect(() => {
    console.log('🔄 AuthContext: State updated', {
      isLoaded,
      userLoaded,
      isSignedIn,
      user: !!user,
      clerkSession: !!clerk.session,
      refreshTrigger
    });

    // More reliable signed-in detection
    const actuallySignedIn = isSignedIn || !!user || !!clerk.session;

    console.log('🔐 Effective signed in status:', actuallySignedIn);

    // If everything is loaded, clear loading
    if (isLoaded && userLoaded) {
      const timer = setTimeout(() => {
        setIsLoading(false);
        console.log('✅ AuthContext: Loading complete');
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isLoaded, userLoaded, isSignedIn, user, clerk.session, refreshTrigger]);

  // Derive onboarding status safely
  const hasCompletedOnboarding = React.useMemo(() => {
    if (!user) return false;
    const completed = !!user.unsafeMetadata?.hasCompletedOnboarding;
    console.log('📋 Onboarding status:', completed);
    return completed;
  }, [user]);

  // More reliable signed-in detection
  const effectiveSignedIn = isSignedIn || !!user || !!clerk.session;

  const value = {
    isLoading: isLoading || !isLoaded || !userLoaded,
    isSignedIn: effectiveSignedIn,
    hasCompletedOnboarding,
    user,
    refreshAuth,
    forceCheckAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);