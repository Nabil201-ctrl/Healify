import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth, useUser, useClerk } from '@clerk/clerk-expo';
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
    const clerk = useClerk();

    const [userId, setUserId] = useState<string | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

    const router = useRouter();
    const segments = useSegments();

    useEffect(() => {
        const initAuth = async () => {
            if (!isLoaded) {
                console.log('⏳ AuthContext: Waiting for Clerk to load...');
                return;
            }
            
            console.log('🔄 AuthContext: Initializing auth check...');
            console.log('  - isLoaded:', isLoaded);
            console.log('  - isSignedIn (hook):', isSignedIn);
            console.log('  - user:', user ? user.id : 'null');
            
            // Check session directly from Clerk (more reliable than isSignedIn hook)
            const activeSession = clerk.session;
            const hasActiveSession = !!activeSession;
            const hasUser = !!user;
            
            // Determine if user is actually signed in:
            // 1. isSignedIn hook says true, OR
            // 2. user object exists, OR  
            // 3. active session exists
            // This handles the case where Clerk's isSignedIn hook is out of sync
            const actuallySignedIn = isSignedIn || hasUser || hasActiveSession;
            
            console.log('  - activeSession:', activeSession ? activeSession.id : 'null');
            console.log('  - hasActiveSession:', hasActiveSession);
            console.log('  - hasUser:', hasUser);
            console.log('  - actuallySignedIn (computed):', actuallySignedIn);
            
            setIsLoading(true);

            try {
                // Check if user is actually signed in using multiple indicators
                if (actuallySignedIn) {
                    // User is signed in (based on session/user existence)
                    // If user object exists, use it; otherwise we need to wait for it
                    if (!user) {
                        console.log('⏳ Session exists but user data not loaded yet, waiting...');
                        // Wait for user data to load - React hooks should update automatically
                        await new Promise(resolve => setTimeout(resolve, 1500));
                        
                        // Re-check user after wait (React hooks may have updated)
                        if (!user) {
                            console.log('⚠️ User data still not available after wait');
                            console.log('  - Session exists:', activeSession?.id);
                            console.log('  - This useEffect will re-run when user becomes available');
                            console.log('  - The dependency array includes user?.id, so it will trigger');
                            setIsLoading(false);
                            return; // Exit early, useEffect will re-run when user loads
                        }
                    }

                    // At this point, user should exist (we have user object)
                    if (!user) {
                        console.log('❌ Cannot proceed: session exists but no user data');
                        setIsLoading(false);
                        return;
                    }

                    console.log('✅ User is signed in:', user.id);
                    setUserId(user.id);
                    
                    // Get token - this is optional and should not block the auth flow
                    // Try without template first (most common case), then with template if needed
                    let fetchedToken: string | null = null;
                    try {
                        // First, try to get token without a template (default JWT)
                        fetchedToken = await getToken();
                        console.log('✅ Token retrieved successfully (without template)');
                    } catch (tokenError: any) {
                        console.warn('⚠️ Could not get token without template, trying with default template...', tokenError?.message || tokenError);
                        // If that fails, try with 'default' template (in case it's configured)
                        try {
                            fetchedToken = await getToken({ template: 'default' });
                            console.log('✅ Token retrieved successfully (with default template)');
                        } catch (templateError: any) {
                            console.warn('⚠️ Could not get token with default template:', templateError?.message || templateError);
                            // If template doesn't exist, that's okay - token is optional for routing
                            // The session is still valid and user is authenticated
                            console.log('ℹ️ Token retrieval failed, but session is valid. Continuing without token.');
                            
                            // Try to ensure session is active anyway
                            if (activeSession) {
                                try {
                                    await clerk.setActive({ session: activeSession });
                                    console.log('✅ Session activated');
                                } catch (activationError) {
                                    console.warn('⚠️ Could not activate session:', activationError);
                                }
                            }
                        }
                    }
                    
                    // Set token (may be null if retrieval failed, but that's okay)
                    setToken(fetchedToken);
                    
                    // Store token in SecureStore if we have one
                    if (fetchedToken) {
                        try {
                            await SecureStore.setItemAsync('token', fetchedToken);
                        } catch (storeError) {
                            console.warn('⚠️ Could not store token in SecureStore:', storeError);
                        }
                    }

                    // Read onboarding status from metadata
                    // Check unsafeMetadata first (frontend-updatable), then publicMetadata (backend-only)
                    // Note: publicMetadata is typically backend-only, but we check it as fallback
                    const onboardingStatusUnsafe = user.unsafeMetadata?.hasCompletedOnboarding;
                    const onboardingStatusPublic = user.publicMetadata?.hasCompletedOnboarding;
                    
                    // Log raw metadata values
                    console.log('📋 Onboarding Status Check:');
                    console.log('  - unsafeMetadata.hasCompletedOnboarding:', onboardingStatusUnsafe);
                    console.log('  - publicMetadata.hasCompletedOnboarding:', onboardingStatusPublic);
                    console.log('  - User ID:', user.id);
                    
                    // Use unsafeMetadata if available, otherwise fallback to publicMetadata
                    // If both are undefined/null/false, default to false (not completed)
                    const hasCompletedOnboarding = 
                        onboardingStatusUnsafe !== undefined && onboardingStatusUnsafe !== null
                            ? !!onboardingStatusUnsafe 
                            : (onboardingStatusPublic !== undefined && onboardingStatusPublic !== null 
                                ? !!onboardingStatusPublic 
                                : false);

                    setHasCompletedOnboarding(hasCompletedOnboarding);
                    console.log('  - Computed hasCompletedOnboarding:', hasCompletedOnboarding);
                    console.log('  - Final Status:', hasCompletedOnboarding ? '✅ COMPLETED' : '❌ NOT COMPLETED');

                    // Get current route segments to determine if user is on correct route
                    const isOnAuthRoute = segments.includes('(auth)');
                    const isOnOnboardingRoute = segments.includes('(onboarding)');
                    const isOnHomeRoute = segments.includes('(home)');
                    const currentRoute = segments.join('/') || 'root';

                    console.log('📍 Current Route:', currentRoute);
                    console.log('  - isOnAuthRoute:', isOnAuthRoute);
                    console.log('  - isOnOnboardingRoute:', isOnOnboardingRoute);
                    console.log('  - isOnHomeRoute:', isOnHomeRoute);

                    // IMPORTANT: If user is signed in, they should NEVER be on auth routes
                    // Always redirect signed-in users away from auth routes
                    if (!hasCompletedOnboarding) {
                        // User hasn't completed onboarding - should be on onboarding page
                        // ALWAYS redirect if on auth route (no exception)
                        if (isOnAuthRoute) {
                            console.log('🔄 AuthContext: Redirecting to onboarding - user signed in but on auth route');
                            router.replace('/(onboarding)/onboarding');
                            return;
                        }
                        // Redirect if on home route
                        if (isOnHomeRoute) {
                            console.log('🔄 AuthContext: Redirecting to onboarding - user has not completed onboarding');
                            router.replace('/(onboarding)/onboarding');
                            return;
                        }
                        // If on onboarding route, that's correct - allow it
                        if (isOnOnboardingRoute) {
                            console.log('✅ AuthContext: User is on correct route (onboarding)');
                            return;
                        }
                        // If on root or any other route, redirect to onboarding
                        console.log('🔄 AuthContext: Redirecting to onboarding - user has not completed onboarding (on root/other route)');
                        router.replace('/(onboarding)/onboarding');
                        return;
                    } else {
                        // User has completed onboarding - should be on home, not auth or onboarding
                        // ALWAYS redirect if on auth route (no exception)
                        if (isOnAuthRoute) {
                            console.log('🔄 AuthContext: Redirecting to home - user signed in but on auth route');
                            router.replace('/(home)');
                            return;
                        }
                        // Redirect if on onboarding route
                        if (isOnOnboardingRoute) {
                            console.log('🔄 AuthContext: Redirecting to home - user has completed onboarding');
                            router.replace('/(home)');
                            return;
                        }
                        // If on home route, that's correct - allow it
                        if (isOnHomeRoute) {
                            console.log('✅ AuthContext: User is on correct route (home)');
                            return;
                        }
                        // If on root or any other route, redirect to home
                        console.log('🔄 AuthContext: Redirecting to home - user has completed onboarding (on root/other route)');
                        router.replace('/(home)');
                        return;
                    }
                } else {
                    // User is not signed in - redirect to sign in (unless already on auth route)
                    const isOnAuthRoute = segments.includes('(auth)');
                    const currentRoute = segments.join('/') || 'root';
                    console.log('🚫 AuthContext: User is not signed in');
                    console.log('📍 Current Route:', currentRoute);
                    console.log('  - isOnAuthRoute:', isOnAuthRoute);
                    
                    if (!isOnAuthRoute) {
                        console.log('🔄 AuthContext: Redirecting to sign-in - user is not signed in');
                        router.replace('/(auth)/sign-in');
                    } else {
                        console.log('✅ AuthContext: User is on auth route, no redirect needed');
                    }
                }
            } catch (err) {
                console.error('❌ AuthContext: Auth initialization error:', err);
            } finally {
                setIsLoading(false);
            }
        };

        initAuth();
    }, [isLoaded, isSignedIn, user?.id, user?.unsafeMetadata?.hasCompletedOnboarding, user?.publicMetadata?.hasCompletedOnboarding, getToken, router, segments, clerk, clerk.session?.id]);

    // Compute actual signed-in state for the context
    // Use multiple indicators to determine if user is signed in
    const activeSession = clerk.session;
    const computedIsSignedIn = isSignedIn || !!user || !!activeSession;

    return (
        <AuthContext.Provider
            value={{
                userId,
                token,
                isLoading,
                isSignedIn: computedIsSignedIn, // Use computed value instead of just isSignedIn hook
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
