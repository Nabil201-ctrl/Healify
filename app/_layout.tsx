import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Image } from 'react-native';
import { Stack } from 'expo-router';
import { ClerkProvider } from '@clerk/clerk-expo';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';
import { AuthProvider } from '../context/AuthContext';
import tw from 'twrnc';

WebBrowser.maybeCompleteAuthSession();

const tokenCache = {
    getToken: () => SecureStore.getItemAsync('clerk_token'),
    saveToken: (token: string) => SecureStore.setItemAsync('clerk_token', token),
};

export default function RootLayout() {
    const [isSplashVisible, setIsSplashVisible] = useState(true);
    const clerkPublishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

    // Debug: log the key (first few characters for security)
    useEffect(() => {
        if (clerkPublishableKey) {
            console.log('Clerk Key loaded:', clerkPublishableKey.substring(0, 10) + '...');
        } else {
            console.error('Clerk Publishable Key not found!');
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsSplashVisible(false);
        }, 2000);
        return () => clearTimeout(timer);
    }, []);

    if (isSplashVisible) {
        return (
            <View style={tw`flex-1 justify-center items-center bg-white`}>
                <Image
                    source={require('../assets/icon.png')}
                    style={tw`w-24 h-24 mb-4 rounded-2xl`}
                    resizeMode="contain"
                />
                <Text style={tw`text-xl font-semibold text-gray-800`}>
                    Loading Healthify...
                </Text>
                <ActivityIndicator size="large" style={tw`mt-4`} color="#16a34a" />
            </View>
        );
    }

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
        <ClerkProvider
            publishableKey={clerkPublishableKey}
            tokenCache={tokenCache}
        >
            <AuthProvider>
                <Stack screenOptions={{ headerShown: false }} />
            </AuthProvider>
        </ClerkProvider>
    );
}