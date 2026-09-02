import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ScrollView, View } from 'react-native';

import { ShopAvatar, ShopCard, ShopChip } from '@/components/brand/ShopKit';
import { ShopNav } from '@/components/brand/ShopNav';
import { NotFound } from '@/components/NotFound';
import { Txt } from '@/components/Txt';
import { Tap } from '@/components/ui';
import { SOURCE_CHIP, STATUS_CHIP, STATUS_LABEL, findShopOrder } from '@/data/shop';
import { LineIcon } from '@/icons/line';
import { callNumber, openWhatsApp } from '@/lib/links';
import { useI18n } from '@/i18n';
import { brand, brandRadius } from '@/theme/brand';
import { Rise } from '@/theme/motion';

/**
 * 12 · Order detail.
 *
 * The customer card repeats the row from the list, with call and chat beside
 * it, then the items, the address and the courier. Section labels sit outside
 * the cards, as the design draws them.
 *
 * Each label rises with its own card — a shared stagger index per section, so
 * the four blocks arrive as four blocks rather than eight loose pieces.
 */
export default function OrderDetailScreen() {
  const { t } = useI18n();
  const { id } = useLocalSearchParams<{ id: string }>();
  const order = findShopOrder(id);

  if (!order) return <NotFound title={t('orders.title')} message={t('notFound.order')} />;

  return (
    <View style={{ flex: 1, backgroundColor: brand.canvas }}>
      <ShopNav
        title={t('shop.order', { id: order.id })}
        subtitle={order.name}
        onBack
        trailing={
          <ShopChip label={t(STATUS_LABEL[order.status])} tone={STATUS_CHIP[order.status]} />
        }
      />

      <ScrollView contentContainerStyle={{ padding: 20, gap: 8, paddingBottom: 40 }}>
        <SectionLabel index={0}>{t('shop.customer')}</SectionLabel>
        <Rise index={0}>
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
            <View style={{ flexDirection: 'row', gap: 11 }}>
              <ContactButton
                icon="phone"
                tint="#E0F7E0"
                color="#0E8A2E"
                label={t('order.call')}
                onPress={() => callNumber(order.phone)}
              />
              <ContactButton
                icon="chat"
                tint="#E0EEFC"
                color={brand.primary}
                label={t('order.whatsapp')}
                onPress={() => openWhatsApp(order.phone)}
              />
            </View>
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
        </Rise>

        <SectionLabel index={1}>{t('shop.orderItems')}</SectionLabel>
        <Rise index={1}>
        <ShopCard padding={0}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              paddingHorizontal: 18,
              paddingVertical: 20,
            }}
          >
            <Txt flex={1} size={14} weight={600} color={brand.text}>
              {t('shop.itemQty', { name: order.item.product, qty: order.item.qty })}
            </Txt>
            <Txt size={14} weight={600} color={brand.text}>
              LKR {order.amount.toLocaleString('en-US')}
            </Txt>
          </View>
          <View style={{ height: 1, backgroundColor: '#E6E6E6' }} />
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              paddingHorizontal: 18,
              paddingVertical: 18,
            }}
          >
            <Txt flex={1} size={15} weight={600} color={brand.text}>
              {t('shop.total')}
            </Txt>
            <Txt size={15} weight={700} color="#0033FF">
              LKR {order.amount.toLocaleString('en-US')}
            </Txt>
          </View>
        </ShopCard>
        </Rise>

        <SectionLabel index={2}>{t('shop.shippingAddress')}</SectionLabel>
        <Rise index={2}>
        <ShopCard>
          <Txt size={13.5} leading={1.65} color={brand.text}>
            {order.address}
          </Txt>
        </ShopCard>
        </Rise>

        <SectionLabel index={3}>{t('shop.courierPayment')}</SectionLabel>
        <Rise index={3}>
        <ShopCard>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Txt flex={1} size={14} weight={600} color={brand.text}>
              {order.courier} - {order.payment}
            </Txt>
            <Txt size={14} weight={700} color={brand.text}>
              LKR {order.amount.toLocaleString('en-US')}
            </Txt>
          </View>
        </ShopCard>
        </Rise>
      </ScrollView>
    </View>
  );
}

function SectionLabel({ children, index }: { children: React.ReactNode; index: number }) {
  return (
    <Rise index={index}>
      <Txt size={14.5} weight={600} color="#727272" style={{ paddingTop: 14, paddingLeft: 6 }}>
        {children}
      </Txt>
    </Rise>
  );
}

function ContactButton({
  icon,
  tint,
  color,
  label,
  onPress,
}: {
  icon: 'phone' | 'chat';
  tint: string;
  color: string;
  label: string;
  onPress: () => void;
}) {
  return (
    <Tap
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={{
        width: 34,
        height: 32,
        borderRadius: brandRadius.backChip,
        backgroundColor: tint,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <LineIcon name={icon} size={16} color={color} />
    </Tap>
  );
}
