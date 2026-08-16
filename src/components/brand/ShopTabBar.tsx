import type { BottomTabBarProps } from 'expo-router/js-tabs';
import React, { useEffect, useId, useRef } from 'react';
import { Animated, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { Txt } from '@/components/Txt';
import { Tap } from '@/components/ui';
import { LineIcon, type LineIconName } from '@/icons/line';
import { useT, type TranslationKey } from '@/i18n';
import { useReduceMotion } from '@/theme/motion';
import { brand, brandSize } from '@/theme/brand';

/**
 * The six-destination tab bar.
 *
 * A gradient rather than a flat fill: sampling the exported PDF gives `#005299`
 * at the top of the bar and `#043865` at its foot. Icons are the stroke set,
 * not the emoji the HTML prototype falls back to.
 *
 * The inactive state is carried by opacity, as the design does — but never
 * below 0.62, so the labels stay legible against the blue.
 */

type Tab = { name: string; icon: LineIconName; labelKey: TranslationKey };

const TABS: Tab[] = [
  { name: 'home', icon: 'home', labelKey: 'tab.home' },
  { name: 'orders', icon: 'orders', labelKey: 'tab.orders' },
  { name: 'inventory', icon: 'box', labelKey: 'tab.inventory' },
  { name: 'couriers', icon: 'truck', labelKey: 'tab.couriers' },
  { name: 'customers', icon: 'users', labelKey: 'tab.customers' },
  { name: 'analytics', icon: 'chart', labelKey: 'tab.analytics' },
];

export function ShopTabBar({ state, navigation }: BottomTabBarProps) {
  const t = useT();
  const insets = useSafeAreaInsets();
  const id = `tabgrad-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const active = state.routes[state.index]?.name;

  return (
    <View style={{ height: brandSize.tabBar + insets.bottom }}>
      <Svg width="100%" height="100%" style={{ position: 'absolute' }}>
        <Defs>
          <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={brand.tabTop} />
            <Stop offset="1" stopColor={brand.tabBottom} />
          </LinearGradient>
        </Defs>
        <Rect x={0} y={0} width="100%" height="100%" fill={`url(#${id})`} />
      </Svg>

      <View style={{ flexDirection: 'row', height: brandSize.tabBar }}>
        {TABS.map((tab) => (
          <TabItem
            key={tab.name}
            tab={tab}
            focused={tab.name === active}
            onPress={() => {
              if (tab.name !== active) navigation.navigate(tab.name);
            }}
          />
        ))}
      </View>
    </View>
  );
}

/**
 * One destination.
 *
 * The focused state lifts and brightens rather than switching instantly: the
 * bar is the only persistent chrome in the app, and an instant swap gives no
 * sense of having moved between places. Opacity never drops below 0.62 so the
 * unfocused labels stay legible on the blue.
 */
function TabItem({
  tab,
  focused,
  onPress,
}: {
  tab: Tab;
  focused: boolean;
  onPress: () => void;
}) {
  const t = useT();
  const progress = useRef(new Animated.Value(focused ? 1 : 0)).current;
  const reduced = useReduceMotion();

  useEffect(() => {
    if (reduced) {
      progress.setValue(focused ? 1 : 0);
      return;
    }
    const animation = Animated.spring(progress, {
      toValue: focused ? 1 : 0,
      tension: 240,
      friction: 20,
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [focused, progress, reduced]);

  return (
    <Tap
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      aria-selected={focused}
      accessibilityLabel={t(tab.labelKey)}
      feedback="opacity"
      onPress={onPress}
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4 }}
    >
      <Animated.View
        style={{
          opacity: progress.interpolate({ inputRange: [0, 1], outputRange: [0.62, 1] }),
          transform: [
            { scale: progress.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] }) },
            { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [0, -1] }) },
          ],
        }}
      >
        <LineIcon name={tab.icon} size={21} color="#FFFFFF" strokeWidth={focused ? 2 : 1.7} />
      </Animated.View>
      <Animated.View
        style={{ opacity: progress.interpolate({ inputRange: [0, 1], outputRange: [0.62, 1] }) }}
      >
        <Txt size={9.5} weight={600} align="center" color="#FFFFFF">
          {t(tab.labelKey)}
        </Txt>
      </Animated.View>
    </Tap>
  );
}
