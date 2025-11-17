// components/SignOutButton.tsx
import React from 'react';
import { TouchableOpacity, Text, Alert } from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import tw from 'twrnc';

export function SignOutButton() {
    const { signOut } = useAuth();

    const handleSignOut = () => {
        Alert.alert(
            'Sign Out',
            'Are you sure you want to sign out?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Sign Out',
                    style: 'destructive',
                    onPress: () => signOut(),
                },
            ]
        );
    };

    return (
        <TouchableOpacity
            style={tw`border-2 border-gray-300 py-3 rounded-2xl`}
            onPress={handleSignOut}
            activeOpacity={0.7}
        >
            <Text style={tw`text-gray-600 text-center text-base font-medium`}>
                🚪 Sign Out
            </Text>
        </TouchableOpacity>
    );
}