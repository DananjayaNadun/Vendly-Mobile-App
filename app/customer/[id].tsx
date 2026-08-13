import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { AppBar, TopChrome, useScrollShadow } from '@/components/AppBar';
import { CodRatingSheet } from '@/components/CodRatingSheet';
import { useRiskLabels } from '@/components/CustomerRow';
import { NotFound } from '@/components/NotFound';
import { RatingOverrideSheet } from '@/components/RatingOverrideSheet';
import { Txt } from '@/components/Txt';
import {
  Avatar,
  Button,
  Card,
  Divider,
  Eyebrow,
  Hatch,
  Money,
  Pill,
  Row,
  Section,
  StatTile,
  Tap,
} from '@/components/ui';
import {
  customers,
  findProduct,
  name,
  orders,
  productLabel,
  type Channel,
  type Product,
} from '@/data/mock';
import { Icon, type IconName } from '@/icons';
import { callNumber, openWhatsApp } from '@/lib/links';
import { useI18n, type TranslationKey } from '@/i18n';
import { Rise } from '@/theme/motion';
import { radius, space, type RiskLevel } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeContext';

/**
 * Customer profile.
 *
 * Ordered the way a seller reads it mid-chat: who they are and how to reach
 * them, whether COD is safe, then what they have actually bought. Reliability
 * gets its own block with the rating set large, because on this screen it is the
 * headline rather than a footnote on an order.
 */
export default function CustomerProfileScreen() {
  const { c } = useTheme();
  const { t, locale } = useI18n();
  const { id } = useLocalSearchParams<{ id: string }>();
  const shadow = useScrollShadow();
  const labels = useRiskLabels();

  const [ratingOpen, setRatingOpen] = useState(false);
  const [overrideOpen, setOverrideOpen] = useState(false);

  const customer = id ? customers[id] : undefined;
  // Hooks stay unconditional — the missing-customer branch is taken below them.
  const [level, setLevel] = useState<RiskLevel>(customer?.risk ?? 'average');
  const [overridden, setOverridden] = useState(!!customer?.overridden);

  if (!customer) return <NotFound title={t('customers.title')} message={t('notFound.customer')} />;

  const theirOrders = orders.filter((o) => o.customer.id === customer.id);
  const channelKey: Record<Channel, TranslationKey> = {
    whatsapp: 'channel.whatsapp',
    messenger: 'channel.messenger',
    instagram: 'channel.instagram',
  };
  const tone = c.risk[level];

  // This customer's own history — the same list step 2 of the builder reads.
  // It used to be `products.slice(0, 2)`, so every customer in the shop was
  // shown as having bought the same first two products in the catalogue.
  const bought = (customer.boughtBefore ?? [])
    .map((entry) => ({ ...entry, product: findProduct(entry.productId) }))
    .filter((entry): entry is typeof entry & { product: Product } => !!entry.product);

  return (
    <View style={{ flex: 1, backgroundColor: c.canvas }}>
      <TopChrome separated={shadow.separated}>
        <AppBar title={name(customer.name, locale)} onLeading={() => router.back()} />
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
        {/* ── Identity + contact ──────────────────────────────────────── */}
        <Rise index={0}>
          <Card padding={space.s5} style={{ gap: space.s4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.s3 }}>
              <Avatar initials={customer.initials} size={52} tone={tone} />
              <View style={{ flex: 1, gap: 2 }}>
                <Txt variant="subheading" size={18} numberOfLines={1}>
                  {name(customer.name, locale)}
                </Txt>
                <Txt variant="caption" mono color={c.body}>
                  {customer.phone}
                </Txt>
                {customer.channel ? (
                  <Txt variant="caption" color={c.muted}>
                    {t('profile.reachesYouOn', { channel: t(channelKey[customer.channel]) })}
                  </Txt>
                ) : null}
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: space.s2 }}>
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
            </View>

            {customer.address ? (
              <>
                <Divider />
                <View style={{ gap: space.s1 }}>
                  <Eyebrow>{t('order.deliverTo')}</Eyebrow>
                  <Txt variant="bodySm" leading={1.55} color={c.body}>
                    {customer.address}
                  </Txt>
                </View>
              </>
            ) : null}
          </Card>
        </Rise>

        {/* ── Value ───────────────────────────────────────────────────── */}
        <Rise index={1}>
          <View style={{ flexDirection: 'row', gap: space.s3 }}>
            <StatTile
              label={t('profile.spent')}
              value={`${t('common.rs')} ${(customer.totalSpent ?? 0).toLocaleString('en-US')}`}
            />
            <StatTile label={t('profile.orders')} value={String(customer.orderCount ?? 0)} />
          </View>
        </Rise>

        {/* ── Reliability ─────────────────────────────────────────────── */}
        <Rise index={2}>
          <Card edge={tone} padding={space.s5} style={{ paddingLeft: space.s5 + space.s1, gap: space.s3 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.s3 }}>
              <View style={{ flex: 1, gap: 2 }}>
                <Eyebrow>{t('profile.reliability')}</Eyebrow>
                <Txt variant="heading" size={20} color={tone.fg}>
                  {labels[level]}
                </Txt>
              </View>
              {overridden ? <Pill label={t('cod.overrides')} tone={c.info} /> : null}
            </View>

            <Txt variant="bodySm" leading={1.55} color={c.body}>
              {(customer.refused ?? 0) + (customer.accepted ?? 0) === 0
                ? t('rating.thinHistory', { count: customer.orderCount ?? 0 })
                : t('cod.refusedOf', {
                    refused: customer.refused ?? 0,
                    total: (customer.refused ?? 0) + (customer.accepted ?? 0),
                  })}
            </Txt>

            {overridden ? (
              <View
                style={{
                  backgroundColor: c.surfaceSunken,
                  borderRadius: radius.md,
                  padding: space.s3,
                }}
              >
                <Txt variant="caption" leading={1.5} color={c.body}>
                  {t('rating.overrideSticks')}
                </Txt>
              </View>
            ) : null}

            <View style={{ flexDirection: 'row', gap: space.s2 }}>
              <Button
                label={t('order.whyRating')}
                variant="quiet"
                flex={1}
                height={44}
                fontSize={14}
                onPress={() => setRatingOpen(true)}
              />
              <Button
                label={t('rating.setManually')}
                variant="quiet"
                flex={1}
                height={44}
                fontSize={14}
                onPress={() => setOverrideOpen(true)}
              />
            </View>
          </Card>
        </Rise>

        {/* ── Recent orders ───────────────────────────────────────────── */}
        <Rise index={3}>
          <Section title={t('profile.recentOrders')}>
            <Card flush>
              {theirOrders.length === 0 ? (
                <Row last>
                  <Txt flex={1} variant="bodySm" color={c.muted}>
                    {t('customers.noOrders')}
                  </Txt>
                </Row>
              ) : (
                theirOrders.map((order, i) => (
                  <Row
                    key={order.id}
                    last={i === theirOrders.length - 1}
                    onPress={() =>
                      router.push({
                        pathname: '/order/[id]',
                        params: { id: order.id.replace('#', '') },
                      })
                    }
                  >
                    <View style={{ flex: 1, gap: 2 }}>
                      <Txt variant="label" weight={600} mono>
                        {order.id}
                      </Txt>
                      <Txt variant="caption" color={c.muted}>
                        {t(`status.${order.status}` as 'status.pending')} ·{' '}
                        {order.payment === 'cod' ? t('pay.cod') : t('pay.paid')}
                      </Txt>
                    </View>
                    <Money amount={order.total} variant="label" weight={600} />
                    <Icon name="chevronRight" size={16} color={c.faint} />
                  </Row>
                ))
              )}
            </Card>
          </Section>
        </Rise>

        {/* ── Products purchased ──────────────────────────────────────── */}
        {bought.length > 0 ? (
          <Rise index={4}>
            <Section title={t('profile.bought')}>
              <Card flush>
                {bought.map((entry, i) => (
                  <Row
                    key={`${entry.product.id}-${entry.size ?? entry.variantKey ?? ''}`}
                    last={i === bought.length - 1}
                    onPress={() =>
                      router.push({ pathname: '/product/[id]', params: { id: entry.product.id } })
                    }
                  >
                    <Hatch style={{ width: 44, height: 44 }} radius={radius.sm} />
                    <View style={{ flex: 1, gap: 2 }}>
                      <Txt variant="label" weight={600}>
                        {productLabel(entry.product.title, entry, t)}
                      </Txt>
                      <Money amount={entry.product.price} variant="caption" />
                    </View>
                    <Txt variant="label" weight={600} mono color={c.body}>
                      {t('profile.timesBought', { count: entry.times ?? 1 })}
                    </Txt>
                  </Row>
                ))}
              </Card>
            </Section>
          </Rise>
        ) : null}

        {/* ── Private notes ───────────────────────────────────────────── */}
        <Rise index={5}>
          <Section title={t('profile.notes')}>
            <Card padding={space.s4} style={{ gap: space.s3 }}>
              {/* Read-only: there is no note editor to open, and a live-looking
                  "Add a note" link that does nothing is worse than its absence. */}
              <Txt variant="bodySm" leading={1.55} color={customer.note ? c.body : c.muted}>
                {customer.note ?? t('profile.notesEmpty')}
              </Txt>
            </Card>
          </Section>
        </Rise>
      </ScrollView>

      <CodRatingSheet
        visible={ratingOpen}
        onClose={() => setRatingOpen(false)}
        customer={{ ...customer, risk: level }}
        onOverride={() => {
          setRatingOpen(false);
          setOverrideOpen(true);
        }}
      />
      <RatingOverrideSheet
        visible={overrideOpen}
        onClose={() => setOverrideOpen(false)}
        customer={customer}
        value={level}
        overridden={overridden}
        onSave={(next) => {
          setLevel(next);
          setOverridden(true);
        }}
        onRemove={() => {
          setLevel(customer.risk);
          setOverridden(false);
        }}
      />
    </View>
  );
}

/** A contact affordance. Duplicated shape from the order screen, kept local. */
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
