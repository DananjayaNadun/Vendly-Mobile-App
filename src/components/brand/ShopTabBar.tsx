import type { BottomTabBarProps } from 'expo-router/js-tabs';
import React, { useEffect, useId, useRef } from 'react';
import { Animated, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { Txt } from '@/components/Txt';
import { Tap } from '@/components/ui';
import { LineIcon, type LineIconName } from '@/icons/line';
import { useT, type TranslationKey } from '@/i18n';
import { useAnimatedNumber, useReduceMotion } from '@/theme/motion';
import { brand, brandRadius, brandSize } from '@/theme/brand';

/**
 * The six-destination tab bar.
 *
 * A gradient rather than a flat fill: sampling the exported PDF gives `#005299`
 * at the top of the bar and `#043865` at its foot.
 *
 * The active destination is carried by a pill that slides between the six
 * slots, not by the icon's brightness alone. Six labels in white-on-blue at
 * 9.5pt is a row of near-identical marks, and "which one am I on" was answered
 * by an opacity difference of 0.38 — legible if you compare two of them side by
 * side, and invisible at a glance. The pill also gives the movement between
 * destinations a direction, which is the thing a tab bar is for.
 *
 * Its position is a percentage of the row, so it is correct on the first frame:
 * nothing here waits on an `onLayout` to know where it belongs.
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

/** Inset of the sliding pill from the row it travels along. */
const PILL_INSET = 5;

export function ShopTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const id = `tabgrad-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const active = state.routes[state.index]?.name;

  const index = TABS.findIndex((tab) => tab.name === active);
  const slide = useAnimatedNumber(Math.max(index, 0));
  const count = TABS.length;

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

      {/* A single hairline of the hero's bright blue, so the bar reads as a
          surface the content scrolls under rather than a block beneath it. */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 1,
          backgroundColor: 'rgba(51,198,255,0.34)',
        }}
      />

      <View style={{ flexDirection: 'row', height: brandSize.tabBar }}>
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: PILL_INSET,
            left: 0,
            right: 0,
            bottom: PILL_INSET,
          }}
        >
          <Animated.View
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              width: `${100 / count}%`,
              left: slide.interpolate({
                inputRange: [0, count - 1],
                outputRange: ['0%', `${(100 * (count - 1)) / count}%`],
              }),
            }}
          >
            {/* The inset is on a child, not on this box. A margin here would
                push the last slot past the right edge of the bar — a 4px
                overflow that gives the whole document a horizontal scrollbar
                the moment Analytics is the active tab. */}
            <View
              style={{
                flex: 1,
                marginHorizontal: 4,
                borderRadius: brandRadius.card,
                backgroundColor: 'rgba(255,255,255,0.16)',
              }}
            />
          </Animated.View>
        </View>

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
        <Txt
          size={9.5}
          weight={focused ? 700 : 600}
          align="center"
          numberOfLines={1}
          color="#FFFFFF"
        >
          {t(tab.labelKey)}
        </Txt>
      </Animated.View>
    </Tap>
  );
}
