import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useRouter, useSegments } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

interface AuthContextType {
    userId: string | null;
    token: string | null;
    isLoading: boolean;
    isSignedIn: boolean;
    hasCompletedOnboarding: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const { getToken, isLoaded, isSignedIn } = useAuth();
    const { user } = useUser();

    const [userId, setUserId] = useState<string | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

    const router = useRouter();
    const segments = useSegments();

    useEffect(() => {
        const initAuth = async () => {
            if (!isLoaded) return;
            setIsLoading(true);

            try {
                if (isSignedIn && user) {
                    const fetchedToken = await getToken({ template: 'default' });
                    setToken(fetchedToken || null);
                    setUserId(user.id);

                    // Read onboarding status from metadata
                    // Check unsafeMetadata first (frontend-updatable), then publicMetadata (backend-only)
                    // Note: publicMetadata is typically backend-only, but we check it as fallback
                    const onboardingStatusUnsafe = user.unsafeMetadata?.hasCompletedOnboarding;
                    const onboardingStatusPublic = user.publicMetadata?.hasCompletedOnboarding;
                    
                    // Use unsafeMetadata if available, otherwise fallback to publicMetadata
                    // If both are undefined/null/false, default to false (not completed)
                    const hasCompletedOnboarding = 
                        onboardingStatusUnsafe !== undefined && onboardingStatusUnsafe !== null
                            ? !!onboardingStatusUnsafe 
                            : (onboardingStatusPublic !== undefined && onboardingStatusPublic !== null 
                                ? !!onboardingStatusPublic 
                                : false);

                    setHasCompletedOnboarding(hasCompletedOnboarding);

                    if (fetchedToken) {
                        await SecureStore.setItemAsync('token', fetchedToken);
                    }

                    // Handle navigation logic based on onboarding status
                    const currentSegments = segments;
                    
                    // If onboarding is not completed (false or undefined), redirect to onboarding
                    if (!hasCompletedOnboarding) {
                        // Only redirect if not already on onboarding screen
                        if (!currentSegments.includes('(onboarding)')) {
                            router.replace('/(onboarding)/onboarding');
                        }
                    } 
                    // If onboarding is completed, ensure user is not on auth or onboarding screens
                    else {
                        if (currentSegments.includes('(auth)')) {
                            router.replace('/(home)');
                        } else if (currentSegments.includes('(onboarding)')) {
                            router.replace('/(home)');
                        }
                    }
                } else {
                    // User is not signed in - redirect to sign in (unless already there)
                    if (!segments.includes('(auth)')) {
                        router.replace('/(auth)/sign-in');
                    }
                }
            } catch (err) {
                console.error('Auth initialization error:', err);
            } finally {
                setIsLoading(false);
            }
        };

        initAuth();
    }, [isLoaded, isSignedIn, user?.id, user?.unsafeMetadata?.hasCompletedOnboarding, user?.publicMetadata?.hasCompletedOnboarding, getToken, router, segments]);

    return (
        <AuthContext.Provider
            value={{
                userId,
                token,
                isLoading,
                isSignedIn: !!isSignedIn,
                hasCompletedOnboarding,
            }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuthContext = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuthContext must be used within an AuthProvider');
    return ctx;
};
