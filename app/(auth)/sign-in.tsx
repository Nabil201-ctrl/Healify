import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View, ActivityIndicator, Platform } from 'react-native';
import { useSignIn, useOAuth, useAuth, useClerk } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as AppleAuthentication from 'expo-apple-authentication';
import tw from 'twrnc';
import { makeRedirectUri, useAuthRequest } from 'expo-auth-session';
import { useAuthContext } from '../../context/AuthContext';

WebBrowser.maybeCompleteAuthSession();

export default function SignInScreen() {
    const { refreshAuth, forceSignIn } = useAuthContext();
    const { signIn, setActive, isLoaded } = useSignIn();
    const { isSignedIn } = useAuth();
    const clerk = useClerk();
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
      console.log('✅ Sign in successful - session activated');
      // Don't navigate here - let the root layout handle it
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
    const { createdSessionId, setActive } = await startGoogleOAuth();

    if (createdSessionId) {
      await setActive!({ session: createdSessionId });
      console.log('✅ Google OAuth: Session created and activated');
      
      // Force signed-in state immediately
      forceSignIn();
      
    } else {
      setError('OAuth flow completed but no session created. Please try again.');
    }
  } catch (err: any) {
    console.error('Google OAuth error:', err);
    
    // Handle "already signed in" error
    if (err?.errors?.[0]?.code === 'session_exists') {
      console.log('⚠️ Google OAuth: Session exists, activating...');
      
      try {
        const client = clerk.client;
        if (client?.sessions && client.sessions.length > 0) {
          const sessionToActivate = client.sessions[client.sessions.length - 1];
          await clerk.setActive({ session: sessionToActivate });
          console.log('✅ Google OAuth: Existing session activated');
          
          // Force signed-in state
          forceSignIn();
          
          // Also try direct navigation as fallback
          setTimeout(() => {
            console.log('🔄 Attempting direct navigation...');
            // Check if we have onboarding data to decide where to go
            const user = clerk.user;
            const hasOnboarding = user?.unsafeMetadata?.hasCompletedOnboarding;
            if (hasOnboarding) {
              router.replace('/(home)');
            } else {
              router.replace('/(onboarding)/onboarding');
            }
          }, 1000);
        }
      } catch (sessionError) {
        console.error('Error activating session:', sessionError);
      }
      return;
    }
    
    // Handle user cancellation
    if (err?.errors?.[0]?.code === 'user_cancelled') {
      setError('');
      return;
    }
    
    setError(err?.errors?.[0]?.message || 'Google sign-in failed.');
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

        // Check if user is already signed in
        if (isSignedIn) {
            console.log('⚠️ User is already signed in, redirecting...');
            // Let AuthContext handle the redirect based on onboarding status
            return;
        }

        setLoading(true);
        setError('');

        try {
            const redirectUrl = makeRedirectUri({
                path: '/(auth)/sign-in',
            });

            const { createdSessionId, setActive, signIn, signUp } = await startAppleOAuth({
                redirectUrl,
            });

            if (createdSessionId) {
                await setActive!({ session: createdSessionId });
                console.log('✅ Apple OAuth: Session created and activated');
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
            console.error('Apple OAuth error:', err);
            
            // Handle "already signed in" error - session exists but might not be active
            if (err?.errors?.[0]?.message?.includes('already signed in') || 
                err?.errors?.[0]?.code === 'session_exists' ||
                err?.message?.includes('already signed in') ||
                err?.errors?.[0]?.code === 'form_identifier_exists') {
                console.log('⚠️ Apple OAuth: Clerk reports user is already signed in (session_exists)');
                console.log('  - Error code:', err?.errors?.[0]?.code);
                console.log('  - Error message:', err?.errors?.[0]?.message);
                
                try {
                    // Get the client to access sessions
                    const client = clerk.client;
                    if (!client) {
                        console.error('❌ Clerk client not available');
                        setError('');
                        setLoading(false);
                        return;
                    }

                    // Get all sessions for this client
                    const sessions = client.sessions;
                    console.log('  - Available sessions:', sessions?.length || 0);

                    if (sessions && sessions.length > 0) {
                        // Get the last (most recent) session
                        const sessionToActivate = sessions[sessions.length - 1];
                        console.log('  - Activating session ID:', sessionToActivate.id);
                        
                        // Activate the session
                        await clerk.setActive({ session: sessionToActivate });
                        console.log('✅ Apple OAuth: Session activated successfully');
                        
                        // Force a reload of the client to ensure state is synced
                        await client.reload();
                        console.log('✅ Apple OAuth: Client reloaded');
                        
                        // Wait for Clerk hooks (useAuth, useUser) to update
                        // This gives React time to re-render with updated auth state
                        console.log('⏳ Apple OAuth: Waiting for auth state to sync...');
                        await new Promise(resolve => setTimeout(resolve, 2000));
                        
                        // Verify session is active
                        const activeSession = clerk.session;
                        console.log('  - Active session after activation:', activeSession ? activeSession.id : 'none');
                        console.log('  - isSignedIn hook should update automatically');
                        
                        // Clear error and stop loading - AuthContext will detect and route
                        setError('');
                        setLoading(false);
                        
                        console.log('✅ Apple OAuth: Session activation complete.');
                        console.log('🔄 Apple OAuth: AuthContext should now detect session and route user automatically.');
                        
                        // Note: AuthContext useEffect will automatically trigger when:
                        // 1. isSignedIn becomes true (from useAuth hook)
                        // 2. user object becomes available (from useUser hook)
                        // 3. The dependency array detects these changes
                        // It will then route based on onboarding status
                    } else {
                        console.log('⚠️ Apple OAuth: No sessions found in client');
                        // Try reloading the client - session might be in a different state
                        await client.reload();
                        console.log('⏳ Apple OAuth: Client reloaded, waiting for state sync...');
                        await new Promise(resolve => setTimeout(resolve, 2000));
                        setError('');
                        setLoading(false);
                    }
                } catch (sessionError: any) {
                    console.error('❌ Apple OAuth: Error handling existing session:', sessionError);
                    console.error('  - Error details:', sessionError?.message);
                    // Clear the error - AuthContext might still detect the session
                    setError('');
                    setLoading(false);
                }
                return;
            }
            
            // Handle user cancellation gracefully
            if (err?.errors?.[0]?.code === 'user_cancelled' || 
                err?.message?.includes('cancel') ||
                err?.errors?.[0]?.code === 'user_cancelled_oauth') {
                setError('');
                // Don't show error for user cancellation
                return;
            }
            
            const errorMessage = err?.errors?.[0]?.message || err?.message || 'Apple sign-in failed. Please check your connection and try again.';
            setError(errorMessage);
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