import { View, Text, ActivityIndicator } from 'react-native';
import { useAuthContext } from '../context/AuthContext';
import { SignOutButton } from './components/SignOutButton';
import tw from "twrnc"

export default function Home() {
    const { userId, token, isLoading, hasCompletedOnboarding } = useAuthContext();

    if (isLoading) {
        return (
            <View style={tw `flex-1 justify-center items-center`} >
                <ActivityIndicator size="large" />
                <Text>Loading user session...</Text>
            </View>
        );
    }

    return (
        <View style={`flex-1 justify-center items-center`}>
            <Text>Welcome 👋</Text>
            <Text>User ID: {userId}</Text>
            <Text>Token: {token ? token.slice(0, 10) + '...' : 'N/A'}</Text>
            <Text>Onboarding Done: {hasCompletedOnboarding ? '✅' : '❌'}</Text>
            <SignOutButton />
        </View>
    );
}
