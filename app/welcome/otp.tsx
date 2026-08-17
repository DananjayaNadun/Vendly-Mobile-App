import { router, useLocalSearchParams } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Animated, ScrollView, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandButton, Gap } from '@/components/brand/BrandKit';
import { ShopNav } from '@/components/brand/ShopNav';
import { Txt } from '@/components/Txt';
import { LineIcon } from '@/icons/line';
import { useI18n } from '@/i18n';
import { familyFor } from '@/theme/fonts';
import { brand, brandRadius, brandSize, brandType } from '@/theme/brand';
import { Rise, usePop } from '@/theme/motion';

/**
 * 05 · Verification — one screen, two jobs.
 *
 * `?mode=reset` is the password-reset code and returns to sign-in; anything else
 * is the phone verification that follows sign-up and continues to the category
 * picker. The design draws them as separate frames that differ only in title,
 * bar colour, the phone glyph and where the two buttons go, so they are one
 * screen here rather than two near-identical files.
 */
const LENGTH = 6;

export default function OtpScreen() {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const isReset = mode === 'reset';

  const [digits, setDigits] = useState<string[]>(Array(LENGTH).fill(''));
  const boxes = useRef<(TextInput | null)[]>([]);

  const setDigit = (index: number, raw: string) => {
    const value = raw.replace(/[^0-9]/g, '').slice(-1);
    setDigits((prev) => prev.map((d, i) => (i === index ? value : d)));
    // Advance on entry, retreat on delete — a six-box code is unusable without it.
    if (value && index < LENGTH - 1) boxes.current[index + 1]?.focus();
    if (!value && index > 0) boxes.current[index - 1]?.focus();
  };

  return (
    <View style={{ flex: 1, backgroundColor: brand.canvas }}>
      <ShopNav
        title={isReset ? t('auth.verificationTitle') : t('auth.verifyTitle')}
        tone={isReset ? 'canvas' : 'surface'}
        onBack
      />

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        keyboardShouldPersistTaps="handled"
      >
        {isReset ? null : (
          <Rise style={{ alignItems: 'center', paddingTop: 46 }}>
            <View
              style={{
                width: 62,
                height: 62,
                borderRadius: 20,
                backgroundColor: brand.iconTile,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <LineIcon name="mobile" size={30} color={brand.primary} />
            </View>
          </Rise>
        )}

        <Rise index={1} style={{ paddingTop: 26, alignItems: 'center', paddingHorizontal: 24 }}>
          <Txt
            size={brandType.lead.size}
            weight={brandType.lead.weight}
            tracking={brandType.lead.tracking}
            align="center"
            color={brand.text}
          >
            {t('auth.otpHeading')}
          </Txt>
          <Gap h={16} />
          <Txt size={13} align="center" color={brand.faint}>
            {t('auth.otpSentTo')}
          </Txt>
          <Gap h={4} />
          <Txt size={12.5} weight={600} mono align="center" color={brand.text}>
            {t('auth.otpNumber')}
          </Txt>
        </Rise>

        {/* ── The code ─────────────────────────────────────────────────── */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 10,
            paddingTop: 38,
            paddingHorizontal: 16,
          }}
        >
          {digits.map((digit, i) => (
            <OtpBox
              key={i}
              index={i}
              value={digit}
              label={t('auth.otpDigit', { n: i + 1 })}
              inputRef={(el) => {
                boxes.current[i] = el;
              }}
              onChange={(v) => setDigit(i, v)}
              onBackspace={() => {
                if (!digit && i > 0) boxes.current[i - 1]?.focus();
              }}
            />
          ))}
        </View>

        <Rise index={8} style={{ paddingTop: 32, paddingHorizontal: brandSize.gutter }}>
          <BrandButton
            pill
            tall
            label={t('auth.verifyCode')}
            onPress={() =>
              isReset ? router.replace('/welcome/sign-in') : router.replace('/welcome/category')
            }
          />
        </Rise>

        <Rise
          index={9}
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 4,
            paddingTop: 38,
            paddingHorizontal: 24,
          }}
        >
          <Txt size={12.5} align="center" color="#919191">
            {t('auth.notReceived')}
          </Txt>
          <Txt size={12.5} weight={600} align="center" color={brand.resend}>
            {t('auth.resendIn', { time: '0:45' })}
          </Txt>
        </Rise>

        <Rise
          index={10}
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 4,
            paddingTop: 34,
            paddingHorizontal: 24,
          }}
        >
          <LineIcon name="lock" size={14} color="#707070" />
          <Txt size={13} align="center" color="#707070">
            {t('auth.expiresIn')}
          </Txt>
          <Txt size={13} weight={600} mono align="center" color={brand.text}>
            9:15
          </Txt>
        </Rise>
      </ScrollView>
    </View>
  );
}

/**
 * One box of the code.
 *
 * The box springs when it takes a digit. Six identical squares with a border
 * that changes colour give almost no signal that the keystroke landed —
 * especially on a phone, where the thumb covers the box being typed into.
 */
function OtpBox({
  index,
  value,
  label,
  inputRef,
  onChange,
  onBackspace,
}: {
  index: number;
  value: string;
  label: string;
  /** Handed the instance so the parent can move focus along the row. */
  inputRef: (el: TextInput | null) => void;
  onChange: (next: string) => void;
  onBackspace: () => void;
}) {
  const scale = usePop(value, !!value);

  return (
    <Rise index={2 + index}>
      <Animated.View style={{ transform: [{ scale }] }}>
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={onChange}
          onKeyPress={({ nativeEvent }) => {
            if (nativeEvent.key === 'Backspace') onBackspace();
          }}
          maxLength={1}
          keyboardType="number-pad"
          accessibilityLabel={label}
          style={{
            width: brandSize.otpBox.width,
            height: brandSize.otpBox.height,
            borderRadius: brandRadius.otp,
            backgroundColor: brand.surface,
            borderWidth: 2,
            borderColor: value ? brand.otpFilled : brand.otpEmpty,
            textAlign: 'center',
            fontFamily: familyFor('latin', 600, true),
            fontSize: 24,
            color: brand.text,
            padding: 0,
          }}
        />
      </Animated.View>
    </Rise>
  );
}
