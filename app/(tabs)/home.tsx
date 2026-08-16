import { router } from 'expo-router';
import React from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ShopCard, StatTile } from '@/components/brand/ShopKit';
import { Txt } from '@/components/Txt';
import { Tap } from '@/components/ui';
import { homeStats, shop } from '@/data/shop';
import { LineIcon, type LineIconName } from '@/icons/line';
import { useI18n, type TranslationKey } from '@/i18n';
import { brand, brandRadius } from '@/theme/brand';

/**
 * 08 · Home.
 *
 * A white band carrying the greeting and the revenue card, then the four
 * counters, then Quick Actions. The white band stops where the counters begin,
 * which is what gives the revenue card its shelf.
 */

const STAT_ICONS: Record<string, { icon: LineIconName; tone: string; color: string }> = {
  new: { icon: 'orders', tone: '#E8F1FE', color: brand.primary },
  cod: { icon: 'card', tone: '#FFF4DE', color: '#C47A00' },
  delivered: { icon: 'checkCircle', tone: '#E4F8E6', color: '#02AE35' },
  cancelled: { icon: 'warning', tone: '#FDECEC', color: '#F20000' },
};

const STAT_LABELS: Record<string, TranslationKey> = {
  new: 'shop.newOrders',
  cod: 'shop.pendingCod',
  delivered: 'shop.delivered',
  cancelled: 'shop.cancelled',
};

const ACTIONS: { key: string; icon: LineIconName; label: TranslationKey; href?: string }[] = [
  { key: 'new', icon: 'plus', label: 'shop.newOrder', href: '/(tabs)/orders' },
  { key: 'ai', icon: 'chat', label: 'shop.aiAssistant' },
  { key: 'reports', icon: 'chart', label: 'shop.reports', href: '/(tabs)/analytics' },
  { key: 'couriers', icon: 'truck', label: 'tab.couriers', href: '/(tabs)/couriers' },
];

export default function HomeScreen() {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();

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
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 14 }}>
            <View style={{ flex: 1 }}>
              <Txt size={14} weight={500} color="#434343">
                {shop.greeting} 👋
              </Txt>
              <View style={{ height: 9 }} />
              <Txt size={20} weight={700} tracking={-0.02} color={brand.text}>
                {shop.name}
              </Txt>
            </View>
            <Tap
              accessibilityRole="button"
              accessibilityLabel={t('notif.title')}
              hitSlop={8}
              style={{ padding: 2 }}
            >
              <LineIcon name="bell" size={22} color={brand.text} />
            </Tap>
            <Tap
              onPress={() => router.push('/settings')}
              accessibilityRole="button"
              accessibilityLabel={t('shop.settings')}
              hitSlop={8}
              style={{ padding: 2 }}
            >
              <LineIcon name="avatar" size={22} color={brand.text} />
            </Tap>
          </View>

          <View style={{ height: 24 }} />

          <View
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
              LKR {shop.revenueToday.toLocaleString('en-US')}
            </Txt>
            <View style={{ height: 8 }} />
            <Txt size={13} weight={500} color="#D9D9D9">
              {shop.revenueDelta}
            </Txt>
          </View>
        </View>

        {/* ── The four counters ────────────────────────────────────────── */}
        <View style={{ paddingHorizontal: 20, paddingTop: 22, gap: 14 }}>
          {[homeStats.slice(0, 2), homeStats.slice(2, 4)].map((row, i) => (
            <View key={i} style={{ flexDirection: 'row', gap: 14 }}>
              {row.map((stat) => {
                const art = STAT_ICONS[stat.key];
                return (
                  <StatTile
                    key={stat.key}
                    label={t(STAT_LABELS[stat.key])}
                    value={stat.value}
                    delta={stat.delta}
                    icon={art.icon}
                    iconTone={art.tone}
                    iconColor={art.color}
                  />
                );
              })}
            </View>
          ))}
        </View>

        {/* ── Quick actions ────────────────────────────────────────────── */}
        <View style={{ paddingHorizontal: 20, paddingTop: 30 }}>
          <Txt size={20} weight={700} tracking={-0.02} color={brand.text}>
            {t('shop.quickActions')}
          </Txt>
          <View style={{ height: 16 }} />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14 }}>
            {ACTIONS.map((action) => (
              <Tap
                key={action.key}
                onPress={action.href ? () => router.push(action.href!) : undefined}
                accessibilityRole="button"
                accessibilityLabel={t(action.label)}
                style={{ width: '47%', flexGrow: 1 }}
              >
                <ShopCard
                  padding={12}
                  style={{
                    minHeight: 68,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 11,
                  }}
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
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
