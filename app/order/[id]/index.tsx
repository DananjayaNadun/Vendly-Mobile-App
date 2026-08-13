import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { AppBar, BottomBar, TopChrome, useScrollShadow } from '@/components/AppBar';
import { CancelOrderDialog } from '@/components/CancelOrderDialog';
import { ChoiceSheet } from '@/components/ChoiceSheet';
import { CodRatingSheet } from '@/components/CodRatingSheet';
import { useRiskLabels } from '@/components/CustomerRow';
import { NotFound } from '@/components/NotFound';
import { Toast } from '@/components/Overlays';
import { Txt } from '@/components/Txt';
import {
  Avatar,
  Button,
  Card,
  Divider,
  Eyebrow,
  Hatch,
  KeyValue,
  Money,
  Pill,
  Row,
  Tap,
} from '@/components/ui';
import {
  findCourier,
  findOrder,
  money,
  name,
  productLabel,
  statusRank,
  type Order,
} from '@/data/mock';
import { Icon, type IconName } from '@/icons';
import { callNumber, openWhatsApp } from '@/lib/links';
import { useI18n, type TranslationKey } from '@/i18n';
import { Rise } from '@/theme/motion';
import { radius, size, space } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeContext';

/**
 * One order.
 *
 * The COD verdict leads. It used to be a tinted banner above the customer card,
 * which put it in the same visual bracket as any other notice; here it is the
 * first thing on the screen, carries the rating as a headline, states the
 * specific money at stake, and offers both replies before anything else is read.
 *
 * The warning is still advisory rather than blocking — the seller knows things
 * the score does not, and an app that refuses to ship an order it dislikes gets
 * worked around rather than trusted.
 */
export default function OrderDetailScreen() {
  const { c } = useTheme();
  const { t, locale } = useI18n();
  const { id } = useLocalSearchParams<{ id: string }>();
  const shadow = useScrollShadow();
  const labels = useRiskLabels();

  const [ratingOpen, setRatingOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cancelled, setCancelled] = useState(false);

  const order = findOrder(id);
  if (!order) return <NotFound title={t('orders.title')} message={t('notFound.order')} />;

  const customer = order.customer;
  const tone = c.risk[customer.risk];
  const isCod = order.payment === 'cod';
  const isRisky = customer.risk === 'risky' || customer.risk === 'high';
  const courier = findCourier(order.courierId);
  const rank = statusRank[order.status];

  /**
   * The overflow menu.
   *
   * ⋮ used to open the Cancel Order dialog directly — the universal "more
   * options" glyph wired straight to the one destructive action on the screen,
   * with no menu in between and no accessible name on the button.
   */
  const menu = [
    ...(isCod ? [{ key: 'rating', label: t('order.whyRating') }] : []),
    ...(courier ? [{ key: 'label', label: t('order.viewLabel') }] : []),
    ...(order.status === 'delivered' || cancelled
      ? []
      : [{ key: 'cancel', label: t('cancel.confirm') }]),
  ];

  const onMenu = (key: string) => {
    if (key === 'rating') setRatingOpen(true);
    if (key === 'label') router.push({ pathname: '/order/[id]/waybill', params: { id: id ?? '' } });
    if (key === 'cancel') setCancelOpen(true);
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.canvas }}>
      <TopChrome separated={shadow.separated}>
        <AppBar
          title={order.id}
          titleMono
          subtitle={t('order.placedVia', {
            when: order.placedAgo ?? order.placedAt,
            channel: order.channel ?? '',
          })}
          onLeading={() => router.back()}
          trailingIcon="dotsVertical"
          trailingIconLabel={t('order.moreOptions')}
          onTrailing={() => setMenuOpen(true)}
        />
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
        {/* ── The verdict ─────────────────────────────────────────────── */}
        {isCod ? (
          <Rise index={0}>
            <Card
              tone={isRisky ? tone : undefined}
              edge={isRisky ? undefined : tone}
              padding={space.s5}
              style={{ gap: space.s4, ...(isRisky ? null : { paddingLeft: space.s5 + space.s1 }) }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.s3 }}>
                {/* The tile sits on the tinted card, so it takes the surface
                    colour rather than a white overlay — a 50% white wash looked
                    correct on the peach light theme and glared on dark. */}
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: radius.md,
                    backgroundColor: isRisky ? c.surface : tone.bg,
                    borderWidth: isRisky ? 1 : 0,
                    borderColor: tone.border,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon
                    name={isRisky ? 'warningTriangle' : 'shield'}
                    size={22}
                    color={tone.fg}
                  />
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Eyebrow color={isRisky ? c.warningBody : c.muted}>{t('rating.title')}</Eyebrow>
                  <Txt variant="heading" color={isRisky ? c.warningInk : c.ink}>
                    {labels[customer.risk]}
                  </Txt>
                </View>
              </View>

              <Txt
                variant="bodySm"
                leading={1.55}
                color={isRisky ? c.warningBody : c.body}
              >
                {isRisky
                  ? t('order.riskyBody', {
                      name: name(customer.name, locale).split(' ')[0],
                      refused: customer.refused ?? 0,
                      total: customer.orderCount ?? 0,
                      fee: money(450),
                    })
                  : t('rating.accepted', { count: customer.accepted ?? 0 })}
              </Txt>

              <View style={{ flexDirection: 'row', gap: space.s2 }}>
                <Button
                  label={t('order.whyRating')}
                  variant={isRisky ? undefined : 'secondary'}
                  tone={isRisky ? tone : undefined}
                  flex={1}
                  height={44}
                  fontSize={14}
                  onPress={() => setRatingOpen(true)}
                />
                {isRisky ? (
                  <Button
                    label={t('order.askAdvance')}
                    variant="contrast"
                    flex={1}
                    height={44}
                    fontSize={14}
                    // The safer path, drafted in the seller's own words. Advising
                    // and offering are the same gesture here — nothing is blocked.
                    onPress={() =>
                      openWhatsApp(
                        customer.phone,
                        t('order.advanceMessage', {
                          name: name(customer.name, locale).split(' ')[0],
                          id: order.id,
                          total: money(order.total),
                        }),
                      )
                    }
                  />
                ) : null}
              </View>
            </Card>
          </Rise>
        ) : null}

        {/* ── Customer ────────────────────────────────────────────────── */}
        <Rise index={1}>
          <Card padding={space.s5} style={{ gap: space.s4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.s3 }}>
              <Avatar initials={customer.initials} size={46} tone={tone} />
              <View style={{ flex: 1, gap: 2 }}>
                <Txt variant="subheading" numberOfLines={1}>
                  {name(customer.name, locale)}
                </Txt>
                <Txt variant="caption" mono color={c.body}>
                  {customer.phone}
                </Txt>
              </View>
              <Pill label={labels[customer.risk]} tone={tone} dot bordered />
            </View>

            <View style={{ flexDirection: 'row', gap: space.s2 }}>
              {/* Two different actions, two different glyphs — these both wore
                  the handset icon, so neither said which was which. */}
              <ContactAction
                icon="chat"
                label={t('order.whatsapp')}
                onPress={() => openWhatsApp(customer.phone)}
              />
              <ContactAction
                icon="phone"
                label={t('order.call')}
                onPress={() => callNumber(customer.phone)}
              />
              <ContactAction
                icon="person"
                label={t('order.profile')}
                onPress={() =>
                  router.push({ pathname: '/customer/[id]', params: { id: customer.id } })
                }
              />
            </View>

            {customer.address ? (
              <>
                <Divider />
                <View style={{ gap: space.s1 }}>
                  <Eyebrow>{t('order.deliverTo')}</Eyebrow>
                  <Txt variant="bodySm" leading={1.55} color={c.body}>
                    {customer.address}
                    {customer.landmark ? `\n${customer.landmark}` : ''}
                  </Txt>
                </View>
              </>
            ) : null}
          </Card>
        </Rise>

        {/* ── Line items + totals ─────────────────────────────────────── */}
        <Rise index={2}>
          <Card flush>
            {order.lines.map((line) => (
              <Row key={`${line.productId}-${line.size ?? line.variantKey ?? ''}`}>
                <Hatch style={{ width: 48, height: 48 }} radius={radius.sm} />
                <View style={{ flex: 1, gap: 2 }}>
                  <Txt variant="label" weight={600}>
                    {productLabel(line.title, line, t)}
                  </Txt>
                  <Txt variant="caption" color={c.muted}>
                    {t('order.qty', { qty: line.qty, price: money(line.price) })}
                  </Txt>
                </View>
                <Money amount={line.price * line.qty} variant="label" weight={600} />
              </Row>
            ))}

            <View
              style={{
                paddingVertical: space.s4,
                paddingHorizontal: space.s4,
                gap: space.s2,
                backgroundColor: c.surfaceSunken,
              }}
            >
              <KeyValue
                label={t('order.subtotal')}
                value={`${t('common.rs')} ${money(order.subtotal)}`}
                mono
              />
              <KeyValue
                label={t('order.delivery')}
                value={`${t('common.rs')} ${money(order.delivery)}`}
                mono
              />
              <Divider style={{ marginVertical: space.s1 }} />
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: space.s3,
                }}
              >
                <Txt variant="subheading" flex={1}>
                  {isCod ? t('order.collectOnDelivery') : t('pay.paid')}
                </Txt>
                <Money amount={order.total} variant="figure" size={22} />
              </View>
            </View>
          </Card>
        </Rise>

        {/* ── Timeline ────────────────────────────────────────────────── */}
        <Rise index={3}>
          <Card padding={space.s5} style={{ gap: space.s4 }}>
            <Txt variant="subheading">{t('order.timeline')}</Txt>

            <View style={{ gap: 0 }}>
              {timelineSteps(order, t).map((step, i, all) => (
                <TimelineStep
                  key={step.title}
                  title={step.title}
                  meta={step.meta}
                  done={step.done}
                  last={i === all.length - 1}
                />
              ))}
            </View>
          </Card>
        </Rise>
      </ScrollView>

      {/* ── Action bar ──────────────────────────────────────────────────────
          What the seller can do next depends entirely on where the order has
          got to. This bar used to read "Confirm & start packing" over an order
          that had already been delivered, and its printer button jumped past
          courier booking to a waybill that announced a pickup nobody had
          booked. */}
      {cancelled ? null : rank <= statusRank.packing ? (
        <BottomBar>
          <View style={{ flexDirection: 'row', gap: space.s3 }}>
            <Tap
              accessibilityRole="button"
              accessibilityLabel={t('courier.title')}
              style={{
                width: 56,
                minHeight: size.primaryButton,
                borderRadius: radius.md,
                borderWidth: 1,
                borderColor: c.border,
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onPress={() =>
                router.push({ pathname: '/order/[id]/courier', params: { id: id ?? '' } })
              }
            >
              <Icon name="printer" size={20} color={c.body} />
            </Tap>
            <Button
              label={order.status === 'pending' ? t('order.confirmAndPack') : t('courier.book')}
              flex={1}
              icon="truck"
              onPress={() =>
                router.push({ pathname: '/order/[id]/courier', params: { id: id ?? '' } })
              }
            />
          </View>
        </BottomBar>
      ) : courier ? (
        <BottomBar>
          <Button
            label={t('order.viewLabel')}
            variant={order.status === 'shipped' ? 'primary' : 'secondary'}
            icon="printer"
            onPress={() =>
              router.push({ pathname: '/order/[id]/waybill', params: { id: id ?? '' } })
            }
          />
        </BottomBar>
      ) : null}

      <ChoiceSheet
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        title={t('order.moreOptions')}
        options={menu}
        onSelect={onMenu}
      />

      <CodRatingSheet
        visible={ratingOpen}
        onClose={() => setRatingOpen(false)}
        customer={customer}
        onOverride={() => {
          // Overriding belongs to the customer, not to this one order.
          setRatingOpen(false);
          router.push({ pathname: '/customer/[id]', params: { id: customer.id } });
        }}
      />
      <CancelOrderDialog
        visible={cancelOpen}
        onClose={() => setCancelOpen(false)}
        onConfirm={() => setCancelled(true)}
      />

      <Toast
        visible={cancelled}
        tone="warning"
        icon="close"
        title={t('order.cancelled')}
        body={t('order.cancelledSub')}
        action={t('common.undo')}
        onAction={() => setCancelled(false)}
        bottom={24}
      />
    </View>
  );
}

/**
 * The four things that happen to an order, with the first unfinished one
 * carrying a note about what it is waiting for.
 *
 * Built from `order.status` rather than written out: the timeline was two
 * hardcoded steps with a hardcoded "Today, 08:14", so a parcel delivered on
 * 8 August still told the seller it was waiting on them to pack it.
 */
function timelineSteps(order: Order, t: (key: TranslationKey, vars?: Record<string, string | number>) => string) {
  const rank = statusRank[order.status];
  const courier = findCourier(order.courierId);
  const nextMeta =
    order.status === 'pending'
      ? t('order.waitingOnYou')
      : order.status === 'packing'
        ? t('order.waitingCourier')
        : order.status === 'shipped'
          ? t('order.withCourier')
          : undefined;

  const steps = [
    {
      title: t('order.placedViaChannel', { channel: order.channel ?? '' }),
      meta: order.placedAt,
    },
    { title: t('order.step.packed'), meta: undefined as string | undefined },
    {
      title: courier
        ? t('order.step.dispatched', { courier: courier.name })
        : t('order.step.dispatchedPlain'),
      meta: undefined as string | undefined,
    },
    {
      title: order.payment === 'cod' ? t('order.step.collected') : t('order.step.delivered'),
      meta: order.deliveredAt,
    },
  ];

  return steps.map((step, i) => {
    const done = i <= rank;
    return { ...step, done, meta: done ? step.meta : i === rank + 1 ? nextMeta : undefined };
  });
}

/** One of the three ways to reach a customer from their order. */
function ContactAction({
  icon,
  label,
  onPress,
}: {
  icon: IconName;
  label: string;
  onPress?: () => void;
}) {
  const { c } = useTheme();
  return (
    <Tap
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={{
        flex: 1,
        minHeight: 46,
        borderRadius: radius.md,
        backgroundColor: c.fill,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: space.s2,
      }}
    >
      <Icon name={icon} size={16} color={c.body} />
      <Txt variant="label" weight={600}>
        {label}
      </Txt>
    </Tap>
  );
}

/** A step on the order's timeline. */
function TimelineStep({
  title,
  meta,
  done,
  last,
}: {
  title: string;
  meta?: string;
  done?: boolean;
  last?: boolean;
}) {
  const { c } = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: space.s3 }}>
      <View style={{ alignItems: 'center', width: 10, paddingTop: 4 }}>
        <View
          style={{
            width: 10,
            height: 10,
            borderRadius: radius.pill,
            backgroundColor: done ? c.accent : 'transparent',
            borderWidth: done ? 0 : 2,
            borderColor: c.handle,
          }}
        />
        {last ? null : <View style={{ width: 2, flex: 1, backgroundColor: c.border }} />}
      </View>
      <View style={{ flex: 1, gap: 2, paddingBottom: last ? 0 : space.s4 }}>
        <Txt variant="label" weight={done ? 600 : 500} color={done ? c.ink : c.muted}>
          {title}
        </Txt>
        {meta ? (
          <Txt variant="caption" color={c.muted}>
            {meta}
          </Txt>
        ) : null}
      </View>
    </View>
  );
}
