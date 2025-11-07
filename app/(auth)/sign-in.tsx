import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View, ActivityIndicator, Alert } from 'react-native';
import { useSignIn, useOAuth } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import tw from 'twrnc';

WebBrowser.maybeCompleteAuthSession();

export default function SignInScreen() {
    const { signIn, setActive, isLoaded } = useSignIn();
    const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });
    const router = useRouter();

    const [emailAddress, setEmailAddress] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const onSignInPress = async () => {
        if (!isLoaded) return;
        setLoading(true);
        setError('');

        try {
            const signInAttempt = await signIn.create({
                identifier: emailAddress,
                password,
            });

            if (signInAttempt.status === 'complete') {
                await setActive({ session: signInAttempt.createdSessionId });
                router.replace('/');
            } else {
                setError('Please complete the additional steps.');
            }
        } catch (err: any) {
            setError(err.errors?.[0]?.message || 'Invalid email or password.');
        } finally {
            setLoading(false);
        }
    };

    const onGoogleSignIn = async () => {
        if (!isLoaded) return;
        setLoading(true);
        setError('');

        try {
            const { createdSessionId, setActive, signIn, signUp } = await startOAuthFlow();

            if (createdSessionId) {
                await setActive!({ session: createdSessionId });
                router.replace('/');
            } else {
                // Use signIn or signUp for next steps such as MFA
                setError('OAuth flow completed but no session created');
            }
        } catch (err: any) {
            setError(err.errors?.[0]?.message || 'Google sign-in failed.');
            console.error('OAuth error', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={tw`flex-1 bg-white px-6 justify-center`}>
            <View style={tw`items-center mb-10`}>
                <Text style={tw`text-3xl font-bold text-green-700 mb-2`}>Healthify</Text>
                <Text style={tw`text-gray-500 text-center`}>Your health, simplified with AI.</Text>
            </View>

            {/* Google Sign In Button */}
            <TouchableOpacity
                onPress={onGoogleSignIn}
                disabled={loading}
                style={tw`flex-row items-center justify-center bg-white border border-gray-300 py-4 rounded-xl mb-6`}
            >
                <Text style={tw`text-gray-700 text-lg font-semibold`}>Continue with Google</Text>
            </TouchableOpacity>

            <View style={tw`flex-row items-center mb-6`}>
                <View style={tw`flex-1 h-px bg-gray-300`} />
                <Text style={tw`mx-4 text-gray-500`}>or</Text>
                <View style={tw`flex-1 h-px bg-gray-300`} />
            </View>

            {/* Email Sign In */}
            <Text style={tw`text-lg font-semibold mb-2`}>Email Address</Text>
            <TextInput
                style={tw`border border-gray-300 rounded-xl p-3 mb-4`}
                placeholder="you@example.com"
                autoCapitalize="none"
                value={emailAddress}
                onChangeText={setEmailAddress}
            />

            <Text style={tw`text-lg font-semibold mb-2`}>Password</Text>
            <TextInput
                style={tw`border border-gray-300 rounded-xl p-3 mb-6`}
                placeholder="Enter password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />

            {error ? <Text style={tw`text-red-500 mb-4 text-center`}>{error}</Text> : null}

            <TouchableOpacity
                onPress={onSignInPress}
                disabled={loading}
                style={tw`bg-green-600 py-4 rounded-xl ${loading ? 'opacity-50' : 'opacity-100'}`}
            >
                {loading ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <Text style={tw`text-center text-white text-lg font-semibold`}>Sign In</Text>
                )}
            </TouchableOpacity>

            <View style={tw`flex-row justify-center mt-5`}>
                <Text style={tw`text-gray-600`}>Don't have an account?</Text>
                <Link href="/(auth)/sign-up" asChild>
                    <TouchableOpacity>
                        <Text style={tw`text-green-700 font-semibold ml-1`}>Sign Up</Text>
                    </TouchableOpacity>
                </Link>
            </View>
        </View>
    );
}