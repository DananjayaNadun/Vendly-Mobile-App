import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';

import { TopChrome, useScrollShadow } from '@/components/AppBar';
import { Toast } from '@/components/Overlays';
import { useRiskLabels } from '@/components/CustomerRow';
import { Txt } from '@/components/Txt';
import {
  Avatar,
  Button,
  Card,
  Dot,
  Eyebrow,
  IconButton,
  Money,
  Pill,
  Row,
  Section,
  Statement,
  Tap,
} from '@/components/ui';
import { home, name, orders, shop, type Order } from '@/data/mock';
import { Icon } from '@/icons';
import { useI18n } from '@/i18n';
import { Rise } from '@/theme/motion';
import { radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeContext';

/**
 * Today.
 *
 * This screen used to be a dashboard: revenue on top, four counters, and the
 * COD warnings — the only thing on it that needed a human — as the third card
 * down, drawn exactly like everything else. A seller opening the app was shown
 * how they were *doing* before being shown what to *do*.
 *
 * It is now a worklist, in the order the morning actually runs:
 *
 * 1. **Needs your decision** — risky COD orders, each with its reason and both
 *    replies available inline. Deciding no longer costs a round trip into the
 *    order and back, which is what made the old screen's warnings easy to skip.
 * 2. **Ready to pack** — decided, waiting on a label.
 * 3. **On the road** — already gone, money still owed.
 *
 * The money band stays, but it leads with what is *exposed* rather than what was
 * earned: cash still out with couriers is the number that decides whether today
 * was a good day, and it is the number the decisions above it directly move.
 */

const DOT_TONE = {
  delivered: 'positive',
  shipped: 'info',
  packing: 'info',
  pending: 'warning',
} as const;

/** A decision the seller has taken on this screen, before it syncs anywhere. */
type Verdict = 'shipped' | 'held';

/** How many rows a settled queue shows inline before "See all" takes over. */
const QUEUE_PREVIEW = 4;

export default function TodayScreen() {
  const { c } = useTheme();
  const { t, locale } = useI18n();
  const params = useLocalSearchParams<{ created?: string; amount?: string }>();
  const shadow = useScrollShadow();

  const [toast, setToast] = useState<string | null>(null);
  const [verdicts, setVerdicts] = useState<Record<string, Verdict>>({});
  const [note, setNote] = useState<{ id: string; verdict: Verdict } | null>(null);

  // Arriving back from the order builder raises the confirmation toast.
  useEffect(() => {
    if (!params.created) return;
    setToast(params.created);
    const timer = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(timer);
  }, [params.created]);

  // Creating an order nudges today's figures — by what the order was actually
  // worth, which the builder passes back. This used to jump to a flat 89150.
  const revenue = home.revenueToday + (toast ? Number(params.amount ?? 0) : 0);

  // ── The three queues, derived rather than listed ───────────────────────────
  // Deriving these from `orders` is what keeps them honest: a status change in
  // the data moves an order between sections instead of leaving two lists to
  // drift apart.
  const { decisions, readyToPack, onTheRoad } = useMemo(() => {
    const pending = orders.filter((o) => o.status === 'pending');
    return {
      decisions: pending.filter(
        (o) => o.payment === 'cod' && o.customer.risk !== 'excellent' && o.customer.risk !== 'good',
      ),
      readyToPack: pending.filter(
        (o) =>
          o.payment !== 'cod' || o.customer.risk === 'excellent' || o.customer.risk === 'good',
      ),
      onTheRoad: orders.filter((o) => o.status === 'shipped'),
    };
  }, []);

  const undecided = decisions.filter((o) => !verdicts[o.id]);
  const atRisk = undecided.reduce((sum, o) => sum + o.total, 0);

  const decide = useCallback((order: Order, verdict: Verdict) => {
    setVerdicts((prev) => ({ ...prev, [order.id]: verdict }));
    setNote({ id: order.id, verdict });
  }, []);

  const undo = useCallback(() => {
    if (!note) return;
    setVerdicts((prev) => {
      const next = { ...prev };
      delete next[note.id];
      return next;
    });
    setNote(null);
  }, [note]);

  // The decision note clears itself, but never while an Undo is still useful.
  useEffect(() => {
    if (!note) return;
    const timer = setTimeout(() => setNote(null), 4500);
    return () => clearTimeout(timer);
  }, [note]);

  return (
    <View style={{ flex: 1, backgroundColor: c.canvas }}>
      <TopChrome separated={shadow.separated}>
        <View
          style={{
            paddingTop: space.s2,
            paddingHorizontal: space.gutter,
            paddingBottom: space.s3,
            flexDirection: 'row',
            alignItems: 'center',
            gap: space.s3,
          }}
        >
          {/* The shop identity is the way into everything account-level. */}
          <Tap
            onPress={() => router.push('/account')}
            accessibilityRole="button"
            accessibilityLabel={t('today.openShop')}
            style={{ flexDirection: 'row', alignItems: 'center', gap: space.s3, flex: 1 }}
          >
            <Avatar initials={shop.initials} size={40} variant="contrast" />
            <View style={{ flex: 1 }}>
              <Txt variant="subheading" numberOfLines={1}>
                {name(shop.name, locale)}
              </Txt>
              <Txt variant="caption" color={c.muted}>
                {name(shop.date, locale)}
              </Txt>
            </View>
          </Tap>

          {/* The same glyph works on Orders, so it cannot be inert here. */}
          <IconButton
            name="search"
            filled
            label={t('search.orders')}
            onPress={() => router.push('/orders?search=1')}
          />
          <IconButton
            name="bell"
            filled
            badge={c.critical.dot}
            label={t('notif.title')}
            onPress={() => router.push('/notifications')}
          />
        </View>
      </TopChrome>

      <ScrollView
        {...shadow}
        contentContainerStyle={{
          paddingTop: space.s3,
          paddingHorizontal: space.gutter,
          paddingBottom: space.s8,
          gap: space.s6,
        }}
      >
        {/* ── The money band ──────────────────────────────────────────────
            Cash to collect leads because it is the figure the decisions
            above move, and the one that is still at risk. */}
        <Rise index={0}>
          <Statement>
            <View style={{ gap: space.s5 }}>
              <View style={{ gap: space.s1 }}>
                <Txt variant="eyebrow" transform="uppercase" color={c.mutedInverse}>
                  {t('home.cashToCollect')}
                </Txt>
                <Money
                  amount={home.cashToCollect}
                  variant="display"
                  color={c.inkInverse}
                  markColor={c.mutedInverse}
                  countUp
                />
                <Txt variant="caption" color={c.mutedInverse}>
                  {t('home.codOrdersOut', { count: home.codOrdersOut })}
                </Txt>
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  gap: space.s5,
                  paddingTop: space.s4,
                  borderTopWidth: 1,
                  borderTopColor: 'rgba(255,255,255,0.12)',
                }}
              >
                <View style={{ flex: 1, gap: 3 }}>
                  <Txt variant="caption" color={c.mutedInverse}>
                    {t('home.revenueToday')}
                  </Txt>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.s2 }}>
                    <Money
                      amount={revenue}
                      variant="subheading"
                      color={c.inkInverse}
                      markColor={c.mutedInverse}
                    />
                    <Pill label={home.revenueDelta} tone={c.positive} />
                  </View>
                </View>
                <View style={{ flex: 1, gap: 3 }}>
                  <Txt variant="caption" color={c.mutedInverse}>
                    {t('home.afterCourier')}
                  </Txt>
                  <Money
                    amount={home.afterCourier}
                    variant="subheading"
                    color={c.inkInverse}
                    markColor={c.mutedInverse}
                  />
                </View>
              </View>
            </View>
          </Statement>
        </Rise>

        {/* ── Needs your decision ─────────────────────────────────────── */}
        <Rise index={1}>
          <View style={{ gap: space.s3 }}>
            <View style={{ gap: space.s1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.s2 }}>
                <Txt variant="heading" flex={1}>
                  {undecided.length ? t('today.decisionsTitle') : t('today.decisionsEmpty')}
                </Txt>
                {undecided.length ? (
                  <Pill label={String(undecided.length)} tone={c.warning} />
                ) : (
                  <Icon name="checkCircle" size={20} color={c.positive.dot} />
                )}
              </View>
              <Txt variant="bodySm" color={c.muted}>
                {undecided.length ? t('today.decisionsSub') : t('today.decisionsEmptySub')}
              </Txt>
            </View>

            {undecided.length ? (
              <>
                <View style={{ gap: space.s3 }}>
                  {undecided.map((order, i) => (
                    <DecisionCard key={order.id} order={order} index={i} onDecide={decide} />
                  ))}
                </View>

                {/* What the queue is worth, so the work has a visible stake. */}
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: space.s2,
                    paddingHorizontal: space.s1,
                  }}
                >
                  <Txt variant="caption" color={c.muted} flex={1}>
                    {t('today.atRisk')} · {t('today.atRiskSub', { count: undecided.length })}
                  </Txt>
                  <Money amount={atRisk} variant="label" weight={600} color={c.warning.fg} />
                </View>
              </>
            ) : null}
          </View>
        </Rise>

        {/* ── Ready to pack ───────────────────────────────────────────── */}
        {readyToPack.length ? (
          <Rise index={2}>
            <Section
              title={t('today.readyToPack')}
              action={t('common.seeAll')}
              onAction={() => router.push('/orders?filter=pending')}
            >
              <Txt variant="bodySm" color={c.muted} style={{ marginTop: -space.s1 }}>
                {t('today.readyToPackSub', { count: readyToPack.length })}
              </Txt>
              <Card flush>
                {readyToPack.slice(0, QUEUE_PREVIEW).map((order, i, shown) => (
                  <QueueRow
                    key={order.id}
                    order={order}
                    last={i === shown.length - 1}
                    // The row itself opens the order, so the trailing element is
                    // an affordance rather than a second control: a "Pack"
                    // button here would nest one tappable inside another and
                    // send both taps to exactly the same place.
                    trailing={<Icon name="chevronRight" size={16} color={c.faint} />}
                  />
                ))}
              </Card>
            </Section>
          </Rise>
        ) : null}

        {/* ── On the road ─────────────────────────────────────────────── */}
        {onTheRoad.length ? (
          <Rise index={3}>
            <Section
              title={t('today.onTheRoad')}
              action={t('common.seeAll')}
              onAction={() => router.push('/orders?filter=shipped')}
            >
              <Txt variant="bodySm" color={c.muted} style={{ marginTop: -space.s1 }}>
                {t('today.onTheRoadSub', { count: home.codOrdersOut })}
              </Txt>
              <Card flush>
                {onTheRoad.slice(0, QUEUE_PREVIEW).map((order, i, shown) => (
                  <QueueRow
                    key={order.id}
                    order={order}
                    last={i === shown.length - 1}
                    trailing={<Money amount={order.total} variant="label" weight={600} />}
                  />
                ))}
              </Card>
            </Section>
          </Rise>
        ) : null}

        {/* ── The status ledger, demoted to a summary strip ───────────── */}
        <Rise index={4}>
          <View style={{ gap: space.s3 }}>
            <Eyebrow>{t('status.all')}</Eyebrow>
            <Card padding={space.s4}>
              <View style={{ flexDirection: 'row' }}>
                {(
                  [
                    [home.counts.pending, t('status.pending'), 'warning'],
                    [home.counts.packing, t('status.packing'), 'info'],
                    [home.counts.shipped, t('status.shipped'), 'info'],
                    [home.counts.delivered, t('status.delivered'), 'positive'],
                  ] as const
                ).map(([count, label, tone]) => (
                  <View key={label} style={{ flex: 1, gap: space.s1, alignItems: 'flex-start' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                      <Dot color={c[tone].dot} size={7} />
                      <Txt variant="figure" size={21} mono>
                        {count}
                      </Txt>
                    </View>
                    <Txt variant="caption" color={c.muted}>
                      {label}
                    </Txt>
                  </View>
                ))}
              </View>
            </Card>
          </View>
        </Rise>
      </ScrollView>

      {/* A decision taken above is reversible for as long as the note is up. */}
      <Toast
        visible={!!note}
        tone={note?.verdict === 'shipped' ? 'positive' : 'warning'}
        icon={note?.verdict === 'shipped' ? 'check' : 'clock'}
        title={note?.verdict === 'shipped' ? t('today.decided') : t('today.held')}
        body={note?.verdict === 'shipped' ? t('today.decidedSub') : t('today.heldSub')}
        action={t('today.undo')}
        onAction={undo}
      />

      <Toast
        visible={!!toast && !note}
        title={t('new.created', { id: toast ?? '' })}
        body={t('new.createdSub')}
        action={t('new.open')}
        onAction={() =>
          router.push({ pathname: '/order/[id]', params: { id: (toast ?? '').replace('#', '') } })
        }
        bottom={16}
      />
    </View>
  );
}

/**
 * One order awaiting a ship-or-hold call.
 *
 * Both replies are on the card. The old screen made the seller open the order,
 * read the warning, go back, and repeat — so in practice the warnings were
 * scrolled past. The reason for the rating is stated in the same breath as the
 * question, because a rating without a reason is not something anyone can act on.
 */
function DecisionCard({
  order,
  index,
  onDecide,
}: {
  order: Order;
  index: number;
  onDecide: (order: Order, verdict: Verdict) => void;
}) {
  const { c } = useTheme();
  const { t, locale } = useI18n();
  const labels = useRiskLabels();
  const tone = c.risk[order.customer.risk];
  const { refused = 0, accepted = 0, orderCount = 0 } = order.customer;

  // The reason is derived from the customer's own history rather than written
  // per row, so it cannot contradict the rating sitting next to it.
  const reason =
    refused === 0 && accepted === 0
      ? t('home.firstOrderHighValue')
      : refused >= 2
        ? t('home.refusedOfLast', { refused, total: orderCount })
        : t('home.refusalsIn', { refused, total: orderCount });

  // No `<Rise>` here: the caller already wraps this card in one, and nesting
  // them made every decision card fade and lift twice.
  return (
    <Card edge={tone} raised padding={space.s4} style={{ paddingLeft: space.s4 + space.s1, gap: space.s4 }}>
        <Tap
          feedback="opacity"
          onPress={() =>
            router.push({ pathname: '/order/[id]', params: { id: order.id.replace('#', '') } })
          }
          accessibilityRole="button"
          accessibilityLabel={`${name(order.customer.name, locale)} ${labels[order.customer.risk]}`}
        >
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: space.s3 }}>
            <Avatar initials={order.customer.initials} size={44} tone={tone} />

            <View style={{ flex: 1, gap: 3 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.s2 }}>
                <Txt variant="subheading" flex={1} numberOfLines={1}>
                  {name(order.customer.name, locale)}
                </Txt>
                <Money amount={order.total} variant="subheading" />
              </View>
              <Txt variant="caption" mono color={c.muted}>
                {order.id}
              </Txt>
            </View>
          </View>
        </Tap>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: space.s2,
            backgroundColor: tone.bg,
            borderRadius: radius.md,
            paddingVertical: space.s2 + 2,
            paddingHorizontal: space.s3,
          }}
        >
          <Icon name="warningTriangle" size={16} color={tone.fg} />
          <Txt variant="caption" flex={1} color={tone.fg} weight={500}>
            {reason}
          </Txt>
        </View>

        {/* On `high` the emphasis flips.
            The warning still advises rather than blocks — both replies are one
            tap, and Ship it is never disabled. But drawing Ship it as the
            highest-contrast element on a card that has just said "first order,
            high value" is not advising, it is recommending, and it recommends
            the thing the screen exists to talk the seller out of. */}
        <View style={{ flexDirection: 'row', gap: space.s2 }}>
          <Button
            label={t('today.askAdvance')}
            variant={order.customer.risk === 'high' ? 'contrast' : 'secondary'}
            height={44}
            flex={1}
            onPress={() => onDecide(order, 'held')}
          />
          <Button
            label={t('today.ship')}
            variant={order.customer.risk === 'high' ? 'secondary' : 'contrast'}
            height={44}
            flex={1}
            onPress={() => onDecide(order, 'shipped')}
          />
        </View>
      </Card>
  );
}

/** A compact order row for the two settled queues. */
function QueueRow({
  order,
  last,
  trailing,
}: {
  order: Order;
  last?: boolean;
  trailing?: React.ReactNode;
}) {
  const { c } = useTheme();
  const { t, locale } = useI18n();

  return (
    <Row
      last={last}
      onPress={() =>
        router.push({ pathname: '/order/[id]', params: { id: order.id.replace('#', '') } })
      }
    >
      <Dot color={c[DOT_TONE[order.status]].dot} />
      <View style={{ flex: 1, gap: 2 }}>
        <Txt variant="label" weight={600} numberOfLines={1}>
          {name(order.customer.name, locale)}
        </Txt>
        <Txt variant="caption" mono color={c.muted}>
          {order.id}
          {order.placedAgo ? ` · ${order.placedAgo}` : ''}
        </Txt>
      </View>
      {order.payment === 'cod' ? (
        <Pill label={t('pay.cod')} tone={c.neutral} />
      ) : (
        <Pill label={t('pay.paid')} tone={c.positive} />
      )}
      {trailing}
    </Row>
  );
}
