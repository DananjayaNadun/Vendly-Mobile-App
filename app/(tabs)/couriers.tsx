import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';

import { BrandButton } from '@/components/brand/BrandKit';
import { ShopCard, ShopChip, ShopHeader, ShopSearch, StatTile } from '@/components/brand/ShopKit';
import { SheetRow, ShopSheet } from '@/components/brand/ShopSheet';
import { Toast } from '@/components/Overlays';
import { Txt } from '@/components/Txt';
import { Tap } from '@/components/ui';
import {
  COURIER_CHIP,
  COURIER_LABEL,
  availableCouriers,
  courierStats,
  couriers as seed,
  shop,
  type ShopCourier,
} from '@/data/shop';
import { LineIcon } from '@/icons/line';
import { shareOnWhatsApp } from '@/lib/links';
import { useI18n } from '@/i18n';
import { brand, brandRadius } from '@/theme/brand';
import { Rise } from '@/theme/motion';

/**
 * 16 · Couriers & delivery.
 *
 * The PDF page for this screen is a broken export — two of its four stat cards
 * render empty, the bottom pair overflows the right edge, and the courier list
 * is missing entirely. The layout here follows the design's intent (four stats,
 * then the connected couriers) in the PDF's visual language.
 *
 * Connecting a courier is real local state: it moves out of the connect list
 * and into the roster, and can be undone from the toast.
 */
export default function CouriersScreen() {
  const { t } = useI18n();
  const [query, setQuery] = useState('');
  const [linked, setLinked] = useState<string[]>([]);
  const [connectOpen, setConnectOpen] = useState(false);
  const [selected, setSelected] = useState<ShopCourier | null>(null);
  const [toast, setToast] = useState<{ title: string; courier?: string } | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  const roster = useMemo<ShopCourier[]>(
    () => [
      ...seed,
      ...linked.map<ShopCourier>((name) => ({ name, active: 0, state: 'pending' })),
    ],
    [linked],
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return roster.filter((c) => !q || c.name.toLowerCase().includes(q));
  }, [query, roster]);

  const unlinked = availableCouriers.filter((name) => !linked.includes(name));

  const meta = (courier: ShopCourier) =>
    courier.waybills
      ? t('shop.courierWaybills', { count: courier.active, waybills: courier.waybills })
      : t('shop.courierSettled', { count: courier.active });

  const exportWaybills = () => {
    shareOnWhatsApp(
      t('shop.waybillMessage', { shop: shop.name, count: courierStats.pendingWaybills }),
    );
    setToast({ title: t('shop.waybillsExported') });
  };

  return (
    <View style={{ flex: 1, backgroundColor: brand.canvas }}>
      <ShopHeader
        title={t('shop.couriersTitle')}
        action={t('shop.add')}
        onAction={() => setConnectOpen(true)}
      />

      <View style={{ paddingHorizontal: 16 }}>
        <ShopSearch value={query} onChange={setQuery} placeholder={t('shop.search')} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 32 }}>
        <Rise style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12 }}>
          <HeaderAction icon="download" label={t('shop.exportWaybills')} onPress={exportWaybills} />
          <HeaderAction
            icon="plus"
            label={t('shop.addCourier')}
            filled
            onPress={() => setConnectOpen(true)}
          />
        </Rise>

        <Rise index={1} style={{ flexDirection: 'row', gap: 14 }}>
          <StatTile
            iconFirst
            countUp
            label={t('shop.activeCouriers')}
            value={String(courierStats.active + linked.length)}
            icon="truck"
            valueSize={26}
            valueColor="#413F3F"
          />
          <StatTile
            iconFirst
            countUp
            label={t('shop.pendingWaybills')}
            value={String(courierStats.pendingWaybills)}
            icon="clock"
            iconTone="#FFF4DE"
            iconColor="#C47A00"
            valueSize={26}
            valueColor="#413F3F"
          />
        </Rise>
        <Rise index={2} style={{ flexDirection: 'row', gap: 14 }}>
          <StatTile
            iconFirst
            countUp
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
            countUp
            label={t('shop.deliveryRate')}
            value={`${courierStats.deliveryRate}%`}
            icon="checkCircle"
            iconTone="#E4F8E6"
            iconColor="#02AE35"
            valueSize={26}
            valueColor="#413F3F"
          />
        </Rise>

        {visible.map((courier, i) => (
          <Rise key={courier.name} index={3 + i}>
          <Tap
            onPress={() => setSelected(courier)}
            accessibilityRole="button"
            accessibilityLabel={courier.name}
          >
            <ShopCard padding={16}>
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
                    {meta(courier)}
                  </Txt>
                </View>
                <ShopChip
                  label={t(COURIER_LABEL[courier.state])}
                  tone={COURIER_CHIP[courier.state]}
                />
              </View>
            </ShopCard>
          </Tap>
          </Rise>
        ))}
      </ScrollView>

      {/* ── Connect a courier ────────────────────────────────────────────── */}
      <ShopSheet
        visible={connectOpen}
        onClose={() => setConnectOpen(false)}
        title={t('shop.connectCourier')}
        subtitle={unlinked.length === 0 ? t('shop.noneToConnect') : undefined}
      >
        {unlinked.map((name) => (
          <SheetRow
            key={name}
            icon="truck"
            label={name}
            onPress={() => {
              setLinked((prev) => [...prev, name]);
              setConnectOpen(false);
              setToast({ title: t('shop.courierConnected', { courier: name }), courier: name });
            }}
          />
        ))}
      </ShopSheet>

      {/* ── One courier ──────────────────────────────────────────────────── */}
      <ShopSheet
        visible={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.name ?? ''}
        subtitle={selected ? meta(selected) : undefined}
      >
        <SheetRow
          icon="download"
          label={t('shop.exportWaybills')}
          onPress={() => {
            setSelected(null);
            exportWaybills();
          }}
        />
        <View style={{ padding: 12 }}>
          <BrandButton
            pill
            variant="outline"
            label={t('common.close')}
            onPress={() => setSelected(null)}
          />
        </View>
      </ShopSheet>

      <Toast
        visible={!!toast}
        title={toast?.title ?? ''}
        action={toast?.courier ? t('common.undo') : undefined}
        onAction={() => {
          setLinked((prev) => prev.filter((n) => n !== toast?.courier));
          setToast(null);
        }}
        bottom={90}
      />
    </View>
  );
}

function HeaderAction({
  icon,
  label,
  filled,
  onPress,
}: {
  icon: 'download' | 'plus';
  label: string;
  filled?: boolean;
  onPress: () => void;
}) {
  return (
    <Tap
      onPress={onPress}
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
