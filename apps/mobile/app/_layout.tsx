import { Stack } from 'expo-router';
import { AuthProvider } from '../src/context/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)/login" options={{ presentation: 'modal' }} />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="course/[id]" options={{ headerShown: true, title: 'Course' }} />
      </Stack>
    </AuthProvider>
  );
}
