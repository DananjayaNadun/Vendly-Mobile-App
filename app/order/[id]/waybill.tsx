import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ScrollView, View } from 'react-native';

import { AppBar, BottomBar, TopChrome, useScrollShadow } from '@/components/AppBar';
import { NotFound } from '@/components/NotFound';
import { Txt } from '@/components/Txt';
import { Button, Card } from '@/components/ui';
import { couriers, findCourier, findOrder, money, name, shop, waybillFor } from '@/data/mock';
import { Icon } from '@/icons';
import { shareOnWhatsApp } from '@/lib/links';
import { useI18n } from '@/i18n';
import { Rise } from '@/theme/motion';
import { radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeContext';

/**
 * Waybill — the label the rider gets.
 *
 * Rendered on white in both themes on purpose: it gets photographed,
 * screenshotted and printed, so inverting it in dark mode would make it useless
 * at the one moment it matters.
 *
 * Everything on it is derived from the order and the courier that was actually
 * booked. It used to render one static object, so whichever courier the seller
 * picked one screen earlier, the label said PRONTO EXPRESS and carried a Pronto
 * tracking number — on the one screen whose entire output is a physical parcel.
 */
export default function WaybillScreen() {
  const { c } = useTheme();
  const { t, locale } = useI18n();
  const { id, courier: courierParam, booked } = useLocalSearchParams<{
    id: string;
    courier?: string;
    booked?: string;
  }>();
  const shadow = useScrollShadow();

  const order = findOrder(id);
  if (!order) return <NotFound title={t('waybill.title')} message={t('notFound.order')} />;

  // The courier just chosen wins; otherwise the one this order already shipped
  // with; otherwise the shop's default.
  const courier = findCourier(courierParam) ?? findCourier(order.courierId) ?? couriers[0];
  const label = waybillFor(order, courier);
  const justBooked = booked === '1';

  // Label-local colours, deliberately fixed rather than themed.
  const paper = '#FFFFFF';
  const labelInk = '#171419';
  const labelBody = '#55505C';
  const labelMuted = '#6F6979';
  const labelRule = '#DAD5CD';

  return (
    <View style={{ flex: 1, backgroundColor: c.canvas }}>
      <TopChrome separated={shadow.separated}>
        <AppBar title={t('waybill.title')} leading="close" onLeading={() => router.back()} />
      </TopChrome>

      <ScrollView
        {...shadow}
        contentContainerStyle={{
          paddingTop: space.s3,
          paddingHorizontal: space.gutter,
          paddingBottom: space.s6,
          gap: space.s4,
        }}
      >
        <Rise index={0}>
          <Card
            tone={c.positive}
            radius={radius.lg}
            padding={space.s4}
            style={{ flexDirection: 'row', alignItems: 'center', gap: space.s3 }}
          >
            <Icon name="checkCircle" size={19} color={c.positive.fg} />
            {/* "Rider arrives 2–4pm" is only true of a booking made just now.
                Reopening an old label got the same line, which read as a fresh
                pickup being promised every time the seller looked at it. */}
            <Txt flex={1} variant="label" weight={600} color={c.positiveInk}>
              {justBooked
                ? t('waybill.booked')
                : t('waybill.bookedWith', { courier: courier.name })}
            </Txt>
          </Card>
        </Rise>

        {/* ── The label itself ────────────────────────────────────────── */}
        <Rise index={1}>
          <View
            style={{
              backgroundColor: paper,
              borderWidth: 1,
              borderColor: '#E7E3DC',
              borderRadius: radius.xl,
              padding: space.s5,
              gap: space.s5,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: space.s3,
              }}
            >
              <View style={{ gap: 2 }}>
                <Txt size={16} weight={700} tracking={-0.01} color={labelInk}>
                  {label.courierName}
                </Txt>
                <Txt size={12} color={labelMuted}>
                  {t('waybill.hub', { city: shop.city })}
                </Txt>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 2 }}>
                <Txt size={11} tracking={0.06} transform="uppercase" color={labelMuted}>
                  {t('waybill.collect')}
                </Txt>
                <Txt size={19} weight={500} mono color={labelInk}>
                  {t('common.rs')} {money(order.total)}
                </Txt>
              </View>
            </View>

            {/* Self-delivery issues no tracking number, so there is no barcode
                to print — saying so beats printing a fake one. */}
            {label.tracking ? (
              <>
                <View style={{ flexDirection: 'row', gap: 2, height: 62, alignItems: 'stretch' }}>
                  {label.barcode.map((w, i) => (
                    <View key={i} style={{ width: w, backgroundColor: labelInk }} />
                  ))}
                </View>

                <Txt size={14} mono align="center" tracking={0.12} color={labelInk}>
                  {label.tracking}
                </Txt>
              </>
            ) : (
              <Txt size={13} align="center" leading={1.5} color={labelMuted}>
                {t('courier.noTracking')}
              </Txt>
            )}

            <View
              style={{
                borderTopWidth: 1,
                borderTopColor: labelRule,
                borderStyle: 'dashed',
                paddingTop: space.s4,
                gap: space.s1,
              }}
            >
              <Txt size={11} tracking={0.06} transform="uppercase" color={labelMuted}>
                {t('waybill.to')}
              </Txt>
              <Txt size={15} weight={600} color={labelInk}>
                {name(order.customer.name, locale)} · {order.customer.phone}
              </Txt>
              <Txt size={14} leading={1.5} color={labelBody}>
                {order.customer.address ?? t('new.noAddress')}
              </Txt>
            </View>

            <View
              style={{
                borderTopWidth: 1,
                borderTopColor: labelRule,
                borderStyle: 'dashed',
                paddingTop: space.s4,
                gap: space.s1,
              }}
            >
              <Txt size={11} tracking={0.06} transform="uppercase" color={labelMuted}>
                {t('waybill.from')}
              </Txt>
              <Txt size={14} color={labelBody}>
                {name(shop.name, locale)} · {shop.phone}
              </Txt>
            </View>
          </View>
        </Rise>
      </ScrollView>

      <BottomBar>
        {/* "Save PDF" sat here with no handler and no way to acquire one without
            `expo-print` and a native rebuild — see the README. Sharing the
            tracking details is a real link, so that is what this offers. */}
        <Button
          label={t('waybill.share')}
          icon="chat"
          onPress={() =>
            shareOnWhatsApp(
              t('waybill.message', {
                shop: name(shop.name, locale),
                id: order.id,
                courier: courier.name,
                tracking: label.tracking ?? '—',
                total: money(order.total),
              }),
            )
          }
        />
      </BottomBar>
    </View>
  );
}
