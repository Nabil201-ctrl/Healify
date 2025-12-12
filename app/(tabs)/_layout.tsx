import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

export default function TabsLayout() {
  const { isDark } = useTheme();

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: true,
        headerStyle: {
          backgroundColor: isDark ? '#1f2937' : '#ffffff',
        },
        headerTitleStyle: {
          color: isDark ? '#ffffff' : '#111827',
        },
        headerShadowVisible: !isDark,
        tabBarStyle: {
          backgroundColor: isDark ? '#1f2937' : '#ffffff',
          borderTopColor: isDark ? '#374151' : '#e5e7eb',
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: isDark ? '#10b981' : '#16a34a',
        tabBarInactiveTintColor: isDark ? '#6b7280' : '#9ca3af',
        tabBarIcon: ({ color, size }) => {
          const iconMap: Record<string, any> = {
            home: 'home',
            chat: 'chatbubbles',
            settings: 'settings',
          };
          const name = iconMap[route.name] ?? 'ellipse';
          return <Ionicons name={name} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="home" options={{ title: 'Home' }} />
      <Tabs.Screen name="chat" options={{ title: 'Chat' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
    </Tabs>
  );
}