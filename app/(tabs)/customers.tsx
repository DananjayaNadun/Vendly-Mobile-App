import React, { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ShopAvatar, ShopCard, ShopChip, ShopSearch, StatTile } from '@/components/brand/ShopKit';
import { Txt } from '@/components/Txt';
import { COD_CHIP, customerStats, customers } from '@/data/shop';
import { useI18n } from '@/i18n';
import { brand } from '@/theme/brand';

/**
 * 13 · Customers.
 *
 * The two counters sit inside the white header band with the search field, and
 * the roster scrolls on the canvas below it.
 */
export default function CustomersScreen() {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return customers.filter((c) => !q || c.name.toLowerCase().includes(q));
  }, [query]);

  return (
    <View style={{ flex: 1, backgroundColor: brand.canvas }}>
      <View
        style={{
          backgroundColor: brand.surface,
          borderBottomWidth: 1,
          borderBottomColor: brand.border,
          paddingTop: insets.top + 14,
          paddingBottom: 20,
        }}
      >
        <Txt
          size={20}
          weight={700}
          tracking={-0.02}
          color={brand.text}
          style={{ paddingHorizontal: 20 }}
        >
          {t('customers.title')}
        </Txt>
        <View style={{ height: 18 }} />
        <View style={{ paddingHorizontal: 16 }}>
          <ShopSearch value={query} onChange={setQuery} placeholder={t('shop.searchCustomers')} />
        </View>
        <View style={{ height: 16 }} />
        <View style={{ flexDirection: 'row', gap: 14, paddingHorizontal: 20 }}>
          <StatTile
            label={t('shop.total')}
            value={String(customerStats.total)}
            icon="users"
            valueColor="#4C00FF"
            valueSize={29}
          />
          <StatTile
            label={t('shop.repeatBuyers')}
            value={String(customerStats.repeat)}
            delta={`${customerStats.repeatPct}%`}
            icon="trend"
            iconTone="#E4F8F5"
            iconColor="#008F83"
            valueSize={29}
          />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, gap: 14, paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
      >
        {visible.length === 0 ? (
          <Txt size={14} align="center" color={brand.muted} style={{ paddingTop: 40 }}>
            {t('search.none', { query: query.trim() })}
          </Txt>
        ) : (
          visible.map((customer) => (
            <ShopCard key={customer.name} padding={16}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 14 }}>
                <ShopAvatar size={40} />
                <View style={{ flex: 1, gap: 10 }}>
                  <Txt size={14.5} weight={600} color={brand.text}>
                    {customer.name}
                  </Txt>
                  <Txt size={11.5} color="#777777">
                    {customer.orders === 1
                      ? t('shop.orderOne', { count: customer.orders })
                      : t('shop.orderMany', { count: customer.orders })}{' '}
                    · LKR {customer.spent.toLocaleString('en-US')}
                  </Txt>
                  <Txt size={11.5} color="#888888">
                    {customer.last}
                  </Txt>
                </View>
                <ShopChip label={customer.cod} tone={COD_CHIP[customer.cod]} />
              </View>
            </ShopCard>
          ))
        )}
      </ScrollView>
    </View>
  );
}
