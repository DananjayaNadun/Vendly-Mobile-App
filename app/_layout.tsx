import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { I18nProvider } from '@/i18n';
import { fontAssets } from '@/theme/fonts';
import { ThemeProvider, useTheme } from '@/theme/ThemeContext';

SplashScreen.preventAutoHideAsync().catch(() => {
  /* Already hidden — nothing to do. */
});

/**
 * Screens live in a plain stack: the tab group is the root entry, and every
 * detail screen pushes over it. Headers are off everywhere because the design
 * draws its own 56px app bar on each screen.
 */
function RootStack() {
  const { c, scheme } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: c.canvas }}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: c.canvas },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="new-order" options={{ animation: 'slide_from_bottom' }} />
        {/* The intent sheet renders its own scrim, so the route is transparent. */}
        <Stack.Screen
          name="add"
          options={{ presentation: 'transparentModal', animation: 'none' }}
        />
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
