import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { AuthProvider, useAuth, UserProfile } from '@/contexts/AuthContext';
import '@/global.css';

export const unstable_settings = {
  anchor: '(tabs)',
};

const AUTH_ROUTES = new Set(['login', 'register']);

function dashboardForProfile(profile: UserProfile): string {
  if (profile.roles.includes('SYSTEM_ADMIN') || profile.roles.includes('HOSPITAL_ADMIN')) {
    return '/dashboard/administrator';
  }
  return '/dashboard/doctor';
}

function AuthGate({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const onAuthScreen = AUTH_ROUTES.has(segments[0] ?? '');
    if (!profile && !onAuthScreen) {
      router.replace('/login');
    } else if (profile && onAuthScreen) {
      router.replace(dashboardForProfile(profile) as never);
    }
  }, [profile, loading, segments, router]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }
  return <>{children}</>;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <GluestackUIProvider mode="dark">
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AuthProvider>
          <AuthGate>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="login" options={{ headerShown: false }} />
              <Stack.Screen name="register" options={{ headerShown: false }} />
              <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
            </Stack>
          </AuthGate>
        </AuthProvider>
        <StatusBar style="auto" />
      </ThemeProvider>
    </GluestackUIProvider>
  );
}
