import { Stack, Redirect } from 'expo-router';
import { useAuth, useUser, useClerk } from '@clerk/clerk-expo';
import { useAuthContext } from '../../context/AuthContext';

export default function OnboardingLayout() {
    const { isSignedIn, isLoaded } = useAuth();
    const { user } = useUser();
    const clerk = useClerk();
    const { isLoading, hasCompletedOnboarding, isSignedIn: contextIsSignedIn } = useAuthContext();

    console.log('🔒 Onboarding Layout: Rendering');
    console.log('  - isLoaded:', isLoaded);
    console.log('  - isLoading (context):', isLoading);
    console.log('  - isSignedIn (hook):', isSignedIn);
    console.log('  - contextIsSignedIn:', contextIsSignedIn);
    console.log('  - user exists:', !!user);
    console.log('  - user ID:', user?.id);

    // Wait for Clerk to load (but don't block on AuthContext isLoading if we have user data)
    // This allows the page to render even if AuthContext is still processing token retrieval
    if (!isLoaded) {
        console.log('⏳ Onboarding Layout: Waiting for Clerk to load...');
        return null;
    }

    // Check if user is actually signed in using multiple indicators (same logic as AuthContext)
    // Use the same robust check to handle cases where isSignedIn hook is out of sync
    const activeSession = clerk.session;
    const actuallySignedIn = contextIsSignedIn || isSignedIn || !!user || !!activeSession;

    console.log('🔒 Onboarding Layout: Checking auth state');
    console.log('  - activeSession exists:', !!activeSession);
    console.log('  - activeSession ID:', activeSession?.id);
    console.log('  - actuallySignedIn:', actuallySignedIn);

    // If we have user data, proceed with onboarding check
    // If we don't have user data but have a session, allow rendering (AuthContext will handle routing)
    // Only redirect to sign-in if we're definitely not signed in
    if (!actuallySignedIn && !user && !activeSession && !isLoading) {
        console.log('🔄 Onboarding Layout: User not signed in, redirecting to sign-in');
        return <Redirect href="/(auth)/sign-in" />;
    }

    // If we're still loading and don't have user data, wait a bit
    // But if we have a session, allow rendering (user data might be loading)
    if (!user && !activeSession && isLoading) {
        console.log('⏳ Onboarding Layout: Waiting for auth state to load...');
        return null;
    }

    // Check onboarding status from user metadata (only if we have user data)
    if (user) {
        const onboardingStatusUnsafe = user.unsafeMetadata?.hasCompletedOnboarding;
        const onboardingStatusPublic = user.publicMetadata?.hasCompletedOnboarding;
        const hasCompleted = 
            onboardingStatusUnsafe !== undefined && onboardingStatusUnsafe !== null
                ? !!onboardingStatusUnsafe 
                : (onboardingStatusPublic !== undefined && onboardingStatusPublic !== null 
                    ? !!onboardingStatusPublic 
                    : false);

        console.log('🔒 Onboarding Layout: Onboarding status check');
        console.log('  - unsafeMetadata.hasCompletedOnboarding:', onboardingStatusUnsafe);
        console.log('  - publicMetadata.hasCompletedOnboarding:', onboardingStatusPublic);
        console.log('  - hasCompleted:', hasCompleted);
        console.log('  - contextHasCompletedOnboarding:', hasCompletedOnboarding);

        // If onboarding is already completed, redirect to home
        if (hasCompleted) {
            console.log('🔄 Onboarding Layout: Redirecting to home (onboarding already completed)');
            return <Redirect href="/(home)" />;
        }
    } else if (hasCompletedOnboarding && !isLoading) {
        // If AuthContext says onboarding is completed but we don't have user data yet,
        // trust the context and redirect to home
        console.log('🔄 Onboarding Layout: Redirecting to home (onboarding completed per context)');
        return <Redirect href="/(home)" />;
    } else if (!user && !isLoading) {
        // If we don't have user data and AuthContext is done loading, something might be wrong
        // But don't block - let AuthContext handle routing via its redirects
        console.log('⚠️ Onboarding Layout: No user data but not loading - AuthContext should handle routing');
    }
    
    console.log('✅ Onboarding Layout: Rendering onboarding stack');

    return <Stack screenOptions={{ headerShown: false }} />;
}

