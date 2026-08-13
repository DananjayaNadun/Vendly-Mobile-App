import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';

import { LargeHeader, TopChrome, useScrollShadow } from '@/components/AppBar';
import { ChoiceSheet } from '@/components/ChoiceSheet';
import { Toast } from '@/components/Overlays';
import { Txt } from '@/components/Txt';
import { Card, Meter, Money, Pill, Row, Section, StatTile, Tap } from '@/components/ui';
import { analytics, money, name, shop } from '@/data/mock';
import { reliability } from '@/data/more';
import { Icon } from '@/icons';
import { shareOnWhatsApp } from '@/lib/links';
import { useI18n, type TranslationKey } from '@/i18n';
import { Rise, useGrow } from '@/theme/motion';
import { radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeContext';
import { Animated } from 'react-native';

/**
 * Insights — promoted out of the old More drawer into a destination of its own.
 *
 * The screen answers only what a shop owner asks out loud: how much did I make,
 * what is an order worth, do they come back, and what is COD costing me. There
 * is no chart here that exists to be a chart.
 *
 * The COD health block is new to this screen. It used to be a separate
 * destination two taps away, but it is the same question as "what is COD costing
 * me" seen from the other side, so the summary lives here and the full
 * `/cod-reliability` screen is one tap on from it.
 */
export default function InsightsScreen() {
  const { c } = useTheme();
  const { t, locale } = useI18n();
  const shadow = useScrollShadow();

  const [period, setPeriod] = useState('thisMonth');
  const [periodOpen, setPeriodOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [toast, setToast] = useState(false);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(false), 3200);
    return () => clearTimeout(timer);
  }, [toast]);

  const periodKey: Record<string, TranslationKey> = {
    thisMonth: 'period.thisMonth',
    lastMonth: 'period.lastMonth',
    last7: 'period.last7',
    last90: 'period.last90',
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.canvas }}>
      <TopChrome separated={shadow.separated}>
        <LargeHeader
          title={t('insights.title')}
          actions={
            <Tap
              onPress={() => setPeriodOpen(true)}
              accessibilityRole="button"
              style={{
                minHeight: 40,
                borderRadius: radius.pill,
                backgroundColor: c.fill,
                flexDirection: 'row',
                alignItems: 'center',
                gap: space.s2,
                paddingHorizontal: space.s4,
              }}
            >
              <Txt variant="label" weight={600}>
                {t(periodKey[period])}
              </Txt>
              <Icon name="chevronDown" size={14} color={c.muted} />
            </Tap>
          }
        />
      </TopChrome>

      <ScrollView
        {...shadow}
        contentContainerStyle={{
          paddingTop: space.s4,
          paddingHorizontal: space.gutter,
          paddingBottom: space.s7,
          gap: space.s4,
        }}
      >
        {/* Revenue ─────────────────────────────────────────────────────── */}
        <Rise index={0}>
          <Card padding={space.s5} style={{ gap: space.s5 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                gap: space.s3,
              }}
            >
              <View style={{ gap: space.s1 }}>
                <Txt variant="caption" color={c.muted}>
                  {t('analytics.revenueMonth', { month: analytics.month })}
                </Txt>
                <Money amount={analytics.revenue} variant="figure" countUp />
              </View>
              <Pill label={analytics.revenueDelta} tone={c.positive} />
            </View>

            <Chart />

            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Txt size={11} mono color={c.faint}>
                1 {analytics.month}
              </Txt>
              <Txt size={11} mono color={c.faint}>
                10 {analytics.month}
              </Txt>
            </View>
          </Card>
        </Rise>

        {/* Order value + retention ─────────────────────────────────────── */}
        <Rise index={1}>
          <View style={{ flexDirection: 'row', gap: space.s3 }}>
            <StatTile
              label={t('analytics.avgOrder')}
              value={`${t('common.rs')} ${analytics.avgOrder.toLocaleString('en-US')}`}
              hint={`+${t('common.rs')} ${analytics.avgOrderDelta.toLocaleString('en-US')}`}
              hintTone={c.positive}
            />
            <StatTile
              label={t('analytics.repeatBuyers')}
              value={`${analytics.repeatPct}%`}
              hint={t('analytics.pts', { count: analytics.repeatDelta })}
              hintTone={c.positive}
            />
          </View>
        </Rise>

        {/* COD health — the summary of what used to be a separate screen. */}
        <Rise index={2}>
          <Section title={t('insights.codHealth')}>
            <Card padding={space.s5} style={{ gap: space.s4 }}>
              <View style={{ flexDirection: 'row', gap: space.s5 }}>
                <View style={{ flex: 1, gap: 3 }}>
                  <Txt variant="caption" color={c.muted}>
                    {t('insights.refusalRate')}
                  </Txt>
                  <Txt variant="figure" size={23} mono>
                    {reliability.cancellationRate}%
                  </Txt>
                </View>
                <View style={{ flex: 1, gap: 3 }}>
                  <Txt variant="caption" color={c.muted}>
                    {t('insights.moneyAtRisk')}
                  </Txt>
                  <Money amount={reliability.moneyAtRisk} variant="figure" size={23} />
                </View>
              </View>

              {/* The ramp, as one stacked bar. */}
              <View style={{ gap: space.s2 }}>
                <View style={{ flexDirection: 'row', height: 10, gap: 2 }}>
                  {reliability.tiers.map((tier) => (
                    <View
                      key={tier.level}
                      style={{
                        flex: tier.count,
                        backgroundColor: c.risk[tier.level].edge,
                        borderRadius: radius.pill,
                      }}
                    />
                  ))}
                </View>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.s3 }}>
                  {reliability.tiers.map((tier) => (
                    <View
                      key={tier.level}
                      style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}
                    >
                      <View
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: radius.pill,
                          backgroundColor: c.risk[tier.level].edge,
                        }}
                      />
                      <Txt size={12} mono color={c.body}>
                        {tier.count}
                      </Txt>
                      <Txt size={12} color={c.muted}>
                        {t(`risk.${tier.level}` as TranslationKey)}
                      </Txt>
                    </View>
                  ))}
                </View>
              </View>
            </Card>

            <Card flush>
              <Row last onPress={() => router.push('/cod-reliability')}>
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: radius.sm,
                    backgroundColor: c.accentSoft,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon name="shield" size={19} color={c.accent} />
                </View>
                <Txt flex={1} variant="label" weight={600}>
                  {t('insights.openReliability')}
                </Txt>
                {/* Same figure as Account's row and the tier breakdown below —
                    all three now come from one derived list. */}
                <Pill
                  label={t('more.riskyCount', { count: reliability.needsReview.length })}
                  tone={c.warning}
                />
                <Icon name="chevronRight" size={16} color={c.faint} />
              </Row>
            </Card>
          </Section>
        </Rise>

        {/* The COD payoff ──────────────────────────────────────────────── */}
        <Rise index={3}>
          <Card padding={space.s5} style={{ gap: space.s4 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: space.s3,
              }}
            >
              <Txt variant="subheading" flex={1}>
                {t('analytics.lostToCod')}
              </Txt>
              <Pill label={analytics.lostDelta} tone={c.positive} />
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: space.s2 }}>
              <Money amount={analytics.lostToCod} variant="figure" size={24} />
              <Txt variant="caption" color={c.muted}>
                {t('analytics.returns', { count: analytics.returns })}
              </Txt>
            </View>

            <View style={{ gap: space.s2 }}>
              {analytics.lossBars.map((pct, i) => (
                <Meter
                  key={i}
                  pct={pct}
                  index={i}
                  height={6}
                  tone={i === analytics.lossBars.length - 1 ? c.positive : c.critical}
                  track={c.chartLossTrack}
                />
              ))}
            </View>

            <Txt variant="caption" leading={1.5} color={c.body}>
              {t('analytics.lostBody')}
            </Txt>
          </Card>
        </Rise>

        {/* Best sellers ────────────────────────────────────────────────── */}
        <Rise index={4}>
          <Section title={t('analytics.bestSellers')}>
            <Card flush>
              {analytics.bestSellers.map((item, i) => (
                <Row key={item.rank} last={i === analytics.bestSellers.length - 1}>
                  <Txt variant="caption" mono color={c.faint}>
                    {item.rank}
                  </Txt>
                  <Txt flex={1} variant="label" weight={500}>
                    {item.title}
                  </Txt>
                  <Money amount={item.revenue} variant="label" weight={600} />
                </Row>
              ))}
            </Card>
          </Section>
        </Rise>

        {/* Export ──────────────────────────────────────────────────────── */}
        <Rise index={5}>
          <Card flush>
            <Row last onPress={() => setExportOpen(true)}>
              <View style={{ flex: 1, gap: 2 }}>
                <Txt variant="label" weight={600}>
                  {t('analytics.export')}
                </Txt>
                <Txt variant="caption" color={c.muted}>
                  {t('analytics.exportSub')}
                </Txt>
              </View>
              <Icon name="chevronRight" size={16} color={c.faint} />
            </Row>
          </Card>
        </Rise>
      </ScrollView>

      <ChoiceSheet
        visible={periodOpen}
        onClose={() => setPeriodOpen(false)}
        title={t('period.title')}
        value={period}
        onSelect={setPeriod}
        options={Object.entries(periodKey).map(([key, label]) => ({ key, label: t(label) }))}
      />

      <ChoiceSheet
        visible={exportOpen}
        onClose={() => setExportOpen(false)}
        title={t('export.title', { period: t(periodKey[period]) })}
        subtitle={t('export.body')}
        // Hands WhatsApp the figures as text. Generating a real PDF or workbook
        // needs a native module this project does not carry — see the README.
        onSelect={() => {
          shareOnWhatsApp(
            `${name(shop.name, locale)} — ${t(periodKey[period])}\n` +
              `${t('analytics.revenueMonth', { month: analytics.month })}: ${t('common.rs')} ${money(analytics.revenue)}\n` +
              `${t('analytics.avgOrder')}: ${t('common.rs')} ${money(analytics.avgOrder)}\n` +
              `${t('analytics.lostToCod')}: ${t('common.rs')} ${money(analytics.lostToCod)}`,
          );
          setToast(true);
        }}
        options={[
          { key: 'pdf', label: t('export.pdf') },
          { key: 'excel', label: t('export.excel') },
          { key: 'csv', label: t('export.csv') },
        ]}
      />

      <Toast
        visible={toast}
        title={t('export.shared', { period: t(periodKey[period]) })}
        body={t('export.sharedSub')}
      />
    </View>
  );
}

/** The daily revenue bars, growing from the axis on mount. */
function Chart() {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: space.s2, height: 120 }}>
      {analytics.bars.map((pct, i) => (
        <Bar key={i} pct={pct} index={i} highlighted={analytics.barsHighlighted.includes(i)} />
      ))}
    </View>
  );
}

function Bar({ pct, index, highlighted }: { pct: number; index: number; highlighted: boolean }) {
  const { c } = useTheme();
  const height = useGrow(pct, index);
  return (
    <Animated.View
      style={{
        flex: 1,
        height,
        backgroundColor: highlighted ? c.chartBar : c.chartTrack,
        borderTopLeftRadius: 6,
        borderTopRightRadius: 6,
      }}
    />
  );
}
