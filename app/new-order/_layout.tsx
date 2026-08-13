import { Stack } from 'expo-router';
import React from 'react';

import { OrderDraftProvider } from '@/state/OrderDraft';
import { useTheme } from '@/theme/ThemeContext';

export default function NewOrderLayout() {
  const { c } = useTheme();
  return (
    <OrderDraftProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: c.canvas },
          animation: 'slide_from_right',
        }}
      />
    </OrderDraftProvider>
  );
}
