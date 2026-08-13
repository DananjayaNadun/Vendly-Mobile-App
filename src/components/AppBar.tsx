import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, type IconName } from '@/icons';
import { useT } from '@/i18n';
import { radius, size, space } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeContext';
import { Tap } from './ui';
import { Txt } from './Txt';

/**
 * Wraps a screen's top chrome and pads for the status bar.
 *
 * The old chrome painted a filled bar with a hard 1px rule under it on every
 * screen, which cut each screen in half before any content was read. The bar now
 * sits on the canvas by default and only grows a separator once the content
 * behind it has actually scrolled — see {@link useScrollShadow}.
 */
export function TopChrome({
  children,
  style,
  transparent,
  separated,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Kept for callers that draw their own background. */
  transparent?: boolean;
  /** Shows the hairline. Drive from {@link useScrollShadow}. */
  separated?: boolean;
}) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        {
          paddingTop: insets.top,
          backgroundColor: transparent ? 'transparent' : c.canvas,
          borderBottomWidth: 1,
          borderBottomColor: separated ? c.border : 'transparent',
          zIndex: 2,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

/**
 * Tracks whether a scroll view has moved off the top, so the header can grow a
 * separator only when there is genuinely content sliding under it.
 */
export function useScrollShadow() {
  const [separated, setSeparated] = React.useState(false);
  const onScroll = React.useCallback(
    (e: { nativeEvent: { contentOffset: { y: number } } }) => {
      const past = e.nativeEvent.contentOffset.y > 4;
      setSeparated((was) => (was === past ? was : past));
    },
    [],
  );
  return { separated, onScroll, scrollEventThrottle: 16 };
}

/**
 * The detail-screen bar: a back affordance, a title with an optional subtitle,
 * and optional trailing controls. The back target is a full 44pt square — the
 * old one was a 40pt box holding a 19pt glyph with no hit slop.
 */
export function AppBar({
  title,
  subtitle,
  titleMono,
  leading = 'back',
  onLeading,
  trailingIcon,
  onTrailing,
  trailingIconLabel,
  trailingLabel,
  onTrailingLabel,
  dimmed,
  trailing,
}: {
  title: string;
  subtitle?: string;
  /** Order ids are set in JetBrains Mono. */
  titleMono?: boolean;
  leading?: 'back' | 'close' | 'none';
  onLeading?: () => void;
  trailingIcon?: IconName;
  onTrailing?: () => void;
  /**
   * Screen-reader name for the trailing icon. Required alongside `trailingIcon`:
   * this button shipped unnamed, so a screen-reader user on an order heard an
   * anonymous button that opened a destructive dialog.
   */
  trailingIconLabel?: string;
  trailingLabel?: string;
  onTrailingLabel?: () => void;
  /** Used on screens where a sheet covers the bar. */
  dimmed?: boolean;
  /** Arbitrary trailing content, for bars that need more than one control. */
  trailing?: React.ReactNode;
}) {
  const { c } = useTheme();
  const t = useT();

  return (
    <View
      style={{
        minHeight: size.appBar,
        flexDirection: 'row',
        alignItems: 'center',
        gap: space.s2,
        paddingHorizontal: space.s2,
        paddingVertical: space.s2,
        opacity: dimmed ? 0.5 : 1,
      }}
    >
      {leading === 'none' ? (
        <View style={{ width: space.s3 }} />
      ) : (
        <Tap
          onPress={onLeading}
          accessibilityRole="button"
          accessibilityLabel={leading === 'back' ? t('common.back') : t('common.close')}
          hitSlop={6}
          style={{
            width: size.touch,
            height: size.touch,
            borderRadius: radius.pill,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name={leading === 'back' ? 'chevronLeft' : 'close'} size={20} color={c.ink} />
        </Tap>
      )}

      <View style={{ flex: 1, gap: 1 }}>
        <Txt
          variant={titleMono ? undefined : 'heading'}
          size={titleMono ? 16 : undefined}
          weight={titleMono ? 500 : undefined}
          mono={titleMono}
          numberOfLines={1}
        >
          {title}
        </Txt>
        {subtitle ? (
          <Txt variant="caption" color={c.muted} mono={titleMono} numberOfLines={1}>
            {subtitle}
          </Txt>
        ) : null}
      </View>

      {trailing}

      {trailingLabel ? (
        <Tap
          onPress={onTrailingLabel}
          feedback="opacity"
          hitSlop={8}
          style={{ paddingHorizontal: space.s3, minHeight: size.touch, justifyContent: 'center' }}
        >
          <Txt variant="label" weight={600} color={c.accent}>
            {trailingLabel}
          </Txt>
        </Tap>
      ) : null}

      {trailingIcon ? (
        <Tap
          onPress={onTrailing}
          accessibilityRole="button"
          accessibilityLabel={trailingIconLabel}
          hitSlop={6}
          style={{
            width: size.touch,
            height: size.touch,
            borderRadius: radius.pill,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name={trailingIcon} size={19} color={c.body} />
        </Tap>
      ) : null}
    </View>
  );
}

/**
 * The large screen title used by the tab destinations, with an optional actions
 * cluster on the right and an optional row beneath.
 */
export function LargeHeader({
  title,
  subtitle,
  actions,
  below,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  below?: React.ReactNode;
}) {
  const { c } = useTheme();
  return (
    <View
      style={{
        paddingTop: space.s2,
        paddingHorizontal: space.gutter,
        paddingBottom: below ? space.s3 : space.s2,
        gap: space.s3,
      }}
    >
      <View
        style={{
          minHeight: size.largeHeaderRow,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: space.s3,
        }}
      >
        <View style={{ flex: 1, gap: 2 }}>
          <Txt variant="title" accessibilityRole="header">
            {title}
          </Txt>
          {subtitle ? (
            <Txt variant="caption" color={c.muted}>
              {subtitle}
            </Txt>
          ) : null}
        </View>
        {actions ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.s2 }}>{actions}</View>
        ) : null}
      </View>
      {below}
    </View>
  );
}

/**
 * A sticky bottom action bar for detail screens, floating over the content with
 * the safe-area inset already accounted for.
 */
export function BottomBar({ children }: { children: React.ReactNode }) {
  const { c, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        backgroundColor: c.surface,
        borderTopWidth: 1,
        borderTopColor: c.border,
        paddingHorizontal: space.gutter,
        paddingTop: space.s3,
        paddingBottom: space.s3 + insets.bottom,
        gap: space.s3,
        ...(isDark
          ? null
          : {
              shadowColor: '#171419',
              shadowOpacity: 0.06,
              shadowRadius: 16,
              shadowOffset: { width: 0, height: -4 },
              elevation: 8,
            }),
      }}
    >
      {children}
    </View>
  );
}
