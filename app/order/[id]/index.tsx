import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ScrollView, View } from 'react-native';

import { BrandBar } from '@/components/brand/BrandKit';
import { ShopAvatar, ShopCard, ShopChip } from '@/components/brand/ShopKit';
import { NotFound } from '@/components/NotFound';
import { Txt } from '@/components/Txt';
import { Tap } from '@/components/ui';
import { SOURCE_CHIP, STATUS_CHIP, findShopOrder } from '@/data/shop';
import { LineIcon } from '@/icons/line';
import { callNumber, openWhatsApp } from '@/lib/links';
import { useI18n } from '@/i18n';
import { brand, brandRadius } from '@/theme/brand';

/**
 * 12 · Order detail.
 *
 * The customer card repeats the row from the list, with call and chat beside
 * it, then the items, the address and the courier. Section labels sit outside
 * the cards, as the design draws them.
 */
export default function OrderDetailScreen() {
  const { t } = useI18n();
  const { id } = useLocalSearchParams<{ id: string }>();
  const order = findShopOrder(id);

  if (!order) return <NotFound title={t('orders.title')} message={t('notFound.order')} />;

  return (
    <View style={{ flex: 1, backgroundColor: brand.canvas }}>
      <BrandBar
        title={t('shop.order', { id: order.id })}
        onBack={() => router.back()}
        trailing={
          <View style={{ paddingRight: 8 }}>
            <ShopChip label={order.status} tone={STATUS_CHIP[order.status]} />
          </View>
        }
      />

      <ScrollView contentContainerStyle={{ padding: 20, gap: 8, paddingBottom: 40 }}>
        <SectionLabel>{t('shop.customer')}</SectionLabel>
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
            <View style={{ flexDirection: 'row', gap: 11 }}>
              <ContactButton
                icon="phone"
                tint="#E0F7E0"
                color="#0E8A2E"
                label={t('order.call')}
                onPress={() => callNumber('+94771234567')}
              />
              <ContactButton
                icon="chat"
                tint="#E0EEFC"
                color={brand.primary}
                label={t('order.whatsapp')}
                onPress={() => openWhatsApp('+94771234567')}
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

        <SectionLabel>{t('shop.orderItems')}</SectionLabel>
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
              {order.item}
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

        <SectionLabel>{t('shop.shippingAddress')}</SectionLabel>
        <ShopCard>
          <Txt size={13.5} leading={1.65} color={brand.text}>
            {order.address}
          </Txt>
        </ShopCard>

        <SectionLabel>{t('shop.courierPayment')}</SectionLabel>
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
      </ScrollView>
    </View>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Txt size={14.5} weight={600} color="#727272" style={{ paddingTop: 14, paddingLeft: 6 }}>
      {children}
    </Txt>
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
