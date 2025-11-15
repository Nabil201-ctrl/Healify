import { Stack, Redirect } from 'expo-router';
import { useAuth, useUser, useClerk } from '@clerk/clerk-expo';
import { useAuthContext } from '../../context/AuthContext';

export default function AuthLayout() {
    const { isSignedIn, isLoaded } = useAuth();
    const { user } = useUser();
    const clerk = useClerk();
    const { isLoading, hasCompletedOnboarding, isSignedIn: contextIsSignedIn } = useAuthContext();

    // Wait for auth to load
    if (!isLoaded || isLoading) {
        return null; // Or return a loading spinner
    }

    // Check if user is actually signed in using multiple indicators
    // Use the same logic as AuthContext to detect signed-in state
    const activeSession = clerk.session;
    const actuallySignedIn = contextIsSignedIn || isSignedIn || !!user || !!activeSession;

    console.log('🔒 Auth Layout: Checking auth state');
    console.log('  - isSignedIn (hook):', isSignedIn);
    console.log('  - contextIsSignedIn:', contextIsSignedIn);
    console.log('  - user exists:', !!user);
    console.log('  - activeSession exists:', !!activeSession);
    console.log('  - actuallySignedIn:', actuallySignedIn);

    // If signed in, redirect based on onboarding status
    if (actuallySignedIn && user) {
        // Check onboarding status from user metadata
        const onboardingStatusUnsafe = user.unsafeMetadata?.hasCompletedOnboarding;
        const onboardingStatusPublic = user.publicMetadata?.hasCompletedOnboarding;
        const hasCompleted = 
            onboardingStatusUnsafe !== undefined && onboardingStatusUnsafe !== null
                ? !!onboardingStatusUnsafe 
                : (onboardingStatusPublic !== undefined && onboardingStatusPublic !== null 
                    ? !!onboardingStatusPublic 
                    : false);

        console.log('🔒 Auth Layout Check:');
        console.log('  - User is signed in');
        console.log('  - unsafeMetadata.hasCompletedOnboarding:', onboardingStatusUnsafe);
        console.log('  - publicMetadata.hasCompletedOnboarding:', onboardingStatusPublic);
        console.log('  - hasCompleted:', hasCompleted);

        if (!hasCompleted) {
            // Redirect to onboarding if not completed
            console.log('🔄 Auth Layout: Redirecting to onboarding (not completed)');
            return <Redirect href="/(onboarding)/onboarding" />;
        } else {
            // Redirect to home if completed
            console.log('🔄 Auth Layout: Redirecting to home (onboarding completed)');
            return <Redirect href="/(home)" />;
        }
    }
    
    console.log('✅ Auth Layout: User can access auth pages (not signed in)');

    return <Stack screenOptions={{ headerShown: false }} />;
}
