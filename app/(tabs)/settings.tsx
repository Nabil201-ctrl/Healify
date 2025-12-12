import React, { useState } from 'react';
import { View, Text, Switch, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import api from '../../api/api';
import tw from 'twrnc';

export default function SettingsScreen() {
  const { isDark, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [healthStatus, setHealthStatus] = useState<string>('');

  const pingBackend = async () => {
    try {
      const res = await api.get('/health');
      setHealthStatus(`OK: ${res.data?.timestamp ?? ''}`);
    } catch (e: any) {
      setHealthStatus(`Error: ${e?.message ?? 'unknown error'}`);
    }
  };

  return (
    <ScrollView style={tw`flex-1 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
      <View style={tw`p-4`}>
        <Text style={tw`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'} mb-6`}>Settings</Text>

        {/* Appearance Section */}
        <View style={tw`${isDark ? 'bg-gray-800' : 'bg-gray-50'} rounded-2xl p-4 mb-4`}>
          <Text style={tw`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'} mb-4`}>Appearance</Text>
          
          <View style={tw`flex-row items-center justify-between py-3`}>
            <View style={tw`flex-row items-center`}>
              <Text style={tw`text-2xl mr-3`}>{isDark ? '🌙' : '☀️'}</Text>
              <View>
                <Text style={tw`text-base font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>Dark Mode</Text>
                <Text style={tw`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {isDark ? 'Enabled' : 'Disabled'}
                </Text>
              </View>
            </View>
            <Switch 
              value={isDark} 
              onValueChange={toggleTheme}
              trackColor={{ false: '#d1d5db', true: '#10b981' }}
              thumbColor={isDark ? '#fff' : '#f3f4f6'}
            />
          </View>
        </View>

        {/* Notifications Section */}
        <View style={tw`${isDark ? 'bg-gray-800' : 'bg-gray-50'} rounded-2xl p-4 mb-4`}>
          <Text style={tw`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'} mb-4`}>Notifications</Text>
          
          <View style={tw`flex-row items-center justify-between py-3`}>
            <View style={tw`flex-row items-center`}>
              <Text style={tw`text-2xl mr-3`}>🔔</Text>
              <View>
                <Text style={tw`text-base font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>Enable Notifications</Text>
                <Text style={tw`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Get health reminders and updates
                </Text>
              </View>
            </View>
            <Switch 
              value={notifications} 
              onValueChange={setNotifications}
              trackColor={{ false: '#d1d5db', true: '#10b981' }}
              thumbColor={notifications ? '#fff' : '#f3f4f6'}
            />
          </View>
        </View>

        {/* Backend Health Check */}
        <View style={tw`${isDark ? 'bg-gray-800' : 'bg-gray-50'} rounded-2xl p-4 mb-4`}>
          <Text style={tw`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'} mb-4`}>System Status</Text>
          
          <TouchableOpacity 
            onPress={pingBackend} 
            style={tw`bg-green-600 py-3 rounded-xl items-center mb-3`}
          >
            <Text style={tw`text-white font-semibold text-base`}>🏥 Check Backend Health</Text>
          </TouchableOpacity>
          
          {healthStatus ? (
            <View style={tw`${healthStatus.startsWith('OK') 
              ? (isDark ? 'bg-green-900' : 'bg-green-50') 
              : (isDark ? 'bg-red-900' : 'bg-red-50')} p-3 rounded-xl`}>
              <Text style={tw`${healthStatus.startsWith('OK') 
                ? (isDark ? 'text-green-300' : 'text-green-800') 
                : (isDark ? 'text-red-300' : 'text-red-800')} font-medium`}>
                {healthStatus}
              </Text>
            </View>
          ) : null}
        </View>

        {/* About Section */}
        <View style={tw`${isDark ? 'bg-gray-800' : 'bg-gray-50'} rounded-2xl p-4 mb-4`}>
          <Text style={tw`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'} mb-4`}>About</Text>
          
          <View style={tw`py-2`}>
            <Text style={tw`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Version</Text>
            <Text style={tw`text-base font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>1.0.0</Text>
          </View>
          
          <View style={tw`py-2 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} mt-2`}>
            <Text style={tw`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>App</Text>
            <Text style={tw`text-base font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>Healify</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}