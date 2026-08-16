import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SheetRow, ShopSheet } from '@/components/brand/ShopSheet';
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
import { Rise } from '@/theme/motion';

/**
 * 09 · Settings.
 *
 * Full-bleed rows with hairline separators, an identity block at the top and
 * the logout pill on its right. Reached from the avatar on Home.
 *
 * The rows arrive in one continuous stagger across the three groups, so the
 * page reads as a single list broken by headings rather than three lists.
 */

type Row = { key: string; icon: LineIconName; label: TranslationKey; href?: string };

/**
 * Each language named in itself, which is the one label a speaker can always
 * recognise. `<Txt script>` renders each in its own face — Instrument Sans has
 * no coverage for either of the other two.
 */
const LANGUAGE_NAMES: Record<Locale, string> = {
  en: 'English',
  si: 'සිංහල',
  ta: 'தமிழ்',
};

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
  const [langOpen, setLangOpen] = useState(false);

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
        <Rise
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
        </Rise>

        <Rule />

        <Rise index={1}>
          <Txt
            size={11.5}
            weight={700}
            tracking={0.096}
            color="#595959"
            style={{ paddingTop: 24, paddingBottom: 12, paddingHorizontal: 26 }}
          >
            {t('shop.business')}
          </Txt>
        </Rise>

        {BUSINESS.map((row, i) => (
          <SettingsRow key={row.key} row={row} index={2 + i} onPress={() => open(row)} />
        ))}

        <Rise index={6}>
          <Txt
            size={14}
            weight={600}
            color="#595959"
            style={{ paddingTop: 24, paddingBottom: 12, paddingHorizontal: 26 }}
          >
            {t('shop.analyticsGroup')}
          </Txt>
        </Rise>
        <SettingsRow
          row={{ key: 'reports', icon: 'chart', label: 'shop.reportsDashboard' }}
          index={7}
          onPress={() => router.push('/analytics')}
        />

        {/* ── Language ────────────────────────────────────────────────────
            Not in the design, which is English-only — but the app ships three
            languages and this screen replaced the one that used to carry the
            switcher. Without it Sinhala and Tamil are unreachable and the whole
            i18n layer is dead weight. */}
        <Rise index={8}>
          <Txt
            size={14}
            weight={600}
            color="#595959"
            style={{ paddingTop: 24, paddingBottom: 12, paddingHorizontal: 26 }}
          >
            {t('account.preferences')}
          </Txt>
        </Rise>
        <Rise index={9}>
          <Tap
            onPress={() => setLangOpen(true)}
            accessibilityRole="button"
            accessibilityLabel={t('shop.language')}
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
            <LineIcon name="globe" size={19} color={brand.primary} />
            <Txt flex={1} size={14} weight={500} color={brand.text}>
              {t('shop.language')}
            </Txt>
            {/* The current language, in its own script. */}
            <Txt size={14} weight={600} script={localeScripts[locale]} color={brand.linkAlt}>
              {LANGUAGE_NAMES[locale]}
            </Txt>
            <LineIcon name="chevronRight" size={15} color="#C0C0C0" />
          </Tap>
        </Rise>
      </ScrollView>

      <ShopSheet
        visible={langOpen}
        onClose={() => setLangOpen(false)}
        title={t('shop.chooseLanguage')}
      >
        {(['en', 'si', 'ta'] as Locale[]).map((l) => (
          <SheetRow
            key={l}
            label={LANGUAGE_NAMES[l]}
            sub={localeLabels[l]}
            script={localeScripts[l]}
            selected={l === locale}
            onPress={() => {
              setLocale(l);
              setLangOpen(false);
            }}
          />
        ))}
      </ShopSheet>

      <Toast visible={!!toast} title={toast ?? ''} bottom={28} />
    </View>
  );
}

function Rule() {
  return <View style={{ height: 1, backgroundColor: brand.border }} />;
}

function SettingsRow({ row, index, onPress }: { row: Row; index: number; onPress: () => void }) {
  const { t } = useI18n();
  return (
    <Rise index={index}>
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
    </Rise>
  );
}
