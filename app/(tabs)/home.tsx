import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ShopCard, StatTile } from '@/components/brand/ShopKit';
import { ShopSheet } from '@/components/brand/ShopSheet';
import { Toast } from '@/components/Overlays';
import { Txt } from '@/components/Txt';
import { Tap } from '@/components/ui';
import { homeStats, shop } from '@/data/shop';
import { LineIcon, type LineIconName } from '@/icons/line';
import { useI18n, type TranslationKey } from '@/i18n';
import { brand, brandRadius } from '@/theme/brand';
import { Rise, useCountUp } from '@/theme/motion';

/**
 * 08 · Home.
 *
 * A white band carrying the greeting and the revenue card, then the four
 * counters, then Quick Actions.
 *
 * Every tile on this screen goes somewhere: the counters open Orders on their
 * matching tab, the revenue card opens Analytics. They were decoration in the
 * first pass, which is the same defect the previous design was audited for.
 *
 * This is the first screen after sign-in, so it assembles itself top-down: the
 * greeting, then today's takings, then the counters, then the actions. The
 * order is the reading order, and the revenue figure counts up because it is
 * the one number the seller opened the app to see.
 */

const STAT_ART: Record<string, { icon: LineIconName; tone: string; color: string }> = {
  new: { icon: 'orders', tone: '#E8F1FE', color: brand.primary },
  cod: { icon: 'card', tone: '#FFF4DE', color: '#C47A00' },
  delivered: { icon: 'checkCircle', tone: '#E4F8E6', color: '#02AE35' },
  cancelled: { icon: 'warning', tone: '#FDECEC', color: '#F20000' },
};

const ACTIONS: { key: string; icon: LineIconName; label: TranslationKey; href?: string }[] = [
  { key: 'new', icon: 'plus', label: 'shop.newOrder', href: '/orders' },
  { key: 'ai', icon: 'chat', label: 'shop.aiAssistant' },
  { key: 'reports', icon: 'chart', label: 'shop.reports', href: '/analytics' },
  { key: 'couriers', icon: 'truck', label: 'tab.couriers', href: '/couriers' },
];

export default function HomeScreen() {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const [bellOpen, setBellOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const revenue = useCountUp(shop.revenueToday);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(timer);
  }, [toast]);

  return (
    <View style={{ flex: 1, backgroundColor: brand.canvas }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        {/* ── Greeting + revenue ───────────────────────────────────────── */}
        <View
          style={{
            backgroundColor: brand.surface,
            paddingTop: insets.top + 14,
            paddingHorizontal: 24,
            paddingBottom: 26,
          }}
        >
          <Rise style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 14 }}>
            <View style={{ flex: 1 }}>
              <Txt size={14} weight={500} color="#434343">
                {t(shop.greetingKey)} 👋
              </Txt>
              <View style={{ height: 9 }} />
              <Txt size={20} weight={700} tracking={-0.02} color={brand.text}>
                {shop.name}
              </Txt>
            </View>
            <Tap
              onPress={() => setBellOpen(true)}
              accessibilityRole="button"
              accessibilityLabel={t('notif.title')}
              hitSlop={10}
              style={{ padding: 2 }}
            >
              <LineIcon name="bell" size={22} color={brand.text} />
            </Tap>
            <Tap
              onPress={() => router.push('/settings')}
              accessibilityRole="button"
              accessibilityLabel={t('shop.settings')}
              hitSlop={10}
              style={{ padding: 2 }}
            >
              <LineIcon name="avatar" size={22} color={brand.text} />
            </Tap>
          </Rise>

          <View style={{ height: 24 }} />

          <Rise index={1}>
            <Tap
              onPress={() => router.push('/analytics')}
              accessibilityRole="button"
              accessibilityLabel={t('shop.todayRevenue')}
              style={{
                backgroundColor: brand.primary,
                borderRadius: brandRadius.ctaTall,
                paddingVertical: 18,
                paddingHorizontal: 20,
              }}
            >
              <Txt size={11} weight={700} tracking={0.11} color="#E9E9E9">
                {t('shop.todayRevenue')}
              </Txt>
              <View style={{ height: 8 }} />
              <Txt size={27} weight={700} tracking={-0.02} color={brand.onPrimary}>
                LKR {revenue.toLocaleString('en-US')}
              </Txt>
              <View style={{ height: 8 }} />
              <Txt size={13} weight={500} color="#D9D9D9">
                {t('shop.revenueDelta', { pct: shop.revenueDeltaPct })}
              </Txt>
            </Tap>
          </Rise>
        </View>

        {/* ── The four counters ────────────────────────────────────────── */}
        <View style={{ paddingHorizontal: 20, paddingTop: 22, gap: 14 }}>
          {[homeStats.slice(0, 2), homeStats.slice(2, 4)].map((row, i) => (
            <View key={i} style={{ flexDirection: 'row', gap: 14 }}>
              {row.map((stat, j) => {
                const art = STAT_ART[stat.key];
                return (
                  // Staggered across the grid rather than down it, so the four
                  // counters arrive in the order they are read.
                  <Rise key={stat.key} index={2 + i * 2 + j} style={{ flex: 1 }}>
                    <Tap
                      onPress={() => router.push(`/orders?tab=${stat.tab}`)}
                      accessibilityRole="button"
                      accessibilityLabel={`${t(stat.label)} ${stat.value}`}
                    >
                      <StatTile
                        countUp
                        label={t(stat.label)}
                        value={stat.value}
                        delta={t(stat.delta.key, stat.delta.vars)}
                        icon={art.icon}
                        iconTone={art.tone}
                        iconColor={art.color}
                      />
                    </Tap>
                  </Rise>
                );
              })}
            </View>
          ))}
        </View>

        {/* ── Quick actions ────────────────────────────────────────────── */}
        <View style={{ paddingHorizontal: 20, paddingTop: 30 }}>
          <Rise index={6}>
            <Txt size={20} weight={700} tracking={-0.02} color={brand.text}>
              {t('shop.quickActions')}
            </Txt>
          </Rise>
          <View style={{ height: 16 }} />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14 }}>
            {ACTIONS.map((action, i) => (
              <Rise key={action.key} index={7 + i} style={{ width: '47%', flexGrow: 1 }}>
              <Tap
                onPress={
                  action.href
                    ? () => router.push(action.href!)
                    : () => setToast(t('shop.aiAssistant'))
                }
                accessibilityRole="button"
                accessibilityLabel={t(action.label)}
              >
                <ShopCard
                  padding={12}
                  style={{ minHeight: 68, flexDirection: 'row', alignItems: 'center', gap: 11 }}
                >
                  <View
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 10,
                      backgroundColor: '#E2F7FC',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <LineIcon name={action.icon} size={18} color={brand.primary} />
                  </View>
                  <Txt flex={1} size={13} weight={600} color={brand.text}>
                    {t(action.label)}
                  </Txt>
                </ShopCard>
              </Tap>
              </Rise>
            ))}
          </View>
        </View>
      </ScrollView>

      <ShopSheet
        visible={bellOpen}
        onClose={() => setBellOpen(false)}
        title={t('notif.title')}
        subtitle={t('shop.noNotificationsSub')}
      >
        <View style={{ alignItems: 'center', paddingVertical: 30, gap: 12 }}>
          <LineIcon name="bell" size={34} color={brand.muted} />
          <Txt size={14} color={brand.body}>
            {t('shop.noNotifications')}
          </Txt>
        </View>
      </ShopSheet>

      <Toast visible={!!toast} title={toast ?? ''} bottom={90} />
    </View>
  );
}
