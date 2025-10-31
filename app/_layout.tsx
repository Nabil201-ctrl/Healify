import { Stack } from 'expo-router';
import { ClerkProvider } from '@clerk/clerk-expo';
import * as SecureStore from 'expo-secure-store';
import { AuthProvider } from '../context/AuthContext';

const tokenCache = {
    getToken: () => SecureStore.getItemAsync('clerk_token'),
    saveToken: (token: string) => SecureStore.setItemAsync('clerk_token', token),
};

export default function RootLayout() {
    return (
        <ClerkProvider
            publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!}
            tokenCache={tokenCache}
        >
            <AuthProvider>
                <Stack screenOptions={{ headerShown: false }} />
            </AuthProvider>
        </ClerkProvider>
    );
}
