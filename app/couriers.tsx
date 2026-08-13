import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';

import { AppBar, TopChrome, useScrollShadow } from '@/components/AppBar';
import { Toast } from '@/components/Overlays';
import { Txt } from '@/components/Txt';
import { Button, Card, Eyebrow, KeyValue, Pill, Row } from '@/components/ui';
import { money } from '@/data/mock';
import { availableCouriers, courierPerformance, type CourierPerformance } from '@/data/more';
import { Icon } from '@/icons';
import { useI18n } from '@/i18n';
import { Rise } from '@/theme/motion';
import { radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeContext';

/**
 * Couriers — the numbers behind Book courier.
 *
 * The screen exists to make the ranking legible: a courier is judged on parcels
 * delivered and returns caused, because a cheap courier that loses parcels costs
 * the shop more than the rate it saves.
 */
export default function CouriersScreen() {
  const { c } = useTheme();
  const { t } = useI18n();
  const shadow = useScrollShadow();

  // Connecting is real local state rather than a dead button: the courier moves
  // out of "Add a courier" and into the connected list, where it can be undone.
  const [linked, setLinked] = useState<string[]>([]);
  const [toast, setToast] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  const connected = useMemo(
    () => [
      ...courierPerformance,
      ...availableCouriers
        .filter((x) => linked.includes(x.id))
        .map<CourierPerformance>((x) => ({
          ...x,
          connected: true,
          fee: null,
          deliveredPct: 0,
          avgDays: 0,
          parcels: 0,
          returns: 0,
          returnFee: null,
          coverage: '—',
        })),
    ],
    [linked],
  );
  const available = availableCouriers.filter((x) => !linked.includes(x.id));

  return (
    <View style={{ flex: 1, backgroundColor: c.canvas }}>
      <TopChrome separated={shadow.separated}>
        <AppBar title={t('couriers.title')} onLeading={() => router.back()} />
      </TopChrome>

      <ScrollView
        {...shadow}
        contentContainerStyle={{
          paddingTop: space.s3,
          paddingHorizontal: space.gutter,
          paddingBottom: space.s7,
          gap: space.s3,
        }}
      >
        <Eyebrow>{t('couriers.connected')}</Eyebrow>

        {connected.map((courier, i) => (
          <Rise key={courier.id} index={i}>
            <CourierCard courier={courier} />
          </Rise>
        ))}

        <Rise index={3}>
          <Card
            radius={radius.lg}
            padding={space.s4}
            style={{ flexDirection: 'row', gap: space.s3 }}
          >
            <Icon name="shield" size={18} color={c.muted} />
            <Txt flex={1} variant="caption" leading={1.55} color={c.body}>
              {t('couriers.note')}
            </Txt>
          </Card>
        </Rise>

        {available.length > 0 ? (
          <>
            <Eyebrow style={{ paddingTop: space.s3 }}>{t('couriers.available')}</Eyebrow>
            <Rise index={4}>
              <Card flush>
                {available.map((courier, i) => (
                  <Row key={courier.id} last={i === available.length - 1}>
                    <Badge initials={courier.initials} />
                    <Txt flex={1} variant="label" weight={500}>
                      {courier.name}
                    </Txt>
                    <Button
                      label={t('couriers.connect')}
                      variant="quiet"
                      height={38}
                      fontSize={14}
                      onPress={() => {
                        setLinked((prev) => [...prev, courier.id]);
                        setToast({ id: courier.id, name: courier.name });
                      }}
                    />
                  </Row>
                ))}
              </Card>
            </Rise>
          </>
        ) : null}
      </ScrollView>

      <Toast
        visible={!!toast}
        title={t('couriers.connectedToast', { courier: toast?.name ?? '' })}
        body={t('couriers.connectedSub')}
        action={t('common.undo')}
        onAction={() => {
          setLinked((prev) => prev.filter((x) => x !== toast?.id));
          setToast(null);
        }}
        bottom={24}
      />
    </View>
  );
}

function Badge({ initials }: { initials: string }) {
  const { c } = useTheme();
  return (
    <View
      style={{
        width: 40,
        height: 40,
        borderRadius: radius.sm,
        backgroundColor: c.fill,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Txt variant="label" weight={600} color={c.body}>
        {initials}
      </Txt>
    </View>
  );
}

function CourierCard({ courier }: { courier: CourierPerformance }) {
  const { c } = useTheme();
  const { t } = useI18n();

  // A courier's return rate is the number that actually costs the shop money.
  const returnRate = courier.parcels === 0 ? 0 : courier.returns / courier.parcels;
  const health = returnRate > 0.12 ? c.critical : returnRate > 0.05 ? c.warning : c.positive;

  return (
    <Card padding={space.s5} style={{ gap: space.s4 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.s3 }}>
        <Badge initials={courier.initials} />
        <View style={{ flex: 1, gap: 2 }}>
          <Txt variant="subheading">{courier.name}</Txt>
          <Txt variant="caption" color={c.body}>
            {courier.coverage}
          </Txt>
        </View>
        <Pill label={t('couriers.onTime', { pct: courier.deliveredPct })} tone={health} />
      </View>

      {/* Delivered vs returned, drawn to scale. */}
      <View style={{ flexDirection: 'row', gap: 3, height: 10 }}>
        <View
          style={{
            flex: Math.max(courier.parcels - courier.returns, 1),
            borderRadius: radius.pill,
            backgroundColor: health.dot,
          }}
        />
        {courier.returns > 0 ? (
          <View
            style={{
              flex: courier.returns,
              borderRadius: radius.pill,
              backgroundColor: c.critical.dot,
            }}
          />
        ) : null}
      </View>

      <View style={{ flexDirection: 'row', gap: space.s2, flexWrap: 'wrap' }}>
        <Pill label={t('couriers.parcels', { count: courier.parcels })} tone={c.neutral} />
        <Pill label={t('couriers.returns', { count: courier.returns })} tone={c.neutral} />
        <Pill label={t('couriers.avg', { days: courier.avgDays })} tone={c.neutral} />
      </View>

      <View style={{ gap: space.s2 }}>
        <KeyValue
          label={t('couriers.baseRate')}
          value={courier.fee === null ? t('couriers.free') : `${t('common.rs')} ${money(courier.fee)}`}
          mono
        />
        <KeyValue
          label={t('couriers.returnFee')}
          value={
            courier.returnFee === null
              ? t('couriers.free')
              : `${t('common.rs')} ${money(courier.returnFee)}`
          }
          tone={courier.returnFee ? c.warning : undefined}
          mono
        />
      </View>
    </Card>
  );
}
