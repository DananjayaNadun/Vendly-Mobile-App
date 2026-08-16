import { router } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandBar, BrandButton, BrandField, BrandLink, Gap } from '@/components/brand/BrandKit';
import { Txt } from '@/components/Txt';
import { useI18n } from '@/i18n';
import { brand, brandRadius, brandSize } from '@/theme/brand';

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
      <BrandBar title={t('auth.resetTitle')} />

      <ScrollView
        contentContainerStyle={{
          paddingTop: 41,
          paddingHorizontal: brandSize.formGutter,
          paddingBottom: insets.bottom + 40,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={{
            borderRadius: brandRadius.info,
            backgroundColor: brand.infoCard,
            padding: 26,
            flexDirection: 'row',
            gap: 16,
            alignItems: 'flex-start',
          }}
        >
          <Txt size={32}>🔐</Txt>
          <View style={{ flex: 1 }}>
            <Txt size={16} weight={600} tracking={-0.012} color={brand.text}>
              {t('auth.resetHeading')}
            </Txt>
            <Gap h={12} />
            <Txt size={13} leading={1.55} color={brand.body}>
              {t('auth.resetBody')}
            </Txt>
          </View>
        </View>

        <Gap h={38} />
        <BrandField
          label={t('auth.email')}
          placeholder={t('auth.emailPlaceholder')}
          value={email}
          onChange={setEmail}
          keyboard="email-address"
          autoComplete="email"
        />

        <Gap h={24} />
        <BrandButton
          pill
          tall
          label={t('auth.sendReset')}
          onPress={() => router.push('/welcome/otp?mode=reset')}
        />

        <Gap h={29} />
        <View style={{ alignItems: 'center' }}>
          <BrandLink
            label={t('auth.backToLogin')}
            color={brand.text}
            size={16}
            onPress={() => router.back()}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
