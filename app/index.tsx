// app/index.tsx
import { ActivityIndicator, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthContext } from '../context/AuthContext';
import { useUser } from '@clerk/clerk-expo'; // Add this
import { useEffect } from 'react';
import tw from 'twrnc';

export default function StartPage() {
  const { isLoading, isSignedIn, hasCompletedOnboarding } = useAuthContext();
  const { user } = useUser(); // Add direct user access
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      // Check both isSignedIn AND if we have a user object
      const actuallySignedIn = isSignedIn || !!user;
      
      if (actuallySignedIn) {
        // Use user metadata directly if available, otherwise use context
        const onboardingCompleted = user?.unsafeMetadata?.hasCompletedOnboarding ?? hasCompletedOnboarding;
        
        if (onboardingCompleted) {
          router.replace('/(home)');
        } else {
          router.replace('/(onboarding)/onboarding');
        }
      } else {
        router.replace('/(auth)/sign-in');
      }
    }
  }, [isLoading, isSignedIn, hasCompletedOnboarding, user, router]);

  return (
    <View style={tw`flex-1 justify-center items-center`}>
      <ActivityIndicator size="large" color="#16a34a" />
    </View>
  );
}