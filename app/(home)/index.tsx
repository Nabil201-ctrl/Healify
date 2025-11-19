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

// Custom hook for dark mode
const useDarkMode = () => {
  const [isDark, setIsDark] = useState(false);
  
  const toggleDarkMode = () => {
    setIsDark(!isDark);
  };

  return { isDark, toggleDarkMode };
};

export default function Dashboard() {
    const { isSignedIn, hasCompletedOnboarding, refreshAuth, forceCheckAuth } = useAuthContext();
    const { user } = useUser();
    const clerk = useClerk();
    const router = useRouter();
    const [refreshing, setRefreshing] = useState(false);
    const [authChecked, setAuthChecked] = useState(false);
    const { isDark, toggleDarkMode } = useDarkMode();

    // Dark mode color scheme
    const colors = {
      // Background colors
      bgPrimary: isDark ? 'bg-gray-900' : 'bg-gray-50',
      bgSecondary: isDark ? 'bg-gray-800' : 'bg-white',
      bgTertiary: isDark ? 'bg-gray-700' : 'bg-gray-100',
      
      // Text colors
      textPrimary: isDark ? 'text-white' : 'text-gray-800',
      textSecondary: isDark ? 'text-gray-300' : 'text-gray-600',
      textTertiary: isDark ? 'text-gray-400' : 'text-gray-500',
      
      // Border colors
      border: isDark ? 'border-gray-700' : 'border-gray-200',
      
      // Special colors
      success: isDark ? 'bg-green-900' : 'bg-green-50',
      successText: isDark ? 'text-green-300' : 'text-green-800',
      successBorder: isDark ? 'border-green-800' : 'border-green-200',
      
      warning: isDark ? 'bg-orange-900' : 'bg-orange-50',
      warningText: isDark ? 'text-orange-300' : 'text-orange-800',
      
      error: isDark ? 'bg-red-900' : 'bg-red-50',
      errorText: isDark ? 'text-red-300' : 'text-red-600',
    };

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
            <View style={tw`flex-1 justify-center items-center ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
                <Text style={tw`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'} mb-4`}>Verifying your session...</Text>
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
            <View style={tw`flex-1 justify-center items-center ${isDark ? 'bg-gray-900' : 'bg-white'} p-6`}>
                <Text style={tw`text-xl ${isDark ? 'text-red-400' : 'text-red-500'} font-bold mb-2`}>Authentication Required</Text>
                <Text style={tw`text-center mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
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
            <View style={tw`flex-1 justify-center items-center ${isDark ? 'bg-gray-900' : 'bg-white'} p-6`}>
                <Text style={tw`text-xl ${isDark ? 'text-orange-400' : 'text-orange-500'} font-bold mb-2`}>Onboarding Required</Text>
                <Text style={tw`text-center mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
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
        <View style={tw`flex-1 ${colors.bgPrimary}`}>
            <ScrollView
                contentContainerStyle={tw`p-5 pb-8`}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl 
                        refreshing={refreshing} 
                        onRefresh={onRefresh}
                        colors={['#16a34a']}
                        tintColor={isDark ? '#16a34a' : '#16a34a'}
                    />
                }
            >
                {/* Theme Toggle */}
                <View style={tw`flex-row justify-between items-center mb-4`}>
                    <View style={tw`${colors.success} p-3 rounded-lg border ${colors.successBorder} flex-1 mr-2`}>
                        <Text style={tw`${colors.successText} text-sm font-medium`}>
                            ✅ Authenticated as {user?.firstName || 'User'}
                        </Text>
                        <Text style={tw`${isDark ? 'text-green-400' : 'text-green-600'} text-xs`}>
                            User ID: {user?.id?.substring(0, 8)}... • Onboarding: Completed
                        </Text>
                    </View>
                    <TouchableOpacity 
                        onPress={toggleDarkMode}
                        style={tw`${isDark ? 'bg-yellow-500' : 'bg-gray-700'} w-12 h-12 rounded-2xl items-center justify-center`}
                    >
                        <Text style={tw`text-white text-xl`}>
                            {isDark ? '☀️' : '🌙'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Header with Gradient */}
                <DashboardHeader 
                    userName={user?.firstName || 'User'}
                    lastSyncTime="2 min ago"
                    isDark={isDark}
                />

                {/* Today's Key Metrics Grid */}
                <Text style={tw`text-xl font-bold ${colors.textPrimary} mb-3 px-1`}>
                    Today's Overview
                </Text>
                <View style={tw`flex-row flex-wrap justify-between mb-6`}>
                    <HealthMetricCard
                        title="Calories"
                        value="2,456"
                        unit="kcal burned"
                        icon="🔥"
                        gradientColors={isDark ? ['#7f1d1d', '#991b1b'] : ['#ef4444', '#dc2626']}
                        trend="up"
                        trendValue="12%"
                        isDark={isDark}
                    />
                    <HealthMetricCard
                        title="Steps"
                        value="8,547"
                        unit="steps today"
                        icon="👟"
                        gradientColors={isDark ? ['#1e3a8a', '#1e40af'] : ['#3b82f6', '#2563eb']}
                        trend="down"
                        trendValue="5%"
                        isDark={isDark}
                    />
                    <HealthMetricCard
                        title="Heart Rate"
                        value="72"
                        unit="bpm average"
                        icon="❤️"
                        gradientColors={isDark ? ['#831843', '#9d174d'] : ['#ec4899', '#db2777']}
                        trend="stable"
                        trendValue="0%"
                        isDark={isDark}
                    />
                    <HealthMetricCard
                        title="Active Time"
                        value="2.5"
                        unit="hours active"
                        icon="⚡"
                        gradientColors={isDark ? ['#78350f', '#92400e'] : ['#f59e0b', '#d97706']}
                        trend="up"
                        trendValue="18%"
                        isDark={isDark}
                    />
                </View>

                {/* Heart Rate Chart */}
                <HeartRateChart isDark={isDark} />

                {/* Vital Signs Section */}
                <VitalSignsSection isDark={isDark} />

                {/* Activity Chart */}
                <ActivityChart isDark={isDark} />

                {/* Sleep Chart */}
                <SleepChart isDark={isDark} />

                {/* Additional Metrics */}
                <View style={tw`${colors.bgSecondary} rounded-2xl p-4 shadow-md mb-6 border ${colors.border}`}>
                    <Text style={tw`text-lg font-bold ${colors.textPrimary} mb-4`}>
                        More Metrics
                    </Text>
                    
                    <View style={tw`flex-row justify-between mb-3`}>
                        <View style={tw`flex-1 ${isDark ? 'bg-cyan-900' : 'bg-cyan-50'} p-3 rounded-xl mr-2 border ${isDark ? 'border-cyan-800' : 'border-cyan-100'}`}>
                            <Text style={tw`text-xs ${isDark ? 'text-cyan-300' : 'text-cyan-700'} font-medium mb-1`}>Distance</Text>
                            <Text style={tw`text-xl font-bold ${isDark ? 'text-cyan-100' : 'text-cyan-900'}`}>6.8 km</Text>
                        </View>
                        <View style={tw`flex-1 ${isDark ? 'bg-teal-900' : 'bg-teal-50'} p-3 rounded-xl ml-2 border ${isDark ? 'border-teal-800' : 'border-teal-100'}`}>
                            <Text style={tw`text-xs ${isDark ? 'text-teal-300' : 'text-teal-700'} font-medium mb-1`}>Floors</Text>
                            <Text style={tw`text-xl font-bold ${isDark ? 'text-teal-100' : 'text-teal-900'}`}>12</Text>
                        </View>
                    </View>

                    <View style={tw`flex-row justify-between`}>
                        <View style={tw`flex-1 ${isDark ? 'bg-orange-900' : 'bg-orange-50'} p-3 rounded-xl mr-2 border ${isDark ? 'border-orange-800' : 'border-orange-100'}`}>
                            <Text style={tw`text-xs ${isDark ? 'text-orange-300' : 'text-orange-700'} font-medium mb-1`}>Stress Level</Text>
                            <Text style={tw`text-xl font-bold ${isDark ? 'text-orange-100' : 'text-orange-900'}`}>Low</Text>
                        </View>
                        <View style={tw`flex-1 ${isDark ? 'bg-violet-900' : 'bg-violet-50'} p-3 rounded-xl ml-2 border ${isDark ? 'border-violet-800' : 'border-violet-100'}`}>
                            <Text style={tw`text-xs ${isDark ? 'text-violet-300' : 'text-violet-700'} font-medium mb-1`}>Body Battery</Text>
                            <Text style={tw`text-xl font-bold ${isDark ? 'text-violet-100' : 'text-violet-900'}`}>78%</Text>
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
                    style={tw`${isDark ? 'bg-gray-800 border-gray-600' : 'bg-white border-indigo-600'} border-2 py-4 rounded-2xl shadow-md mb-6`}
                    activeOpacity={0.8}
                >
                    <Text style={tw`${isDark ? 'text-gray-200' : 'text-indigo-600'} text-center text-base font-semibold`}>
                        🎯 Set Health Goals
                    </Text>
                </TouchableOpacity>

                {/* Debug and utility buttons */}
                <View style={tw`${colors.bgTertiary} p-4 rounded-2xl mb-4 border ${colors.border}`}>
                    <Text style={tw`${colors.textPrimary} text-sm font-medium mb-2`}>Debug Tools</Text>
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
                        <TouchableOpacity 
                            onPress={toggleDarkMode}
                            style={tw`flex-1 ${isDark ? 'bg-yellow-600' : 'bg-gray-600'} py-2 rounded-lg`}
                        >
                            <Text style={tw`text-white text-center text-xs`}>
                                {isDark ? 'Light' : 'Dark'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}