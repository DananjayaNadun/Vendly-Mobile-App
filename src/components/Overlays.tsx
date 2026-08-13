import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  ScrollView,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, type IconName } from '@/icons';
import { useT } from '@/i18n';
import { useReveal } from '@/theme/motion';
import { elevation, radius, size, space } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeContext';
import { Tap } from './ui';
import { Txt } from './Txt';

/**
 * Bottom sheet.
 *
 * Two shapes: content-height, and near-full-height pinned a fixed distance from
 * the top. `top` switches between them.
 *
 * The sheet is driven by {@link useReveal} rather than `Modal`'s own `slide`, so
 * the scrim fades in step with the panel and the panel arrives on a spring —
 * a linear slide under a hard scrim is what made the old sheets feel like
 * dialogs dropped on the screen rather than surfaces pulled up from its edge.
 */
export function Sheet({
  visible,
  onClose,
  children,
  /** Distance from the top of the screen; omit to size to content. */
  top,
  title,
  subtitle,
  footer,
  scrollable,
}: {
  visible: boolean;
  onClose: () => void;
  children?: React.ReactNode;
  top?: number;
  title?: string;
  subtitle?: React.ReactNode;
  footer?: React.ReactNode;
  /** For tall sheets whose body can overflow. */
  scrollable?: boolean;
}) {
  const { c } = useTheme();
  const t = useT();
  const insets = useSafeAreaInsets();
  const { mounted, scrimStyle, contentStyle } = useReveal(visible, 'bottom');

  if (!mounted) return null;

  const body = scrollable ? (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>{children}</ScrollView>
  ) : (
    children
  );

  return (
    <Modal visible transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <Animated.View style={[{ flex: 1, backgroundColor: c.scrim }, scrimStyle]}>
        <Pressable style={{ flex: 1 }} onPress={onClose} accessibilityLabel={t('common.close')} />
      </Animated.View>

      <Animated.View
        style={[
          {
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            ...(top !== undefined ? { top: top + insets.top } : null),
            backgroundColor: c.surface,
            borderTopLeftRadius: radius.sheet,
            borderTopRightRadius: radius.sheet,
            paddingTop: space.s3,
            ...elevation.sheet,
          },
          contentStyle,
        ]}
      >
        <View
          style={{
            width: 40,
            height: 4,
            borderRadius: radius.pill,
            backgroundColor: c.handle,
            alignSelf: 'center',
          }}
        />

        {title ? (
          <View
            style={{
              paddingTop: space.s5,
              paddingHorizontal: space.gutter,
              paddingBottom: space.s4,
              gap: space.s2,
              borderBottomWidth: subtitle ? 1 : 0,
              borderBottomColor: c.divider,
            }}
          >
            <Txt variant="heading" size={20}>
              {title}
            </Txt>
            {subtitle}
          </View>
        ) : null}

        {body}

        {footer ? (
          <View
            style={{
              paddingTop: space.s3,
              paddingHorizontal: space.gutter,
              paddingBottom: space.s5 + insets.bottom,
              borderTopWidth: 1,
              borderTopColor: c.divider,
            }}
          >
            {footer}
          </View>
        ) : (
          <View style={{ height: insets.bottom + space.s2 }} />
        )}
      </Animated.View>
    </Modal>
  );
}

/** The centred destructive dialog. */
export function Dialog({
  visible,
  onClose,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const { c } = useTheme();
  const t = useT();
  const { mounted, scrimStyle, contentStyle } = useReveal(visible, 'centre');

  if (!mounted) return null;

  return (
    <Modal visible transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <Animated.View
        style={[
          {
            flex: 1,
            backgroundColor: c.scrim,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: space.s6,
          },
          scrimStyle,
        ]}
      >
        <Pressable
          onPress={onClose}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          accessibilityLabel={t('common.close')}
        />
        <Animated.View
          style={[
            {
              width: '100%',
              backgroundColor: c.surface,
              borderRadius: radius.xxl,
              padding: space.s5,
              gap: space.s4,
              ...elevation.dialog,
            },
            contentStyle,
          ]}
        >
          {children}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

/** The radio row used by the cancel dialog. */
export function RadioRow({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const { c } = useTheme();
  return (
    <Tap
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: space.s3,
        borderRadius: radius.md,
        minHeight: size.touch,
        paddingVertical: space.s3,
        paddingHorizontal: space.s4,
        borderWidth: selected ? 2 : 1,
        borderColor: selected ? c.accent : c.border,
        backgroundColor: selected ? c.accentSoft : 'transparent',
      }}
    >
      <View
        style={{
          width: 20,
          height: 20,
          borderRadius: radius.pill,
          borderWidth: selected ? 6 : 1.5,
          borderColor: selected ? c.accent : c.handle,
        }}
      />
      <Txt flex={1} variant="label" weight={500}>
        {label}
      </Txt>
    </Tap>
  );
}

/**
 * The inverted toast, pinned clear of the tab bar.
 *
 * `tone` picks the leading glyph: confirmations get a check, a held or reverted
 * action gets its own mark, so the toast is not read on colour alone.
 */
export function Toast({
  visible,
  title,
  body,
  action,
  onAction,
  bottom = 104,
  tone = 'positive',
  icon,
}: {
  visible: boolean;
  title: string;
  body?: string;
  action?: string;
  onAction?: () => void;
  bottom?: number;
  tone?: 'positive' | 'warning' | 'neutral';
  icon?: IconName;
}) {
  const { c } = useTheme();
  const anim = useRef(new Animated.Value(0)).current;
  const [mounted, setMounted] = React.useState(visible);

  /**
   * The content is latched while the toast animates out.
   *
   * Callers raise a toast from the same state they clear when the action is
   * undone, so by the time the exit animation runs, `title` and `tone` have
   * already reverted to their defaults — which made a "Decided" toast visibly
   * relabel itself "Held" on its way off screen.
   */
  const latched = useRef({ title, body, action, tone, icon });
  if (visible) latched.current = { title, body, action, tone, icon };
  const shown = visible ? { title, body, action, tone, icon } : latched.current;

  useEffect(() => {
    const duration = visible ? 260 : 160;

    if (visible) setMounted(true);

    const animation = Animated.timing(anim, {
      toValue: visible ? 1 : 0,
      duration,
      easing: visible ? Easing.bezier(0.22, 1, 0.36, 1) : Easing.in(Easing.cubic),
      useNativeDriver: true,
    });
    animation.start();

    if (visible) return () => animation.stop();

    // Unmounting is driven by a timer rather than the animation's completion
    // callback. That callback does not fire if the animation is interrupted or
    // if the frame loop is throttled (a backgrounded app, an occluded web
    // view), and the result was an invisible toast left mounted over the tab
    // bar, still able to swallow taps.
    const timer = setTimeout(() => setMounted(false), duration + 60);
    return () => {
      animation.stop();
      clearTimeout(timer);
    };
  }, [visible, anim]);

  if (!mounted) return null;

  const badge =
    shown.tone === 'positive' ? c.positive.dot : shown.tone === 'warning' ? c.warning.dot : c.muted;

  return (
    <Animated.View
      // Never intercepts touches while leaving — an exiting toast that is still
      // hit-testable is indistinguishable from a dead zone over the tab bar.
      pointerEvents={visible ? 'box-none' : 'none'}
      accessibilityLiveRegion="polite"
      style={{
        position: 'absolute',
        left: space.s4,
        right: space.s4,
        bottom,
        opacity: anim,
        transform: [
          { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) },
          { scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1] }) },
        ],
      }}
    >
      <View
        style={{
          backgroundColor: c.toastBg,
          borderRadius: radius.lg,
          paddingVertical: space.s3 + 2,
          paddingHorizontal: space.s4,
          flexDirection: 'row',
          alignItems: 'center',
          gap: space.s3,
          ...elevation.toast,
        }}
      >
        <View
          style={{
            width: 24,
            height: 24,
            borderRadius: radius.pill,
            backgroundColor: badge,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name={shown.icon ?? 'check'} size={13} color="#FFFFFF" strokeWidth={2.2} />
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Txt variant="label" weight={600} color={c.toastFg}>
            {shown.title}
          </Txt>
          {shown.body ? (
            <Txt variant="caption" color={c.toastBody}>
              {shown.body}
            </Txt>
          ) : null}
        </View>
        {shown.action ? (
          <Tap onPress={onAction} feedback="opacity" hitSlop={10}>
            <Txt variant="label" weight={600} color={c.toastAction}>
              {shown.action}
            </Txt>
          </Tap>
        ) : null}
      </View>
    </Animated.View>
  );
}

/** Scrim stand-in used where a screen is dimmed behind a sheet. */
export function DimmedBackdrop({ style }: { style?: StyleProp<ViewStyle> }) {
  const { c } = useTheme();
  return (
    <View
      pointerEvents="none"
      style={[
        { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: c.scrim },
        style,
      ]}
    />
  );
}

/** Shared close affordance for sheet headers. */
export function SheetClose({ onPress }: { onPress: () => void }) {
  const { c } = useTheme();
  const t = useT();
  return (
    <Tap
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={t('common.close')}
      hitSlop={8}
      style={{
        width: size.touch,
        height: size.touch,
        borderRadius: radius.pill,
        backgroundColor: c.fill,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icon name="close" size={17} color={c.body} />
    </Tap>
  );
}
