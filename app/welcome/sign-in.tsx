import { router } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandButton, BrandField, BrandLink, Gap } from '@/components/brand/BrandKit';
import { SocialRow } from '@/components/brand/Social';
import { Txt } from '@/components/Txt';
import { useI18n } from '@/i18n';
import { brand, brandSize } from '@/theme/brand';

/**
 * 03 · Sign in.
 *
 * A solid blue header over the form. Nothing here authenticates — there is no
 * backend — so "Sign in" enters the app the way the prototype's own flow does.
 * No credential is stored, sent or validated anywhere.
 */
export default function SignInScreen() {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: brand.canvas }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={{
            backgroundColor: brand.primary,
            paddingTop: insets.top + 30,
            paddingBottom: 30,
            paddingHorizontal: 32,
          }}
        >
          <Txt size={30} weight={700} tracking={-0.02} color={brand.onPrimary}>
            {t('auth.welcomeBack')}
          </Txt>
          <Gap h={8} />
          <Txt size={13.5} color={brand.onPrimaryMuted}>
            {t('auth.signInSub')}
          </Txt>
        </View>

        <View style={{ paddingTop: 34, paddingHorizontal: brandSize.formGutter, gap: 20 }}>
          <BrandField
            label={t('auth.email')}
            value={email}
            onChange={setEmail}
            keyboard="email-address"
            autoComplete="email"
          />
          <BrandField
            label={t('auth.password')}
            value={password}
            onChange={setPassword}
            secure
          />
          <View style={{ alignItems: 'flex-end' }}>
            <BrandLink
              label={t('auth.forgot')}
              size={14}
              weight={500}
              color={brand.linkAlt}
              onPress={() => router.push('/welcome/forgot')}
            />
          </View>
        </View>

        <View style={{ paddingTop: 24, paddingHorizontal: brandSize.gutter }}>
          <BrandButton pill tall label={t('auth.signIn')} onPress={() => router.replace('/home')} />
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 14,
            paddingTop: 42,
            paddingHorizontal: 56,
          }}
        >
          <View style={{ flex: 1, height: 1, backgroundColor: brand.rule }} />
          <Txt size={13} color="#8B8B8B">
            {t('auth.orContinue')}
          </Txt>
          <View style={{ flex: 1, height: 1, backgroundColor: brand.rule }} />
        </View>

        <SocialRow />

        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 5,
            paddingTop: 34,
          }}
        >
          <Txt size={14} color={brand.text}>
            {t('auth.noAccount')}
          </Txt>
          <BrandLink
            label={t('auth.signUp')}
            size={14}
            color={brand.linkAlt}
            onPress={() => router.push('/welcome/sign-up')}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
