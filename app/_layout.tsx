import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { I18nProvider } from '@/i18n';
import { brand } from '@/theme/brand';
import { fontAssets } from '@/theme/fonts';
import { ThemeProvider } from '@/theme/ThemeContext';

SplashScreen.preventAutoHideAsync().catch(() => {
  /* Already hidden — nothing to do. */
});

/**
 * Screens live in a plain stack. The app opens on `welcome`, which runs the
 * splash, onboarding and authentication flow before handing over to the tab
 * group. Headers are off everywhere because each screen draws its own.
 */
function RootStack() {
  return (
    <View style={{ flex: 1, backgroundColor: brand.canvas }}>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: brand.canvas },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" options={{ animation: 'fade' }} />
        <Stack.Screen name="welcome" options={{ animation: 'fade' }} />
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
        <Stack.Screen name="settings" />
        <Stack.Screen name="business-profile" />
      </Stack>
    </View>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts(fontAssets);

  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync().catch(() => {});
  }, [loaded, error]);

  // Holding the splash until the faces resolve avoids a flash of the system
  // font, which would reflow every screen — the design is tuned to these metrics.
  if (!loaded && !error) return null;

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <I18nProvider>
          <RootStack />
        </I18nProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
