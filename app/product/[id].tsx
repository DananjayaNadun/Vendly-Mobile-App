import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { AddStockSheet, stockRowsFor } from '@/components/AddStockSheet';
import { AppBar, BottomBar, TopChrome, useScrollShadow } from '@/components/AppBar';
import { NotFound } from '@/components/NotFound';
import { Txt } from '@/components/Txt';
import {
  Button,
  Card,
  Divider,
  Hatch,
  KeyValue,
  Money,
  Pill,
  QtyStepper,
  Row,
  Toggle,
} from '@/components/ui';
import { money, products, type Variant } from '@/data/mock';
import { website } from '@/data/more';
import { shareOnWhatsApp } from '@/lib/links';
import { useI18n, type TranslationKey } from '@/i18n';
import { Rise } from '@/theme/motion';
import { radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeContext';

/**
 * Product — stock is adjusted in place.
 *
 * A shop owner counting a shelf should not have to navigate somewhere else to
 * record what they can see, so the per-variant steppers edit the real value and
 * the total above them updates as they count.
 */
export default function ProductScreen() {
  const { c } = useTheme();
  const { t } = useI18n();
  const { id } = useLocalSearchParams<{ id: string }>();
  const shadow = useScrollShadow();

  const product = products.find((p) => p.id === id);
  // Hooks stay unconditional — the missing-product branch is taken below them.
  const [variants, setVariants] = useState<Variant[]>(product?.variants ?? []);
  const [units, setUnits] = useState(product?.stock ?? 0);
  const [hidden, setHidden] = useState(!!product?.hidden);
  const [stockOpen, setStockOpen] = useState(false);

  if (!product) return <NotFound title={t('products.title')} message={t('notFound.product')} />;

  const hasVariants = variants.length > 0;
  const total = hasVariants ? variants.reduce((sum, v) => sum + v.stock, 0) : units;
  const colourKey: Record<Variant['name'], TranslationKey> = {
    teal: 'colour.teal',
    mustard: 'colour.mustard',
    indigo: 'colour.indigo',
    natural: 'colour.natural',
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.canvas }}>
      <TopChrome separated={shadow.separated}>
        <AppBar
          title={product.title}
          subtitle={product.sku}
          onLeading={() => router.back()}
          trailingLabel={t('common.edit')}
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
        {/* ── Gallery ─────────────────────────────────────────────────── */}
        <Rise index={0}>
          <View style={{ flexDirection: 'row', gap: space.s2 }}>
            <Hatch
              style={{ flex: 2, height: 168, justifyContent: 'flex-end', padding: space.s3 }}
              radius={radius.lg}
            >
              <View
                style={{
                  alignSelf: 'flex-start',
                  backgroundColor: c.surface,
                  borderRadius: radius.sm,
                  paddingVertical: 4,
                  paddingHorizontal: 8,
                }}
              >
                <Txt size={11} mono color={c.muted}>
                  {t('product.photo')}
                </Txt>
              </View>
            </Hatch>
            <View style={{ flex: 1, gap: space.s2 }}>
              <Hatch style={{ flex: 1 }} radius={radius.lg} />
              <Hatch style={{ flex: 1 }} radius={radius.lg} />
            </View>
          </View>
        </Rise>

        {/* ── Pricing ─────────────────────────────────────────────────── */}
        <Rise index={1}>
          <Card padding={space.s5} style={{ gap: space.s3 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: space.s3,
              }}
            >
              <Txt variant="bodySm" color={c.body} flex={1}>
                {t('product.sellingPrice')}
              </Txt>
              <Money amount={product.price} variant="figure" size={24} />
            </View>
            <Divider />
            <KeyValue
              label={t('product.costMargin')}
              value={`${t('common.rs')} ${money(product.cost ?? 0)} · ${product.marginPct ?? 0}%`}
              mono
            />
          </Card>
        </Rise>

        {/* ── Stock ───────────────────────────────────────────────────────
            By colour where a product has them, and as a single count where it
            does not — a plain product used to show no stock control at all. */}
        <Rise index={2}>
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
                {hasVariants ? t('product.stockByColour') : t('product.stockUnits')}
              </Txt>
              <Pill
                label={t('product.total', { count: total })}
                tone={total === 0 ? c.critical : total <= 6 ? c.warning : c.positive}
              />
            </View>

            {hasVariants ? (
              variants.map((variant, i) => (
                <View
                  key={variant.name}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: space.s3,
                    opacity: variant.stock === 0 ? 0.6 : 1,
                  }}
                >
                  <Txt flex={1} variant="label" weight={500}>
                    {t(colourKey[variant.name])}
                  </Txt>
                  {variant.stock === 0 ? (
                    <Pill label={t('products.outOfStock')} tone={c.critical} />
                  ) : null}
                  <QtyStepper
                    large
                    value={variant.stock}
                    onChange={(qty) =>
                      setVariants((prev) =>
                        prev.map((v, index) => (index === i ? { ...v, stock: qty } : v)),
                      )
                    }
                  />
                </View>
              ))
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.s3 }}>
                <Txt flex={1} variant="label" weight={500}>
                  {product.title}
                </Txt>
                {units === 0 ? <Pill label={t('products.outOfStock')} tone={c.critical} /> : null}
                <QtyStepper large value={units} onChange={setUnits} />
              </View>
            )}
          </Card>
        </Rise>

        {/* ── Visibility ──────────────────────────────────────────────────
            Products screen and website both read this, and the Hidden filter
            had no way to ever get anything in it before. */}
        <Rise index={3}>
          <Card flush>
            {/* The row is not pressable: a `<Toggle>` inside a pressable row is
                a nested button, which is invalid HTML on web and ambiguous to a
                screen reader. See the README. */}
            <Row last>
              <View style={{ flex: 1, gap: 2 }}>
                <Txt variant="label" weight={600}>
                  {t('product.hide')}
                </Txt>
                <Txt variant="caption" color={c.muted}>
                  {hidden ? t('product.hidden') : t('web.productsNote')}
                </Txt>
              </View>
              <Toggle value={hidden} label={t('product.hide')} onChange={setHidden} />
            </Row>
          </Card>
        </Rise>

        {/* ── Velocity ────────────────────────────────────────────────── */}
        <Rise index={4}>
          <Card padding={space.s5} style={{ gap: space.s3 }}>
            <Txt variant="subheading">{t('product.last30')}</Txt>
            <KeyValue
              label={t('product.sold')}
              value={t('product.soldValue', {
                count: product.sold30 ?? 0,
                amount: money(product.revenue30 ?? 0),
              })}
              mono
            />
            <KeyValue
              label={t('product.runsOutIn')}
              value={t('product.runsOutValue', { days: product.runsOutDays ?? 0 })}
              tone={c.warning}
              mono
            />
          </Card>
        </Rise>
      </ScrollView>

      <BottomBar>
        <View style={{ flexDirection: 'row', gap: space.s3 }}>
          <Button
            label={t('product.shareToChat')}
            variant="secondary"
            flex={1}
            // Pasting a product into a chat is most of this app's selling, so
            // it hands WhatsApp the name, the price and the shop link.
            onPress={() =>
              shareOnWhatsApp(
                `${product.title} — ${t('common.rs')} ${money(product.price)}\nhttps://${website.domain}`,
              )
            }
          />
          <Button
            label={t('product.addStock')}
            variant="contrast"
            flex={1}
            icon="plus"
            onPress={() => setStockOpen(true)}
          />
        </View>
      </BottomBar>

      <AddStockSheet
        visible={stockOpen}
        onClose={() => setStockOpen(false)}
        rows={
          hasVariants
            ? variants.map((v) => ({ key: v.name, label: v.name, stock: v.stock }))
            : [{ key: product.id, label: product.title, stock: units }]
        }
        onSave={(received) => {
          if (hasVariants) {
            setVariants((prev) =>
              prev.map((v) => ({ ...v, stock: v.stock + (received[v.name] ?? 0) })),
            );
          } else {
            setUnits((prev) => prev + (received[product.id] ?? 0));
          }
        }}
      />
    </View>
  );
}
