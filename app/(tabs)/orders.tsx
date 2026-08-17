import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';

import { ShopAvatar, ShopCard, ShopChip, ShopSearch } from '@/components/brand/ShopKit';
import { ShopNav } from '@/components/brand/ShopNav';
import { Txt } from '@/components/Txt';
import { Tap } from '@/components/ui';
import {
  ORDER_TABS,
  SOURCE_CHIP,
  STATUS_CHIP,
  STATUS_LABEL,
  TAB_LABEL,
  orders as allOrders,
  type OrderStatus,
  type ShopOrder,
} from '@/data/shop';
import { LineIcon } from '@/icons/line';
import { useI18n } from '@/i18n';
import { brand } from '@/theme/brand';
import { Rise } from '@/theme/motion';

/**
 * 11 · Orders.
 *
 * A white header holding the title, the search field and the status tabs, then
 * the cards. Each card is split: the customer on white, and the id, source,
 * time and amount on a hairline-separated foot.
 *
 * `?tab=` preselects a status, which is how the counters on Home open this.
 */
export default function OrdersScreen() {
  const { t } = useI18n();
  // `?tab=` preselects a status (the counters on Home) and `?q=` a search term
  // (a customer's row), so both land here already filtered.
  const params = useLocalSearchParams<{ tab?: string; q?: string }>();
  const [query, setQuery] = useState(params.q ?? '');
  const [tab, setTab] = useState<(typeof ORDER_TABS)[number]>(
    ORDER_TABS.includes(params.tab as OrderStatus) ? (params.tab as OrderStatus) : 'all',
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allOrders
      .filter((o) => tab === 'all' || o.status === tab)
      .filter(
        (o) => !q || `${o.name} ${o.item.product} ${o.id}`.toLowerCase().includes(q),
      );
  }, [query, tab]);

  return (
    <View style={{ flex: 1, backgroundColor: brand.canvas }}>
      <ShopNav
        large
        title={t('orders.title')}
        below={
          <>
            <View style={{ paddingHorizontal: 16 }}>
              <ShopSearch value={query} onChange={setQuery} placeholder={t('shop.searchOrders')} />
            </View>
            <View style={{ height: 16 }} />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20, gap: 22 }}
            >
              {ORDER_TABS.map((key) => {
                const active = key === tab;
                return (
                  <Tap
                    key={key}
                    onPress={() => setTab(key)}
                    accessibilityRole="tab"
                    aria-selected={active}
                    accessibilityLabel={t(TAB_LABEL[key])}
                    feedback="opacity"
                    style={{
                      paddingBottom: 8,
                      borderBottomWidth: 2,
                      borderBottomColor: active ? '#000DFF' : 'transparent',
                    }}
                  >
                    <Txt
                      size={13.5}
                      weight={active ? 700 : 500}
                      color={active ? '#000DFF' : brand.text}
                    >
                      {t(TAB_LABEL[key])}
                    </Txt>
                  </Tap>
                );
              })}
            </ScrollView>
          </>
        }
      />

      <ScrollView
        contentContainerStyle={{ padding: 20, gap: 14, paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
      >
        {visible.length === 0 ? (
          <View style={{ alignItems: 'center', paddingTop: 48, gap: 14 }}>
            <LineIcon name="orders" size={34} color={brand.muted} />
            <Txt size={15} weight={600} align="center" color={brand.text}>
              {t('orders.noneIn', { status: t(TAB_LABEL[tab]) })}
            </Txt>
            <Txt size={13} leading={1.5} align="center" color={brand.body}>
              {t('orders.noneInBody')}
            </Txt>
            <Tap
              onPress={() => {
                setTab('all');
                setQuery('');
              }}
              accessibilityRole="button"
              accessibilityLabel={t('orders.showAll')}
              style={{ paddingVertical: 8, paddingHorizontal: 12 }}
            >
              <Txt size={14} weight={600} color={brand.linkAlt}>
                {t('orders.showAll')}
              </Txt>
            </Tap>
          </View>
        ) : (
          visible.map((order, i) => <OrderCard key={order.id} order={order} index={i} />)
        )}
      </ScrollView>
    </View>
  );
}

function OrderCard({ order, index }: { order: ShopOrder; index: number }) {
  const { t } = useI18n();

  return (
    <Rise index={index}>
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
              {t('shop.itemQty', { name: order.item.product, qty: order.item.qty })}
            </Txt>
          </View>
          <ShopChip label={t(STATUS_LABEL[order.status])} tone={STATUS_CHIP[order.status]} />
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
    </Rise>
  );
}
