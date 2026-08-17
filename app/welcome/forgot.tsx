import { router } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandButton, BrandField, BrandLink, Gap } from '@/components/brand/BrandKit';
import { ShopNav } from '@/components/brand/ShopNav';
import { Txt } from '@/components/Txt';
import { LineIcon } from '@/icons/line';
import { useI18n } from '@/i18n';
import { brand, brandRadius, brandSize } from '@/theme/brand';
import { Rise } from '@/theme/motion';

/**
 * 04 · Reset password.
 *
 * The tinted explainer card carries the whole message, so the field below it
 * needs no helper text of its own.
 */
export default function ForgotPasswordScreen() {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: brand.canvas }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ShopNav title={t('auth.resetTitle')} tone="canvas" onBack />

      <ScrollView
        contentContainerStyle={{
          paddingTop: 41,
          paddingHorizontal: brandSize.formGutter,
          paddingBottom: insets.bottom + 40,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <Rise
          style={{
            borderRadius: brandRadius.info,
            backgroundColor: brand.infoCard,
            padding: 26,
            flexDirection: 'row',
            gap: 16,
            alignItems: 'flex-start',
          }}
        >
          <View
            style={{
              width: 46,
              height: 46,
              borderRadius: 14,
              backgroundColor: brand.surface,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <LineIcon name="lock" size={24} color={brand.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Txt size={16} weight={600} tracking={-0.012} color={brand.text}>
              {t('auth.resetHeading')}
            </Txt>
            <Gap h={12} />
            <Txt size={13} leading={1.55} color={brand.body}>
              {t('auth.resetBody')}
            </Txt>
          </View>
        </Rise>

        <Gap h={38} />
        <Rise index={1}>
          <BrandField
            label={t('auth.email')}
            placeholder={t('auth.emailPlaceholder')}
            value={email}
            onChange={setEmail}
            keyboard="email-address"
            autoComplete="email"
          />
        </Rise>

        <Gap h={24} />
        <Rise index={2}>
          <BrandButton
            pill
            tall
            label={t('auth.sendReset')}
            onPress={() => router.push('/welcome/otp?mode=reset')}
          />
        </Rise>

        <Gap h={29} />
        <Rise index={3} style={{ alignItems: 'center' }}>
          <BrandLink
            label={t('auth.backToLogin')}
            color={brand.text}
            size={16}
            onPress={() => router.back()}
          />
        </Rise>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
