import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';

import { AppBar, TopChrome, useScrollShadow } from '@/components/AppBar';
import { Txt } from '@/components/Txt';
import { Card, Eyebrow, FilterChips, Money, Pill, Row, Section, StatTile } from '@/components/ui';
import { money, name } from '@/data/mock';
import { payments, type PayMethod, type TxStatus } from '@/data/more';
import { Icon } from '@/icons';
import { useI18n, type TranslationKey } from '@/i18n';
import { Rise } from '@/theme/motion';
import { radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeContext';

/**
 * Payments & invoices.
 *
 * A COD shop's money is split between what has landed and what is still in a
 * rider's bag, so the two figures lead and the transaction list is filterable by
 * exactly that distinction.
 */
export default function PaymentsScreen() {
  const { c } = useTheme();
  const { t, locale } = useI18n();
  const shadow = useScrollShadow();
  const [filter, setFilter] = useState('all');

  const methodKey: Record<PayMethod, TranslationKey> = {
    cod: 'pay.method.cod',
    bank: 'pay.method.bank',
    payhere: 'pay.method.payhere',
  };
  const statusKey: Record<TxStatus, TranslationKey> = {
    collected: 'pay.status.collected',
    pending: 'pay.status.pending',
    refunded: 'pay.status.refunded',
  };
  const statusTone = {
    collected: c.positive,
    pending: c.warning,
    refunded: c.critical,
  } as const;

  const methodColour = [c.chartBar, c.positive.dot, c.muted];

  const visible = useMemo(
    () =>
      filter === 'all'
        ? payments.transactions
        : payments.transactions.filter((tx) => tx.status === filter),
    [filter],
  );

  return (
    <View style={{ flex: 1, backgroundColor: c.canvas }}>
      <TopChrome separated={shadow.separated}>
        <AppBar title={t('pay.title')} onLeading={() => router.back()} />
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
        {/* ── Headline figures ────────────────────────────────────────── */}
        <Rise index={0}>
          <Card padding={space.s5} style={{ gap: space.s2 }}>
            <Eyebrow>{t('pay.collected')}</Eyebrow>
            <Money amount={payments.totalCollected} variant="figure" size={32} countUp />
          </Card>
        </Rise>

        <Rise index={1}>
          <View style={{ flexDirection: 'row', gap: space.s3 }}>
            <StatTile
              label={t('pay.pendingCod')}
              value={`${t('common.rs')} ${money(payments.pendingCod)}`}
            />
            <StatTile
              label={t('pay.refunds')}
              value={`${t('common.rs')} ${money(payments.refundsOwed)}`}
            />
          </View>
        </Rise>

        {/* ── Split by method ─────────────────────────────────────────── */}
        <Rise index={2}>
          <Card padding={space.s5} style={{ gap: space.s4 }}>
            <Txt variant="subheading">{t('pay.byMethod')}</Txt>

            <View style={{ flexDirection: 'row', gap: 3, height: 12 }}>
              {payments.byMethod.map((entry, i) => (
                <View
                  key={entry.method}
                  style={{
                    flex: entry.share,
                    borderRadius: radius.pill,
                    backgroundColor: methodColour[i],
                  }}
                />
              ))}
            </View>

            <View style={{ gap: space.s3 }}>
              {payments.byMethod.map((entry, i) => (
                <View
                  key={entry.method}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: space.s3 }}
                >
                  <View
                    style={{
                      width: 9,
                      height: 9,
                      borderRadius: radius.pill,
                      backgroundColor: methodColour[i],
                    }}
                  />
                  <Txt flex={1} variant="bodySm">
                    {t(methodKey[entry.method])}
                  </Txt>
                  <Money amount={entry.amount} variant="bodySm" color={c.body} />
                  <Txt
                    variant="caption"
                    mono
                    color={c.muted}
                    style={{ width: 38, textAlign: 'right' }}
                  >
                    {entry.share}%
                  </Txt>
                </View>
              ))}
            </View>
          </Card>
        </Rise>

        {/* ── Transactions ────────────────────────────────────────────── */}
        <Rise index={3}>
          <Section title={t('pay.transactions')}>
            <FilterChips
              value={filter}
              onChange={setFilter}
              options={[
                { key: 'all', label: t('status.all') },
                { key: 'pending', label: t('pay.status.pending'), tone: c.warning },
                { key: 'collected', label: t('pay.status.collected'), tone: c.positive },
                { key: 'refunded', label: t('pay.status.refunded'), tone: c.critical },
              ]}
            />

            <Card flush>
              {visible.map((tx, i) => (
                <Row
                  key={tx.id}
                  last={i === visible.length - 1}
                  onPress={() =>
                    router.push({
                      pathname: '/order/[id]',
                      params: { id: tx.orderId.replace('#', '') },
                    })
                  }
                >
                  <View style={{ flex: 1, gap: 3 }}>
                    <Txt variant="label" weight={600}>
                      {name(tx.customer.name, locale)}
                    </Txt>
                    <Txt variant="caption" mono color={c.muted}>
                      {tx.orderId} · {t(methodKey[tx.method])} · {tx.when}
                    </Txt>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: space.s1 }}>
                    <Money amount={tx.amount} variant="label" weight={600} />
                    <Pill label={t(statusKey[tx.status])} tone={statusTone[tx.status]} />
                  </View>
                </Row>
              ))}
            </Card>
          </Section>
        </Rise>

        {/* ── Invoices ────────────────────────────────────────────────── */}
        <Rise index={4}>
          <Section title={t('pay.invoices')}>
            <Card flush>
              {/* Opens the order the invoice bills, rather than an empty press
                  handler under a chevron that promised somewhere to go. */}
              {payments.invoices.map((inv, i) => (
                <Row
                  key={inv.id}
                  last={i === payments.invoices.length - 1}
                  onPress={() =>
                    router.push({
                      pathname: '/order/[id]',
                      params: { id: inv.orderId.replace('#', '') },
                    })
                  }
                >
                  <View style={{ flex: 1, gap: 3 }}>
                    <Txt variant="label" weight={600} mono>
                      {inv.id}
                    </Txt>
                    <Txt variant="caption" color={c.muted}>
                      {inv.orderId} · {t('pay.invoiceIssued', { date: inv.issued })}
                    </Txt>
                  </View>
                  <Money amount={inv.amount} variant="label" weight={600} />
                  <Pill
                    label={inv.paid ? t('pay.invoicePaid') : t('pay.invoiceUnpaid')}
                    tone={inv.paid ? c.positive : c.neutral}
                  />
                  <Icon name="chevronRight" size={16} color={c.faint} />
                </Row>
              ))}
            </Card>
          </Section>
        </Rise>
      </ScrollView>
    </View>
  );
}
