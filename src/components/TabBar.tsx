import { router } from 'expo-router';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import React from 'react';
import { Animated, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, type IconName } from '@/icons';
import { useT, type TranslationKey } from '@/i18n';
import { usePressAnim } from '@/theme/motion';
import { elevation, radius, size, space } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeContext';
import { Tap } from './ui';
import { Txt } from './Txt';

/**
 * The tab bar.
 *
 * **Insights replaces More.** The old fifth destination was a drawer of nine
 * unrelated screens with Analytics — something a seller wants weekly — buried
 * inside it. Analytics is now a destination in its own right, and the settings
 * that made up the rest of the drawer moved behind the shop avatar on Today,
 * which is where account-level things belong.
 *
 * Tapping Add still goes straight into the order builder: that is the single
 * most common thing a seller does, and putting a menu in front of it would cost
 * a tap every time. Long-press still opens the intent sheet, and the other
 * intents are now also reachable from the screens that own them — "add stock"
 * from Products, "add customer" from Customers.
 */

type Tab = { name: string; icon: IconName; labelKey: TranslationKey };

const TABS: Tab[] = [
  { name: 'index', icon: 'home', labelKey: 'nav.today' },
  { name: 'orders', icon: 'list', labelKey: 'nav.orders' },
  { name: 'products', icon: 'box', labelKey: 'nav.products' },
  { name: 'insights', icon: 'chart', labelKey: 'nav.insights' },
];

export function TabBar({
  state,
  navigation,
  onAddLongPress,
}: BottomTabBarProps & { onAddLongPress?: () => void }) {
  const { c } = useTheme();
  const t = useT();
  const insets = useSafeAreaInsets();

  const activeName = state.routes[state.index]?.name;

  return (
    <View
      style={{
        backgroundColor: c.surface,
        borderTopWidth: 1,
        borderTopColor: c.border,
        paddingTop: space.s2,
        paddingHorizontal: space.s2,
        paddingBottom: space.s2 + insets.bottom,
        flexDirection: 'row',
        alignItems: 'stretch',
      }}
    >
      <TabItem tab={TABS[0]} focused={activeName === TABS[0].name} navigation={navigation} />
      <TabItem tab={TABS[1]} focused={activeName === TABS[1].name} navigation={navigation} />

      <View style={{ width: 78, alignItems: 'center' }}>
        <AddButton onLongPress={onAddLongPress} label={t('nav.add')} />
      </View>

      <TabItem tab={TABS[2]} focused={activeName === TABS[2].name} navigation={navigation} />
      <TabItem tab={TABS[3]} focused={activeName === TABS[3].name} navigation={navigation} />
    </View>
  );
}

/**
 * A destination. The active state is carried by colour *and* by a filled pill
 * behind the icon — colour alone is not a safe signal for a colour-blind user,
 * and this bar's accent sits next to a risk ramp that is already chromatic.
 */
function TabItem({
  tab,
  focused,
  navigation,
}: {
  tab: Tab;
  focused: boolean;
  navigation: BottomTabBarProps['navigation'];
}) {
  const { c } = useTheme();
  const t = useT();
  const anim = React.useRef(new Animated.Value(focused ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.spring(anim, {
      toValue: focused ? 1 : 0,
      tension: 240,
      friction: 22,
      useNativeDriver: true,
    }).start();
  }, [focused, anim]);

  return (
    <Tap
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={t(tab.labelKey)}
      feedback="opacity"
      onPress={() => {
        if (!focused) navigation.navigate(tab.name);
      }}
      style={{
        flex: 1,
        alignItems: 'center',
        gap: 4,
        paddingVertical: space.s1,
        minHeight: size.touch,
      }}
    >
      <View style={{ height: 30, justifyContent: 'center' }}>
        <Animated.View
          style={{
            position: 'absolute',
            left: -16,
            right: -16,
            top: 3,
            bottom: 3,
            borderRadius: radius.pill,
            backgroundColor: c.accentSoft,
            opacity: anim,
            transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }) }],
          }}
        />
        {/* The pill is an absolutely-positioned sibling, and on web a positioned
            element paints above in-flow content whatever the DOM order — so the
            opaque light-mode pill (`#EEECFF`) was covering the icon it sits
            behind. Native honours source order, which is why this only showed in
            the browser, and dark got away with it only because its `accentSoft`
            happens to be translucent. Any absolute sibling in this codebase has
            the same trap. */}
        <View style={{ zIndex: 1 }}>
          <Icon name={tab.icon} size={22} color={focused ? c.accent : c.muted} />
        </View>
      </View>
      <Txt size={11} weight={focused ? 600 : 500} color={focused ? c.accent : c.muted}>
        {t(tab.labelKey)}
      </Txt>
    </Tap>
  );
}

/** The raised Add button, lifted out of the bar. */
function AddButton({ onLongPress, label }: { onLongPress?: () => void; label: string }) {
  const { c } = useTheme();
  const { scale, onPressIn, onPressOut } = usePressAnim(0.92);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: -size.fabLift,
        transform: [{ scale }],
      }}
    >
      <Tap
        accessibilityRole="button"
        accessibilityLabel={label}
        feedback="none"
        onPress={() => router.push('/new-order/step1')}
        onLongPress={onLongPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={{
          width: size.fab,
          height: size.fab,
          borderRadius: radius.xxl,
          backgroundColor: c.accent,
          alignItems: 'center',
          justifyContent: 'center',
          ...elevation.fab,
        }}
      >
        <Icon name="plus" size={26} color={c.onAccent} strokeWidth={2} />
      </Tap>
    </Animated.View>
  );
}
