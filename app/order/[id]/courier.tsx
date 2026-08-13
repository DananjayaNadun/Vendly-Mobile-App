import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { AppBar, BottomBar, TopChrome, useScrollShadow } from '@/components/AppBar';
import { NotFound } from '@/components/NotFound';
import { Txt } from '@/components/Txt';
import { Button, Card, Eyebrow, KeyValue, Money, Pill, Row, Tap } from '@/components/ui';
import { couriers, findOrder, money, shop } from '@/data/mock';
import { Icon } from '@/icons';
import { useI18n } from '@/i18n';
import { Rise } from '@/theme/motion';
import { radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeContext';

/**
 * Book courier — rate plus performance.
 *
 * Couriers are ranked by what the seller actually loses money on, delivery rate
 * and speed, not by price alone — which is why the cheapest option is not the
 * pre-selected one.
 */
export default function CourierScreen() {
  const { c } = useTheme();
  const { t } = useI18n();
  const { id } = useLocalSearchParams<{ id: string }>();
  const shadow = useScrollShadow();

  // Reopening an already-booked order preselects the courier it went out with.
  const booked = findOrder(id)?.courierId;
  const [selected, setSelected] = useState(booked ?? couriers[0].id);

  const order = findOrder(id);
  if (!order) return <NotFound title={t('courier.title')} message={t('notFound.order')} />;

  const chosen = couriers.find((x) => x.id === selected) ?? couriers[0];
  const isRisky = order.customer.risk === 'risky' || order.customer.risk === 'high';

  return (
    <View style={{ flex: 1, backgroundColor: c.canvas }}>
      <TopChrome separated={shadow.separated}>
        <AppBar
          title={t('courier.title')}
          subtitle={`${order.id} · ${shop.city} → ${order.customer.city ?? shop.city}`}
          onLeading={() => router.back()}
        />
      </TopChrome>

      <ScrollView
        {...shadow}
        contentContainerStyle={{
          paddingTop: space.s3,
          paddingHorizontal: space.gutter,
          paddingBottom: space.s6,
          gap: space.s5,
        }}
      >
        <View style={{ gap: space.s2 }}>
          <Eyebrow>{t('courier.choose')}</Eyebrow>

          {couriers.map((courier, i) => {
            const active = courier.id === selected;
            const detail =
              courier.id === 'pronto'
                ? t('courier.nextDay')
                : courier.id === 'koombiya'
                  ? t('courier.twoDays', { pct: courier.deliveredPct ?? 0 })
                  : t('courier.selfDesc');

            return (
              <Rise key={courier.id} index={i}>
                <Tap
                  onPress={() => setSelected(courier.id)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: active }}
                  accessibilityLabel={courier.name}
                >
                  <Card
                    padding={space.s4}
                    style={{
                      gap: space.s3,
                      borderWidth: active ? 2 : 1,
                      borderColor: active ? c.accent : c.border,
                    }}
                    bordered
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.s3 }}>
                      <View
                        style={{
                          width: 42,
                          height: 42,
                          borderRadius: radius.sm,
                          backgroundColor: active ? c.accentSoft : c.fill,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Txt variant="label" weight={600} color={active ? c.accent : c.body}>
                          {courier.initials}
                        </Txt>
                      </View>
                      <View style={{ flex: 1, gap: 2 }}>
                        <Txt variant="subheading">{courier.name}</Txt>
                        <Txt variant="caption" color={c.body}>
                          {detail}
                        </Txt>
                      </View>
                      {courier.fee === null ? (
                        <Txt variant="subheading" mono>
                          —
                        </Txt>
                      ) : (
                        <Money amount={courier.fee} variant="subheading" />
                      )}
                    </View>

                    {/* Performance chips only on the selected courier — the
                        collapsed rows stay one line tall. */}
                    {active && courier.deliveredPct ? (
                      <View style={{ flexDirection: 'row', gap: space.s2, flexWrap: 'wrap' }}>
                        <Pill
                          label={t('courier.delivered', { pct: courier.deliveredPct })}
                          tone={c.positive}
                        />
                        {courier.avgDays ? (
                          <Pill
                            label={t('courier.avgDays', { days: courier.avgDays })}
                            tone={c.neutral}
                          />
                        ) : null}
                        {courier.yourParcels ? (
                          <Pill
                            label={t('courier.yourParcels', { count: courier.yourParcels })}
                            tone={c.neutral}
                          />
                        ) : null}
                      </View>
                    ) : null}
                  </Card>
                </Tap>
              </Rise>
            );
          })}
        </View>

        {/* ── Consignment details ─────────────────────────────────────── */}
        <Rise index={3}>
          {/* Read-only consignment facts. These carried chevrons and empty press
              handlers, which promised an editor that does not exist. */}
          <Card flush>
            <Row>
              <Txt flex={1} variant="bodySm" color={c.body}>
                {t('courier.pickup')}
              </Txt>
              <Txt variant="label" weight={600}>
                {t('courier.pickupValue')}
              </Txt>
            </Row>
            <Row>
              <Txt flex={1} variant="bodySm" color={c.body}>
                {t('courier.weight')}
              </Txt>
              <Txt variant="label" weight={600}>
                {t('courier.weightValue')}
              </Txt>
            </Row>
            <Row last sunken>
              <Txt flex={1} variant="bodySm" color={c.body}>
                {t('courier.collectFrom')}
              </Txt>
              <Money amount={order.total} variant="subheading" />
            </Row>
          </Card>
        </Rise>

        {/* The warning follows the seller into the booking step. */}
        {isRisky && chosen.returnFee ? (
          <Rise index={4}>
            <Card
              tone={c.warning}
              radius={radius.lg}
              padding={space.s4}
              style={{ flexDirection: 'row', gap: space.s3 }}
            >
              <Icon name="warningTriangle" size={18} color={c.warning.fg} />
              <Txt flex={1} variant="bodySm" leading={1.5} color={c.warningBody}>
                {t('courier.riskNote', {
                  courier: chosen.name.split(' ')[0],
                  fee: money(chosen.returnFee),
                })}
              </Txt>
            </Card>
          </Rise>
        ) : null}
      </ScrollView>

      <BottomBar>
        <KeyValue
          label={t('courier.fee')}
          value={chosen.fee === null ? '—' : `${t('common.rs')} ${money(chosen.fee)}`}
          mono
        />
        <Button
          label={t('courier.book')}
          icon="printer"
          // The choice travels with the navigation. It used to live only in this
          // screen's local state, so picking Koombiya or self-delivery still
          // printed a Pronto Express label with a Pronto tracking number.
          onPress={() =>
            router.push({
              pathname: '/order/[id]/waybill',
              params: { id: id ?? '', courier: chosen.id, booked: '1' },
            })
          }
        />
      </BottomBar>
    </View>
  );
}
