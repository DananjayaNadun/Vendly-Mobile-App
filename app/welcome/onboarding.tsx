import { router } from 'expo-router';
import React from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Brandmark, BrandGradient } from '@/components/brand/Brandmark';
import { BrandButton, BrandLink, Gap } from '@/components/brand/BrandKit';
import { Txt } from '@/components/Txt';
import { LineIcon, type LineIconName } from '@/icons/line';
import { useI18n, type TranslationKey } from '@/i18n';
import { brand, brandRadius, brandSize, brandType } from '@/theme/brand';

/**
 * 02 · Onboarding.
 *
 * The gradient hero carries the mark, the wordmark and the four things the app
 * does; the sheet below carries the two ways in. The hero is proportional
 * rather than the prototype's fixed 612pt, so the buttons stay on-screen on a
 * shorter device.
 */

const TILES: { icon: LineIconName; key: TranslationKey }[] = [
  { icon: 'orders', key: 'auth.tile.orders' },
  { icon: 'box', key: 'auth.tile.inventory' },
  { icon: 'users', key: 'auth.tile.customers' },
  { icon: 'chart', key: 'auth.tile.analytics' },
];

export default function OnboardingScreen() {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: brand.canvas }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} bounces={false}>
        <BrandGradient
          style={{
            paddingTop: insets.top + 56,
            paddingBottom: 64,
            paddingHorizontal: 24,
            alignItems: 'center',
          }}
        >
          {/* The mark *is* the V: "endly.lk" runs off it on the same baseline.
              Labelled as a whole, because the letterform is drawn rather than
              typed — a screen reader would otherwise announce "endly.lk". */}
          <View
            accessible
            accessibilityRole="image"
            accessibilityLabel="Vendly.lk"
            style={{ flexDirection: 'row', alignItems: 'flex-end' }}
          >
            <Brandmark size={124} />
            <Txt
              size={44}
              weight={700}
              tracking={-0.03}
              color={brand.onPrimary}
              style={{ marginLeft: -14, marginBottom: 12 }}
            >
              endly
              <Txt size={44} weight={700} tracking={-0.03} color={brand.spark}>
                .lk
              </Txt>
            </Txt>
          </View>

          <Gap h={26} />
          <Txt
            size={16}
            weight={500}
            align="center"
            color="rgba(255,255,255,0.92)"
            style={{ fontStyle: 'italic' }}
          >
            {t('auth.tagline')}
          </Txt>

          <Gap h={72} />
          <View style={{ flexDirection: 'row', gap: 14 }}>
            {TILES.map((tile) => (
              <View key={tile.key} style={{ alignItems: 'center', gap: 8, width: 74 }}>
                <View
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: brandRadius.tile,
                    backgroundColor: brand.heroTile,
                    borderWidth: 1,
                    borderColor: brand.heroTileBorder,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <LineIcon name={tile.icon} size={26} color={brand.onPrimary} />
                </View>
                <Txt size={12.5} weight={500} align="center" color="rgba(255,255,255,0.94)">
                  {t(tile.key)}
                </Txt>
              </View>
            ))}
          </View>
        </BrandGradient>

        <View
          style={{
            paddingTop: 34,
            paddingHorizontal: brandSize.gutter,
            paddingBottom: insets.bottom + 28,
          }}
        >
          <BrandButton
            tall
            label={t('auth.getStarted')}
            onPress={() => router.push('/welcome/sign-up')}
          />
          <Gap h={16} />
          <BrandButton
            tall
            variant="outline"
            label={t('auth.haveAccount')}
            onPress={() => router.push('/welcome/sign-in')}
          />

          <Gap h={34} />
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <Txt size={12.5} leading={1.5} align="center" color="#6B6B6B">
              {t('auth.terms')}
            </Txt>
            <BrandLink label={t('auth.termsLink')} size={12.5} weight={500} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
