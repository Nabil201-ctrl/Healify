import { SignedIn, SignedOut, useUser } from '@clerk/clerk-expo';
import { Link } from 'expo-router';
import { Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { SignOutButton } from '../components/SignOutButton';
import tw from 'twrnc';

export default function Dashboard() {
    const { user } = useUser();

    return (
        <View style={tw`flex-1 bg-white`}>
            {/* When signed in */}
            <SignedIn>
                <ScrollView
                    contentContainerStyle={tw`p-6`}
                    showsVerticalScrollIndicator={false}
                >
                    <Text style={tw`text-2xl font-bold text-gray-800 mb-2`}>
                        Welcome back 👋
                    </Text>
                    <Text style={tw`text-base text-gray-600 mb-6`}>
                        {user?.emailAddresses[0]?.emailAddress}
                    </Text>

                    {/* Dashboard cards */}
                    <View style={tw`flex-row flex-wrap justify-between`}>
                        <View style={tw`w-[48%] bg-blue-100 p-4 rounded-2xl mb-4`}>
                            <Text style={tw`text-blue-700 text-lg font-semibold`}>
                                AI Checks
                            </Text>
                            <Text style={tw`text-2xl font-bold text-blue-900 mt-2`}>12</Text>
                        </View>

                        <View style={tw`w-[48%] bg-green-100 p-4 rounded-2xl mb-4`}>
                            <Text style={tw`text-green-700 text-lg font-semibold`}>
                                Appointments
                            </Text>
                            <Text style={tw`text-2xl font-bold text-green-900 mt-2`}>3</Text>
                        </View>

                        <View style={tw`w-[48%] bg-purple-100 p-4 rounded-2xl mb-4`}>
                            <Text style={tw`text-purple-700 text-lg font-semibold`}>
                                Health Score
                            </Text>
                            <Text style={tw`text-2xl font-bold text-purple-900 mt-2`}>
                                87%
                            </Text>
                        </View>

                        <View style={tw`w-[48%] bg-yellow-100 p-4 rounded-2xl mb-4`}>
                            <Text style={tw`text-yellow-700 text-lg font-semibold`}>
                                Insights
                            </Text>
                            <Text style={tw`text-2xl font-bold text-yellow-900 mt-2`}>
                                5 New
                            </Text>
                        </View>
                    </View>

                    {/* Quick actions */}
                    <TouchableOpacity
                        style={tw`bg-blue-600 py-4 rounded-xl mt-4`}
                        activeOpacity={0.8}
                    >
                        <Text style={tw`text-white text-center text-lg font-semibold`}>
                            Start AI Health Check
                        </Text>
                    </TouchableOpacity>

                    {/* Sign out */}
                    <View style={tw`mt-6`}>
                        <SignOutButton />
                    </View>
                </ScrollView>
            </SignedIn>

            {/* When signed out */}
            <SignedOut>
                <View style={tw`flex-1 justify-center items-center`}>
                    <Text style={tw`text-xl font-semibold mb-4`}>
                        Welcome to MedAI 🩺
                    </Text>
                    <Link href="/(auth)/sign-in" asChild>
                        <TouchableOpacity style={tw`bg-blue-500 px-6 py-3 rounded-xl mb-3`}>
                            <Text style={tw`text-white text-lg font-medium`}>Sign In</Text>
                        </TouchableOpacity>
                    </Link>
                    <Link href="/(auth)/sign-up" asChild>
                        <TouchableOpacity style={tw`border border-blue-500 px-6 py-3 rounded-xl`}>
                            <Text style={tw`text-blue-600 text-lg font-medium`}>Sign Up</Text>
                        </TouchableOpacity>
                    </Link>
                </View>
            </SignedOut>
        </View>
    );
}
