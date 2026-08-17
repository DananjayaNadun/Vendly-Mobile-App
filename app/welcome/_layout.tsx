import { Stack } from 'expo-router';
import React from 'react';

import { brand } from '@/theme/brand';

/**
 * Onboarding and authentication, from the Vendly.lk design handoff.
 *
 * These screens are additive: the app still starts at `(tabs)`, so nothing that
 * already worked has changed route. To gate the app behind this flow, point the
 * root stack's first screen at `welcome` in `app/_layout.tsx`.
 *
 * Headers are off because these screens draw their own: the gradient hero on
 * splash and onboarding, and `ShopNav` on everything after them.
 */
export default function WelcomeLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: brand.canvas },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" options={{ animation: 'fade' }} />
      <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
    </Stack>
  );
}
