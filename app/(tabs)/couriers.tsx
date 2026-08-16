import React, { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';

import { ShopCard, ShopChip, ShopHeader, ShopSearch, StatTile } from '@/components/brand/ShopKit';
import { Txt } from '@/components/Txt';
import { Tap } from '@/components/ui';
import { COURIER_CHIP, courierStats, couriers } from '@/data/shop';
import { LineIcon } from '@/icons/line';
import { useI18n } from '@/i18n';
import { brand, brandRadius } from '@/theme/brand';

/**
 * 16 · Couriers & delivery.
 *
 * The PDF page for this screen is a broken export — two of its four stat cards
 * render empty and the bottom pair overflows off the right edge, with the
 * courier list missing entirely. The layout here follows the design's intent as
 * the HTML prototype states it (four stats, then the connected couriers) while
 * keeping the PDF's visual language and its two header buttons.
 */
export default function CouriersScreen() {
  const { t } = useI18n();
  const [query, setQuery] = useState('');

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return couriers.filter((c) => !q || c.name.toLowerCase().includes(q));
  }, [query]);

  return (
    <View style={{ flex: 1, backgroundColor: brand.canvas }}>
      <ShopHeader title={t('shop.couriersTitle')} action={t('shop.add')} />

      <View style={{ paddingHorizontal: 16 }}>
        <ShopSearch value={query} onChange={setQuery} placeholder={t('shop.search')} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 32 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12 }}>
          <HeaderAction icon="download" label={t('shop.exportWaybills')} />
          <HeaderAction icon="plus" label={t('shop.addCourier')} filled />
        </View>

        <View style={{ flexDirection: 'row', gap: 14 }}>
          <StatTile
            iconFirst
            label={t('shop.activeCouriers')}
            value={String(courierStats.active)}
            icon="truck"
            valueSize={26}
            valueColor="#413F3F"
          />
          <StatTile
            iconFirst
            label={t('shop.pendingWaybills')}
            value={String(courierStats.pendingWaybills)}
            icon="clock"
            iconTone="#FFF4DE"
            iconColor="#C47A00"
            valueSize={26}
            valueColor="#413F3F"
          />
        </View>
        <View style={{ flexDirection: 'row', gap: 14 }}>
          <StatTile
            iconFirst
            label={t('shop.averageDelivery')}
            value={`LKR ${courierStats.averageDelivery}`}
            icon="card"
            iconTone="#E4F8E6"
            iconColor="#02AE35"
            valueSize={22}
            valueColor="#413F3F"
          />
          <StatTile
            iconFirst
            label={t('shop.deliveryRate')}
            value={`${courierStats.deliveryRate}%`}
            icon="checkCircle"
            iconTone="#E4F8E6"
            iconColor="#02AE35"
            valueSize={26}
            valueColor="#413F3F"
          />
        </View>

        {visible.map((courier) => (
          <ShopCard key={courier.name} padding={16}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <View
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 11,
                  backgroundColor: '#F2F4F7',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <LineIcon name="truck" size={20} color={brand.text} />
              </View>
              <View style={{ flex: 1, gap: 6 }}>
                <Txt size={14.5} weight={600} color={brand.text}>
                  {courier.name}
                </Txt>
                <Txt size={11.5} color="#888888">
                  {courier.meta}
                </Txt>
              </View>
              <ShopChip label={courier.state} tone={COURIER_CHIP[courier.state]} />
            </View>
          </ShopCard>
        ))}
      </ScrollView>
    </View>
  );
}

function HeaderAction({
  icon,
  label,
  filled,
}: {
  icon: 'download' | 'plus';
  label: string;
  filled?: boolean;
}) {
  return (
    <Tap
      accessibilityRole="button"
      accessibilityLabel={label}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        minHeight: 38,
        paddingHorizontal: 14,
        borderRadius: brandRadius.social,
        backgroundColor: filled ? '#1478FF' : brand.surface,
        ...(filled ? null : { borderWidth: 1, borderColor: '#D8DEE6' }),
      }}
    >
      <LineIcon name={icon} size={15} color={filled ? '#FFFFFF' : '#1478FF'} strokeWidth={2} />
      <Txt size={11.5} weight={700} color={filled ? '#FFFFFF' : '#1478FF'}>
        {label}
      </Txt>
    </Tap>
  );
}
