import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { BottomBar } from '@/components/AppBar';
import { ChoiceSheet } from '@/components/ChoiceSheet';
import { useRiskLabels } from '@/components/CustomerRow';
import { StepChrome } from '@/components/StepChrome';
import { Rich, Txt } from '@/components/Txt';
import { Button, Card, Eyebrow, Money, Row, Segmented, Tap, Toggle } from '@/components/ui';
import { findProduct, money, name, nextOrderId, productLabel } from '@/data/mock';
import { Icon } from '@/icons';
import { useI18n } from '@/i18n';
import { Rise } from '@/theme/motion';
import { radius, size, space } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeContext';
import { useOrderDraft } from '@/state/OrderDraft';

/**
 * Step 3 — payment, with the warning inline.
 *
 * The COD warning sits in the flow rather than in a modal, and the CTA stays
 * live behind it. The seller is told what the risk is and offered the safer
 * path, but is never stopped.
 */
const DISCOUNTS = [0, 100, 250, 500];

export default function Step3Screen() {
  const { c } = useTheme();
  const { t, locale } = useI18n();
  const draft = useOrderDraft();
  const labels = useRiskLabels();
  const [discountOpen, setDiscountOpen] = useState(false);

  const customer = draft.customer;
  const isRisky = customer?.risk === 'risky' || customer?.risk === 'high';

  const create = () => {
    // A real implementation posts the draft; the toast is raised by Today. The
    // id and the amount travel with it so Today does not have to guess either —
    // the revenue figure there used to jump to a hardcoded 89150.
    const id = nextOrderId();
    const total = draft.total;
    draft.reset();
    router.dismissAll();
    router.replace({ pathname: '/(tabs)', params: { created: id, amount: String(total) } });
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.canvas }}>
      <StepChrome step={3} title={t('new.deliveryPayment')} />

      <ScrollView
        contentContainerStyle={{
          paddingTop: space.s2,
          paddingHorizontal: space.gutter,
          paddingBottom: space.s6,
          gap: space.s4,
        }}
      >
        {/* ── Address ─────────────────────────────────────────────────────
            Read-only. The "Change" link opened nothing, and an address editor
            is a screen this app does not have; saying what is on file is
            honest, offering to edit it was not. */}
        <Rise index={0}>
          <Card padding={space.s4}>
            <View style={{ gap: space.s1 }}>
              <Eyebrow>{t('new.addressOnFile')}</Eyebrow>
              <Txt
                variant="bodySm"
                leading={1.55}
                color={customer?.address ? c.body : c.warning.fg}
              >
                {customer?.address ?? t('new.noAddress')}
              </Txt>
            </View>
          </Card>
        </Rise>

        {/* ── Payment method ──────────────────────────────────────────── */}
        <Rise index={1}>
          <View style={{ gap: space.s2 }}>
            <Eyebrow>{t('new.howWillTheyPay')}</Eyebrow>
            <Segmented
              value={draft.payment}
              onChange={(key) => draft.setPayment(key as 'cod' | 'bank' | 'advance')}
              options={[
                { key: 'cod', label: t('new.payCod') },
                { key: 'bank', label: t('new.payBank') },
                { key: 'advance', label: t('new.payAdvance') },
              ]}
            />
          </View>
        </Rise>

        {/* ── Inline COD warning ──────────────────────────────────────── */}
        {isRisky && draft.payment === 'cod' && customer ? (
          <Rise>
            <Card tone={c.warning} padding={space.s4} style={{ gap: space.s3 }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: space.s3 }}>
                <Icon name="warningTriangle" size={18} color={c.warning.fg} />
                <Rich
                  flex={1}
                  variant="bodySm"
                  leading={1.55}
                  color={c.warningBody}
                  boldColor={c.warningInk}
                  text={t('new.riskInline', {
                    name: name(customer.name, locale).split(' ')[0],
                    level: labels[customer.risk],
                    refused: customer.refused ?? 0,
                    total: customer.orderCount ?? 0,
                  })}
                />
              </View>
              <Button
                label={t('new.sendAdvanceLink')}
                variant="contrast"
                height={44}
                fontSize={14}
                onPress={() => draft.setPayment('advance')}
              />
            </Card>
          </Rise>
        ) : null}

        {/* ── Totals ──────────────────────────────────────────────────────
            The lines are itemised now. Step 2 is a screen back, and a total
            with nothing behind it is the hardest thing to check out loud. */}
        <Rise index={2}>
          <Card flush>
            {draft.lines.map((line) => {
              const product = findProduct(line.productId);
              if (!product) return null;
              return (
                <Row key={line.productId}>
                  <Txt flex={1} variant="bodySm" color={c.body}>
                    {productLabel(product.title, undefined, t)}
                    <Txt variant="bodySm" mono color={c.muted}>
                      {`  ×${line.qty}`}
                    </Txt>
                  </Txt>
                  <Money amount={product.price * line.qty} variant="bodySm" color={c.body} />
                </Row>
              );
            })}
            <Row>
              <Txt flex={1} variant="bodySm" color={c.body}>
                {t('order.delivery')}
              </Txt>
              <Money amount={draft.delivery} variant="bodySm" color={c.body} />
            </Row>
            {/* Opens a real picker. "Add" was a live-looking link with no handler. */}
            <Row onPress={() => setDiscountOpen(true)}>
              <Txt flex={1} variant="bodySm" color={c.body}>
                {t('new.discount')}
              </Txt>
              {draft.discount > 0 ? (
                <Txt variant="label" weight={600} mono color={c.positive.fg}>
                  −{t('common.rs')} {money(draft.discount)}
                </Txt>
              ) : (
                <View
                  style={{
                    borderRadius: radius.pill,
                    paddingVertical: 4,
                    paddingHorizontal: 10,
                    backgroundColor: c.fill,
                  }}
                >
                  <Txt variant="label" weight={600} color={c.accent}>
                    {t('common.add')}
                  </Txt>
                </View>
              )}
            </Row>
            <Row last sunken style={{ paddingVertical: space.s4 }}>
              <Txt flex={1} variant="subheading">
                {draft.payment === 'cod' ? t('new.theyPayRider') : t('new.theyPayNow')}
              </Txt>
              <Money amount={draft.total} variant="figure" size={22} countUp />
            </Row>
          </Card>
        </Rise>

        {/* ── WhatsApp confirmation ───────────────────────────────────── */}
        <Rise index={3}>
          <Card
            padding={space.s4}
            style={{ flexDirection: 'row', alignItems: 'center', gap: space.s3 }}
          >
            <View style={{ flex: 1, gap: 2 }}>
              <Txt variant="label" weight={600}>
                {t('new.sendWhatsapp')}
              </Txt>
              <Txt variant="caption" color={c.muted}>
                {t('new.sendWhatsappSub')}
              </Txt>
            </View>
            <Toggle
              value={draft.notifyWhatsapp}
              label={t('new.sendWhatsapp')}
              onChange={draft.setNotifyWhatsapp}
            />
          </Card>
        </Rise>
      </ScrollView>

      <BottomBar>
        <Button
          label={t('new.create', { total: money(draft.total) })}
          height={size.primaryButtonTall}
          disabled={draft.itemCount === 0}
          onPress={create}
        />
      </BottomBar>

      <ChoiceSheet
        visible={discountOpen}
        onClose={() => setDiscountOpen(false)}
        title={t('new.discount')}
        value={String(draft.discount)}
        onSelect={(key) => draft.setDiscount(Number(key))}
        options={DISCOUNTS.filter((amount) => amount === 0 || amount < draft.subtotal).map(
          (amount) => ({
            key: String(amount),
            label: amount === 0 ? t('new.noDiscount') : `${t('common.rs')} ${money(amount)}`,
          }),
        )}
      />
    </View>
  );
}
