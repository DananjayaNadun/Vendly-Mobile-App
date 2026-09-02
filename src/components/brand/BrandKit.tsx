import React from 'react';
import { TextInput, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';

import { Txt } from '@/components/Txt';
import { Tap } from '@/components/ui';
import { LineIcon, type LineIconName } from '@/icons/line';
import { useI18n } from '@/i18n';
import { familyFor } from '@/theme/fonts';
import { brand, brandRadius, brandSize, brandType } from '@/theme/brand';

/**
 * The controls the onboarding and authentication screens are assembled from.
 *
 * These are deliberately *not* the app's existing `ui.tsx` components. That set
 * is built on the themed "Ledger" palette — warm paper, indigo accent, a risk
 * ramp — and these screens are a different design language that renders the
 * same in both themes. Sharing the components would mean either theming these
 * screens (which the design does not do) or de-theming those (which would
 * restyle all 28 existing routes as a side effect).
 *
 * What they do share is `<Txt>`, so every label still resolves its font family
 * and its line height from the active locale. That is what stops these screens
 * being the one English-only corner of a trilingual app.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Buttons
// ─────────────────────────────────────────────────────────────────────────────

export function BrandButton({
  label,
  onPress,
  variant = 'primary',
  tall,
  pill,
  style,
  raised,
  icon,
}: {
  label: string;
  onPress?: () => void;
  /** `outline` is the white "I already have an account" button. */
  variant?: 'primary' | 'outline';
  /** The 69pt button used on onboarding and the OTP step. */
  tall?: boolean;
  /** Fully rounded, as the PDF draws the sign-in and onboarding CTAs. */
  pill?: boolean;
  style?: StyleProp<ViewStyle>;
  /** The floating CTA on the category picker. */
  raised?: boolean;
  /**
   * Drawn after the label. The category CTA carried its arrow as a `→` typed
   * into the translated string, which put the one glyph that has to line up
   * with the label's baseline outside the type system entirely — and gave the
   * Sinhala and Tamil builds an arrow from a fallback font.
   */
  icon?: LineIconName;
}) {
  const outline = variant === 'outline';
  const type = tall ? brandType.ctaTall : brandType.cta;

  return (
    <Tap
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[
        {
          // A minimum, not a fixed height: these labels are three languages
          // long, and Sinhala runs past the English measure.
          minHeight: tall ? brandSize.ctaTall : brandSize.cta,
          borderRadius: pill
            ? brandRadius.pill
            : tall
              ? brandRadius.ctaTall
              : brandRadius.cta,
          backgroundColor: outline ? brand.surface : brand.primary,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          paddingVertical: 10,
          paddingHorizontal: 20,
          ...(outline ? { borderWidth: 1, borderColor: brand.borderStrong } : null),
          ...(raised
            ? {
                shadowColor: brand.primary,
                shadowOpacity: 0.32,
                shadowRadius: 24,
                shadowOffset: { width: 0, height: 8 },
                elevation: 8,
              }
            : null),
        },
        style,
      ]}
    >
      <Txt
        size={type.size}
        weight={outline ? 500 : type.weight}
        align="center"
        color={outline ? brand.text : brand.onPrimary}
      >
        {label}
      </Txt>
      {icon ? (
        <LineIcon
          name={icon}
          size={Math.round(type.size * 0.95)}
          color={outline ? brand.text : brand.onPrimary}
          strokeWidth={2.2}
        />
      ) : null}
    </Tap>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Fields
// ─────────────────────────────────────────────────────────────────────────────

export function BrandField({
  label,
  placeholder,
  value,
  onChange,
  secure,
  keyboard,
  autoComplete,
  error,
}: {
  label: string;
  placeholder?: string;
  value?: string;
  onChange?: (next: string) => void;
  secure?: boolean;
  keyboard?: 'email-address' | 'phone-pad' | 'default';
  autoComplete?: 'email' | 'tel' | 'name' | 'off';
  /** Shown under the field in red, and swaps the border to match. */
  error?: string;
}) {
  const { script } = useI18n();

  return (
    <View style={{ gap: 9 }}>
      <Txt size={brandType.label.size} weight={brandType.label.weight} color={brand.text}>
        {label}
      </Txt>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#B4B4B4"
        secureTextEntry={secure}
        keyboardType={keyboard ?? 'default'}
        autoComplete={autoComplete}
        autoCapitalize={keyboard === 'email-address' ? 'none' : 'sentences'}
        accessibilityLabel={label}
        style={{
          // Taller and more rounded than the HTML prototype's 49pt box, with a
          // hairline outline rather than a grey fill — as the PDF draws it.
          minHeight: brandSize.field,
          borderRadius: brandRadius.otp,
          backgroundColor: brand.field,
          borderWidth: error ? 1.5 : 1,
          borderColor: error ? '#F20000' : brand.fieldBorder,
          paddingHorizontal: 16,
          paddingVertical: 14,
          fontFamily: familyFor(script, 400, false),
          fontSize: brandType.field.size,
          color: brand.text,
        }}
      />
      {error ? (
        <Txt size={12} weight={500} color="#F20000">
          {error}
        </Txt>
      ) : null}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Links and spacing
// ─────────────────────────────────────────────────────────────────────────────

/** A text link rendered inline inside a sentence. */
export function BrandLink({
  label,
  onPress,
  color = brand.link,
  size = 13,
  weight = 600,
  style,
}: {
  label: string;
  onPress?: () => void;
  color?: string;
  size?: number;
  weight?: 400 | 500 | 600 | 700;
  style?: StyleProp<TextStyle>;
}) {
  return (
    <Tap onPress={onPress} feedback="opacity" hitSlop={8} accessibilityRole="link">
      <Txt size={size} weight={weight} color={color} style={style}>
        {label}
      </Txt>
    </Tap>
  );
}

/** Fixed vertical space, as the prototype spells its gaps out. */
export function Gap({ h }: { h: number }) {
  return <View style={{ height: h }} />;
}
