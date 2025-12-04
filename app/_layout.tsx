// app/_layout.tsx
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuthContext } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
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
    console.log('[RootLayout] Navigation effect triggered:', {
      isAuthLoading,
      isOnboardingLoading,
      hasCompletedOnboarding,
      isSignedIn,
      segments: segments.join('/'),
    });

    if (isLoading) {
      console.log('[RootLayout] Still loading, waiting...');
      return; // Wait until both auth and onboarding status are loaded
    }

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboardingGroup = segments[0] === '(onboarding)';
    const inTabsGroup = segments[0] === '(tabs)';

    // New Flow: Onboarding -> Auth -> App
    if (!hasCompletedOnboarding) {
      // If onboarding isn't complete, force user to the onboarding screen
      if (!inOnboardingGroup) {
        console.log('[RootLayout] Redirecting to onboarding');
        router.replace('/(onboarding)/onboarding');
      }
    } else {
      // Onboarding is complete, now check auth status
      if (isSignedIn) {
        // User is signed in, send them to the tabbed app
        if (!inTabsGroup) {
          console.log('[RootLayout] User signed in, redirecting to tabs/home');
          setTimeout(() => {
            router.replace('/(tabs)/home');
          }, 100);
        } else {
          console.log('[RootLayout] User already in tabs group');
        }
      } else {
        // User is not signed in, send them to the auth flow
        if (!inAuthGroup) {
          console.log('[RootLayout] User not signed in, redirecting to sign-in');
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
      <Stack.Screen name="(chat)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

// --- Root Component with Providers ---
export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </ThemeProvider>
  );
}