import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const insets = useSafeAreaInsets(); // Mengambil ukuran area aman HP Anda

  return (
    <Tabs screenOptions={{ 
      tabBarActiveTintColor: '#007AFF',
      headerShown: false,
      tabBarStyle: { 
        paddingBottom: insets.bottom > 0 ? insets.bottom : 10, // Dorong ke atas
        height: 60 + (insets.bottom > 0 ? insets.bottom : 0),  // Sesuaikan tinggi
        backgroundColor: '#ffffff'
      }
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Kalender',
          tabBarIcon: ({ color }) => <Ionicons name="calendar" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="finished"
        options={{
          title: 'Selesai',
          tabBarIcon: ({ color }) => <Ionicons name="checkmark-done-circle" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}