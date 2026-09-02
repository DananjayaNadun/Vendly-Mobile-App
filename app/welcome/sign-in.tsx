import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandButton, BrandField, BrandLink } from '@/components/brand/BrandKit';
import { ShopNav } from '@/components/brand/ShopNav';
import { SocialRow } from '@/components/brand/Social';
import { LineIcon } from '@/icons/line';
import { Toast } from '@/components/Overlays';
import { Txt } from '@/components/Txt';
import { useI18n } from '@/i18n';
import { brand, brandSize } from '@/theme/brand';
import { Rise } from '@/theme/motion';

/**
 * 03 · Sign in.
 *
 * A solid blue header over the form. Nothing here authenticates — there is no
 * backend — so "Sign in" enters the app the way the prototype's own flow does.
 * No credential is stored, sent or validated anywhere.
 */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignInScreen() {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3400);
    return () => clearTimeout(timer);
  }, [toast]);

  const emailError = touched && !EMAIL_RE.test(email.trim()) ? t('auth.emailInvalid') : undefined;
  const passwordError = touched && !password ? t('auth.passwordRequired') : undefined;
  const canSubmit = EMAIL_RE.test(email.trim()) && !!password;

  const submit = () => {
    if (!canSubmit) {
      setTouched(true);
      return;
    }
    router.replace('/home');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: brand.canvas }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* The one nav in the app that is not a bar over content — the blue
            band *is* the top of this page. Same component, `primary` tone. */}
        <ShopNav
          tone="primary"
          titleSize={29}
          onBack
          title={t('auth.welcomeBack')}
          trailing={
            <View style={{ opacity: 0.9 }}>
              <LineIcon name="hand" size={30} color={brand.onPrimary} strokeWidth={1.6} />
            </View>
          }
          subtitle={t('auth.signInSub')}
          style={{ paddingBottom: 18 }}
        />

        <Rise
          index={1}
          style={{ paddingTop: 34, paddingHorizontal: brandSize.formGutter, gap: 20 }}
        >
          <BrandField
            label={t('auth.email')}
            value={email}
            onChange={setEmail}
            keyboard="email-address"
            autoComplete="email"
            error={emailError}
          />
          <BrandField
            label={t('auth.password')}
            value={password}
            onChange={setPassword}
            secure
            error={passwordError}
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
        </Rise>

        <Rise index={2} style={{ paddingTop: 24, paddingHorizontal: brandSize.gutter }}>
          <BrandButton pill tall label={t('auth.signIn')} onPress={submit} />
        </Rise>

        <Rise
          index={3}
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
        </Rise>

        <Rise index={4}>
          <SocialRow onPress={(provider) => setToast(t('shop.socialSoon', { provider }))} />
        </Rise>

        <Rise
          index={5}
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
        </Rise>
      </ScrollView>

      <Toast visible={!!toast} title={toast ?? ''} bottom={28} />
    </KeyboardAvoidingView>
  );
}
