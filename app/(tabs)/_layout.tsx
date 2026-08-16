import Tabs from 'expo-router/js-tabs';
import React from 'react';

import { ShopTabBar } from '@/components/brand/ShopTabBar';

/**
 * The six destinations the Vendly.lk design specifies.
 *
 * This replaces the previous four-tab shell (Today · Orders · Products ·
 * Insights) and its raised Add button — neither exists in the new design, which
 * puts New Order behind a Quick Action on Home instead.
 */
export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <ShopTabBar {...props} />}>
      <Tabs.Screen name="home" />
      <Tabs.Screen name="orders" />
      <Tabs.Screen name="inventory" />
      <Tabs.Screen name="couriers" />
      <Tabs.Screen name="customers" />
      <Tabs.Screen name="analytics" />
    </Tabs>
  );
}
