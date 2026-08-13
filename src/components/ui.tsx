import React, { useId } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Svg, { Defs, Pattern, Rect } from 'react-native-svg';

import { Icon, type IconName } from '@/icons';
import { useI18n, useT, type Script } from '@/i18n';
import { familyFor } from '@/theme/fonts';
import { useGrow, usePressAnim, useCountUp } from '@/theme/motion';
import {
  radius,
  size,
  space,
  elevation,
  type RiskLevel,
  type ToneColors,
  type TypeRole,
} from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeContext';
import { Txt } from './Txt';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// ─────────────────────────────────────────────────────────────────────────────
// Surfaces
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The standard card.
 *
 * In light it separates from the paper canvas by shadow alone — giving every
 * card the same 1px outline, as the old system did, is exactly what flattened
 * the hierarchy. In dark a shadow is invisible, so the border comes back and
 * does the job instead.
 */
export function Card({
  children,
  style,
  padding,
  flush,
  radius: r = radius.xl,
  tone,
  edge,
  raised,
  bordered,
}: {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  padding?: number;
  flush?: boolean;
  radius?: number;
  /** Tinted variant — the warning and success banners. */
  tone?: ToneColors;
  /**
   * Draws the saturated risk bar down the leading edge. This is how a list of
   * orders becomes triageable at a glance.
   */
  edge?: ToneColors;
  /** For a card that is asking to be acted on. */
  raised?: boolean;
  /** Forces the outline on in light mode too. */
  bordered?: boolean;
}) {
  const { c, isDark } = useTheme();
  const outlined = isDark || bordered || !!tone;

  return (
    <View
      style={[
        {
          backgroundColor: tone?.bg ?? c.surface,
          borderRadius: r,
          flexShrink: 0,
          ...(outlined ? { borderWidth: 1, borderColor: tone?.border ?? c.border } : null),
          ...(isDark ? null : raised ? elevation.raised : elevation.card),
          ...(flush ? { overflow: 'hidden' } : null),
          ...(padding !== undefined ? { padding } : null),
        },
        style,
      ]}
    >
      {edge?.edge ? (
        <View
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: size.edge,
            backgroundColor: edge.edge,
            borderTopLeftRadius: r,
            borderBottomLeftRadius: r,
          }}
        />
      ) : null}
      {children}
    </View>
  );
}

/** The near-black "statement" surface the money hero sits on. */
export function Statement({
  children,
  style,
  padding = space.s5,
}: {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  padding?: number;
}) {
  const { c, isDark } = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: c.surfaceInverse,
          borderRadius: radius.xl,
          padding,
          ...(isDark ? { borderWidth: 1, borderColor: c.border } : elevation.raised),
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

/** A row inside a flush card, with the lighter interior hairline beneath it. */
export function Row({
  children,
  last,
  style,
  onPress,
  onLongPress,
  sunken,
  edge,
}: {
  children?: React.ReactNode;
  /** Omits the bottom hairline. */
  last?: boolean;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  onLongPress?: () => void;
  sunken?: boolean;
  /** Leading risk bar, for rows inside a flush list card. */
  edge?: ToneColors;
}) {
  const { c } = useTheme();
  const body = (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: space.s3,
          minHeight: size.touch,
          paddingVertical: space.s3 + 2,
          paddingHorizontal: space.s4,
          ...(last ? null : { borderBottomWidth: 1, borderBottomColor: c.divider }),
          ...(sunken ? { backgroundColor: c.surfaceSunken } : null),
        },
        style,
      ]}
    >
      {edge?.edge ? (
        <View
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: size.edge,
            backgroundColor: edge.edge,
          }}
        />
      ) : null}
      {children}
    </View>
  );
  return onPress || onLongPress ? (
    <Tap onPress={onPress} onLongPress={onLongPress} feedback="highlight">
      {body}
    </Tap>
  ) : (
    body
  );
}

/** Hairline used between stacked blocks inside a padded card. */
export function Divider({ style }: { style?: StyleProp<ViewStyle> }) {
  const { c } = useTheme();
  return <View style={[{ height: 1, backgroundColor: c.divider }, style]} />;
}

/** A titled group with an optional trailing action. */
export function Section({
  title,
  action,
  onAction,
  children,
  style,
  gap = space.s3,
}: {
  title?: string;
  action?: string;
  onAction?: () => void;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  gap?: number;
}) {
  const { c } = useTheme();
  return (
    <View style={[{ gap }, style]}>
      {title || action ? (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: space.s3,
          }}
        >
          {title ? <Txt variant="heading">{title}</Txt> : <View />}
          {action ? (
            <Tap onPress={onAction} feedback="opacity" hitSlop={8}>
              <Txt variant="label" color={c.accent}>
                {action}
              </Txt>
            </Tap>
          ) : null}
        </View>
      ) : null}
      {children}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Labels
// ─────────────────────────────────────────────────────────────────────────────

/** The uppercase section label used above groups. */
export function Eyebrow({
  children,
  style,
  color,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  color?: string;
}) {
  const { c } = useTheme();
  return (
    <View style={style}>
      <Txt variant="eyebrow" transform="uppercase" color={color ?? c.muted}>
        {children}
      </Txt>
    </View>
  );
}

/** The status dot. */
export function Dot({ color, size: s = 8 }: { color: string; size?: number }) {
  return <View style={{ width: s, height: s, borderRadius: radius.pill, backgroundColor: color }} />;
}

/**
 * A rounded chip. Drawn three ways: borderless on a tint (deltas, stock counts),
 * bordered on a tint (the risk ramp), and solid (an active filter).
 */
export function Pill({
  label,
  tone,
  dot,
  bordered,
  style,
  strong,
}: {
  label: string;
  tone: ToneColors;
  dot?: boolean;
  bordered?: boolean;
  style?: StyleProp<ViewStyle>;
  /** Solid fill in the tone's own colour — for the loudest risk callouts. */
  strong?: boolean;
}) {
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 5,
          backgroundColor: strong ? tone.edge ?? tone.dot : tone.bg,
          borderRadius: radius.pill,
          paddingVertical: 4,
          paddingHorizontal: 10,
          ...(bordered && tone.border && !strong
            ? { borderWidth: 1, borderColor: tone.border }
            : null),
        },
        style,
      ]}
    >
      {dot && !strong ? <Dot color={tone.dot} size={6} /> : null}
      <Txt size={12} weight={600} color={strong ? '#FFFFFF' : tone.fg}>
        {label}
      </Txt>
    </View>
  );
}

/** Convenience wrapper that maps a risk level onto its palette entry. */
export function RiskPill({
  level,
  label,
  dot,
  bordered,
  strong,
}: {
  level: RiskLevel;
  label: string;
  dot?: boolean;
  bordered?: boolean;
  strong?: boolean;
}) {
  const { c } = useTheme();
  return <Pill label={label} tone={c.risk[level]} dot={dot} bordered={bordered} strong={strong} />;
}

/**
 * Money, set the way the system wants it: a small currency mark and a large mono
 * figure sharing a baseline. `countUp` animates the figure to its value, which
 * is used on the one hero total per screen.
 */
export function Money({
  amount,
  variant = 'subheading',
  color,
  markColor,
  countUp,
  mark = true,
  size: s,
  weight,
  align,
}: {
  amount: number;
  variant?: TypeRole;
  color?: string;
  markColor?: string;
  countUp?: boolean;
  /** Set false to drop the "Rs" mark. */
  mark?: boolean;
  size?: number;
  weight?: 400 | 500 | 600 | 700;
  align?: 'left' | 'right';
}) {
  const { c } = useTheme();
  const t = useT();
  const shown = useCountUp(amount, !!countUp);
  const value = (countUp ? shown : amount).toLocaleString('en-US');

  const markSize =
    s !== undefined
      ? Math.round(s * 0.45)
      : variant === 'display'
        ? 17
        : variant === 'figure'
          ? 14
          : variant === 'title'
            ? 14
            : 13;

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 5,
        ...(align === 'right' ? { justifyContent: 'flex-end' } : null),
      }}
    >
      {mark ? (
        <Txt size={markSize} weight={500} color={markColor ?? color ?? c.muted}>
          {t('common.rs')}
        </Txt>
      ) : null}
      <Txt variant={variant} size={s} weight={weight} mono color={color}>
        {value}
      </Txt>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Controls
// ─────────────────────────────────────────────────────────────────────────────

export type TapFeedback = 'scale' | 'opacity' | 'highlight' | 'none';

/**
 * Press feedback for every tappable surface.
 *
 * `scale` is the default and reads as the surface being pushed. `highlight` is
 * for full-width list rows, where scaling a row that spans the screen looks
 * like a glitch — those tint instead. `opacity` is for bare text links.
 */
export function Tap({
  children,
  style,
  feedback = 'scale',
  ...rest
}: PressableProps & {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  feedback?: TapFeedback;
}) {
  const { c } = useTheme();
  const { scale, onPressIn, onPressOut } = usePressAnim();

  /**
   * Anything that responds to a press is announced as a button unless the
   * caller names a more specific role. Defaulting here rather than at each call
   * site is what stops controls shipping silently unlabelled — the toast's Undo
   * was reaching screen readers as an anonymous view.
   */
  const accessibilityRole =
    rest.accessibilityRole ?? (rest.onPress || rest.onLongPress ? 'button' : undefined);

  if (feedback === 'highlight') {
    return (
      <Pressable
        {...rest}
        accessibilityRole={accessibilityRole}
        style={({ pressed }) => [style, pressed && { backgroundColor: c.fill }]}
      >
        {children}
      </Pressable>
    );
  }

  if (feedback === 'opacity' || feedback === 'none') {
    return (
      <Pressable
        {...rest}
        accessibilityRole={accessibilityRole}
        style={({ pressed }) => [style, feedback === 'opacity' && pressed && { opacity: 0.55 }]}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <AnimatedPressable
      {...rest}
      accessibilityRole={accessibilityRole}
      onPressIn={(e) => {
        onPressIn();
        rest.onPressIn?.(e);
      }}
      onPressOut={(e) => {
        onPressOut();
        rest.onPressOut?.(e);
      }}
      style={[style, { transform: [{ scale }] }]}
    >
      {children}
    </AnimatedPressable>
  );
}

/** The circular outlined icon button in the app bars. */
export function IconButton({
  name,
  onPress,
  badge,
  color,
  filled,
  label,
}: {
  name: IconName;
  onPress?: () => void;
  /** The notification dot. */
  badge?: string;
  color?: string;
  /** Solid neutral fill instead of an outline. */
  filled?: boolean;
  /** Screen-reader label. Icon-only controls are unusable without one. */
  label?: string;
}) {
  const { c } = useTheme();
  return (
    <Tap
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={6}
      style={{
        width: size.iconButton,
        height: size.iconButton,
        borderRadius: radius.pill,
        backgroundColor: filled ? c.fill : 'transparent',
        ...(filled ? null : { borderWidth: 1, borderColor: c.border }),
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icon name={name} size={18} color={color ?? c.body} />
      {badge ? (
        <View
          style={{
            position: 'absolute',
            top: 8,
            right: 9,
            width: 8,
            height: 8,
            borderRadius: radius.pill,
            backgroundColor: badge,
            borderWidth: 2,
            borderColor: c.surface,
          }}
        />
      ) : null}
    </Tap>
  );
}

export type ButtonVariant = 'primary' | 'secondary' | 'contrast' | 'danger' | 'quiet' | 'ghost';

/** The full-width CTAs. */
export function Button({
  label,
  variant = 'primary',
  onPress,
  height = size.primaryButton,
  flex,
  style,
  fontSize,
  tone,
  icon,
  disabled,
}: {
  label: string;
  variant?: ButtonVariant;
  onPress?: () => void;
  /**
   * A *minimum* height, not a fixed one. Sinhala and Tamil labels run longer
   * than their English source — "Ask advance" already wraps to two lines inside
   * a 44pt button in Sinhala — and a fixed height simply clipped the second line.
   */
  height?: number;
  flex?: number;
  style?: StyleProp<ViewStyle>;
  fontSize?: number;
  /** For buttons inside a tinted banner, which borrow the banner's colours. */
  tone?: ToneColors;
  icon?: IconName;
  disabled?: boolean;
}) {
  const { c } = useTheme();

  const variants: Record<ButtonVariant, { bg: string; fg: string; border?: string }> = {
    primary: { bg: c.accent, fg: c.onAccent },
    secondary: { bg: c.surface, fg: c.ink, border: c.border },
    contrast: { bg: c.contrast, fg: c.onContrast },
    danger: { bg: c.danger, fg: c.onDanger },
    quiet: { bg: c.fill, fg: c.ink },
    ghost: { bg: 'transparent', fg: c.accent },
  };
  const v = tone ? { bg: tone.bg, fg: tone.fg, border: tone.border } : variants[variant];

  return (
    <Tap
      onPress={disabled ? undefined : onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      style={[
        {
          minHeight: height,
          borderRadius: radius.md,
          backgroundColor: v.bg,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: space.s2,
          paddingVertical: space.s2,
          paddingHorizontal: space.s4,
          opacity: disabled ? 0.45 : 1,
          ...(v.border ? { borderWidth: 1, borderColor: v.border } : null),
          ...(flex !== undefined ? { flex } : null),
        },
        style,
      ]}
    >
      {icon ? <Icon name={icon} size={17} color={v.fg} strokeWidth={2} /> : null}
      <Txt size={fontSize ?? 15} weight={600} color={v.fg} tracking={-0.005} align="center">
        {label}
      </Txt>
    </Tap>
  );
}

/** The pill-shaped filter row under a header. */
export function FilterChips({
  options,
  value,
  onChange,
}: {
  options: { key: string; label: string; tone?: ToneColors; count?: number }[];
  value: string;
  onChange?: (key: string) => void;
}) {
  const { c } = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: space.s2, flexWrap: 'wrap' }}>
      {options.map((o) => {
        const active = o.key === value;
        return (
          <Tap
            key={o.key}
            onPress={() => onChange?.(o.key)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              backgroundColor: active ? c.contrast : (o.tone?.bg ?? c.fill),
              borderRadius: radius.pill,
              minHeight: 36,
              paddingVertical: 8,
              paddingHorizontal: 14,
            }}
          >
            <Txt size={14} weight={active ? 600 : 500} color={active ? c.onContrast : (o.tone?.fg ?? c.body)}>
              {o.label}
            </Txt>
            {o.count !== undefined ? (
              <Txt size={13} mono weight={500} color={active ? c.onContrast : c.muted}>
                {o.count}
              </Txt>
            ) : null}
          </Tap>
        );
      })}
    </View>
  );
}

/** The inset segmented control. */
export function Segmented({
  options,
  value,
  onChange,
  compact,
}: {
  /**
   * `script` forces one option's face independently of the active locale. The
   * language switcher needs it: its labels are always `EN / සිං / தமிழ்`, so two
   * of the three are never in the language currently being rendered.
   */
  options: { key: string; label: string; script?: Script }[];
  value: string;
  onChange?: (key: string) => void;
  /** The language-switcher variant: pill-shaped and tighter. */
  compact?: boolean;
}) {
  const { c, isDark } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: c.track,
        borderRadius: compact ? radius.pill : radius.md,
        padding: 4,
      }}
    >
      {options.map((o) => {
        const active = o.key === value;
        return (
          <Tap
            key={o.key}
            onPress={() => onChange?.(o.key)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            feedback="opacity"
            style={{
              flex: compact ? undefined : 1,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: compact ? radius.pill : radius.xs,
              minHeight: compact ? 32 : 38,
              paddingHorizontal: compact ? 14 : 0,
              ...(active
                ? {
                    backgroundColor: c.surface,
                    ...(isDark ? null : elevation.card),
                  }
                : null),
            }}
          >
            <Txt
              size={compact ? 13 : 14}
              weight={active ? 600 : 500}
              script={o.script}
              color={active ? c.ink : c.body}
            >
              {o.label}
            </Txt>
          </Tap>
        );
      })}
    </View>
  );
}

/** Switch. Animates the knob across rather than snapping. */
export function Toggle({
  value,
  onChange,
  label,
}: {
  value: boolean;
  onChange?: (next: boolean) => void;
  label?: string;
}) {
  const { c } = useTheme();
  const anim = React.useRef(new Animated.Value(value ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.spring(anim, {
      toValue: value ? 1 : 0,
      tension: 220,
      friction: 20,
      useNativeDriver: true,
    }).start();
  }, [value, anim]);

  return (
    <Tap
      onPress={() => onChange?.(!value)}
      feedback="none"
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value }}
      hitSlop={8}
      style={{
        width: 48,
        height: 28,
        borderRadius: radius.pill,
        backgroundColor: value ? c.accent : c.fill,
        borderWidth: value ? 0 : 1,
        borderColor: c.border,
        padding: 3,
        justifyContent: 'center',
      }}
    >
      <Animated.View
        style={{
          width: 22,
          height: 22,
          borderRadius: radius.pill,
          backgroundColor: '#FFFFFF',
          ...elevation.card,
          transform: [
            { translateX: anim.interpolate({ inputRange: [0, 1], outputRange: [0, 20] }) },
          ],
        }}
      />
    </Tap>
  );
}

/** The −/count/+ control. */
export function QtyStepper({
  value,
  onChange,
  large,
}: {
  value: number;
  onChange?: (next: number) => void;
  large?: boolean;
}) {
  const { c } = useTheme();
  const t = useT();
  const d = large ? 36 : 32;
  const canDecrement = value > 0;
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: large ? space.s3 : space.s2,
        backgroundColor: c.fill,
        borderRadius: radius.pill,
        padding: 4,
      }}
    >
      <Tap
        onPress={() => canDecrement && onChange?.(value - 1)}
        accessibilityRole="button"
        accessibilityLabel={t('common.decrease')}
        style={{
          width: d,
          height: d,
          borderRadius: radius.pill,
          backgroundColor: c.surface,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Txt size={large ? 19 : 17} weight={500} color={canDecrement ? c.ink : c.faint}>
          −
        </Txt>
      </Tap>
      <Txt
        size={large ? 16 : 15}
        weight={500}
        mono
        style={{ minWidth: large ? 18 : 14, textAlign: 'center' }}
      >
        {value}
      </Txt>
      <Tap
        onPress={() => onChange?.(value + 1)}
        accessibilityRole="button"
        accessibilityLabel={t('common.increase')}
        style={{
          width: d,
          height: d,
          borderRadius: radius.pill,
          backgroundColor: c.contrast,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Txt size={large ? 19 : 17} weight={500} color={c.onContrast}>
          +
        </Txt>
      </Tap>
    </View>
  );
}

/** The progress rail on the new-order flow. */
export function ProgressSteps({ current, total = 3 }: { current: number; total?: number }) {
  const { c } = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: 5 }} accessibilityRole="progressbar">
      {Array.from({ length: total }, (_, i) => (
        <View
          key={i}
          style={{
            flex: 1,
            height: 4,
            borderRadius: radius.pill,
            backgroundColor: i < current ? c.accent : c.rail,
          }}
        />
      ))}
    </View>
  );
}

/**
 * A horizontal proportion bar. Grows from zero on mount, because the growth is
 * what makes two meters comparable at a glance.
 */
export function Meter({
  pct,
  tone,
  index = 0,
  height = 8,
  track,
}: {
  pct: number;
  tone?: ToneColors;
  index?: number;
  height?: number;
  track?: string;
}) {
  const { c } = useTheme();
  const width = useGrow(pct, index);
  return (
    <View
      style={{
        height,
        borderRadius: radius.pill,
        backgroundColor: track ?? c.chartTrack,
        overflow: 'hidden',
      }}
    >
      <Animated.View
        style={{
          width,
          height: '100%',
          borderRadius: radius.pill,
          backgroundColor: tone?.edge ?? tone?.dot ?? c.chartBar,
        }}
      />
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Placeholders and content states
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The diagonal-hatch stand-in wherever a product photo goes.
 *
 * The pattern id is per-instance: `react-native-svg` renders real DOM ids on
 * web, so a shared id meant the first instance's colours won for every hatch on
 * the page and none of them updated when the theme changed.
 */
export function Hatch({
  style,
  radius: r = radius.sm,
  children,
}: {
  style?: StyleProp<ViewStyle>;
  radius?: number;
  children?: React.ReactNode;
}) {
  const { c } = useTheme();
  const id = `hatch-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  return (
    <View style={[{ borderRadius: r, overflow: 'hidden', backgroundColor: c.hatchA }, style]}>
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
        <Defs>
          <Pattern
            id={id}
            patternUnits="userSpaceOnUse"
            width={10}
            height={10}
            patternTransform="rotate(45)"
          >
            <Rect x={0} y={0} width={5} height={10} fill={c.hatchA} />
            <Rect x={5} y={0} width={5} height={10} fill={c.hatchB} />
          </Pattern>
        </Defs>
        <Rect x={0} y={0} width="100%" height="100%" fill={`url(#${id})`} />
      </Svg>
      {children}
    </View>
  );
}

/** The circular initials avatar. */
export function Avatar({
  initials,
  size: d = 44,
  variant = 'muted',
  tone,
}: {
  initials: string;
  size?: number;
  /** `muted` is the neutral circle; `contrast` is the near-black shop tile. */
  variant?: 'muted' | 'contrast';
  /** Tints the avatar to a risk tone — used on customer rows. */
  tone?: ToneColors;
}) {
  const { c } = useTheme();
  const contrast = variant === 'contrast';
  return (
    <View
      style={{
        width: d,
        height: d,
        borderRadius: contrast ? radius.md : radius.pill,
        backgroundColor: contrast ? c.contrast : (tone?.bg ?? c.fill),
        alignItems: 'center',
        justifyContent: 'center',
        ...(tone?.border && !contrast ? { borderWidth: 1, borderColor: tone.border } : null),
      }}
    >
      <Txt
        size={Math.round(d * 0.34)}
        weight={600}
        color={contrast ? c.onContrast : (tone?.fg ?? c.body)}
      >
        {initials}
      </Txt>
    </View>
  );
}

/** A live search field. */
export function SearchField({
  value,
  onChange,
  placeholder,
  autoFocus,
  onCancel,
  cancelLabel,
}: {
  value: string;
  onChange: (next: string) => void;
  placeholder: string;
  autoFocus?: boolean;
  onCancel?: () => void;
  cancelLabel?: string;
}) {
  const { c } = useTheme();
  const { script } = useI18n();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.s3 }}>
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          gap: space.s3,
          backgroundColor: c.fill,
          borderRadius: radius.md,
          minHeight: size.touch,
          paddingHorizontal: space.s4,
        }}
      >
        <Icon name="search" size={17} color={c.muted} />
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={c.muted}
          autoFocus={autoFocus}
          returnKeyType="search"
          style={{
            flex: 1,
            padding: 0,
            fontFamily: familyFor(script, 400, false),
            fontSize: 15,
            color: c.ink,
          }}
        />
        {value.length > 0 ? (
          <Tap onPress={() => onChange('')} feedback="opacity" hitSlop={10}>
            <Icon name="close" size={16} color={c.muted} />
          </Tap>
        ) : null}
      </View>

      {onCancel && cancelLabel ? (
        <Tap onPress={onCancel} feedback="opacity" hitSlop={8}>
          <Txt variant="label" color={c.accent}>
            {cancelLabel}
          </Txt>
        </Tap>
      ) : null}
    </View>
  );
}

/** The figure-over-label tile used across the app. */
export function StatTile({
  label,
  value,
  hint,
  hintTone,
  flex = 1,
  mono = true,
  onPress,
}: {
  label: string;
  value: string;
  hint?: string;
  hintTone?: ToneColors;
  flex?: number;
  mono?: boolean;
  onPress?: () => void;
}) {
  const { c } = useTheme();
  const inner = (
    <Card style={{ flex, padding: space.s4, gap: space.s1 }}>
      <Txt variant="caption" color={c.muted}>
        {label}
      </Txt>
      <Txt variant="figure" size={23} mono={mono}>
        {value}
      </Txt>
      {hint ? (
        <Txt size={12} weight={hintTone ? 500 : 400} color={hintTone?.fg ?? c.muted}>
          {hint}
        </Txt>
      ) : null}
    </Card>
  );
  return onPress ? (
    <Tap onPress={onPress} style={{ flex }}>
      {inner}
    </Tap>
  ) : (
    inner
  );
}

/** A label/value pair, as used in totals blocks and detail tables. */
export function KeyValue({
  label,
  value,
  strong,
  tone,
  mono = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
  tone?: ToneColors;
  mono?: boolean;
}) {
  const { c } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: space.s4,
      }}
    >
      <Txt variant={strong ? 'subheading' : 'bodySm'} color={strong ? c.ink : c.body}>
        {label}
      </Txt>
      <Txt
        variant={strong ? 'subheading' : 'bodySm'}
        weight={strong ? 600 : 500}
        mono={mono}
        color={tone?.fg ?? c.ink}
      >
        {value}
      </Txt>
    </View>
  );
}

/** The empty state: an icon, a line saying what is missing, and a way forward. */
export function EmptyState({
  icon,
  title,
  body,
  action,
  onAction,
}: {
  icon: IconName;
  title: string;
  body?: string;
  action?: string;
  onAction?: () => void;
}) {
  const { c } = useTheme();
  return (
    <View style={{ alignItems: 'center', paddingVertical: space.s9, paddingHorizontal: space.s5, gap: space.s3 }}>
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: radius.pill,
          backgroundColor: c.fill,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: space.s1,
        }}
      >
        <Icon name={icon} size={26} color={c.muted} />
      </View>
      <Txt variant="heading" align="center">
        {title}
      </Txt>
      {body ? (
        <Txt variant="body" color={c.body} align="center" style={{ maxWidth: 280 }}>
          {body}
        </Txt>
      ) : null}
      {action ? (
        <Button label={action} onPress={onAction} style={{ marginTop: space.s3, minWidth: 180 }} />
      ) : null}
    </View>
  );
}

/** A skeleton block. `tone` picks one of the three greys. */
export function Skeleton({
  width,
  height,
  radius: r = 8,
  tone = 0,
  style,
}: {
  width?: number | `${number}%`;
  height: number;
  radius?: number;
  tone?: 0 | 1 | 2;
  style?: StyleProp<ViewStyle>;
}) {
  const { c } = useTheme();
  const pulse = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius: r,
          backgroundColor: c.skeleton[tone],
          opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 0.45] }),
        },
        style,
      ]}
    />
  );
}
