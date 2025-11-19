// components/SleepChart.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { StackedBarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import tw from 'twrnc';

export default function SleepChart() {
    const screenWidth = Dimensions.get('window').width - 40;

    const sleepData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        data: [
            [6, 1.5, 0.5], // Deep, Light, REM
            [5.5, 2, 0.5],
            [7, 1, 0.5],
            [6.5, 1.5, 0.5],
            [5, 2.5, 0.5],
            [8, 1, 1],
            [7.5, 1, 0.5],
        ],
        barColors: ['#4f46e5', '#8b5cf6', '#c084fc'],
    };

    const chartConfig = {
        backgroundColor: '#ffffff',
        backgroundGradientFrom: '#ffffff',
        backgroundGradientTo: '#ffffff',
        decimalPlaces: 1,
        color: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
        style: {
            borderRadius: 16,
        },
    };

    return (
        <View style={tw`bg-white rounded-2xl p-4 shadow-md mb-6`}>
            <View style={tw`flex-row justify-between items-center mb-4`}>
                <Text style={tw`text-lg font-bold text-gray-800`}>😴 Sleep Quality</Text>
                <Text style={tw`text-sm text-purple-600 font-medium`}>Last 7 Days</Text>
            </View>
            
            <StackedBarChart
                data={sleepData}
                width={screenWidth}
                height={220}
                chartConfig={chartConfig}
                style={tw`rounded-xl`}
                hideLegend={false}
            />
            
            <View style={tw`flex-row justify-between mt-4`}>
                <View style={tw`flex-row items-center`}>
                    <View style={tw`w-3 h-3 bg-indigo-600 rounded mr-2`} />
                    <Text style={tw`text-xs text-gray-600`}>Deep</Text>
                </View>
                <View style={tw`flex-row items-center`}>
                    <View style={tw`w-3 h-3 bg-purple-500 rounded mr-2`} />
                    <Text style={tw`text-xs text-gray-600`}>Light</Text>
                </View>
                <View style={tw`flex-row items-center`}>
                    <View style={tw`w-3 h-3 bg-purple-300 rounded mr-2`} />
                    <Text style={tw`text-xs text-gray-600`}>REM</Text>
                </View>
            </View>
            
            <View style={tw`flex-row justify-between mt-4`}>
                <View style={tw`flex-1 items-center`}>
                    <Text style={tw`text-xs text-gray-500`}>Last Night</Text>
                    <Text style={tw`text-lg font-bold text-gray-800`}>7h 30m</Text>
                </View>
                <View style={tw`flex-1 items-center`}>
                    <Text style={tw`text-xs text-gray-500`}>Quality</Text>
                    <Text style={tw`text-lg font-bold text-green-600`}>85%</Text>
                </View>
                <View style={tw`flex-1 items-center`}>
                    <Text style={tw`text-xs text-gray-500`}>Bedtime</Text>
                    <Text style={tw`text-lg font-bold text-gray-800`}>10:45 PM</Text>
                </View>
            </View>
        </View>
    );
}