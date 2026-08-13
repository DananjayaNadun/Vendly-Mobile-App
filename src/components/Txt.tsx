import React, { useMemo } from 'react';
import { Text, type StyleProp, type TextProps, type TextStyle } from 'react-native';

import { useI18n } from '@/i18n';
import { familyFor, trackingToPoints, type Script, type Weight } from '@/theme/fonts';
import { scriptLeadingFloor, typeScale, type TypeRole } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeContext';

export type TxtProps = Omit<TextProps, 'style'> & {
  /**
   * A variant from the type scale. Prefer this over a raw `size` — it carries the
   * matching weight, tracking and line height, which is what actually makes a
   * screen feel typeset rather than assembled.
   */
  variant?: TypeRole;
  /** Font size in points. Overrides the variant's size when both are given. */
  size?: number;
  weight?: Weight;
  /** JetBrains Mono — numbers, order ids, phone numbers, tracking codes. */
  mono?: boolean;
  /**
   * Forces a script instead of taking the active locale's.
   *
   * Only for text that is deliberately *not* in the current language — the
   * language switcher shows `EN / සිං / தமிழ்` whatever locale you are in, and
   * without this the two foreign labels were drawn in a Latin-only face: mangled
   * on web, and tofu on Android, where nothing falls back once `fontFamily` is
   * set. A seller who only reads Sinhala could not read the way back to Sinhala.
   */
  script?: Script;
  color?: string;
  /** Letter-spacing in `em`, as written in the design; converted internally. */
  tracking?: number;
  /** `line-height` as a multiplier. */
  leading?: number;
  align?: TextStyle['textAlign'];
  transform?: TextStyle['textTransform'];
  flex?: number;
  style?: StyleProp<TextStyle>;
  children?: React.ReactNode;
};

/**
 * Every piece of text in the app goes through this component. Centralising it
 * is what makes the Sinhala and Tamil builds work: the font family *and the
 * leading* are derived from the script rather than hardcoded per screen. Mono is
 * the exception and is never swapped — amounts must read identically in all three.
 */
export function Txt({
  variant,
  size,
  weight,
  mono = false,
  script: scriptOverride,
  color,
  tracking,
  leading,
  align,
  transform,
  flex,
  style,
  children,
  ...rest
}: TxtProps) {
  const { c } = useTheme();
  const { script: localeScript } = useI18n();
  const script = scriptOverride ?? localeScript;

  const base = variant ? typeScale[variant] : undefined;
  const resolvedSize = size ?? base?.size ?? 15;
  const resolvedWeight = weight ?? base?.weight ?? 400;
  const resolvedTracking = tracking ?? base?.tracking;
  const resolvedLeading = leadingFor(leading ?? base?.leading, script, mono);

  const resolved = useMemo<TextStyle>(
    () => ({
      fontFamily: familyFor(script, resolvedWeight, mono),
      fontSize: resolvedSize,
      color: color ?? c.ink,
      ...(resolvedTracking !== undefined
        ? { letterSpacing: trackingToPoints(resolvedTracking, resolvedSize) }
        : null),
      ...(resolvedLeading !== undefined
        ? { lineHeight: Math.round(resolvedLeading * resolvedSize) }
        : null),
      ...(align ? { textAlign: align } : null),
      ...(transform ? { textTransform: transform } : null),
      ...(flex !== undefined ? { flex } : null),
    }),
    [
      script,
      resolvedWeight,
      mono,
      resolvedSize,
      color,
      c.ink,
      resolvedTracking,
      resolvedLeading,
      align,
      transform,
      flex,
    ],
  );

  return (
    <Text {...rest} style={[resolved, style]}>
      {children}
    </Text>
  );
}

/** Latin keeps the scale's own leading; the other two scripts get a floor. */
function leadingFor(authored: number | undefined, script: Script, mono: boolean) {
  if (mono || script === 'latin') return authored;
  return Math.max(authored ?? 0, scriptLeadingFloor);
}

/**
 * Renders a translated string that contains `**bold**` runs — used to lift one
 * phrase inside a sentence ("Based only on ... **your** shop").
 */
export function Rich({
  text,
  boldColor,
  boldWeight = 600,
  ...rest
}: TxtProps & { text: string; boldColor?: string; boldWeight?: Weight }) {
  const { c } = useTheme();
  const { script: localeScript } = useI18n();
  const script = rest.script ?? localeScript;
  const parts = text.split(/\*\*(.+?)\*\*/g);

  return (
    <Txt {...rest}>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <Text
            key={i}
            style={{
              fontFamily: familyFor(script, boldWeight, rest.mono ?? false),
              color: boldColor ?? c.ink,
            }}
          >
            {part}
          </Text>
        ) : (
          part
        ),
      )}
    </Txt>
  );
}
