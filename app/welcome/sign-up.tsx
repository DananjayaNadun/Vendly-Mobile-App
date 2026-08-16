import { router } from 'expo-router';
import React, { useState } from 'react';
import { Animated, KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandBar, BrandButton, BrandField, Gap } from '@/components/brand/BrandKit';
import { Txt } from '@/components/Txt';
import { Tap } from '@/components/ui';
import { useI18n, type TranslationKey } from '@/i18n';
import { brand, brandSize, brandType } from '@/theme/brand';
import { Rise, useAnimatedNumber } from '@/theme/motion';

/**
 * 06 · Create account.
 *
 * Six fields and a consent checkbox. Nothing is submitted anywhere — the CTA
 * moves to phone verification, as the prototype's flow does.
 */

type Field = {
  key: string;
  label: TranslationKey;
  placeholder: TranslationKey;
  secure?: boolean;
  keyboard?: 'email-address' | 'phone-pad';
  autoComplete?: 'email' | 'tel' | 'name';
};

const FIELDS: Field[] = [
  { key: 'name', label: 'auth.fullName', placeholder: 'auth.fullNamePlaceholder', autoComplete: 'name' },
  { key: 'business', label: 'auth.businessName', placeholder: 'auth.businessNamePlaceholder' },
  { key: 'phone', label: 'auth.phone', placeholder: 'auth.phonePlaceholder', keyboard: 'phone-pad', autoComplete: 'tel' },
  { key: 'email', label: 'auth.email', placeholder: 'auth.emailPlaceholder', keyboard: 'email-address', autoComplete: 'email' },
  { key: 'password', label: 'auth.password', placeholder: 'auth.passwordPlaceholder', secure: true },
  { key: 'confirm', label: 'auth.confirmPassword', placeholder: 'auth.passwordPlaceholder', secure: true },
];

export default function SignUpScreen() {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const [values, setValues] = useState<Record<string, string>>({});
  const [agreed, setAgreed] = useState(true);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: brand.canvas }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <BrandBar
        title={t('auth.createTitle')}
        background={brand.surface}
        borderColor="#EDEDED"
        borderWidth={2}
      />

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <Rise style={{ paddingTop: 30, paddingHorizontal: 43 }}>
          <Txt
            size={brandType.heading.size}
            weight={brandType.heading.weight}
            tracking={brandType.heading.tracking}
            color={brand.text}
          >
            {t('auth.createHeading')}
          </Txt>
          <Gap h={14} />
          <Txt size={13.5} color="#8D8D8D">
            {t('auth.createSub')}
          </Txt>
        </Rise>

        <View style={{ paddingTop: 24, paddingHorizontal: 36, gap: 20 }}>
          {FIELDS.map((field, i) => (
            <Rise key={field.key} index={1 + i}>
              <BrandField
                label={t(field.label)}
                placeholder={t(field.placeholder)}
                value={values[field.key] ?? ''}
                onChange={(next) => setValues((prev) => ({ ...prev, [field.key]: next }))}
                secure={field.secure}
                keyboard={field.keyboard}
                autoComplete={field.autoComplete}
              />
            </Rise>
          ))}
        </View>

        {/* ── Consent ──────────────────────────────────────────────────── */}
        <Rise
          index={7}
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: 8,
            paddingTop: 26,
            paddingHorizontal: 43,
          }}
        >
          <Tap
            onPress={() => setAgreed((was) => !was)}
            accessibilityRole="checkbox"
            // `aria-checked` rather than `accessibilityState`: react-native-web
            // does not map the latter onto this role, so the box announced with
            // no state at all. RN understands this alias on native too.
            aria-checked={agreed}
            accessibilityLabel={t('auth.agreeLabel')}
            hitSlop={10}
            style={{
              width: 18,
              height: 18,
              borderRadius: 5,
              marginTop: 2,
              borderWidth: 1.5,
              borderColor: agreed ? brand.primary : '#B9B9B9',
              backgroundColor: agreed ? brand.primary : brand.surface,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CheckMark on={agreed} />
          </Tap>

          <Txt flex={1} size={12.5} leading={1.55} color={brand.text}>
            {t('auth.agreePrefix')}{' '}
            <Txt size={12.5} weight={600} color={brand.linkSoft}>
              {t('auth.agreeTerms')}
            </Txt>{' '}
            {t('auth.agreeAnd')}{' '}
            <Txt size={12.5} weight={600} color={brand.linkSoft}>
              {t('auth.agreePrivacy')}
            </Txt>
          </Txt>
        </Rise>

        <Rise index={8} style={{ paddingTop: 26, paddingHorizontal: brandSize.gutter }}>
          <BrandButton
            pill
            tall
            label={t('auth.createTitle')}
            // The consent box is the one real gate on this screen, so it has to
            // actually gate something.
            onPress={agreed ? () => router.push('/welcome/otp') : undefined}
            style={agreed ? undefined : { opacity: 0.45 }}
          />
        </Rise>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/**
 * The consent tick.
 *
 * Springs in rather than appearing, because the box is 18pt square and its
 * fill colour changing underneath a glyph that simply blinks on is easy to
 * miss — and this is the one control on the screen that gates the CTA.
 */
function CheckMark({ on }: { on: boolean }) {
  const anim = useAnimatedNumber(on ? 1 : 0);
  return (
    <Animated.View style={{ opacity: anim, transform: [{ scale: anim }] }}>
      <Txt size={11} weight={700} color={brand.onPrimary}>
        ✓
      </Txt>
    </Animated.View>
  );
}
