import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ShopAvatar, ShopCard, ShopChip, ShopSearch, StatTile } from '@/components/brand/ShopKit';
import { ShopSheet, SheetRow } from '@/components/brand/ShopSheet';
import { Txt } from '@/components/Txt';
import { Tap } from '@/components/ui';
import { COD_CHIP, COD_LABEL, customerStats, customers, type ShopCustomer } from '@/data/shop';
import { LineIcon } from '@/icons/line';
import { callNumber, openWhatsApp } from '@/lib/links';
import { useI18n } from '@/i18n';
import { brand } from '@/theme/brand';
import { Rise } from '@/theme/motion';

/**
 * 13 · Customers.
 *
 * The two counters sit inside the white header band with the search field, and
 * the roster scrolls on the canvas below it.
 *
 * A customer row opens the three things a seller does with one — call, message,
 * or look at their orders — rather than being a card that only looks tappable.
 */
export default function CustomersScreen() {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<ShopCustomer | null>(null);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return customers.filter((c) => !q || c.name.toLowerCase().includes(q));
  }, [query]);

  const ago = (last: ShopCustomer['last']) =>
    last.unit === 'h'
      ? t('shop.agoHours', { n: last.value })
      : t('shop.agoDays', { n: last.value });

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
        <Rise style={{ flexDirection: 'row', gap: 14, paddingHorizontal: 20 }}>
          <StatTile
            countUp
            label={t('shop.total')}
            value={String(customerStats.total)}
            icon="users"
            valueColor="#4C00FF"
            valueSize={29}
          />
          <StatTile
            countUp
            label={t('shop.repeatBuyers')}
            value={String(customerStats.repeat)}
            delta={`${customerStats.repeatPct}%`}
            icon="trend"
            iconTone="#E4F8F5"
            iconColor="#008F83"
            valueSize={29}
          />
        </Rise>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, gap: 14, paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
      >
        {visible.length === 0 ? (
          <View style={{ alignItems: 'center', paddingTop: 48, gap: 12 }}>
            <LineIcon name="users" size={34} color={brand.muted} />
            <Txt size={14} align="center" color={brand.body}>
              {t('search.none', { query: query.trim() })}
            </Txt>
          </View>
        ) : (
          visible.map((customer, i) => (
            <Rise key={customer.name} index={i}>
            <Tap
              onPress={() => setSelected(customer)}
              accessibilityRole="button"
              accessibilityLabel={customer.name}
            >
              <ShopCard padding={16}>
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
                      {t('shop.lastOrder', { ago: ago(customer.last) })}
                    </Txt>
                  </View>
                  <ShopChip label={t(COD_LABEL[customer.cod])} tone={COD_CHIP[customer.cod]} />
                </View>
              </ShopCard>
            </Tap>
            </Rise>
          ))
        )}
      </ScrollView>

      <ShopSheet
        visible={!!selected}
        onClose={() => setSelected(null)}
        title={t('shop.customerActions', { name: selected?.name ?? '' })}
        subtitle={selected?.phone}
      >
        <SheetRow
          icon="chat"
          label={t('order.whatsapp')}
          onPress={() => {
            if (selected) openWhatsApp(selected.phone);
            setSelected(null);
          }}
        />
        <SheetRow
          icon="phone"
          label={t('order.call')}
          onPress={() => {
            if (selected) callNumber(selected.phone);
            setSelected(null);
          }}
        />
        <SheetRow
          icon="orders"
          label={t('shop.viewOrders')}
          onPress={() => {
            const name = selected?.name ?? '';
            setSelected(null);
            router.push(`/orders?q=${encodeURIComponent(name)}`);
          }}
        />
      </ShopSheet>
    </View>
  );
}
