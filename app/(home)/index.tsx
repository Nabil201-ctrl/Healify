import React, { useEffect, useState } from 'react';
import { Text, View, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthContext } from '../../context/AuthContext';
import { useUser, useClerk } from '@clerk/clerk-expo';
import { DashboardHeader } from '../components/DashboardHeader';
import HealthMetricCard from '../components/HealthMetricCard';
import { HeartRateChart } from '../components/HeartRateChart';
import ActivityChart from '../components/ActivityChart';
import SleepChart from '../components/SleepChart';
import { VitalSignsSection } from '../components/VitalSignsSection';
import tw from 'twrnc';

export default function Dashboard() {
    const { isSignedIn, hasCompletedOnboarding, refreshAuth, forceCheckAuth } = useAuthContext();
    const { user } = useUser();
    const clerk = useClerk();
    const router = useRouter();
    const [refreshing, setRefreshing] = useState(false);
    const [authChecked, setAuthChecked] = useState(false);

    // Verify authentication on mount
    useEffect(() => {
        const verifyAuth = async () => {
            console.log('🏠 Dashboard: Verifying authentication...');
            const actuallySignedIn = await forceCheckAuth();
            
            if (!actuallySignedIn) {
                console.log('🚨 Dashboard: Not authenticated, redirecting to sign-in');
                router.replace('/(auth)/sign-in');
                return;
            }

            if (!hasCompletedOnboarding) {
                console.log('🔄 Dashboard: Onboarding not completed, redirecting');
                router.replace('/(onboarding)/onboarding');
                return;
            }

            console.log('✅ Dashboard: Authentication verified');
            setAuthChecked(true);
        };

        verifyAuth();
    }, [isSignedIn, hasCompletedOnboarding, forceCheckAuth, router]);

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        console.log('🔄 Dashboard: Manual refresh triggered');
        
        // Refresh auth state first
        await forceCheckAuth();
        refreshAuth();
        
        // Simulate data refresh
        setTimeout(() => {
            setRefreshing(false);
            console.log('✅ Dashboard: Refresh completed');
        }, 1500);
    }, [forceCheckAuth, refreshAuth]);

    const handleForceAuthCheck = async () => {
        console.log('🔍 Dashboard: Manual auth check');
        const actuallySignedIn = await forceCheckAuth();
        console.log('✅ Manual auth check result:', actuallySignedIn);
        refreshAuth();
    };

    const handleSignOut = async () => {
        try {
            console.log('🚪 Dashboard: Signing out...');
            await clerk.signOut();
            router.replace('/(auth)/sign-in');
        } catch (error) {
            console.error('Sign out error:', error);
        }
    };

    // Show loading while verifying auth
    if (!authChecked && (isSignedIn || user)) {
        return (
            <View style={tw`flex-1 justify-center items-center bg-white`}>
                <Text style={tw`text-lg text-gray-600 mb-4`}>Verifying your session...</Text>
                <TouchableOpacity 
                    onPress={handleForceAuthCheck}
                    style={tw`bg-blue-500 px-4 py-2 rounded-lg`}
                >
                    <Text style={tw`text-white`}>Check Auth Status</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Show auth error state if not properly authenticated
    if (!isSignedIn && !user) {
        return (
            <View style={tw`flex-1 justify-center items-center bg-white p-6`}>
                <Text style={tw`text-xl text-red-500 font-bold mb-2`}>Authentication Required</Text>
                <Text style={tw`text-gray-600 text-center mb-6`}>
                    You need to be signed in to view the dashboard.
                </Text>
                <TouchableOpacity 
                    onPress={handleForceAuthCheck}
                    style={tw`bg-blue-500 px-6 py-3 rounded-lg mb-3`}
                >
                    <Text style={tw`text-white font-semibold`}>Check Auth Status</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    onPress={() => router.replace('/(auth)/sign-in')}
                    style={tw`bg-indigo-600 px-6 py-3 rounded-lg`}
                >
                    <Text style={tw`text-white font-semibold`}>Go to Sign In</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Show onboarding redirect if not completed
    if (!hasCompletedOnboarding) {
        return (
            <View style={tw`flex-1 justify-center items-center bg-white p-6`}>
                <Text style={tw`text-xl text-orange-500 font-bold mb-2`}>Onboarding Required</Text>
                <Text style={tw`text-gray-600 text-center mb-6`}>
                    Please complete onboarding to access the dashboard.
                </Text>
                <TouchableOpacity 
                    onPress={() => router.replace('/(onboarding)/onboarding')}
                    style={tw`bg-indigo-600 px-6 py-3 rounded-lg`}
                >
                    <Text style={tw`text-white font-semibold`}>Complete Onboarding</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Main dashboard content
    return (
        <View style={tw`flex-1 bg-gray-50`}>
            <ScrollView
                contentContainerStyle={tw`p-5 pb-8`}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl 
                        refreshing={refreshing} 
                        onRefresh={onRefresh}
                        colors={['#16a34a']}
                    />
                }
            >
                {/* Debug header - remove in production */}
                <View style={tw`bg-green-50 p-3 rounded-lg mb-4 border border-green-200`}>
                    <Text style={tw`text-green-800 text-sm font-medium`}>
                        ✅ Authenticated as {user?.firstName || 'User'}
                    </Text>
                    <Text style={tw`text-green-600 text-xs`}>
                        User ID: {user?.id?.substring(0, 8)}... • Onboarding: Completed
                    </Text>
                </View>

                {/* Header with Gradient */}
                <DashboardHeader 
                    userName={user?.firstName || 'User'}
                    lastSyncTime="2 min ago"
                />

                {/* Today's Key Metrics Grid */}
                <Text style={tw`text-xl font-bold text-gray-800 mb-3 px-1`}>
                    Today's Overview
                </Text>
                <View style={tw`flex-row flex-wrap justify-between mb-6`}>
                    <HealthMetricCard
                        title="Calories"
                        value="2,456"
                        unit="kcal burned"
                        icon="🔥"
                        gradientColors={['#ef4444', '#dc2626']}
                        trend="up"
                        trendValue="12%"
                    />
                    <HealthMetricCard
                        title="Steps"
                        value="8,547"
                        unit="steps today"
                        icon="👟"
                        gradientColors={['#3b82f6', '#2563eb']}
                        trend="down"
                        trendValue="5%"
                    />
                    <HealthMetricCard
                        title="Heart Rate"
                        value="72"
                        unit="bpm average"
                        icon="❤️"
                        gradientColors={['#ec4899', '#db2777']}
                        trend="stable"
                        trendValue="0%"
                    />
                    <HealthMetricCard
                        title="Active Time"
                        value="2.5"
                        unit="hours active"
                        icon="⚡"
                        gradientColors={['#f59e0b', '#d97706']}
                        trend="up"
                        trendValue="18%"
                    />
                </View>

                {/* Heart Rate Chart */}
                <HeartRateChart />

                {/* Vital Signs Section */}
                <VitalSignsSection />

                {/* Activity Chart */}
                <ActivityChart />

                {/* Sleep Chart */}
                <SleepChart />

                {/* Additional Metrics */}
                <View style={tw`bg-white rounded-2xl p-4 shadow-md mb-6`}>
                    <Text style={tw`text-lg font-bold text-gray-800 mb-4`}>
                        More Metrics
                    </Text>
                    
                    <View style={tw`flex-row justify-between mb-3`}>
                        <View style={tw`flex-1 bg-cyan-50 p-3 rounded-xl mr-2 border border-cyan-100`}>
                            <Text style={tw`text-xs text-cyan-700 font-medium mb-1`}>Distance</Text>
                            <Text style={tw`text-xl font-bold text-cyan-900`}>6.8 km</Text>
                        </View>
                        <View style={tw`flex-1 bg-teal-50 p-3 rounded-xl ml-2 border border-teal-100`}>
                            <Text style={tw`text-xs text-teal-700 font-medium mb-1`}>Floors</Text>
                            <Text style={tw`text-xl font-bold text-teal-900`}>12</Text>
                        </View>
                    </View>

                    <View style={tw`flex-row justify-between`}>
                        <View style={tw`flex-1 bg-orange-50 p-3 rounded-xl mr-2 border border-orange-100`}>
                            <Text style={tw`text-xs text-orange-700 font-medium mb-1`}>Stress Level</Text>
                            <Text style={tw`text-xl font-bold text-orange-900`}>Low</Text>
                        </View>
                        <View style={tw`flex-1 bg-violet-50 p-3 rounded-xl ml-2 border border-violet-100`}>
                            <Text style={tw`text-xs text-violet-700 font-medium mb-1`}>Body Battery</Text>
                            <Text style={tw`text-xl font-bold text-violet-900`}>78%</Text>
                        </View>
                    </View>
                </View>

                {/* Insights & Recommendations */}
                <View style={tw`bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-5 shadow-lg mb-6`}>
                    <Text style={tw`text-white text-lg font-bold mb-3`}>💡 Today's Insights</Text>
                    <View style={tw`bg-white bg-opacity-20 rounded-xl p-3 mb-2`}>
                        <Text style={tw`text-white font-medium mb-1`}>Great Activity!</Text>
                        <Text style={tw`text-white text-opacity-90 text-xs`}>
                            You're 15% more active than last Monday. Keep it up!
                        </Text>
                    </View>
                    <View style={tw`bg-white bg-opacity-20 rounded-xl p-3`}>
                        <Text style={tw`text-white font-medium mb-1`}>Hydration Reminder</Text>
                        <Text style={tw`text-white text-opacity-90 text-xs`}>
                            Don't forget to drink water. Target: 2L/day
                        </Text>
                    </View>
                </View>

                {/* Action Buttons */}
                <TouchableOpacity
                    style={tw`bg-indigo-600 py-4 rounded-2xl shadow-lg mb-4`}
                    activeOpacity={0.8}
                >
                    <Text style={tw`text-white text-center text-base font-semibold`}>
                        📊 View Detailed Reports
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={tw`bg-white border-2 border-indigo-600 py-4 rounded-2xl shadow-md mb-6`}
                    activeOpacity={0.8}
                >
                    <Text style={tw`text-indigo-600 text-center text-base font-semibold`}>
                        🎯 Set Health Goals
                    </Text>
                </TouchableOpacity>

                {/* Debug and utility buttons */}
                <View style={tw`bg-gray-100 p-4 rounded-2xl mb-4`}>
                    <Text style={tw`text-gray-700 text-sm font-medium mb-2`}>Debug Tools</Text>
                    <View style={tw`flex-row space-x-2`}>
                        <TouchableOpacity 
                            onPress={handleForceAuthCheck}
                            style={tw`flex-1 bg-blue-500 py-2 rounded-lg`}
                        >
                            <Text style={tw`text-white text-center text-xs`}>Check Auth</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            onPress={handleSignOut}
                            style={tw`flex-1 bg-red-500 py-2 rounded-lg`}
                        >
                            <Text style={tw`text-white text-center text-xs`}>Sign Out</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}