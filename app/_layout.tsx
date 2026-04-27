import { useColorScheme } from '@/hooks/use-color-scheme';
import { Stack } from 'expo-router';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider>
  );
}