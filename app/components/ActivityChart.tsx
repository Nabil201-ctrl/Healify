// components/ActivityChart.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import tw from 'twrnc';

export default function ActivityChart() {
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
        backgroundColor: '#ffffff',
        backgroundGradientFrom: '#ffffff',
        backgroundGradientTo: '#ffffff',
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
        style: {
            borderRadius: 16,
        },
        barPercentage: 0.5,
    };

    return (
        <View style={tw`bg-white rounded-2xl p-4 shadow-md mb-6`}>
            <View style={tw`flex-row justify-between items-center mb-4`}>
                <Text style={tw`text-lg font-bold text-gray-800`}>⚡ Activity Minutes</Text>
                <Text style={tw`text-sm text-blue-600 font-medium`}>This Week</Text>
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
                    <Text style={tw`text-xs text-gray-500`}>Daily Avg</Text>
                    <Text style={tw`text-lg font-bold text-gray-800`}>71 min</Text>
                </View>
                <View style={tw`flex-1 items-center`}>
                    <Text style={tw`text-xs text-gray-500`}>Weekly Total</Text>
                    <Text style={tw`text-lg font-bold text-gray-800`}>495 min</Text>
                </View>
                <View style={tw`flex-1 items-center`}>
                    <Text style={tw`text-xs text-gray-500`}>Goal</Text>
                    <Text style={tw`text-lg font-bold text-gray-800`}>60 min/day</Text>
                </View>
            </View>
        </View>
    );
}