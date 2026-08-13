import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';

import { AppBar, TopChrome, useScrollShadow } from '@/components/AppBar';
import { useRiskLabels } from '@/components/CustomerRow';
import { Rich, Txt } from '@/components/Txt';
import { Avatar, Card, Dot, Eyebrow, Money, Pill, Row, Section, StatTile, Tap } from '@/components/ui';
import { money, name } from '@/data/mock';
import { reliability } from '@/data/more';
import { Icon } from '@/icons';
import { useI18n } from '@/i18n';
import { Rise } from '@/theme/motion';
import { radius, space, type RiskLevel } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeContext';

/**
 * COD Reliability — the shop-wide view of the score the order screens apply one
 * customer at a time.
 *
 * It has to earn the seller's trust in the number, so it leads with the money at
 * stake, then shows the distribution, then the working list, and only then
 * explains itself.
 */
export default function CodReliabilityScreen() {
  const { c } = useTheme();
  const { t, locale } = useI18n();
  const shadow = useScrollShadow();
  const labels = useRiskLabels();

  const [tier, setTier] = useState<RiskLevel | null>(null);

  // Selecting a tier filters the working list; no selection shows the default
  // Risky + High risk queue the screen is for.
  const list = useMemo(
    () =>
      tier ? reliability.needsReview.filter((cust) => cust.risk === tier) : reliability.needsReview,
    [tier],
  );

  return (
    <View style={{ flex: 1, backgroundColor: c.canvas }}>
      <TopChrome separated={shadow.separated}>
        <AppBar title={t('cod.title')} onLeading={() => router.back()} />
      </TopChrome>

      <ScrollView
        {...shadow}
        contentContainerStyle={{
          paddingTop: space.s3,
          paddingHorizontal: space.gutter,
          paddingBottom: space.s7,
          gap: space.s5,
        }}
      >
        {/* ── Money first ─────────────────────────────────────────────── */}
        <Rise index={0}>
          <Card tone={c.warning} padding={space.s5} style={{ gap: space.s2 }}>
            <Eyebrow color={c.warning.fg}>{t('cod.atRisk')}</Eyebrow>
            <Money
              amount={reliability.moneyAtRisk}
              variant="figure"
              size={32}
              color={c.warningInk}
              markColor={c.warningBody}
              countUp
            />
            {/* Money *at risk*, not money out — a narrower set than the Today
                screen's "cash to collect", which is why it gets its own line
                rather than borrowing the COD-orders-out one. */}
            <Txt variant="bodySm" leading={1.5} color={c.warningBody}>
              {t('cod.atRiskSub', { count: reliability.atRiskOrders })}
            </Txt>
          </Card>
        </Rise>

        <Rise index={1}>
          <View style={{ flexDirection: 'row', gap: space.s3 }}>
            <StatTile label={t('cod.tracked')} value={money(reliability.customersTracked)} />
            <StatTile
              label={t('cod.refusalRate')}
              value={`${reliability.cancellationRate}%`}
              // No `toLowerCase()` here: it is a no-op in Sinhala and Tamil and
              // would quietly de-capitalise the acronym in the English string.
              hint={`${money(reliability.codOrdersRecorded)} ${t('cod.recorded')}`}
            />
          </View>
        </Rise>

        {/* ── Distribution ────────────────────────────────────────────── */}
        <Rise index={2}>
          <Card padding={space.s5} style={{ gap: space.s4 }}>
            <View style={{ gap: 2 }}>
              <Txt variant="subheading">{t('cod.byTier')}</Txt>
              <Txt variant="caption" color={c.muted}>
                {t('cod.tapTier')}
              </Txt>
            </View>

            {/* One bar, weighted by how many customers sit in each tier. */}
            <View style={{ flexDirection: 'row', gap: 3, height: 12 }}>
              {reliability.tiers.map((entry) => (
                <View
                  key={entry.level}
                  style={{
                    flex: entry.count,
                    borderRadius: radius.pill,
                    backgroundColor: c.risk[entry.level].edge,
                    opacity: tier && tier !== entry.level ? 0.25 : 1,
                  }}
                />
              ))}
            </View>

            <View style={{ gap: 2 }}>
              {reliability.tiers.map((entry) => {
                const active = tier === entry.level;
                return (
                  <Tap
                    key={entry.level}
                    onPress={() => setTier(active ? null : entry.level)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    feedback="highlight"
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: space.s3,
                      minHeight: 44,
                      paddingVertical: space.s2,
                      paddingHorizontal: space.s3,
                      marginHorizontal: -space.s3,
                      borderRadius: radius.sm,
                      backgroundColor: active ? c.fill : 'transparent',
                    }}
                  >
                    <Dot color={c.risk[entry.level].dot} size={10} />
                    <Txt flex={1} variant="label" weight={active ? 600 : 500}>
                      {labels[entry.level]}
                    </Txt>
                    <Txt variant="label" weight={600} mono color={c.body}>
                      {entry.count}
                    </Txt>
                  </Tap>
                );
              })}
            </View>
          </Card>
        </Rise>

        {/* ── Working list ────────────────────────────────────────────── */}
        <Rise index={3}>
          <View style={{ gap: space.s3 }}>
            <View style={{ gap: 2 }}>
              <Txt variant="heading">{tier ? labels[tier] : t('cod.needsReview')}</Txt>
              <Txt variant="bodySm" color={c.muted}>
                {t('cod.needsReviewSub')}
              </Txt>
            </View>

            <Card flush>
              {list.length === 0 ? (
                <Row last>
                  <Txt flex={1} variant="bodySm" color={c.muted}>
                    {t('cod.allClear')}
                  </Txt>
                </Row>
              ) : (
                list.map((cust, i) => (
                  <Row
                    key={cust.id}
                    last={i === list.length - 1}
                    edge={c.risk[cust.risk]}
                    style={{ paddingLeft: space.s4 + space.s1 }}
                    onPress={() => router.push({ pathname: '/customer/[id]', params: { id: cust.id } })}
                  >
                    <Avatar initials={cust.initials} size={38} tone={c.risk[cust.risk]} />
                    <View style={{ flex: 1, gap: 2 }}>
                      <Txt variant="label" weight={600}>
                        {name(cust.name, locale)}
                      </Txt>
                      {/* A brand-new customer has no COD history to summarise,
                          so show when they last ordered instead of "0 of 0". */}
                      <Txt variant="caption" color={c.muted}>
                        {(cust.refused ?? 0) + (cust.accepted ?? 0) === 0
                          ? t('customers.lastOrder', { date: cust.lastOrder ?? '—' })
                          : t('cod.refusedOf', {
                              refused: cust.refused ?? 0,
                              total: (cust.refused ?? 0) + (cust.accepted ?? 0),
                            })}
                      </Txt>
                    </View>
                    <Pill label={labels[cust.risk]} tone={c.risk[cust.risk]} dot bordered />
                  </Row>
                ))
              )}
            </Card>
          </View>
        </Rise>

        {/* ── Overrides ───────────────────────────────────────────────── */}
        <Rise index={4}>
          <View style={{ gap: space.s2 }}>
            <Eyebrow>{t('cod.overrides')}</Eyebrow>
            <Card flush>
              {reliability.overrides.length === 0 ? (
                <Row last>
                  <Txt flex={1} variant="bodySm" color={c.muted}>
                    {t('cod.noOverrides')}
                  </Txt>
                </Row>
              ) : (
                reliability.overrides.map((entry, i) => (
                  <Row
                    key={entry.customer.id}
                    last={i === reliability.overrides.length - 1}
                    onPress={() =>
                      router.push({ pathname: '/customer/[id]', params: { id: entry.customer.id } })
                    }
                  >
                    <View style={{ flex: 1, gap: 2 }}>
                      <Txt variant="label" weight={600}>
                        {name(entry.customer.name, locale)}
                      </Txt>
                      <Txt variant="caption" color={c.muted}>
                        {t('cod.overrideSetOn', { date: entry.setOn })}
                      </Txt>
                    </View>
                    <Pill label={labels[entry.level]} tone={c.risk[entry.level]} dot bordered />
                    <Icon name="chevronRight" size={16} color={c.faint} />
                  </Row>
                ))
              )}
            </Card>
          </View>
        </Rise>

        {/* ── How it works ────────────────────────────────────────────── */}
        <Rise index={5}>
          <Section title={t('cod.howItWorks')} gap={space.s2}>
            <Card padding={space.s5}>
              <Rich variant="bodySm" leading={1.6} color={c.body} text={t('cod.howBody')} />
            </Card>
          </Section>
        </Rise>
      </ScrollView>
    </View>
  );
}
