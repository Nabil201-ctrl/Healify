import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View, ActivityIndicator, Platform } from 'react-native';
import { useSignIn, useOAuth } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as AppleAuthentication from 'expo-apple-authentication';
import tw from 'twrnc';

WebBrowser.maybeCompleteAuthSession();

export default function SignInScreen() {
    const { signIn, setActive, isLoaded } = useSignIn();
    const { startOAuthFlow: startGoogleOAuth } = useOAuth({ strategy: 'oauth_google' });
    const { startOAuthFlow: startAppleOAuth } = useOAuth({ strategy: 'oauth_apple' });
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
                // Don't navigate manually - let AuthContext handle navigation based on onboarding status
                // The AuthContext will check onboarding metadata and redirect accordingly
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
        if (!isLoaded) {
            setError('Authentication service is not ready. Please try again.');
            return;
        }
        
        setLoading(true);
        setError('');

        try {
            const { createdSessionId, setActive, signIn, signUp } = await startGoogleOAuth();

            if (createdSessionId) {
                await setActive!({ session: createdSessionId });
                // Don't navigate manually - let AuthContext handle navigation based on onboarding status
                // The AuthContext will check onboarding metadata and redirect to onboarding if needed
            } else {
                // Handle MFA or other additional steps
                if (signIn || signUp) {
                    setError('Please complete additional verification steps.');
                } else {
                    setError('OAuth flow completed but no session created. Please try again.');
                }
            }
        } catch (err: any) {
            // Handle user cancellation gracefully
            if (err?.errors?.[0]?.code === 'user_cancelled' || err?.message?.includes('cancel')) {
                setError('');
                // Don't show error for user cancellation
                return;
            }
            
            const errorMessage = err?.errors?.[0]?.message || err?.message || 'Google sign-in failed. Please check your connection and try again.';
            setError(errorMessage);
            console.error('Google OAuth error:', err);
        } finally {
            setLoading(false);
        }
    };

    const onAppleSignIn = async () => {
        if (!isLoaded) {
            setError('Authentication service is not ready. Please try again.');
            return;
        }
        
        if (Platform.OS !== 'ios') {
            setError('Apple Sign In is only available on iOS');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const { createdSessionId, setActive, signIn, signUp } = await startAppleOAuth();

            if (createdSessionId) {
                await setActive!({ session: createdSessionId });
                // Don't navigate manually - let AuthContext handle navigation based on onboarding status
                // The AuthContext will check onboarding metadata and redirect to onboarding if needed
            } else {
                // Handle MFA or other additional steps
                if (signIn || signUp) {
                    setError('Please complete additional verification steps.');
                } else {
                    setError('OAuth flow completed but no session created. Please try again.');
                }
            }
        } catch (err: any) {
            // Handle user cancellation gracefully
            if (err?.errors?.[0]?.code === 'user_cancelled' || err?.message?.includes('cancel')) {
                setError('');
                // Don't show error for user cancellation
                return;
            }
            
            const errorMessage = err?.errors?.[0]?.message || err?.message || 'Apple sign-in failed. Please check your connection and try again.';
            setError(errorMessage);
            console.error('Apple OAuth error:', err);
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
                style={tw`flex-row items-center justify-center bg-white border border-gray-300 py-4 rounded-xl mb-4`}
            >
                <Text style={tw`text-gray-700 text-lg font-semibold`}>Continue with Google</Text>
            </TouchableOpacity>

            {/* Apple Sign In Button (iOS only) */}
            {Platform.OS === 'ios' && (
                <AppleAuthentication.AppleAuthenticationButton
                    buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                    buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                    cornerRadius={12}
                    style={tw`w-full h-14 mb-4`}
                    onPress={onAppleSignIn}
                />
            )}

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