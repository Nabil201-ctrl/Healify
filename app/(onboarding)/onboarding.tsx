import React, { useRef, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    Animated,
    Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingService } from '../../services/OnboardingService';
import tw from 'twrnc';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// Onboarding data remains the same
const slides = [
    {
        id: '1',
        title: 'Welcome to Healthify 🩺',
        description: 'Your personal health companion, simplified.',
        icon: 'heart-circle-outline',
        color: '#3B82F6',
    },
    {
        id: '2',
        title: 'Understand Your Health 🤖',
        description: 'Describe how you feel, and learn about what matters to your health.',
        icon: 'chatbubble-ellipses-outline',
        color: '#10B981',
    },
    {
        id: '3',
        title: 'Track Your Vitals 📊',
        description: 'Monitor your vitals, sleep, and activity in one unified dashboard.',
        icon: 'stats-chart-outline',
        color: '#F59E0B',
    },
    {
        id: '4',
        title: 'Get Health Insights 💡',
        description: 'Receive trusted health information and preventive care reminders.',
        icon: 'notifications-outline',
        color: '#8B5CF6',
    },
    {
        id: '5',
        title: 'Ready to Begin? ❤️',
        description: 'We\'ll ask for notification permissions so you never miss important health alerts!',
        icon: 'rocket-outline',
        color: '#EC4899',
    },
];

export default function OnboardingScreen() {
    const router = useRouter();
    const scrollX = useRef(new Animated.Value(0)).current;
    const flatListRef = useRef<FlatList>(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleProceed = async () => {
        try {
            // Request notification permissions
            const { registerForPushNotificationsAsync, getNotificationPermissionStatus } = await import('../../services/NotificationService');

            const currentStatus = await getNotificationPermissionStatus();

            if (currentStatus === 'undetermined') {
                // Request permission
                const token = await registerForPushNotificationsAsync();

                if (token) {
                    console.log('[Onboarding] Notification permission granted, token:', token);
                } else {
                    console.log('[Onboarding] Notification permission denied or unavailable');
                }
            } else if (currentStatus === 'granted') {
                console.log('[Onboarding] Notification permission already granted');
            } else {
                console.log('[Onboarding] Notification permission previously denied');
            }
        } catch (error) {
            console.error('[Onboarding] Error requesting notification permissions:', error);
            // Continue anyway - notifications are not critical for onboarding
        }

        // Mark onboarding as completed so the user doesn't see it again.
        await OnboardingService.setOnboardingCompleted();
        // Navigate to the authentication flow. The root layout will handle it from there.
        router.replace('/(auth)/sign-in');
    };

    const handleNextSlide = () => {
        if (currentIndex < slides.length - 1) {
            const nextIndex = currentIndex + 1;
            flatListRef.current?.scrollToOffset({
                offset: nextIndex * width,
                animated: true,
            });
            setCurrentIndex(nextIndex);
        } else {
            handleProceed();
        }
    };

    const renderItem = ({ item }: { item: typeof slides[0] }) => (
        <View style={[tw`flex-1 items-center justify-center p-6`, { width }]}>
            <View style={[tw`w-40 h-40 mb-8 rounded-full items-center justify-center`, { backgroundColor: `${item.color}20` }]}>
                <Ionicons name={item.icon as any} size={80} color={item.color} />
            </View>
            <Text style={tw`text-2xl font-bold text-center mb-3 text-gray-800`}>{item.title}</Text>
            <Text style={tw`text-base text-gray-600 text-center px-4 leading-6`}>{item.description}</Text>
        </View>
    );

    const updateCurrentIndex = (e: any) => {
        const contentOffsetX = e.nativeEvent.contentOffset.x;
        const index = Math.round(contentOffsetX / width);
        setCurrentIndex(index);
    };

    const Dots = () => (
        <View style={tw`flex-row justify-center mt-4`}>
            {slides.map((_, i) => (
                <View
                    key={i}
                    style={[
                        tw`w-2.5 h-2.5 rounded-full mx-1`,
                        {
                            backgroundColor: slides[i].color,
                            opacity: i === currentIndex ? 1 : 0.3
                        },
                    ]}
                />
            ))}
        </View>
    );

    return (
        <View style={tw`flex-1 bg-white`}>
            <View style={tw`flex-row justify-end pt-12 px-6`}>
                <TouchableOpacity onPress={handleProceed} style={tw`px-4 py-2 border border-gray-300 rounded-lg`}>
                    <Text style={tw`text-gray-600 font-medium`}>Skip</Text>
                </TouchableOpacity>
            </View>

            <Animated.FlatList
                data={slides}
                ref={flatListRef}
                renderItem={renderItem}
                horizontal
                showsHorizontalScrollIndicator={false}
                pagingEnabled
                bounces={false}
                keyExtractor={(item) => item.id}
                onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
                onMomentumScrollEnd={updateCurrentIndex}
                scrollEventThrottle={16}
                style={tw`flex-1`}
            />

            <Dots />

            <View style={tw`p-6 pt-4`}>
                <TouchableOpacity
                    onPress={handleNextSlide}
                    style={[tw`py-4 rounded-xl flex-row items-center justify-center`, { backgroundColor: slides[currentIndex].color }]}
                    activeOpacity={0.8}
                >
                    <Text style={tw`text-white text-lg font-semibold`}>
                        {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
