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

                    // ✅ Read onboarding status from unsafeMetadata (client-side updatable)
                    const onboardingStatus =
                        user.unsafeMetadata?.hasCompletedOnboarding ?? false;

                    setHasCompletedOnboarding(!!onboardingStatus);

                    if (fetchedToken) {
                        await SecureStore.setItemAsync('token', fetchedToken);
                    }

                    // ✅ Handle navigation logic
                    if (!onboardingStatus && !segments.includes('(onboarding)')) {
                        router.replace('/(onboarding)/onboarding');
                    } else if (onboardingStatus && segments.includes('(auth)')) {
                        router.replace('/');
                    }
                } else {
                    router.replace('/(auth)/sign-in');
                }
            } catch (err) {
                console.error('Auth initialization error:', err);
            } finally {
                setIsLoading(false);
            }
        };

        initAuth();
    }, [isLoaded, isSignedIn]);

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
