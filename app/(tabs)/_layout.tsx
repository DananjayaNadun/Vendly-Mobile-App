import { router } from 'expo-router';
import Tabs from 'expo-router/js-tabs';
import React from 'react';

import { TabBar } from '@/components/TabBar';
import { TabChromeProvider, useTabChrome } from '@/state/TabChrome';

/**
 * Four destinations plus the raised Add button.
 *
 * Analytics was promoted out of the old More drawer and is now `insights`;
 * everything else that drawer held is account-level and lives at `/account`,
 * reached from the shop avatar on Today.
 */
export default function TabsLayout() {
  return (
    <TabChromeProvider>
      <TabsWithChrome />
    </TabChromeProvider>
  );
}

function TabsWithChrome() {
  // Bulk selection on Orders hides the bar so the mode owns the whole screen.
  const { tabBarHidden } = useTabChrome();

  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) =>
        tabBarHidden ? null : (
          // Long-pressing Add opens the intent sheet. See app/add.tsx.
          <TabBar {...props} onAddLongPress={() => router.push('/add')} />
        )
      }
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="orders" />
      <Tabs.Screen name="products" />
      <Tabs.Screen name="insights" />
    </Tabs>
  );
}
