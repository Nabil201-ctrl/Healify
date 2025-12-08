// app/_layout.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { View } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider, useAuthContext } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import { OnboardingService } from '../services/OnboardingService';
import { LoadingScreen } from '../components/LoadingScreen';
import tw from 'twrnc';

import { registerForPushNotificationsAsync } from '../services/NotificationService';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// --- Main Navigation Logic ---
function RootLayoutNav() {
  const { isLoading: isAuthLoading, isSignedIn } = useAuthContext();
  const [isOnboardingLoading, setOnboardingLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Preparing your experience...');
  const [appIsReady, setAppIsReady] = useState(false);

  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    async function prepare() {
      try {
        // Check onboarding status
        setLoadingMessage('Checking your progress...');
        const completed = await OnboardingService.hasCompletedOnboarding();
        setHasCompletedOnboarding(completed);
        setOnboardingLoading(false);

        // Register for Push Notifications
        registerForPushNotificationsAsync().then(token => {
          if (token) {
            console.log("Push Token retrieved:", token);
            // TODO: Send this token to backend to associate with user
          }
        });
      } catch (e) {
        console.warn('[RootLayout] Error during preparation:', e);
      } finally {
        // Tell the application to render
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  // Hide the native splash screen once our custom splash is showing
  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      // This tells expo-splash-screen to hide the native splash
      // Our custom LoadingScreen with LifeLine is now visible
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

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
      if (isAuthLoading) {
        setLoadingMessage('Verifying your session...');
      }
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
        // User is signed in
        const { user } = useAuthContext();

        // Check if profile is complete (assuming user object has this field now)
        // We need to cast or ensure the type is updated in AuthContext, but for now we access it dynamically or assume it's there.
        // Ideally, update User type in types.ts.
        const isProfileComplete = (user as any)?.isProfileComplete;

        if (!isProfileComplete) {
          if (segments[1] !== 'profile-setup') {
            console.log('[RootLayout] Profile incomplete, redirecting to setup');
            router.replace('/(onboarding)/profile-setup');
          }
        } else {
          // User is signed in and profile is complete, send them to the tabbed app
          if (!inTabsGroup) {
            console.log('[RootLayout] User signed in, redirecting to tabs/home');
            setLoadingMessage('Loading your dashboard...');
            setTimeout(() => {
              router.replace('/(tabs)/home');
            }, 100);
          } else {
            console.log('[RootLayout] User already in tabs group');
          }
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

  // Show premium loading screen (with LifeLine) as splash and loading screen
  if (!appIsReady || isAuthLoading || isOnboardingLoading) {
    return (
      <View style={tw`flex-1`} onLayout={onLayoutRootView}>
        <LoadingScreen message={loadingMessage} />
      </View>
    );
  }

  // Once loaded, render the navigation stack
  return (
    <View style={tw`flex-1`} onLayout={onLayoutRootView}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(home)" />
        <Stack.Screen name="(chat)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </View>
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