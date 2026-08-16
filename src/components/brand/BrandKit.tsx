import { router } from 'expo-router';
import React from 'react';
import { TextInput, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Txt } from '@/components/Txt';
import { Tap } from '@/components/ui';
import { useI18n, useT } from '@/i18n';
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
          alignItems: 'center',
          justifyContent: 'center',
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
}: {
  label: string;
  placeholder?: string;
  value?: string;
  onChange?: (next: string) => void;
  secure?: boolean;
  keyboard?: 'email-address' | 'phone-pad' | 'default';
  autoComplete?: 'email' | 'tel' | 'name' | 'off';
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
        style={{
          // Taller and more rounded than the HTML prototype's 49pt box, with a
          // hairline outline rather than a grey fill — as the PDF draws it.
          minHeight: brandSize.field,
          borderRadius: brandRadius.otp,
          backgroundColor: brand.field,
          borderWidth: 1,
          borderColor: brand.fieldBorder,
          paddingHorizontal: 16,
          paddingVertical: 14,
          fontFamily: familyFor(script, 400, false),
          fontSize: brandType.field.size,
          color: brand.text,
        }}
      />
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Chrome
// ─────────────────────────────────────────────────────────────────────────────

/** The auth app bar: a rounded back chip, a title, and optional trailing content. */
export function BrandBar({
  title,
  onBack,
  background = brand.canvas,
  borderColor = brand.divider,
  borderWidth = 1,
  trailing,
}: {
  title: string;
  onBack?: () => void;
  background?: string;
  borderColor?: string;
  borderWidth?: number;
  trailing?: React.ReactNode;
}) {
  const t = useT();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        paddingTop: insets.top,
        backgroundColor: background,
        borderBottomWidth: borderWidth,
        borderBottomColor: borderColor,
      }}
    >
      <View
        style={{
          minHeight: brandSize.appBar,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          paddingHorizontal: 14,
        }}
      >
        <Tap
          onPress={onBack ?? (() => router.back())}
          accessibilityRole="button"
          accessibilityLabel={t('common.back')}
          hitSlop={10}
          style={{
            width: brandSize.backChip.width,
            height: brandSize.backChip.height,
            borderRadius: brandRadius.backChip,
            backgroundColor: brand.backChip,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Txt size={14} color={brand.backChipInk}>
            ←
          </Txt>
        </Tap>
        <Txt
          flex={1}
          size={brandType.barTitle.size}
          weight={brandType.barTitle.weight}
          color={brand.text}
          numberOfLines={1}
        >
          {title}
        </Txt>
        {trailing}
      </View>
    </View>
  );
}

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
