import { SignedIn, SignedOut, useUser } from '@clerk/clerk-expo';
import { Link } from 'expo-router';
import { Text, View, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SignOutButton } from '../components/SignOutButton';
import { DashboardHeader } from '../components/DashboardHeader';
import { HealthMetricCard } from '../components/HealthMetricCard';
import { HeartRateChart } from '../components/HeartRateChart';
import { ActivityChart } from '../components/ActivityChart';
import { SleepChart } from '../components/SleepChart';
import { VitalSignsSection } from '../components/VitalSignsSection';
import tw from 'twrnc';
import React, { useState } from 'react';

export default function Dashboard() {
    const { user } = useUser();
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        // Simulate data refresh
        setTimeout(() => {
            setRefreshing(false);
        }, 1500);
    }, []);

    return (
        <View style={tw`flex-1 bg-gray-50`}>
            {/* When signed in */}
            <SignedIn>
                <ScrollView
                    contentContainerStyle={tw`p-5 pb-8`}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                >
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
                            <View style={tw`flex-1 bg-gradient-to-r from-cyan-50 to-cyan-100 p-3 rounded-xl mr-2`}>
                                <Text style={tw`text-xs text-cyan-700 font-medium mb-1`}>Distance</Text>
                                <Text style={tw`text-xl font-bold text-cyan-900`}>6.8 km</Text>
                            </View>
                            <View style={tw`flex-1 bg-gradient-to-r from-teal-50 to-teal-100 p-3 rounded-xl ml-2`}>
                                <Text style={tw`text-xs text-teal-700 font-medium mb-1`}>Floors</Text>
                                <Text style={tw`text-xl font-bold text-teal-900`}>12</Text>
                            </View>
                        </View>

                        <View style={tw`flex-row justify-between`}>
                            <View style={tw`flex-1 bg-gradient-to-r from-orange-50 to-orange-100 p-3 rounded-xl mr-2`}>
                                <Text style={tw`text-xs text-orange-700 font-medium mb-1`}>Stress Level</Text>
                                <Text style={tw`text-xl font-bold text-orange-900`}>Low</Text>
                            </View>
                            <View style={tw`flex-1 bg-gradient-to-r from-violet-50 to-violet-100 p-3 rounded-xl ml-2`}>
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

                    {/* Sign out */}
                    <View style={tw`mt-4`}>
                        <SignOutButton />
                    </View>
                </ScrollView>
            </SignedIn>

            {/* When signed out */}
            <SignedOut>
                <LinearGradient
                    colors={['#6366f1', '#8b5cf6']}
                    style={tw`flex-1`}
                >
                    <View style={tw`flex-1 justify-center items-center px-8`}>
                        <View style={tw`bg-white rounded-3xl p-8 shadow-2xl w-full max-w-sm`}>
                            <Text style={tw`text-4xl text-center mb-2`}>🩺</Text>
                            <Text style={tw`text-2xl font-bold text-center mb-2 text-gray-800`}>
                                MedAI Health
                            </Text>
                            <Text style={tw`text-sm text-center mb-6 text-gray-600`}>
                                Track your health metrics from your smartwatch
                            </Text>
                            
                            <Link href="/(auth)/sign-in" asChild>
                                <TouchableOpacity 
                                    style={tw`bg-indigo-600 px-6 py-4 rounded-2xl mb-3 shadow-md`}
                                    activeOpacity={0.8}
                                >
                                    <Text style={tw`text-white text-center text-lg font-semibold`}>
                                        Sign In
                                    </Text>
                                </TouchableOpacity>
                            </Link>
                            
                            <Link href="/(auth)/sign-up" asChild>
                                <TouchableOpacity 
                                    style={tw`border-2 border-indigo-600 px-6 py-4 rounded-2xl`}
                                    activeOpacity={0.8}
                                >
                                    <Text style={tw`text-indigo-600 text-center text-lg font-semibold`}>
                                        Sign Up
                                    </Text>
                                </TouchableOpacity>
                            </Link>
                        </View>
                    </View>
                </LinearGradient>
            </SignedOut>
        </View>
    );
}