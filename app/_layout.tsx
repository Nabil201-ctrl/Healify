// app/_layout.tsx
import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ClerkProvider, useAuth, useUser } from '@clerk/clerk-expo';
import * as SecureStore from 'expo-secure-store';
import { AuthProvider, useAuthContext } from '../context/AuthContext';
import tw from 'twrnc';

const tokenCache = {
  getToken: () => SecureStore.getItemAsync('clerk_token'),
  saveToken: (token: string) => SecureStore.setItemAsync('clerk_token', token),
};

function RootLayoutNav() {
  const { isLoading, isSignedIn, hasCompletedOnboarding, refreshAuth } = useAuthContext();
  const router = useRouter();
  const { isLoaded } = useAuth();
  const { user } = useUser(); // Add direct user hook
  const [hasRedirected, setHasRedirected] = React.useState(false);

  React.useEffect(() => {
    console.log('🔄 Root Layout: Auth state changed', {
      isLoading,
      isSignedIn,
      hasCompletedOnboarding,
      hasUser: !!user,
      hasRedirected,
      isLoaded
    });

    // Don't do anything if still loading
    if (isLoading || !isLoaded) {
      return;
    }

    // Prevent multiple redirects
    if (hasRedirected) {
      return;
    }

    // CASE 1: User is properly signed in (ideal case)
    if (isSignedIn && user) {
      console.log('✅ CASE 1: User is properly signed in');
      const targetRoute = hasCompletedOnboarding ? '/(home)' : '/(onboarding)/onboarding';
      console.log('➡️ Redirecting to:', targetRoute);
      
      setHasRedirected(true);
      setTimeout(() => {
        router.replace(targetRoute);
      }, 100);
      return;
    }

    // CASE 2: We have a user object but isSignedIn is false (your current issue)
    if (user && !isSignedIn) {
      console.log('🚨 CASE 2: User data exists but isSignedIn is false - forcing redirect');
      const hasOnboarding = !!user.unsafeMetadata?.hasCompletedOnboarding;
      const targetRoute = hasOnboarding ? '/(home)' : '/(onboarding)/onboarding';
      console.log('➡️ Redirecting to:', targetRoute);
      
      setHasRedirected(true);
      setTimeout(() => {
        router.replace(targetRoute);
      }, 100);
      return;
    }

    // CASE 3: No user and not signed in - stay on auth pages
    if (!isSignedIn && !user) {
      console.log('➡️ CASE 3: User not signed in, staying on auth pages');
      // No redirect needed
      return;
    }

    // CASE 4: Signed in but no user data yet - wait and retry
    if (isSignedIn && !user) {
      console.log('🔄 CASE 4: Signed in but no user data yet, waiting...');
      setTimeout(() => {
        refreshAuth();
      }, 500);
      return;
    }

  }, [isLoading, isSignedIn, hasCompletedOnboarding, user, router, isLoaded, hasRedirected, refreshAuth]);

  // Reset redirect flag when key auth states change
  React.useEffect(() => {
    console.log('🔄 Resetting redirect flag due to auth state change');
    setHasRedirected(false);
  }, [isSignedIn, user]); // Reset when signed in status OR user object changes

  if (isLoading || !isLoaded) {
    return (
      <View style={tw`flex-1 justify-center items-center bg-white`}>
        <ActivityIndicator size="large" color="#16a34a" />
        <Text style={tw`mt-4 text-gray-600`}>Loading Healthify...</Text>
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  const clerkPublishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!clerkPublishableKey) {
    return (
      <View style={tw`flex-1 justify-center items-center bg-red-50`}>
        <Text style={tw`text-red-600 text-lg text-center`}>
          Configuration Error{'\n'}
          Missing Clerk publishable key{'\n'}
          Check your .env file
        </Text>
      </View>
    );
  }

  return (
    <ClerkProvider publishableKey={clerkPublishableKey} tokenCache={tokenCache}>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </ClerkProvider>
  );
} 