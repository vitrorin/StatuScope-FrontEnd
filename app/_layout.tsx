import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';
import { AppColors } from '@/constants/theme';

import { useColorScheme } from '@/hooks/use-color-scheme';

import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { AuthProvider, useAuth, UserProfile } from '@/contexts/AuthContext';
import { I18nProvider } from '@/i18n';
import { AppQueryProvider } from '@/lib/queryClient';
import '@/global.css';

export const unstable_settings = {
  anchor: '(tabs)',
};

const AUTH_ROUTES = new Set(['login', 'register']);

function dashboardForProfile(profile: UserProfile): string {
  if (profile.roles.includes('SYSTEM_ADMIN')) {
    return '/system/dashboard';
  }
  if (profile.roles.includes('HOSPITAL_ADMIN')) {
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
      <View className="flex-1 items-center justify-center" testID="app-auth-loading">
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
        <I18nProvider>
          <AppQueryProvider>
            <AuthProvider>
              <AuthGate>
                <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: AppColors.surface.page } }}>
                  <Stack.Screen name="(tabs)" />
                  <Stack.Screen name="login" />
                  <Stack.Screen name="register" />
                  <Stack.Screen name="modal" options={{ headerShown: true, presentation: 'modal', title: 'Modal' }} />
                </Stack>
              </AuthGate>
            </AuthProvider>
          </AppQueryProvider>
        </I18nProvider>
        <StatusBar style="auto" />
      </ThemeProvider>
    </GluestackUIProvider>
  );
}
