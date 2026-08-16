import type { BottomTabBarProps } from 'expo-router/js-tabs';
import React, { useId } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { Txt } from '@/components/Txt';
import { Tap } from '@/components/ui';
import { LineIcon, type LineIconName } from '@/icons/line';
import { useT, type TranslationKey } from '@/i18n';
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
        {TABS.map((tab) => {
          const focused = tab.name === active;
          return (
            <Tap
              key={tab.name}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              aria-selected={focused}
              accessibilityLabel={t(tab.labelKey)}
              feedback="opacity"
              onPress={() => {
                if (!focused) navigation.navigate(tab.name);
              }}
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
                opacity: focused ? 1 : 0.62,
              }}
            >
              <LineIcon name={tab.icon} size={21} color="#FFFFFF" strokeWidth={focused ? 2 : 1.7} />
              <Txt size={9.5} weight={600} align="center" color="#FFFFFF">
                {t(tab.labelKey)}
              </Txt>
            </Tap>
          );
        })}
      </View>
    </View>
  );
}
