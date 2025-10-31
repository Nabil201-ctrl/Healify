import { View, Text, TouchableOpacity } from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';

export default function OnboardingScreen() {
    const { user } = useUser();
    const router = useRouter();

    const completeOnboarding = async () => {
        try {
            await user?.update({
                publicMetadata: { hasCompletedOnboarding: true },
            });
            router.replace('/');
        } catch (err) {
            console.error('Error completing onboarding:', err);
        }
    };

    return (
        <View className="flex-1 items-center justify-center">
            <Text>Welcome to the app 🎉</Text>
            <TouchableOpacity onPress={completeOnboarding}>
                <Text style={{ color: 'blue', marginTop: 10 }}>Complete Onboarding</Text>
            </TouchableOpacity>
        </View>
    );
}
