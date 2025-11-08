import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View, ActivityIndicator, Platform } from 'react-native';
import { useSignUp, useOAuth } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as AppleAuthentication from 'expo-apple-authentication';
import tw from 'twrnc';

WebBrowser.maybeCompleteAuthSession();

export default function SignUpScreen() {
    const { isLoaded, signUp, setActive } = useSignUp();
    const { startOAuthFlow: startGoogleOAuth } = useOAuth({ strategy: 'oauth_google' });
    const { startOAuthFlow: startAppleOAuth } = useOAuth({ strategy: 'oauth_apple' });
    const router = useRouter();

    const [emailAddress, setEmailAddress] = useState('');
    const [password, setPassword] = useState('');
    const [pendingVerification, setPendingVerification] = useState(false);
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const onSignUpPress = async () => {
        if (!isLoaded) return;
        setLoading(true);
        setError('');

        try {
            await signUp.create({ emailAddress, password });
            await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
            setPendingVerification(true);
        } catch (err: any) {
            setError(err.errors?.[0]?.message || 'Failed to sign up. Please check your info.');
        } finally {
            setLoading(false);
        }
    };

    const onGoogleSignUp = async () => {
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
                // Small delay to ensure session is properly set
                setTimeout(() => {
                    router.replace('/');
                }, 100);
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
            
            const errorMessage = err?.errors?.[0]?.message || err?.message || 'Google sign-up failed. Please check your connection and try again.';
            setError(errorMessage);
            console.error('Google OAuth error:', err);
        } finally {
            setLoading(false);
        }
    };

    const onAppleSignUp = async () => {
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
                // Small delay to ensure session is properly set
                setTimeout(() => {
                    router.replace('/');
                }, 100);
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
            
            const errorMessage = err?.errors?.[0]?.message || err?.message || 'Apple sign-up failed. Please check your connection and try again.';
            setError(errorMessage);
            console.error('Apple OAuth error:', err);
        } finally {
            setLoading(false);
        }
    };

    const onVerifyPress = async () => {
        if (!isLoaded) return;
        setLoading(true);
        setError('');

        try {
            const attempt = await signUp.attemptEmailAddressVerification({ code });
            if (attempt.status === 'complete') {
                await setActive({ session: attempt.createdSessionId });
                router.replace('/');
            }
        } catch (err: any) {
            setError(err.errors?.[0]?.message || 'Invalid verification code.');
        } finally {
            setLoading(false);
        }
    };

    if (pendingVerification) {
        return (
            <View style={tw`flex-1 bg-white justify-center px-6`}>
                <Text style={tw`text-2xl font-bold text-green-700 mb-2`}>Verify Email</Text>
                <Text style={tw`text-gray-500 mb-6`}>
                    Enter the 6-digit code sent to your email.
                </Text>
                <TextInput
                    style={tw`border border-gray-300 rounded-xl p-3 mb-6 text-center text-lg`}
                    placeholder="Verification code"
                    keyboardType="numeric"
                    value={code}
                    onChangeText={setCode}
                />

                {error ? <Text style={tw`text-red-500 mb-4`}>{error}</Text> : null}

                <TouchableOpacity
                    onPress={onVerifyPress}
                    style={tw`bg-green-600 py-4 rounded-xl`}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={tw`text-center text-white text-lg font-semibold`}>
                            Verify & Continue
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={tw`flex-1 bg-white justify-center px-6`}>
            <View style={tw`items-center mb-10`}>
                <Text style={tw`text-3xl font-bold text-green-700 mb-2`}>Join Healthify</Text>
                <Text style={tw`text-gray-500 text-center`}>
                    Create your account and start your wellness journey.
                </Text>
            </View>

            {/* Google Sign Up Button */}
            <TouchableOpacity
                onPress={onGoogleSignUp}
                disabled={loading}
                style={tw`flex-row items-center justify-center bg-white border border-gray-300 py-4 rounded-xl mb-4`}
            >
                <Text style={tw`text-gray-700 text-lg font-semibold`}>Continue with Google</Text>
            </TouchableOpacity>

            {/* Apple Sign Up Button (iOS only) */}
            {Platform.OS === 'ios' && (
                <AppleAuthentication.AppleAuthenticationButton
                    buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_UP}
                    buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                    cornerRadius={12}
                    style={tw`w-full h-14 mb-4`}
                    onPress={onAppleSignUp}
                />
            )}

            <View style={tw`flex-row items-center mb-6`}>
                <View style={tw`flex-1 h-px bg-gray-300`} />
                <Text style={tw`mx-4 text-gray-500`}>or</Text>
                <View style={tw`flex-1 h-px bg-gray-300`} />
            </View>

            <TextInput
                style={tw`border border-gray-300 rounded-xl p-3 mb-4`}
                placeholder="Email address"
                autoCapitalize="none"
                value={emailAddress}
                onChangeText={setEmailAddress}
            />

            <TextInput
                style={tw`border border-gray-300 rounded-xl p-3 mb-6`}
                placeholder="Password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />

            {error ? <Text style={tw`text-red-500 mb-4 text-center`}>{error}</Text> : null}

            <TouchableOpacity
                onPress={onSignUpPress}
                style={tw`bg-green-600 py-4 rounded-xl`}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <Text style={tw`text-center text-white text-lg font-semibold`}>Sign Up</Text>
                )}
            </TouchableOpacity>

            <View style={tw`flex-row justify-center mt-5`}>
                <Text style={tw`text-gray-600`}>Already have an account?</Text>
                <Link href="/(auth)/sign-in" asChild>
                    <TouchableOpacity>
                        <Text style={tw`text-green-700 font-semibold ml-1`}>Sign In</Text>
                    </TouchableOpacity>
                </Link>
            </View>
        </View>
    );
}