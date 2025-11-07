import { useClerk } from '@clerk/clerk-expo';
import * as Linking from 'expo-linking';
import { Text, TouchableOpacity } from 'react-native';
import tw from 'twrnc';

export const SignOutButton = () => {
    const { signOut } = useClerk();

    const handleSignOut = async () => {
        try {
            await signOut();
            // Redirect to home
            Linking.openURL(Linking.createURL('/'));
        } catch (err) {
            console.error(JSON.stringify(err, null, 2));
        }
    };

    return (
        <TouchableOpacity
            onPress={handleSignOut}
            style={tw`mt-4 px-6 py-3 bg-red-500 rounded-xl`}
            activeOpacity={0.8}
        >
            <Text style={tw`text-white text-center text-base font-semibold`}>
                Sign Out
            </Text>
        </TouchableOpacity>
    );
};
