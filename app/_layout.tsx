import { useEffect } from 'react';
import { View } from 'react-native';
import { ErrorBoundaryProps, SplashScreen, Stack } from 'expo-router';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  useFonts,
} from '@expo-google-fonts/poppins';
import { QueryProvider } from '@/src/api/query';
import { OfflineBanner } from '@/src/components/OfflineBanner';
import { ErrorView } from '@/src/components/StatusViews';
import { colors } from '@/src/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({ Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold });
  // A font failure falls back to the system font rather than blocking the app.
  const ready = fontsLoaded || !!fontError;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  if (!ready) return null;

  return (
    <QueryProvider>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <AppStack />
        <OfflineBanner />
      </SafeAreaProvider>
    </QueryProvider>
  );
}

function AppStack() {
  const insets = useSafeAreaInsets();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        // Keep content clear of the notch / Dynamic Island in landscape.
        contentStyle: {
          backgroundColor: colors.background,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="movie/[id]" />
      <Stack.Screen name="trailer/[id]" options={{ presentation: 'fullScreenModal', animation: 'fade' }} />
      <Stack.Screen name="booking/[id]" />
      <Stack.Screen name="booking/seats" />
    </Stack>
  );
}

// Expo Router renders this (a plain function component) if any screen throws while rendering.
export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  if (__DEV__) console.error(error);
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ErrorView message="Something went wrong on this screen." onRetry={retry} />
    </View>
  );
}
