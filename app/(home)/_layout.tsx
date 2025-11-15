import { Stack, Redirect } from 'expo-router';
import { useAuth, useUser, useClerk } from '@clerk/clerk-expo';
import { useAuthContext } from '../../context/AuthContext';

export default function HomeLayout() {
    const { isSignedIn, isLoaded } = useAuth();
    const { user } = useUser();
    const clerk = useClerk();
    const { isLoading, isSignedIn: contextIsSignedIn } = useAuthContext();

    // Wait for auth to load
    if (!isLoaded || isLoading) {
        return null; // Or return a loading spinner
    }

    // Check if user is actually signed in using multiple indicators (same logic as AuthContext)
    const activeSession = clerk.session;
    const actuallySignedIn = contextIsSignedIn || isSignedIn || !!user || !!activeSession;

    console.log('🔒 Home Layout: Checking auth state');
    console.log('  - isSignedIn (hook):', isSignedIn);
    console.log('  - contextIsSignedIn:', contextIsSignedIn);
    console.log('  - user exists:', !!user);
    console.log('  - activeSession exists:', !!activeSession);
    console.log('  - actuallySignedIn:', actuallySignedIn);

    // If not signed in, redirect to sign in
    if (!actuallySignedIn || !user) {
        console.log('🔄 Home Layout: User not signed in, redirecting to sign-in');
        return <Redirect href="/(auth)/sign-in" />;
    }

    // Check onboarding status from user metadata
    const onboardingStatusUnsafe = user.unsafeMetadata?.hasCompletedOnboarding;
    const onboardingStatusPublic = user.publicMetadata?.hasCompletedOnboarding;
    const hasCompleted = 
        onboardingStatusUnsafe !== undefined && onboardingStatusUnsafe !== null
            ? !!onboardingStatusUnsafe 
            : (onboardingStatusPublic !== undefined && onboardingStatusPublic !== null 
                ? !!onboardingStatusPublic 
                : false);

    console.log('🔒 Home Layout Check:');
    console.log('  - unsafeMetadata.hasCompletedOnboarding:', onboardingStatusUnsafe);
    console.log('  - publicMetadata.hasCompletedOnboarding:', onboardingStatusPublic);
    console.log('  - hasCompleted:', hasCompleted);

    // If onboarding is not completed, redirect to onboarding
    if (!hasCompleted) {
        console.log('🔄 Home Layout: Redirecting to onboarding (not completed)');
        return <Redirect href="/(onboarding)/onboarding" />;
    }
    
    console.log('✅ Home Layout: User can access home pages (onboarding completed)');

    return <Stack />;
}