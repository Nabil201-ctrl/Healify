import React from 'react';
import { View, Text, useWindowDimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import tw from 'twrnc';

interface HeartRateChartProps {
    isDark?: boolean;
}

export function HeartRateChart({ isDark = false }: HeartRateChartProps) {
    const { width } = useWindowDimensions();
    // Calculate chart width: screen width - (padding left/right 20px each + container padding 16px each + border)
    const chartWidth = width - 72;

    const heartRateData = {
        labels: ['6AM', '9AM', '12PM', '3PM', '6PM', '9PM'],
        datasets: [
            {
                data: [68, 72, 75, 78, 72, 68],
                color: (opacity = 1) => isDark 
                    ? `rgba(236, 72, 153, ${opacity})` 
                    : `rgba(236, 72, 153, ${opacity})`,
                strokeWidth: 2,
            },
        ],
    };

    const chartConfig = {
        backgroundColor: isDark ? '#1f2937' : '#ffffff',
        backgroundGradientFrom: isDark ? '#1f2937' : '#ffffff',
        backgroundGradientTo: isDark ? '#374151' : '#ffffff',
        decimalPlaces: 0,
        color: (opacity = 1) => isDark 
            ? `rgba(236, 72, 153, ${opacity})` 
            : `rgba(236, 72, 153, ${opacity})`,
        labelColor: (opacity = 1) => isDark 
            ? `rgba(209, 213, 219, ${opacity})` 
            : `rgba(107, 114, 128, ${opacity})`,
        style: {
            borderRadius: 16,
        },
        propsForDots: {
            r: '4',
            strokeWidth: '2',
            stroke: isDark ? '#ec4899' : '#ec4899',
        },
        propsForBackgroundLines: {
            stroke: isDark ? '#374151' : '#e5e7eb',
            strokeWidth: 1,
        },
    };

    return (
        <View style={tw`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-4 shadow-md mb-6 border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <View style={tw`flex-row justify-between items-center mb-4`}>
                <Text style={tw`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>❤️ Heart Rate</Text>
                <View style={tw`flex-row items-center`}>
                    <View style={tw`w-3 h-3 ${isDark ? 'bg-pink-400' : 'bg-pink-500'} rounded-full mr-2`} />
                    <Text style={tw`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Today</Text>
                </View>
            </View>
            
            <LineChart
                data={heartRateData}
                width={chartWidth}
                height={200}
                chartConfig={chartConfig}
                bezier
                style={tw`rounded-xl -ml-4`}
                withVerticalLines={false}
                withHorizontalLines={false}
                withInnerLines={false}
                withOuterLines={false}
            />
            
            <View style={tw`flex-row justify-between mt-4`}>
                <View style={tw`items-center`}>
                    <Text style={tw`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Min</Text>
                    <Text style={tw`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>68 bpm</Text>
                </View>
                <View style={tw`items-center`}>
                    <Text style={tw`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Avg</Text>
                    <Text style={tw`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>72 bpm</Text>
                </View>
                <View style={tw`items-center`}>
                    <Text style={tw`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Max</Text>
                    <Text style={tw`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>78 bpm</Text>
                </View>
                <View style={tw`items-center`}>
                    <Text style={tw`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Resting</Text>
                    <Text style={tw`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>65 bpm</Text>
                </View>
            </View>
        </View>
    );
}