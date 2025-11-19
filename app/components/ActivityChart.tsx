import React from 'react';
import { View, Text } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import tw from 'twrnc';

interface ActivityChartProps {
    isDark?: boolean;
}

export default function ActivityChart({ isDark = false }: ActivityChartProps) {
    const screenWidth = Dimensions.get('window').width - 40;

    const activityData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
            {
                data: [65, 78, 82, 75, 90, 45, 60],
            },
        ],
    };

    const chartConfig = {
        backgroundColor: isDark ? '#1f2937' : '#ffffff',
        backgroundGradientFrom: isDark ? '#1f2937' : '#ffffff',
        backgroundGradientTo: isDark ? '#374151' : '#ffffff',
        decimalPlaces: 0,
        color: (opacity = 1) => isDark 
            ? `rgba(96, 165, 250, ${opacity})` 
            : `rgba(59, 130, 246, ${opacity})`,
        labelColor: (opacity = 1) => isDark 
            ? `rgba(209, 213, 219, ${opacity})` 
            : `rgba(107, 114, 128, ${opacity})`,
        style: {
            borderRadius: 16,
        },
        barPercentage: 0.5,
        propsForBackgroundLines: {
            stroke: isDark ? '#374151' : '#e5e7eb',
            strokeWidth: 1,
        },
    };

    return (
        <View style={tw`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-4 shadow-md mb-6 border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <View style={tw`flex-row justify-between items-center mb-4`}>
                <Text style={tw`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>⚡ Activity Minutes</Text>
                <Text style={tw`text-sm ${isDark ? 'text-blue-400' : 'text-blue-600'} font-medium`}>This Week</Text>
            </View>
            
            <BarChart
                data={activityData}
                width={screenWidth}
                height={220}
                chartConfig={chartConfig}
                style={tw`rounded-xl`}
                showValuesOnTopOfBars
                withCustomBarColorFromData
                flatColor
                fromZero
            />
            
            <View style={tw`flex-row justify-between mt-4`}>
                <View style={tw`flex-1 items-center`}>
                    <Text style={tw`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Daily Avg</Text>
                    <Text style={tw`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>71 min</Text>
                </View>
                <View style={tw`flex-1 items-center`}>
                    <Text style={tw`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Weekly Total</Text>
                    <Text style={tw`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>495 min</Text>
                </View>
                <View style={tw`flex-1 items-center`}>
                    <Text style={tw`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Goal</Text>
                    <Text style={tw`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>60 min/day</Text>
                </View>
            </View>
        </View>
    );
}