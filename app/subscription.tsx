import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';

import { AppBar, BottomBar, TopChrome, useScrollShadow } from '@/components/AppBar';
import { Dialog } from '@/components/Overlays';
import { Toast } from '@/components/Overlays';
import { Txt } from '@/components/Txt';
import { Button, Card, Eyebrow, Money, Pill, Row, Section, Tap } from '@/components/ui';
import { money, name, shop } from '@/data/mock';
import { plans, subscription, type Plan } from '@/data/more';
import { Icon } from '@/icons';
import { shareOnWhatsApp } from '@/lib/links';
import { useI18n } from '@/i18n';
import { Rise } from '@/theme/motion';
import { radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeContext';

/**
 * Subscription.
 *
 * Unlimited orders sit on every tier, which is the pricing promise the plan card
 * on Account makes; the comparison keeps that feature first on each plan so the
 * difference between tiers is legible at a glance.
 */
export default function SubscriptionScreen() {
  const { c } = useTheme();
  const { t, locale } = useI18n();
  const shadow = useScrollShadow();
  const [selected, setSelected] = useState(subscription.currentPlanId);
  const [confirm, setConfirm] = useState<'switch' | 'cancel' | null>(null);
  const [toast, setToast] = useState<{ title: string; body: string } | null>(null);

  const current = plans.find((p) => p.id === subscription.currentPlanId) ?? plans[1];
  const chosen = plans.find((p) => p.id === selected) ?? current;
  const changing = selected !== subscription.currentPlanId;

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  return (
    <View style={{ flex: 1, backgroundColor: c.canvas }}>
      <TopChrome separated={shadow.separated}>
        <AppBar title={t('sub.title')} onLeading={() => router.back()} />
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
        {/* ── Current plan ────────────────────────────────────────────── */}
        <Rise index={0}>
          <Card padding={space.s5} style={{ gap: space.s2 }}>
            <Eyebrow>{t('sub.current')}</Eyebrow>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: space.s3 }}>
              <Txt variant="title" size={26}>
                {t(current.nameKey)}
              </Txt>
              <Txt variant="bodySm" mono color={c.body}>
                {t('sub.perMonth', { amount: money(current.price) })}
              </Txt>
            </View>
            <Txt variant="bodySm" color={c.body}>
              {t('sub.renewsOn', { date: subscription.renews })}
            </Txt>
          </Card>
        </Rise>

        {/* ── Comparison ──────────────────────────────────────────────── */}
        <Rise index={1}>
          <Section title={t('sub.changePlan')}>
            {plans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                selected={plan.id === selected}
                isCurrent={plan.id === subscription.currentPlanId}
                onPress={() => setSelected(plan.id)}
              />
            ))}
          </Section>
        </Rise>

        {/* ── Payment method ──────────────────────────────────────────────
            Informational. The "Update" link here opened nothing, and card entry
            is not something this app should ever host — it says where that
            happens instead. */}
        <Rise index={2}>
          <View style={{ gap: space.s2 }}>
            <Eyebrow>{t('sub.paymentMethod')}</Eyebrow>
            <Card flush>
              <Row last>
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
                  <Icon name="card" size={19} color={c.body} />
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Txt variant="label" weight={500}>
                    {subscription.card}
                  </Txt>
                  <Txt variant="caption" color={c.muted}>
                    {t('sub.managedOnWeb')}
                  </Txt>
                </View>
              </Row>
            </Card>
          </View>
        </Rise>

        {/* ── Billing history ─────────────────────────────────────────── */}
        <Rise index={3}>
          <View style={{ gap: space.s2 }}>
            <Eyebrow>{t('sub.billingHistory')}</Eyebrow>
            <Card flush>
              {subscription.billing.map((entry, i) => (
                <Row key={entry.id} last={i === subscription.billing.length - 1}>
                  <Txt flex={1} variant="label" weight={500}>
                    {entry.period}
                  </Txt>
                  <Money amount={entry.amount} variant="bodySm" color={c.body} />
                  <Tap
                    feedback="opacity"
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel={`${t('sub.receipt')} ${entry.period}`}
                    onPress={() =>
                      shareOnWhatsApp(
                        t('sub.receiptMessage', {
                          shop: name(shop.name, locale),
                          period: entry.period,
                          amount: money(entry.amount),
                        }),
                      )
                    }
                  >
                    <Txt variant="label" weight={600} color={c.accent}>
                      {t('sub.receipt')}
                    </Txt>
                  </Tap>
                </Row>
              ))}
            </Card>
          </View>
        </Rise>

        <Tap
          feedback="opacity"
          accessibilityRole="button"
          accessibilityLabel={t('sub.cancel')}
          onPress={() => setConfirm('cancel')}
          style={{ paddingVertical: space.s3, alignItems: 'center', minHeight: 44 }}
        >
          <Txt variant="label" weight={600} color={c.danger}>
            {t('sub.cancel')}
          </Txt>
        </Tap>
      </ScrollView>

      {changing ? (
        <BottomBar>
          <Button
            label={t('sub.switchTo', { plan: t(chosen.nameKey) })}
            onPress={() => setConfirm('switch')}
          />
        </BottomBar>
      ) : null}

      {/* Both of these change what the shop pays, so both confirm first — and
          both used to be text with no handler at all. */}
      <Dialog visible={confirm !== null} onClose={() => setConfirm(null)}>
        <Txt variant="heading" size={20}>
          {confirm === 'cancel'
            ? t('sub.cancelTitle')
            : t('sub.switchTitle', { plan: t(chosen.nameKey) })}
        </Txt>
        <Txt variant="body" leading={1.55} color={c.body}>
          {confirm === 'cancel'
            ? t('sub.cancelBody', { date: subscription.renews })
            : t('sub.switchBody', { date: subscription.renews })}
        </Txt>
        <View style={{ flexDirection: 'row', gap: space.s3, paddingTop: space.s1 }}>
          <Button
            label={confirm === 'cancel' ? t('sub.cancelKeep') : t('search.cancel')}
            variant="secondary"
            flex={1}
            height={48}
            onPress={() => setConfirm(null)}
          />
          <Button
            label={confirm === 'cancel' ? t('sub.cancel') : t('sub.changePlan')}
            variant={confirm === 'cancel' ? 'danger' : 'primary'}
            flex={1}
            height={48}
            onPress={() => {
              setToast(
                confirm === 'cancel'
                  ? {
                      title: t('sub.cancelled'),
                      body: t('sub.cancelledSub', { date: subscription.renews }),
                    }
                  : {
                      title: t('sub.switched'),
                      body: t('sub.switchedSub', {
                        plan: t(chosen.nameKey),
                        date: subscription.renews,
                      }),
                    },
              );
              setConfirm(null);
            }}
          />
        </View>
      </Dialog>

      <Toast
        visible={!!toast}
        title={toast?.title ?? ''}
        body={toast?.body}
        tone="neutral"
        icon="clock"
        bottom={24}
      />
    </View>
  );
}

function PlanCard({
  plan,
  selected,
  isCurrent,
  onPress,
}: {
  plan: Plan;
  selected: boolean;
  isCurrent: boolean;
  onPress: () => void;
}) {
  const { c } = useTheme();
  const { t } = useI18n();

  return (
    <Tap
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={t(plan.nameKey)}
    >
      <Card
        padding={space.s5}
        bordered
        style={{
          gap: space.s3,
          borderWidth: selected ? 2 : 1,
          borderColor: selected ? c.accent : c.border,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.s3 }}>
          <Txt variant="subheading">{t(plan.nameKey)}</Txt>
          {isCurrent ? <Pill label={t('sub.currentBadge')} tone={c.info} /> : null}
          <Txt variant="label" weight={600} mono color={c.body} style={{ marginLeft: 'auto' }}>
            {t('sub.perMonth', { amount: money(plan.price) })}
          </Txt>
        </View>

        <View style={{ gap: space.s2 }}>
          {plan.featureKeys.map((key) => (
            <View key={key} style={{ flexDirection: 'row', alignItems: 'center', gap: space.s2 }}>
              <Icon name="check" size={14} color={c.positive.fg} strokeWidth={2.2} />
              <Txt variant="bodySm" color={c.body}>
                {t(key)}
              </Txt>
            </View>
          ))}
        </View>
      </Card>
    </Tap>
  );
}
