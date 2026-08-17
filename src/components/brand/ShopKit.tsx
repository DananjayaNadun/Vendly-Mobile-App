import React from 'react';
import { TextInput, View, type StyleProp, type ViewStyle } from 'react-native';

import { Txt } from '@/components/Txt';
import { LineIcon, type LineIconName } from '@/icons/line';
import { useI18n } from '@/i18n';
import { useCountUp } from '@/theme/motion';
import { familyFor } from '@/theme/fonts';
import { brand, brandChip, brandRadius, type BrandChip } from '@/theme/brand';

/**
 * The pieces the nine application screens are assembled from.
 *
 * All of it is transcribed from the exported PDF: white cards on a `#F5F5F5`
 * canvas, a hairline border plus a barely-there shadow, 16–17pt radii, and the
 * pill chips that carry status.
 */

/** The white card every list row and stat tile sits on. */
export function ShopCard({
  children,
  style,
  padding = 18,
}: {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  padding?: number;
}) {
  return (
    <View
      style={[
        {
          backgroundColor: brand.surface,
          borderRadius: brandRadius.cta,
          borderWidth: 1,
          borderColor: '#E8E8E8',
          padding,
          shadowColor: '#000000',
          shadowOpacity: 0.05,
          shadowRadius: 2,
          shadowOffset: { width: 0, height: 1 },
          elevation: 1,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

/** The status pill: `Pending`, `Good`, `WhatsApp`, `COD : High`. */
export function ShopChip({ label, tone }: { label: string; tone: BrandChip }) {
  const c = brandChip[tone];
  return (
    <View
      style={{
        alignSelf: 'flex-start',
        backgroundColor: c.bg,
        borderRadius: brandRadius.chip,
        paddingVertical: 3,
        paddingHorizontal: 9,
      }}
    >
      <Txt size={9.5} weight={700} tracking={0.03} color={c.fg}>
        {label}
      </Txt>
    </View>
  );
}

/** The full-width rounded search field that heads most screens. */
export function ShopSearch({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (next: string) => void;
  placeholder: string;
}) {
  const { script } = useI18n();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: brand.fill,
        borderRadius: brandRadius.otp,
        borderWidth: 1,
        borderColor: '#E6E6E6',
        minHeight: 49,
        paddingHorizontal: 16,
      }}
    >
      <LineIcon name="search" size={18} color={brand.muted} />
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#9A9A9A"
        style={{
          flex: 1,
          padding: 0,
          fontFamily: familyFor(script, 400, false),
          fontSize: 14,
          color: brand.text,
        }}
      />
    </View>
  );
}

/**
 * A stat tile: a label, a tinted icon square, and a figure.
 *
 * `iconFirst` flips between the two arrangements the design uses — Home puts
 * the icon top-right of the label, Analytics puts it top-left.
 */
export function StatTile({
  label,
  value,
  delta,
  deltaDirection,
  icon,
  iconTone = brand.iconTile,
  iconColor = brand.primary,
  valueColor = brand.text,
  valueSize = 26,
  iconFirst,
  countUp,
}: {
  label: string;
  value: string;
  delta?: string;
  /**
   * Draws the movement as an arrow beside the delta. The direction was an `↑`
   * typed into the string, which meant it came from whatever font the platform
   * fell back to for that codepoint — a different weight and size beside the
   * drawn icons in the same tile.
   */
  deltaDirection?: 'up' | 'down';
  icon: LineIconName;
  iconTone?: string;
  iconColor?: string;
  valueColor?: string;
  valueSize?: number;
  iconFirst?: boolean;
  /**
   * Counts the figure up on mount. Only for tiles whose value is a plain
   * number or a plain amount — the count-up parses digits out of the string
   * and puts the rest back, so it leaves `LKR` and `%` where they were.
   */
  countUp?: boolean;
}) {
  const square = (
    <View
      style={{
        width: 32,
        height: 32,
        borderRadius: 9,
        backgroundColor: iconTone,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <LineIcon name={icon} size={18} color={iconColor} />
    </View>
  );

  const shown = useAnimatedFigure(value, !!countUp);

  return (
    <ShopCard style={{ flex: 1, minHeight: 120 }} padding={16}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        {iconFirst ? square : null}
        <Txt flex={1} size={13} weight={600} color="#413F3F">
          {label}
        </Txt>
        {iconFirst ? null : square}
      </View>
      <View style={{ flex: 1, minHeight: 12 }} />
      <Txt size={valueSize} weight={700} tracking={-0.03} color={valueColor}>
        {shown}
      </Txt>
      {delta ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 }}>
          {deltaDirection ? (
            <LineIcon
              name={deltaDirection === 'up' ? 'arrowUp' : 'arrowDown'}
              size={13}
              color={deltaDirection === 'up' ? '#37BC1D' : '#F20000'}
              strokeWidth={2.4}
            />
          ) : null}
          <Txt
            size={13}
            weight={600}
            color={deltaDirection === 'down' ? '#F20000' : '#37BC1D'}
          >
            {delta}
          </Txt>
        </View>
      ) : null}
    </ShopCard>
  );
}

/** `LKR 4,820`, set the way every amount in this design is. */
export function Lkr({
  amount,
  size = 14,
  weight = 700,
  color = brand.text,
}: {
  amount: number;
  size?: number;
  weight?: 400 | 500 | 600 | 700;
  color?: string;
}) {
  return (
    <Txt size={size} weight={weight} color={color}>
      LKR {amount.toLocaleString('en-US')}
    </Txt>
  );
}

/** The circular avatar the order and customer rows use. */
export function ShopAvatar({ size = 44 }: { size?: number }) {
  return <LineIcon name="avatar" size={size} color={brand.text} strokeWidth={1.6} />;
}

/**
 * Counts the digits inside a formatted figure up to their final value.
 *
 * Splitting the string rather than taking a number keeps the caller honest:
 * a tile shows `LKR 80,000` or `92%`, and the prefix and suffix have to survive
 * the animation intact.
 */
function useAnimatedFigure(value: string, enabled: boolean): string {
  const match = value.match(/^(\D*)([\d,]+)(.*)$/);
  const target = match ? Number(match[2].replace(/,/g, '')) : 0;
  const shown = useCountUp(target, enabled && !!match);
  if (!match || !enabled) return value;
  return `${match[1]}${shown.toLocaleString('en-US')}${match[3]}`;
}
