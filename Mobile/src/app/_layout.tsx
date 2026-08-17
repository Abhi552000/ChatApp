import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { ActivityIndicator, useColorScheme, View } from 'react-native';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { SocketProvider } from '../context/SocketContext';
import React, { useEffect } from 'react';

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { authUser, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === 'login' || segments[0] === 'signup' || segments[0] === 'verify-otp';

    if (!authUser) {
      // Redirect to login if not authenticated
      if (!inAuthGroup) {
        router.replace('/login');
      }
    } else if (!authUser.user.isVerified) {
      // Redirect to OTP if not verified
      if (segments[0] !== 'verify-otp') {
        router.replace('/verify-otp');
      }
    } else {
      // Redirect to chat main page if authenticated and verified
      if (inAuthGroup) {
        router.replace('/');
      }
    }
  }, [authUser, loading, segments]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#090D16' }}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" options={{ animation: 'fade' }} />
      <Stack.Screen name="signup" options={{ animation: 'fade' }} />
      <Stack.Screen name="verify-otp" options={{ animation: 'fade' }} />
      <Stack.Screen name="index" options={{ title: 'Chats' }} />
      <Stack.Screen name="chat/[id]" options={{ presentation: 'card' }} />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  // Hide native splash screen once layout starts mounting
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <AuthProvider>
      <SocketProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <RootLayoutNav />
        </ThemeProvider>
      </SocketProvider>
    </AuthProvider>
  );
}

