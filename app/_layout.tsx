// app/_layout.tsx
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuthContext } from '../context/AuthContext';
import { OnboardingService } from '../services/OnboardingService';
import tw from 'twrnc';

// --- Main Navigation Logic ---
function RootLayoutNav() {
  const { isLoading: isAuthLoading, isSignedIn } = useAuthContext();
  const [isOnboardingLoading, setOnboardingLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Check onboarding status first
    const checkOnboarding = async () => {
      const completed = await OnboardingService.hasCompletedOnboarding();
      setHasCompletedOnboarding(completed);
      setOnboardingLoading(false);
    };
    checkOnboarding();
  }, []);

  useEffect(() => {
    const isLoading = isAuthLoading || isOnboardingLoading;
    if (isLoading) {
      return; // Wait until both auth and onboarding status are loaded
    }

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboardingGroup = segments[0] === '(onboarding)';

    // New Flow: Onboarding -> Auth -> App
    if (!hasCompletedOnboarding) {
      // If onboarding isn't complete, force user to the onboarding screen
      if (!inOnboardingGroup) {
        router.replace('/(onboarding)/onboarding');
      }
    } else {
      // Onboarding is complete, now check auth status
      if (isSignedIn) {
        // User is signed in, send them to the main app
        router.replace('/(home)');
      } else {
        // User is not signed in, send them to the auth flow
        if (!inAuthGroup) {
          router.replace('/(auth)/sign-in');
        }
      }
    }
  }, [isAuthLoading, isOnboardingLoading, hasCompletedOnboarding, isSignedIn, segments, router]);

  // Show a loading screen while we determine the initial route
  if (isAuthLoading || isOnboardingLoading) {
    return (
      <View style={tw`flex-1 justify-center items-center bg-white`}>
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  // Once loaded, render the navigation stack
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(onboarding)" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(home)" />
    </Stack>
  );
}

// --- Root Component with Providers ---
export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}