// components/HeartRateChart.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import tw from 'twrnc';

export function HeartRateChart() {
    const screenWidth = Dimensions.get('window').width - 40;

    const heartRateData = {
        labels: ['6AM', '9AM', '12PM', '3PM', '6PM', '9PM'],
        datasets: [
            {
                data: [68, 72, 75, 78, 72, 68],
                color: (opacity = 1) => `rgba(236, 72, 153, ${opacity})`,
                strokeWidth: 2,
            },
        ],
    };

    const chartConfig = {
        backgroundColor: '#ffffff',
        backgroundGradientFrom: '#ffffff',
        backgroundGradientTo: '#ffffff',
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(236, 72, 153, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
        style: {
            borderRadius: 16,
        },
        propsForDots: {
            r: '4',
            strokeWidth: '2',
            stroke: '#ec4899',
        },
    };

    return (
        <View style={tw`bg-white rounded-2xl p-4 shadow-md mb-6`}>
            <View style={tw`flex-row justify-between items-center mb-4`}>
                <Text style={tw`text-lg font-bold text-gray-800`}>❤️ Heart Rate</Text>
                <View style={tw`flex-row items-center`}>
                    <View style={tw`w-3 h-3 bg-pink-500 rounded-full mr-2`} />
                    <Text style={tw`text-sm text-gray-600`}>Today</Text>
                </View>
            </View>
            
            <LineChart
                data={heartRateData}
                width={screenWidth}
                height={220}
                chartConfig={chartConfig}
                bezier
                style={tw`rounded-xl`}
                withVerticalLines={false}
                withHorizontalLines={false}
                withInnerLines={false}
                withOuterLines={false}
            />
            
            <View style={tw`flex-row justify-between mt-4`}>
                <View style={tw`items-center`}>
                    <Text style={tw`text-xs text-gray-500`}>Min</Text>
                    <Text style={tw`text-lg font-bold text-gray-800`}>68 bpm</Text>
                </View>
                <View style={tw`items-center`}>
                    <Text style={tw`text-xs text-gray-500`}>Avg</Text>
                    <Text style={tw`text-lg font-bold text-gray-800`}>72 bpm</Text>
                </View>
                <View style={tw`items-center`}>
                    <Text style={tw`text-xs text-gray-500`}>Max</Text>
                    <Text style={tw`text-lg font-bold text-gray-800`}>78 bpm</Text>
                </View>
                <View style={tw`items-center`}>
                    <Text style={tw`text-xs text-gray-500`}>Resting</Text>
                    <Text style={tw`text-lg font-bold text-gray-800`}>65 bpm</Text>
                </View>
            </View>
        </View>
    );
}