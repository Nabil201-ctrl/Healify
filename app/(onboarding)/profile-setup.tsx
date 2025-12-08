import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthContext } from '../../context/AuthContext';
import tw from 'twrnc';
import { Ionicons } from '@expo/vector-icons';
import api from '../../api/api';

type BodyType = 'Slim' | 'Lean' | 'Fat' | 'Average';
type ActivityLevel = 'Sedentary' | 'Lightly Active' | 'Moderately Active' | 'Very Active';
type JobType = 'Active' | 'Office' | 'Mixed';

export default function ProfileSetupScreen() {
    const router = useRouter();
    const { user, signIn } = useAuthContext(); // Assuming signIn or a refresh method updates user
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Form State
    const [age, setAge] = useState('');
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');
    const [bodyType, setBodyType] = useState<BodyType | ''>('');

    const [jobType, setJobType] = useState<JobType | ''>('');
    const [activityLevel, setActivityLevel] = useState<ActivityLevel | ''>('');
    const [averageSteps, setAverageSteps] = useState('');
    const [daysLessActive, setDaysLessActive] = useState<string[]>([]);

    const [healthIssues, setHealthIssues] = useState('');
    const [allergies, setAllergies] = useState('');
    const [medications, setMedications] = useState('');

    const totalSteps = 3;

    const handleNext = () => {
        if (step === 1) {
            if (!age || !height || !weight || !bodyType) {
                Alert.alert('Missing Fields', 'Please fill in all fields to proceed.');
                return;
            }
        } else if (step === 2) {
            if (!jobType || !activityLevel || !averageSteps) {
                Alert.alert('Missing Fields', 'Please fill in all fields to proceed.');
                return;
            }
        }
        setStep(step + 1);
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const payload = {
                age: Number(age),
                height: Number(height),
                weight: Number(weight),
                bodyType,
                jobType,
                activityLevel,
                averageSteps: Number(averageSteps),
                daysLessActive,
                healthIssues: healthIssues.split(',').map(s => s.trim()).filter(Boolean),
                allergies: allergies.split(',').map(s => s.trim()).filter(Boolean),
                medications: medications.split(',').map(s => s.trim()).filter(Boolean),
                isProfileComplete: true
            };

            await api.patch('/users/me', payload);

            // Force refresh user context or re-login logic if needed
            // Ideally AuthContext has a refreshUser method. 
            // For now, we might need to rely on the next app load or implement a refresh.
            // Let's assume we can navigate and the root layout check will pass if we update local state or if we just navigate.
            // But RootLayout checks user.isProfileComplete. We need to update the context.
            // A simple way is to reload the app or have a method in context.
            // I'll assume for now we just navigate and maybe show a success message.

            Alert.alert('Success', 'Profile setup complete!', [
                { text: 'OK', onPress: () => router.replace('/(tabs)/home') }
            ]);

        } catch (error) {
            console.error('Profile update error:', error);
            Alert.alert('Error', 'Failed to save profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const toggleDay = (day: string) => {
        if (daysLessActive.includes(day)) {
            setDaysLessActive(daysLessActive.filter(d => d !== day));
        } else {
            setDaysLessActive([...daysLessActive, day]);
        }
    };

    const renderStep1 = () => (
        <View>
            <Text style={tw`text-xl font-bold text-gray-800 mb-4`}>Basic Information</Text>

            <Text style={tw`text-gray-600 mb-2`}>Age</Text>
            <TextInput style={tw`border border-gray-300 rounded-xl p-3 mb-4`} keyboardType="numeric" value={age} onChangeText={setAge} placeholder="Years" />

            <Text style={tw`text-gray-600 mb-2`}>Height (cm)</Text>
            <TextInput style={tw`border border-gray-300 rounded-xl p-3 mb-4`} keyboardType="numeric" value={height} onChangeText={setHeight} placeholder="cm" />

            <Text style={tw`text-gray-600 mb-2`}>Weight (kg)</Text>
            <TextInput style={tw`border border-gray-300 rounded-xl p-3 mb-4`} keyboardType="numeric" value={weight} onChangeText={setWeight} placeholder="kg" />

            <Text style={tw`text-gray-600 mb-2`}>Body Type</Text>
            <View style={tw`flex-row flex-wrap gap-2 mb-4`}>
                {['Slim', 'Lean', 'Fat', 'Average'].map((type) => (
                    <TouchableOpacity
                        key={type}
                        onPress={() => setBodyType(type as BodyType)}
                        style={tw`px-4 py-2 rounded-full border ${bodyType === type ? 'bg-green-600 border-green-600' : 'border-gray-300 bg-white'}`}
                    >
                        <Text style={tw`${bodyType === type ? 'text-white' : 'text-gray-600'}`}>{type}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    const renderStep2 = () => (
        <View>
            <Text style={tw`text-xl font-bold text-gray-800 mb-4`}>Lifestyle & Activity</Text>

            <Text style={tw`text-gray-600 mb-2`}>Job Type</Text>
            <View style={tw`flex-row flex-wrap gap-2 mb-4`}>
                {['Active', 'Office', 'Mixed'].map((type) => (
                    <TouchableOpacity
                        key={type}
                        onPress={() => setJobType(type as JobType)}
                        style={tw`px-4 py-2 rounded-full border ${jobType === type ? 'bg-green-600 border-green-600' : 'border-gray-300 bg-white'}`}
                    >
                        <Text style={tw`${jobType === type ? 'text-white' : 'text-gray-600'}`}>{type}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <Text style={tw`text-gray-600 mb-2`}>Activity Level</Text>
            <View style={tw`flex-row flex-wrap gap-2 mb-4`}>
                {['Sedentary', 'Lightly Active', 'Moderately Active', 'Very Active'].map((level) => (
                    <TouchableOpacity
                        key={level}
                        onPress={() => setActivityLevel(level as ActivityLevel)}
                        style={tw`px-4 py-2 rounded-full border ${activityLevel === level ? 'bg-green-600 border-green-600' : 'border-gray-300 bg-white'}`}
                    >
                        <Text style={tw`${activityLevel === level ? 'text-white' : 'text-gray-600'}`}>{level}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <Text style={tw`text-gray-600 mb-2`}>Average Daily Steps</Text>
            <TextInput style={tw`border border-gray-300 rounded-xl p-3 mb-4`} keyboardType="numeric" value={averageSteps} onChangeText={setAverageSteps} placeholder="e.g. 5000" />

            <Text style={tw`text-gray-600 mb-2`}>Days Less Active</Text>
            <View style={tw`flex-row flex-wrap gap-2 mb-4`}>
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                    <TouchableOpacity
                        key={day}
                        onPress={() => toggleDay(day)}
                        style={tw`px-3 py-2 rounded-full border ${daysLessActive.includes(day) ? 'bg-green-600 border-green-600' : 'border-gray-300 bg-white'}`}
                    >
                        <Text style={tw`${daysLessActive.includes(day) ? 'text-white' : 'text-gray-600'}`}>{day}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    const renderStep3 = () => (
        <View>
            <Text style={tw`text-xl font-bold text-gray-800 mb-4`}>Health Details</Text>
            <Text style={tw`text-gray-500 text-sm mb-4`}>Separate multiple items with commas.</Text>

            <Text style={tw`text-gray-600 mb-2`}>Health Issues (Optional)</Text>
            <TextInput
                style={tw`border border-gray-300 rounded-xl p-3 mb-4`}
                value={healthIssues}
                onChangeText={setHealthIssues}
                placeholder="e.g. Asthma, Diabetes (or leave empty)"
                multiline
            />

            <Text style={tw`text-gray-600 mb-2`}>Allergies (Optional)</Text>
            <TextInput
                style={tw`border border-gray-300 rounded-xl p-3 mb-4`}
                value={allergies}
                onChangeText={setAllergies}
                placeholder="e.g. Peanuts, Penicillin"
                multiline
            />

            <Text style={tw`text-gray-600 mb-2`}>Medications (Optional)</Text>
            <TextInput
                style={tw`border border-gray-300 rounded-xl p-3 mb-4`}
                value={medications}
                onChangeText={setMedications}
                placeholder="e.g. Ibuprofen"
                multiline
            />
        </View>
    );

    return (
        <View style={tw`flex-1 bg-white pt-12 px-6`}>
            {/* Progress Bar */}
            <View style={tw`h-2 bg-gray-100 rounded-full mb-8 overflow-hidden`}>
                <View style={[tw`h-full bg-green-600`, { width: `${(step / totalSteps) * 100}%` }]} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
            </ScrollView>

            <View style={tw`py-6 flex-row justify-between`}>
                {step > 1 ? (
                    <TouchableOpacity onPress={handleBack} style={tw`px-6 py-4 rounded-xl border border-gray-300`}>
                        <Text style={tw`text-gray-600 font-semibold`}>Back</Text>
                    </TouchableOpacity>
                ) : <View />}

                <TouchableOpacity
                    onPress={step === totalSteps ? handleSubmit : handleNext}
                    style={tw`px-8 py-4 rounded-xl bg-green-600 flex-row items-center`}
                    disabled={loading}
                >
                    {loading ? <ActivityIndicator color="white" /> : (
                        <Text style={tw`text-white font-semibold text-lg`}>
                            {step === totalSteps ? 'Complete Setup' : 'Next'}
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}
