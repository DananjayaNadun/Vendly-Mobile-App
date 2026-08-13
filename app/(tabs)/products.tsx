import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';

import { LargeHeader, TopChrome, useScrollShadow } from '@/components/AppBar';
import { AddStockSheet, stockRowsFor } from '@/components/AddStockSheet';
import { ChoiceSheet } from '@/components/ChoiceSheet';
import { Toast } from '@/components/Overlays';
import { Txt } from '@/components/Txt';
import {
  Card,
  EmptyState,
  FilterChips,
  Hatch,
  IconButton,
  Meter,
  Money,
  Pill,
  SearchField,
  Tap,
} from '@/components/ui';
import { products, productsMeta, sellableProducts, type Product } from '@/data/mock';
import { Icon } from '@/icons';
import { useI18n } from '@/i18n';
import { Rise } from '@/theme/motion';
import { radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeContext';

/**
 * Products — stock is the headline.
 *
 * Products and inventory are deliberately one screen: on a phone, "what do I
 * have" and "how many are left" are the same question, so the stock count sits
 * on the row rather than behind a second tab. The count now also gets a meter,
 * because "6 left" means nothing without knowing what full looks like.
 *
 * "Add stock" is offered here as well as from the product's own screen — an
 * action belongs on the screen that owns its subject. The header used to carry a
 * "New" button instead, which opened nothing: there is no create-product screen
 * for it to open, and a control that leads nowhere is worse than no control.
 */
export default function ProductsScreen() {
  const { c } = useTheme();
  const { t } = useI18n();
  const shadow = useScrollShadow();
  const params = useLocalSearchParams<{ stock?: string }>();

  const [filter, setFilter] = useState('all');
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState('');
  const [stock, setStock] = useState(products.map((p) => ({ ...p })));
  const [pickerOpen, setPickerOpen] = useState(!!params.stock);
  const [stockFor, setStockFor] = useState<Product | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(timer);
  }, [toast]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q) {
      // Search ignores the stock filter, same reasoning as the orders list.
      return stock.filter(
        (p) => p.title.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q),
      );
    }
    // Hidden used to return `[]` unconditionally, so the chip was a dead end
    // that always produced the same bare "Hidden" empty state.
    if (filter === 'hidden') return stock.filter((p) => p.hidden);
    const sellable = stock.filter((p) => !p.hidden);
    if (filter === 'low') return sellable.filter((p) => p.state === 'low');
    if (filter === 'out') return sellable.filter((p) => p.state === 'out');
    return sellable;
  }, [filter, query, stock]);

  const addStock = (product: Product, received: Record<string, number>) => {
    const added = Object.values(received).reduce((sum, n) => sum + n, 0);
    if (added === 0) return;
    setStock((prev) =>
      prev.map((p) =>
        p.id === product.id
          ? {
              ...p,
              stock: p.stock + added,
              state: p.stock + added === 0 ? 'out' : p.stock + added <= 6 ? 'low' : 'ok',
              variants: p.variants?.map((v) => ({ ...v, stock: v.stock + (received[v.name] ?? 0) })),
            }
          : p,
      ),
    );
    setToast(t('products.stockAdded', { count: added, product: product.title }));
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.canvas }}>
      <TopChrome separated={shadow.separated}>
        {searching ? (
          <View
            style={{
              paddingTop: space.s2,
              paddingHorizontal: space.gutter,
              paddingBottom: space.s3,
            }}
          >
            <SearchField
              autoFocus
              value={query}
              onChange={setQuery}
              placeholder={t('search.products')}
              cancelLabel={t('search.cancel')}
              onCancel={() => {
                setSearching(false);
                setQuery('');
              }}
            />
          </View>
        ) : (
          <LargeHeader
            title={t('products.title')}
            actions={
              <>
                <IconButton
                  name="search"
                  filled
                  label={t('search.products')}
                  onPress={() => setSearching(true)}
                />
                <Tap
                  accessibilityRole="button"
                  accessibilityLabel={t('products.addStock')}
                  onPress={() => setPickerOpen(true)}
                  style={{
                    minHeight: 40,
                    borderRadius: radius.pill,
                    backgroundColor: c.contrast,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: space.s2,
                    paddingHorizontal: space.s4,
                  }}
                >
                  <Icon name="plus" size={16} color={c.onContrast} strokeWidth={2.2} />
                  <Txt variant="label" weight={600} color={c.onContrast}>
                    {t('products.addStock')}
                  </Txt>
                </Tap>
              </>
            }
            below={
              <FilterChips
                value={filter}
                onChange={setFilter}
                options={[
                  { key: 'all', label: t('status.all'), count: productsMeta.all },
                  {
                    key: 'low',
                    label: t('products.low', { count: productsMeta.low }),
                    tone: c.warning,
                  },
                  {
                    key: 'out',
                    label: t('products.out', { count: productsMeta.out }),
                    tone: c.critical,
                  },
                  { key: 'hidden', label: t('products.hidden', { count: productsMeta.hidden }) },
                ]}
              />
            }
          />
        )}
      </TopChrome>

      <ScrollView
        {...shadow}
        contentContainerStyle={{
          paddingTop: space.s4,
          paddingHorizontal: space.gutter,
          paddingBottom: space.s7,
          gap: space.s2,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {visible.length === 0 ? (
          query.trim() ? (
            <EmptyState
              icon="box"
              title={t('search.none', { query: query.trim() })}
              action={t('search.cancel')}
              onAction={() => setQuery('')}
            />
          ) : (
            <EmptyState
              icon="box"
              title={t('products.hiddenEmpty')}
              body={t('products.hiddenEmptyBody')}
            />
          )
        ) : null}

        {/* Forecast banner — the reason to open this screen unprompted. */}
        {query.trim() || visible.length === 0 || filter === 'hidden' ? null : (
          <Rise index={0}>
            <Tap onPress={() => setFilter('low')} accessibilityRole="button">
              <Card
                tone={c.warning}
                radius={radius.lg}
                padding={space.s4}
                style={{ flexDirection: 'row', alignItems: 'center', gap: space.s3 }}
              >
                <Icon name="warningTriangle" size={18} color={c.warning.fg} />
                <Txt flex={1} variant="bodySm" leading={1.45} color={c.warningBody}>
                  {t('products.runOutWarning', { count: productsMeta.low })}
                </Txt>
                <Icon name="chevronRight" size={16} color={c.warning.fg} />
              </Card>
            </Tap>
          </Rise>
        )}

        {visible.map((product, i) => (
          <ProductRow key={product.id} product={product} index={i + 1} />
        ))}
      </ScrollView>

      {/* Pick the product, then count what arrived. */}
      <ChoiceSheet
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
        title={t('products.pickForStock')}
        onSelect={(id) => setStockFor(stock.find((p) => p.id === id) ?? null)}
        options={sellableProducts.map((p) => ({
          key: p.id,
          label: p.title,
          sub: p.sku,
        }))}
      />

      <AddStockSheet
        visible={!!stockFor}
        onClose={() => setStockFor(null)}
        rows={stockFor ? stockRowsFor(stockFor) : []}
        onSave={(received) => stockFor && addStock(stockFor, received)}
      />

      <Toast visible={!!toast} title={toast ?? ''} />
    </View>
  );
}

function ProductRow({ product, index }: { product: Product; index: number }) {
  const { c } = useTheme();
  const { t } = useI18n();

  const stock =
    product.state === 'out'
      ? { label: t('products.outOfStock'), tone: c.critical, pct: 0 }
      : product.state === 'low'
        ? { label: t('products.left', { count: product.stock }), tone: c.warning, pct: 22 }
        : { label: t('products.inStock', { count: product.stock }), tone: c.positive, pct: 78 };

  const variantLabel = product.variantLabel
    ? product.variantLabel.kind === 'sizes'
      ? t('products.sizes', { count: product.variantLabel.count })
      : t('products.colours', { count: product.variantLabel.count })
    : null;

  return (
    <Rise index={index}>
      <Tap
        onPress={() => router.push({ pathname: '/product/[id]', params: { id: product.id } })}
        accessibilityRole="button"
        accessibilityLabel={`${product.title}, ${stock.label}`}
      >
        <Card
          radius={radius.lg}
          edge={product.state === 'ok' ? undefined : stock.tone}
          style={{
            padding: space.s3,
            paddingLeft: product.state === 'ok' ? space.s3 : space.s4,
            flexDirection: 'row',
            alignItems: 'center',
            gap: space.s3,
            opacity: product.state === 'out' ? 0.75 : 1,
          }}
        >
          <Hatch style={{ width: 60, height: 60 }} radius={radius.md} />

          <View style={{ flex: 1, gap: space.s1 }}>
            <Txt variant="subheading" numberOfLines={1}>
              {product.title}
            </Txt>
            <Txt variant="caption" mono color={c.muted}>
              {product.sku}
              {variantLabel ? ` · ${variantLabel}` : ''}
            </Txt>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.s2, flexWrap: 'wrap' }}>
              <Money amount={product.price} variant="label" weight={600} />
              <Pill label={stock.label} tone={stock.tone} />
              {product.hidden ? <Pill label={t('product.hidden')} tone={c.neutral} /> : null}
            </View>

            <Meter pct={stock.pct} tone={stock.tone} index={index} height={4} />
          </View>

          <Icon name="chevronRight" size={17} color={c.faint} />
        </Card>
      </Tap>
    </Rise>
  );
}
