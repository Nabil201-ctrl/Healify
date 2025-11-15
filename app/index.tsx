import { View, Text, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth, useUser, useClerk } from '@clerk/clerk-expo';
import { useAuthContext } from '../context/AuthContext';
import tw from 'twrnc';

export default function Home() {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const clerk = useClerk();
  const { isLoading, hasCompletedOnboarding, isSignedIn: contextIsSignedIn } = useAuthContext();

  // Wait for auth to load
  if (!isLoaded || isLoading) {
    return (
      <View style={tw`flex-1 justify-center items-center`}>
        <ActivityIndicator size="large" />
        <Text style={tw`mt-2 text-gray-700`}>Loading...</Text>
      </View>
    );
  }

  // Check if user is actually signed in using multiple indicators (same logic as AuthContext)
  const activeSession = clerk.session;
  const actuallySignedIn = contextIsSignedIn || isSignedIn || !!user || !!activeSession;

  console.log('🔒 Root Index Check:');
  console.log('  - isSignedIn (hook):', isSignedIn);
  console.log('  - contextIsSignedIn:', contextIsSignedIn);
  console.log('  - user exists:', !!user);
  console.log('  - activeSession exists:', !!activeSession);
  console.log('  - actuallySignedIn:', actuallySignedIn);

  // If not signed in, redirect to sign in
  if (!actuallySignedIn || !user) {
    console.log('  - User is not signed in');
    console.log('🔄 Root Index: Redirecting to sign-in');
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

  console.log('🔒 Root Index Check:');
  console.log('  - User is signed in');
  console.log('  - unsafeMetadata.hasCompletedOnboarding:', onboardingStatusUnsafe);
  console.log('  - publicMetadata.hasCompletedOnboarding:', onboardingStatusPublic);
  console.log('  - hasCompleted:', hasCompleted);

  // If onboarding is not completed, redirect to onboarding
  if (!hasCompleted) {
    console.log('🔄 Root Index: Redirecting to onboarding (not completed)');
    return <Redirect href="/(onboarding)/onboarding" />;
  }

  // If onboarding is completed, redirect to home
  console.log('🔄 Root Index: Redirecting to home (onboarding completed)');
  return <Redirect href="/(home)" />;
}
