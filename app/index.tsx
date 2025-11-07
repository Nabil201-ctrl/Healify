import { View, Text, ActivityIndicator } from 'react-native';
import { useAuthContext } from '../context/AuthContext';
import { SignOutButton } from './components/SignOutButton';
import tw from 'twrnc';

export default function Home() {
  const { userId, token, isLoading, hasCompletedOnboarding } = useAuthContext();

  if (isLoading) {
    return (
      <View style={tw`flex-1 justify-center items-center`}>
        <ActivityIndicator size="large" />
        <Text style={tw`mt-2 text-gray-700`}>Loading user session...</Text>
      </View>
    );
  }

  return (
    <View style={tw`flex-1 justify-center items-center bg-white`}>
      <Text style={tw`text-lg font-semibold mb-2`}>Welcome 👋</Text>
      <Text style={tw`text-base`}>User ID: {userId}</Text>
      <Text style={tw`text-base`}>
        Token: {token ? token.slice(0, 10) + '...' : 'N/A'}
      </Text>
      <Text style={tw`text-base mb-4`}>
        Onboarding Done: {hasCompletedOnboarding ? '✅' : '❌'}
      </Text>
      <SignOutButton />
    </View>
  );
}
