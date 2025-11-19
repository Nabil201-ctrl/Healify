import React from 'react';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import tw from 'twrnc';

interface HealthMetricCardProps {
    title: string;
    value: string | number;
    unit: string;
    icon: string;
    gradientColors: string[];
    trend?: 'up' | 'down' | 'stable';
    trendValue?: string;
}

export const HealthMetricCard: React.FC<HealthMetricCardProps> = ({
    title,
    value,
    unit,
    icon,
    gradientColors,
    trend,
    trendValue,
}) => {
    const getTrendColor = () => {
        if (trend === 'up') return 'text-green-600';
        if (trend === 'down') return 'text-red-600';
        return 'text-gray-600';
    };

    const getTrendIcon = () => {
        if (trend === 'up') return '↑';
        if (trend === 'down') return '↓';
        return '→';
    };

    return (
        <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={tw`w-[48%] p-4 rounded-2xl mb-4 shadow-lg`}
        >
            <View style={tw`flex-row justify-between items-start mb-2`}>
                <Text style={tw`text-sm text-white font-medium opacity-90`}>{title}</Text>
                <Text style={tw`text-xl`}>{icon}</Text>
            </View>
            <Text style={tw`text-3xl font-bold text-white mb-1`}>{value}</Text>
            <View style={tw`flex-row justify-between items-center`}>
                <Text style={tw`text-xs text-white opacity-80`}>{unit}</Text>
                {trend && trendValue && (
                    <View style={tw`flex-row items-center bg-white bg-opacity-20 px-2 py-1 rounded-full`}>
                        <Text style={tw`text-xs text-white font-semibold`}>
                            {getTrendIcon()} {trendValue}
                        </Text>
                    </View>
                )}
            </View>
        </LinearGradient>
    );
};