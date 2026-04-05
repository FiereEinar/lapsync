import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { useAuthStore } from "../src/store/useAuthStore";
import { View, ActivityIndicator } from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import "../global.css";

export default function RootLayout() {
  const { isLoading, user, checkAuth } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      setTimeout(() => {
        router.replace('/(auth)/login');
      }, 0);
    } else if (user && inAuthGroup) {
      setTimeout(() => {
        if (user.role === 'admin') {
          router.replace('/(admin)/dashboard');
        } else {
          router.replace('/(client)/dashboard');
        }
      }, 0);
    }
  }, [user, isLoading, segments]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-zinc-950">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(admin)" options={{ headerShown: false }} />
        <Stack.Screen name="(client)" options={{ headerShown: false }} />
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack>
    </GestureHandlerRootView>
  );
}
