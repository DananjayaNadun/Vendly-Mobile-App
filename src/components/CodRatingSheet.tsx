import React from 'react';
import { ScrollView, View } from 'react-native';

import { name, type Customer } from '@/data/mock';
import { useI18n } from '@/i18n';
import { Icon } from '@/icons';
import { radius, space, type RiskLevel } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeContext';
import { Sheet } from './Overlays';
import { Rich, Txt } from './Txt';
import { Button, Card, Eyebrow, Row, Tap } from './ui';

/**
 * "Why this rating?" — the explanation behind the COD verdict.
 *
 * A warning the seller cannot interrogate is a warning they learn to ignore, so
 * this shows the whole basis for the score: where it sits on the ramp, the
 * individual events that moved it, what to do about it, and how to overrule it.
 *
 * The ramp is drawn as a full scale with the customer's position marked rather
 * than as five equal blocks with one lit, so it reads as a position on a
 * spectrum — which is what a reliability score is.
 */

const RAMP: RiskLevel[] = ['excellent', 'good', 'average', 'risky', 'high'];

export function CodRatingSheet({
  visible,
  onClose,
  customer,
  onOverride,
}: {
  visible: boolean;
  onClose: () => void;
  customer: Customer;
  /** Opens the override sheet. Omitted where overriding is not offered. */
  onOverride?: () => void;
}) {
  const { c } = useTheme();
  const { t, locale } = useI18n();

  const firstName = name(customer.name, locale).split(' ')[0];
  const rampLabels: Record<RiskLevel, string> = {
    excellent: t('risk.excellent'),
    good: t('risk.good'),
    average: t('risk.average'),
    risky: t('risk.risky'),
    high: t('risk.high'),
  };
  const tone = c.risk[customer.risk];

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      top={110}
      title={t('rating.title')}
      subtitle={
        <Rich
          variant="bodySm"
          leading={1.55}
          color={c.body}
          text={t('rating.basedOn', { name: firstName })}
        />
      }
      footer={<Button label={t('common.gotIt')} variant="contrast" onPress={onClose} />}
    >
      <ScrollView
        contentContainerStyle={{
          paddingTop: space.s5,
          paddingHorizontal: space.gutter,
          paddingBottom: space.s5,
          gap: space.s5,
        }}
      >
        {/* ── Where this customer sits ─────────────────────────────────── */}
        <View style={{ gap: space.s3 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.s3 }}>
            <Txt variant="title" size={22} color={tone.fg} flex={1}>
              {rampLabels[customer.risk]}
            </Txt>
          </View>

          <View style={{ flexDirection: 'row', gap: 3 }}>
            {RAMP.map((level) => {
              const active = level === customer.risk;
              return (
                <View
                  key={level}
                  style={{
                    flex: 1,
                    height: active ? 12 : 8,
                    alignSelf: 'center',
                    borderRadius: radius.pill,
                    backgroundColor: active ? c.risk[level].edge : c.risk[level].bg,
                  }}
                />
              );
            })}
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 2 }}>
            {RAMP.map((level) => {
              const active = level === customer.risk;
              return (
                <Txt
                  key={level}
                  size={11}
                  weight={active ? 600 : 400}
                  color={active ? c.risk[level].fg : c.faint}
                >
                  {rampLabels[level]}
                </Txt>
              );
            })}
          </View>
        </View>

        {/* ── What moved it ────────────────────────────────────────────── */}
        <Card flush>
          <Row>
            <Marker sign="−" tone="critical" />
            <Txt flex={1} variant="bodySm" leading={1.45}>
              {t('rating.refused', { count: customer.refused ?? 0 })}
            </Txt>
            <Txt variant="caption" color={c.muted}>
              Jun, Jul
            </Txt>
          </Row>
          <Row>
            <Marker sign="+" tone="positive" />
            <Txt flex={1} variant="bodySm" leading={1.45}>
              {t('rating.accepted', { count: customer.accepted ?? 0 })}
            </Txt>
            <Txt variant="caption" color={c.muted}>
              since Mar
            </Txt>
          </Row>
          <Row last>
            <Marker sign="·" tone="neutral" />
            <Txt flex={1} variant="bodySm" leading={1.45}>
              {t('rating.thinHistory', { count: customer.orderCount ?? 0 })}
            </Txt>
          </Row>
        </Card>

        {/* ── Suggested action ─────────────────────────────────────────── */}
        <Card tone={c.info} padding={space.s4} style={{ gap: space.s2 }}>
          <Txt variant="label" weight={600} color={c.info.fg}>
            {t('rating.suggestTitle')}
          </Txt>
          <Txt variant="bodySm" leading={1.55} color={c.info.fg}>
            {t('rating.suggestBody')}
          </Txt>
        </Card>

        {/* ── Override ─────────────────────────────────────────────────── */}
        {onOverride ? (
          <View style={{ gap: space.s2 }}>
            <Eyebrow>{t('rating.disagree')}</Eyebrow>
            <Tap onPress={onOverride} accessibilityRole="button">
              <Card
                padding={space.s4}
                style={{ flexDirection: 'row', alignItems: 'center', gap: space.s3 }}
              >
                <View style={{ flex: 1, gap: 2 }}>
                  <Txt variant="label" weight={600}>
                    {t('rating.setManually')}
                  </Txt>
                  <Txt variant="caption" color={c.muted}>
                    {t('rating.overrideSticks')}
                  </Txt>
                </View>
                <Icon name="chevronRight" size={17} color={c.muted} />
              </Card>
            </Tap>
          </View>
        ) : null}
      </ScrollView>
    </Sheet>
  );
}

/** The small +/−/· tile that prefixes each contributing event. */
function Marker({ sign, tone }: { sign: string; tone: 'critical' | 'positive' | 'neutral' }) {
  const { c } = useTheme();
  const colors = c[tone];
  return (
    <View
      style={{
        width: 28,
        height: 28,
        borderRadius: radius.xs,
        backgroundColor: colors.bg,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Txt size={15} weight={600} color={colors.fg}>
        {sign}
      </Txt>
    </View>
  );
}
