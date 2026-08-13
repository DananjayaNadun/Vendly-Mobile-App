import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';

import { BottomBar } from '@/components/AppBar';
import { StepChrome } from '@/components/StepChrome';
import { Txt } from '@/components/Txt';
import {
  Button,
  Card,
  EmptyState,
  Eyebrow,
  Hatch,
  Money,
  QtyStepper,
  SearchField,
  Tap,
} from '@/components/ui';
import {
  fastMovers,
  findProduct,
  money,
  name,
  productLabel,
  sellableProducts,
  type Product,
  type VariantRef,
} from '@/data/mock';
import { Icon } from '@/icons';
import { useI18n } from '@/i18n';
import { Rise } from '@/theme/motion';
import { radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeContext';
import { useOrderDraft } from '@/state/OrderDraft';

/**
 * Step 2 — items, one tap each.
 *
 * Two lists, ordered by how likely a tap is: what this customer bought before,
 * then the shop's fast movers. Search is there but never the first move.
 */
export default function Step2Screen() {
  const { c } = useTheme();
  const { t, locale } = useI18n();
  const draft = useOrderDraft();
  const [query, setQuery] = useState('');

  const customerName = draft.customer
    ? name(draft.customer.name, locale).split(' ')[0]
    : t('new.someoneNew');

  /**
   * This customer's own history — not two product ids pinned to the screen.
   *
   * The header has always read "Items for {name}" off the matched customer while
   * this list was hardcoded to Nimali's two lines, so choosing Dilani produced
   * "Items for Dilani" above somebody else's purchases under the heading
   * "bought before". A customer with no history simply has no section.
   */
  const prior = useMemo(
    () =>
      (draft.customer?.boughtBefore ?? [])
        .map((entry) => ({ ...entry, product: findProduct(entry.productId) }))
        .filter((entry): entry is typeof entry & { product: Product } => !!entry.product),
    [draft.customer],
  );

  const priorIds = prior.map((entry) => entry.product.id);
  const movers = fastMovers.filter((p) => !priorIds.includes(p.id)).slice(0, 2);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return sellableProducts.filter(
      (p) => p.title.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <View style={{ flex: 1, backgroundColor: c.canvas }}>
      <StepChrome step={2} title={t('new.itemsFor', { name: customerName })} />

      {/* A real input. This was a `<Tap>` styled exactly like `SearchField` —
          same fill, radius, magnifier and grey placeholder — so it read as
          focusable and did nothing at all when tapped. */}
      <View style={{ paddingHorizontal: space.gutter, paddingBottom: space.s3 }}>
        <SearchField
          value={query}
          onChange={setQuery}
          placeholder={t('new.searchProduct')}
          cancelLabel={query ? t('search.cancel') : undefined}
          onCancel={query ? () => setQuery('') : undefined}
        />
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingTop: space.s2,
          paddingHorizontal: space.gutter,
          paddingBottom: space.s6,
          gap: space.s4,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {results ? (
          results.length === 0 ? (
            <EmptyState
              icon="search"
              title={t('new.noMatch', { query: query.trim() })}
              action={t('search.cancel')}
              onAction={() => setQuery('')}
            />
          ) : (
            <View style={{ gap: space.s2 }}>
              {results.map((product, i) => (
                <ProductLine key={product.id} product={product} index={i} />
              ))}
            </View>
          )
        ) : (
          <>
            {prior.length > 0 ? (
              <>
                <Eyebrow>{t('new.boughtBefore')}</Eyebrow>
                <View style={{ gap: space.s2 }}>
                  {prior.map((entry, i) => (
                    <ProductLine
                      key={entry.product.id}
                      product={entry.product}
                      variant={entry}
                      index={i}
                    />
                  ))}
                </View>
              </>
            ) : null}

            {movers.length > 0 ? (
              <>
                <Eyebrow style={{ paddingTop: space.s1 }}>{t('new.fastMovers')}</Eyebrow>
                <View style={{ flexDirection: 'row', gap: space.s2 }}>
                  {movers.map((product, i) => (
                    <Rise key={product.id} index={i + 2} style={{ flex: 1 }}>
                      <Card radius={radius.lg} padding={space.s3} style={{ gap: space.s2 }}>
                        <Hatch style={{ height: 72 }} radius={radius.sm} />
                        <Txt variant="label" weight={600} numberOfLines={2}>
                          {product.title}
                        </Txt>
                        <Txt variant="caption" mono color={c.body}>
                          {t('products.inStock', { count: product.stock })}
                        </Txt>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: space.s2,
                          }}
                        >
                          <Money amount={product.price} variant="caption" />
                          <Tap
                            accessibilityRole="button"
                            accessibilityLabel={`${t('common.add')} ${product.title}`}
                            onPress={() => draft.setQty(product.id, draft.qtyOf(product.id) + 1)}
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: radius.pill,
                              backgroundColor: c.contrast,
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Icon name="plus" size={16} color={c.onContrast} strokeWidth={2.2} />
                          </Tap>
                        </View>
                      </Card>
                    </Rise>
                  ))}
                </View>
              </>
            ) : null}
          </>
        )}
      </ScrollView>

      {/* The running total stays glued to the CTA so the seller can quote a
          price out loud without leaving the step. */}
      <BottomBar>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.s4 }}>
          <View style={{ gap: 2 }}>
            <Txt variant="caption" color={c.muted}>
              {draft.itemCount} {draft.itemCount === 1 ? t('common.item') : t('common.items')}
            </Txt>
            <Money amount={draft.subtotal} variant="figure" size={21} countUp />
          </View>
          <Button
            label={t('new.deliveryPayment')}
            flex={1}
            disabled={draft.itemCount === 0}
            onPress={() => router.push('/new-order/step3')}
          />
        </View>
      </BottomBar>
    </View>
  );
}

/** One addable product row, with its variant if this customer has a usual one. */
function ProductLine({
  product,
  variant,
  index,
}: {
  product: Product;
  variant?: VariantRef;
  index: number;
}) {
  const { c } = useTheme();
  const { t } = useI18n();
  const draft = useOrderDraft();

  return (
    <Rise index={index}>
      <Card
        radius={radius.lg}
        padding={space.s3}
        style={{ flexDirection: 'row', alignItems: 'center', gap: space.s3 }}
      >
        <Hatch style={{ width: 48, height: 48 }} radius={radius.sm} />
        <View style={{ flex: 1, gap: 2 }}>
          <Txt variant="label" weight={600}>
            {productLabel(product.title, variant, t)}
          </Txt>
          <Txt variant="caption" mono color={c.body}>
            {t('new.inStock', { price: money(product.price), stock: product.stock })}
          </Txt>
        </View>
        <QtyStepper
          value={draft.qtyOf(product.id)}
          onChange={(qty) => draft.setQty(product.id, qty)}
        />
      </Card>
    </Rise>
  );
}
