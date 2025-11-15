import React, { useRef, useState, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    Animated,
    Dimensions,
} from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import tw from 'twrnc';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// 🩺 Onboarding data with icons
const slides = [
    {
        id: '1',
        title: 'Welcome to MedAI 🩺',
        description:
            'Your personal health companion powered by artificial intelligence.',
        icon: 'heart-circle-outline',
        color: '#3B82F6',
    },
    {
        id: '2',
        title: 'AI Symptom Checker 🤖',
        description:
            'Describe how you feel, and our AI helps you understand possible causes instantly.',
        icon: 'chatbubble-ellipses-outline',
        color: '#10B981',
    },
    {
        id: '3',
        title: 'Track Your Health 📊',
        description:
            'Monitor your vitals, sleep, activity, and diet in one unified dashboard.',
        icon: 'stats-chart-outline',
        color: '#F59E0B',
    },
    {
        id: '4',
        title: 'Get Virtual Care 🧑‍⚕️',
        description:
            'Connect securely with licensed doctors and get personalized consultations.',
        icon: 'videocam-outline',
        color: '#EF4444',
    },
    {
        id: '5',
        title: 'Stay Informed 💡',
        description:
            'Receive trusted health insights and preventive care reminders daily.',
        icon: 'notifications-outline',
        color: '#8B5CF6',
    },
    {
        id: '6',
        title: 'Your Health, Simplified ❤️',
        description:
            'Ready to take control of your well-being? Let\'s begin your journey!',
        icon: 'rocket-outline',
        color: '#EC4899',
    },
];

export default function OnboardingScreen() {
    const { user } = useUser();
    const router = useRouter();
    const scrollX = useRef(new Animated.Value(0)).current;
    const flatListRef = useRef<FlatList>(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    const completeOnboarding = async () => {
        try {
            console.log('🎯 Starting onboarding completion...');
            console.log('  - User ID:', user?.id);
            console.log('  - Current onboarding status (before update):', user?.unsafeMetadata?.hasCompletedOnboarding);
            
            // Update unsafeMetadata to mark onboarding as completed
            await user?.update({
                unsafeMetadata: { hasCompletedOnboarding: true },
            });
            console.log('✅ Onboarding metadata updated successfully');
            
            // Reload user data to ensure metadata is synced
            await user?.reload();
            console.log('✅ User data reloaded');
            console.log('  - Updated onboarding status:', user?.unsafeMetadata?.hasCompletedOnboarding);
            
            // Navigate to home - the onboarding layout will also redirect if needed
            // This ensures immediate navigation after successful completion
            console.log('🔄 Navigating to home...');
            router.replace('/(home)');
        } catch (err) {
            console.error('❌ Error completing onboarding:', err);
        }
    };

    const handleNext = () => {
        if (currentIndex < slides.length - 1) {
            const nextIndex = currentIndex + 1;
            console.log(`🔄 Scrolling from index ${currentIndex} to ${nextIndex}`);
            // Scroll to the next slide using scrollToOffset (more reliable than scrollToIndex)
            if (flatListRef.current) {
                flatListRef.current.scrollToOffset({
                    offset: nextIndex * width,
                    animated: true,
                });
                // Also update index immediately for UI responsiveness
                // The scroll events will sync it properly
                setCurrentIndex(nextIndex);
            } else {
                console.warn('⚠️ FlatList ref is null');
            }
        } else {
            completeOnboarding();
        }
    };

    const renderItem = ({ item }: any) => (
        <View style={[tw`flex-1 items-center justify-center p-6`, { width }]}>
            <View style={[
                tw`w-40 h-40 mb-8 rounded-full items-center justify-center`,
                { backgroundColor: `${item.color}20` } // 20 = 12% opacity in hex
            ]}>
                <Ionicons
                    name={item.icon}
                    size={80}
                    color={item.color}
                />
            </View>
            <Text style={tw`text-2xl font-bold text-center mb-3 text-gray-800`}>
                {item.title}
            </Text>
            <Text style={tw`text-base text-gray-600 text-center px-4`}>
                {item.description}
            </Text>
        </View>
    );

    const updateIndex = (e: any) => {
        if (e && e.nativeEvent && e.nativeEvent.contentOffset) {
            const index = Math.round(e.nativeEvent.contentOffset.x / width);
            if (index >= 0 && index < slides.length) {
                setCurrentIndex(index);
            }
        }
    };

    // Handle viewable items change for more reliable index tracking
    const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
        if (viewableItems && viewableItems.length > 0 && viewableItems[0].index !== null) {
            const index = viewableItems[0].index;
            if (index >= 0 && index < slides.length) {
                setCurrentIndex(index);
            }
        }
    }, []);

    const viewabilityConfig = {
        itemVisiblePercentThreshold: 50,
    };

    const Dots = () => (
        <View style={tw`flex-row justify-center mt-4`}>
            {slides.map((_, i) => {
                const opacity = scrollX.interpolate({
                    inputRange: [(i - 1) * width, i * width, (i + 1) * width],
                    outputRange: [0.3, 1, 0.3],
                    extrapolate: 'clamp',
                });
                return (
                    <Animated.View
                        key={i}
                        style={[
                            tw`w-2.5 h-2.5 rounded-full mx-1`,
                            {
                                opacity,
                                backgroundColor: slides[i].color
                            },
                        ]}
                    />
                );
            })}
        </View>
    );

    return (
        <View style={tw`flex-1 bg-white`}>
            <Animated.FlatList
                data={slides}
                ref={flatListRef}
                renderItem={renderItem}
                horizontal
                showsHorizontalScrollIndicator={false}
                pagingEnabled
                bounces={false}
                keyExtractor={(item) => item.id}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                    { useNativeDriver: false }
                )}
                onMomentumScrollEnd={updateIndex}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
                scrollEventThrottle={16}
                getItemLayout={(data, index) => ({
                    length: width,
                    offset: width * index,
                    index,
                })}
            />

            <Dots />

            <View style={tw`p-6`}>
                <TouchableOpacity
                    onPress={handleNext}
                    style={[
                        tw`py-4 rounded-xl`,
                        { backgroundColor: slides[currentIndex].color }
                    ]}
                    activeOpacity={0.8}
                >
                    <Text style={tw`text-center text-white text-lg font-semibold`}>
                        {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}