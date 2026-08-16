import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ShopCard, ShopAvatar, ShopChip, ShopSearch } from '@/components/brand/ShopKit';
import { Txt } from '@/components/Txt';
import { Tap } from '@/components/ui';
import {
  ORDER_TABS,
  SOURCE_CHIP,
  STATUS_CHIP,
  orders as allOrders,
  type ShopOrder,
} from '@/data/shop';
import { useI18n } from '@/i18n';
import { brand } from '@/theme/brand';

/**
 * 11 · Orders.
 *
 * A white header holding the title, the search field and the status tabs, then
 * the cards. Each card is split: the customer on white, and the id, source,
 * time and amount on a hairline-separated foot.
 */
export default function OrdersScreen() {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<(typeof ORDER_TABS)[number]>('All');

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allOrders
      .filter((o) => tab === 'All' || o.status === tab)
      .filter((o) => !q || `${o.name} ${o.item} ${o.id}`.toLowerCase().includes(q));
  }, [query, tab]);

  return (
    <View style={{ flex: 1, backgroundColor: brand.canvas }}>
      <View
        style={{
          backgroundColor: brand.surface,
          borderBottomWidth: 1,
          borderBottomColor: brand.border,
          paddingTop: insets.top + 14,
        }}
      >
        <Txt
          size={20}
          weight={700}
          tracking={-0.02}
          color={brand.text}
          style={{ paddingHorizontal: 20 }}
        >
          {t('orders.title')}
        </Txt>
        <View style={{ height: 18 }} />
        <View style={{ paddingHorizontal: 16 }}>
          <ShopSearch value={query} onChange={setQuery} placeholder={t('shop.searchOrders')} />
        </View>
        <View style={{ height: 18 }} />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 22 }}
        >
          {ORDER_TABS.map((label) => {
            const active = label === tab;
            return (
              <Tap
                key={label}
                onPress={() => setTab(label)}
                accessibilityRole="tab"
                aria-selected={active}
                accessibilityLabel={label}
                feedback="opacity"
                style={{
                  paddingBottom: 10,
                  borderBottomWidth: 2,
                  borderBottomColor: active ? '#000DFF' : 'transparent',
                }}
              >
                <Txt size={13.5} weight={active ? 700 : 500} color={active ? '#000DFF' : brand.text}>
                  {label}
                </Txt>
              </Tap>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, gap: 14, paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
      >
        {visible.length === 0 ? (
          <Txt size={14} align="center" color={brand.muted} style={{ paddingTop: 40 }}>
            {t('search.none', { query: query.trim() || String(tab) })}
          </Txt>
        ) : (
          visible.map((order) => <OrderCard key={order.id} order={order} />)
        )}
      </ScrollView>
    </View>
  );
}

function OrderCard({ order }: { order: ShopOrder }) {
  return (
    <Tap
      onPress={() =>
        router.push({ pathname: '/order/[id]', params: { id: order.id.replace('#', '') } })
      }
      accessibilityRole="button"
      accessibilityLabel={`${order.name} ${order.id}`}
    >
      <ShopCard padding={0}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 14, padding: 16 }}>
          <ShopAvatar />
          <View style={{ flex: 1, gap: 6 }}>
            <Txt size={14.5} weight={600} color={brand.text}>
              {order.name}
            </Txt>
            <Txt size={11.5} color="#A4A4A4">
              {order.item}
            </Txt>
          </View>
          <ShopChip label={order.status} tone={STATUS_CHIP[order.status]} />
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            borderTopWidth: 1,
            borderTopColor: '#EFEFEF',
            paddingHorizontal: 16,
            paddingVertical: 12,
          }}
        >
          <Txt size={11} weight={600} color="#9D9D9D">
            {order.id}
          </Txt>
          <ShopChip label={order.source} tone={SOURCE_CHIP[order.source]} />
          <View style={{ flex: 1 }} />
          <Txt size={10} color="#848484">
            {order.time}
          </Txt>
          <Txt size={13} weight={700} color={brand.text}>
            LKR {order.amount.toLocaleString('en-US')}
          </Txt>
        </View>
      </ShopCard>
    </Tap>
  );
}
