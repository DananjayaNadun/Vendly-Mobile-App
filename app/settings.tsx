import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Toast } from '@/components/Overlays';
import { Txt } from '@/components/Txt';
import { Tap } from '@/components/ui';
import { shop } from '@/data/shop';
import { LineIcon, type LineIconName } from '@/icons/line';
import {
  localeLabels,
  localeScripts,
  useI18n,
  type Locale,
  type TranslationKey,
} from '@/i18n';
import { brand, brandChip, brandRadius } from '@/theme/brand';

/**
 * 09 · Settings.
 *
 * Full-bleed rows with hairline separators, an identity block at the top and
 * the logout pill on its right. Reached from the avatar on Home.
 */

type Row = { key: string; icon: LineIconName; label: TranslationKey; href?: string };

const BUSINESS: Row[] = [
  { key: 'profile', icon: 'store', label: 'shop.businessProfile', href: '/business-profile' },
  { key: 'website', icon: 'globe', label: 'shop.websiteBuilder' },
  { key: 'courier', icon: 'truck', label: 'shop.courierManagement', href: '/couriers' },
  { key: 'payment', icon: 'card', label: 'shop.paymentManagement' },
];

export default function SettingsScreen() {
  const { t, locale, setLocale } = useI18n();
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(timer);
  }, [toast]);

  const open = (row: Row) => {
    if (row.href) router.push(row.href);
    else setToast(t('shop.premiumOnly', { feature: t(row.label) }));
  };

  return (
    <View style={{ flex: 1, backgroundColor: brand.canvas }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <Txt
          size={25}
          weight={700}
          tracking={-0.028}
          color={brand.text}
          style={{ paddingTop: insets.top + 14, paddingHorizontal: 20, paddingBottom: 18 }}
        >
          {t('shop.settings')}
        </Txt>

        <Rule />

        {/* ── Identity ─────────────────────────────────────────────────── */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 16,
            paddingHorizontal: 18,
            paddingVertical: 16,
          }}
        >
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 13,
              borderWidth: 1.6,
              borderColor: brand.text,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <LineIcon name="avatar" size={26} color={brand.text} strokeWidth={1.6} />
          </View>

          <View style={{ flex: 1, gap: 6 }}>
            <Txt size={19} weight={600} tracking={-0.014} color={brand.text}>
              {shop.owner}
            </Txt>
            <Txt size={12.5} color="#A8A8A8">
              {shop.email}
            </Txt>
            <View
              style={{
                alignSelf: 'flex-start',
                backgroundColor: brandChip.blue.bg,
                borderRadius: brandRadius.chip,
                paddingVertical: 2,
                paddingHorizontal: 8,
              }}
            >
              <Txt size={9.5} weight={700} color="#000DFF">
                {shop.plan}
              </Txt>
            </View>
          </View>

          <Tap
            onPress={() => router.replace('/welcome')}
            accessibilityRole="button"
            accessibilityLabel={t('shop.logout')}
            style={{
              minHeight: 30,
              borderRadius: brandRadius.social,
              backgroundColor: brandChip.red.bg,
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: 22,
            }}
          >
            <Txt size={11.5} weight={700} color="#F20000">
              {t('shop.logout')}
            </Txt>
          </Tap>
        </View>

        <Rule />

        <Txt
          size={11.5}
          weight={700}
          tracking={0.096}
          color="#595959"
          style={{ paddingTop: 24, paddingBottom: 12, paddingHorizontal: 26 }}
        >
          {t('shop.business')}
        </Txt>

        {BUSINESS.map((row) => (
          <SettingsRow key={row.key} row={row} onPress={() => open(row)} />
        ))}

        <Txt
          size={14}
          weight={600}
          color="#595959"
          style={{ paddingTop: 24, paddingBottom: 12, paddingHorizontal: 26 }}
        >
          {t('shop.analyticsGroup')}
        </Txt>
        <SettingsRow
          row={{ key: 'reports', icon: 'chart', label: 'shop.reportsDashboard' }}
          onPress={() => router.push('/analytics')}
        />

        {/* ── Language ────────────────────────────────────────────────────
            Not in the design, which is English-only — but the app ships three
            languages and this screen replaced the one that used to carry the
            switcher. Without it Sinhala and Tamil are unreachable and the whole
            i18n layer is dead weight. Each label renders in its own script. */}
        <Txt
          size={14}
          weight={600}
          color="#595959"
          style={{ paddingTop: 24, paddingBottom: 12, paddingHorizontal: 26 }}
        >
          {t('account.preferences')}
        </Txt>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 14,
            minHeight: 52,
            paddingHorizontal: 24,
            borderBottomWidth: 1,
            borderBottomColor: '#E6E6E6',
          }}
        >
          <LineIcon name="globe" size={19} color={brand.primary} />
          <Txt flex={1} size={14} weight={500} color={brand.text}>
            {t('more.language')}
          </Txt>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {(['en', 'si', 'ta'] as Locale[]).map((l) => {
              const active = l === locale;
              return (
                <Tap
                  key={l}
                  onPress={() => setLocale(l)}
                  accessibilityRole="radio"
                  aria-checked={active}
                  accessibilityLabel={localeLabels[l]}
                  style={{
                    minWidth: 44,
                    minHeight: 30,
                    borderRadius: brandRadius.social,
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingHorizontal: 10,
                    backgroundColor: active ? brand.primary : brand.fill,
                  }}
                >
                  <Txt
                    size={12.5}
                    weight={600}
                    script={localeScripts[l]}
                    color={active ? brand.onPrimary : brand.body}
                  >
                    {localeLabels[l]}
                  </Txt>
                </Tap>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <Toast visible={!!toast} title={toast ?? ''} bottom={28} />
    </View>
  );
}

function Rule() {
  return <View style={{ height: 1, backgroundColor: brand.border }} />;
}

function SettingsRow({ row, onPress }: { row: Row; onPress: () => void }) {
  const { t } = useI18n();
  return (
    <Tap
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={t(row.label)}
      feedback="highlight"
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        minHeight: 52,
        paddingHorizontal: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#E6E6E6',
      }}
    >
      <LineIcon name={row.icon} size={19} color={brand.primary} />
      <Txt flex={1} size={14} weight={500} color={brand.text}>
        {t(row.label)}
      </Txt>
      <LineIcon name="chevronRight" size={15} color="#C0C0C0" />
    </Tap>
  );
}
