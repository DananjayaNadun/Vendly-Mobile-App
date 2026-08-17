import React, { useEffect, useMemo, useState } from 'react';
import { Animated, ScrollView, View } from 'react-native';

import { ShopCard, ShopChip, ShopSearch } from '@/components/brand/ShopKit';
import { ShopNav } from '@/components/brand/ShopNav';
import { ShopSheet } from '@/components/brand/ShopSheet';
import { BrandButton } from '@/components/brand/BrandKit';
import { Toast } from '@/components/Overlays';
import { Txt } from '@/components/Txt';
import { Tap } from '@/components/ui';
import { STOCK_CHIP, STOCK_LABEL, products as seed, stockState, type ShopProduct } from '@/data/shop';
import { LineIcon } from '@/icons/line';
import { useI18n } from '@/i18n';
import { brand, brandRadius } from '@/theme/brand';
import { Rise, usePop } from '@/theme/motion';

/**
 * 14 · Inventory.
 *
 * Each row carries a thumbnail placeholder, the name and price on the left, the
 * stock count on the right, and the state chip pinned top-right.
 *
 * Rows are tappable: counting a shelf is the thing a seller actually does here,
 * so tapping one opens a stepper that edits the real count and re-derives the
 * chip beside it.
 */
export default function InventoryScreen() {
  const { t } = useI18n();
  const [query, setQuery] = useState('');
  const [stock, setStock] = useState<ShopProduct[]>(seed.map((p) => ({ ...p })));
  const [editing, setEditing] = useState<ShopProduct | null>(null);
  const [draft, setDraft] = useState(0);
  const [addOpen, setAddOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  // The count is the only thing that changes when the stepper is pressed, and
  // a digit swapping for another digit is easy to miss.
  const bump = usePop(draft);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(timer);
  }, [toast]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return stock.filter((p) => !q || p.name.toLowerCase().includes(q));
  }, [query, stock]);

  const open = (product: ShopProduct) => {
    setEditing(product);
    setDraft(product.stock);
  };

  const save = () => {
    if (!editing) return;
    setStock((prev) => prev.map((p) => (p.name === editing.name ? { ...p, stock: draft } : p)));
    setToast(t('shop.stockSaved', { product: editing.name, count: draft }));
    setEditing(null);
  };

  return (
    <View style={{ flex: 1, backgroundColor: brand.canvas }}>
      <ShopNav
        large
        title={t('tab.inventory')}
        cta={t('shop.add')}
        onCta={() => setAddOpen(true)}
        below={
          <View style={{ paddingHorizontal: 16 }}>
            <ShopSearch value={query} onChange={setQuery} placeholder={t('shop.searchProducts')} />
          </View>
        }
      />

      <ScrollView
        contentContainerStyle={{ padding: 20, gap: 14, paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
      >
        {visible.length === 0 ? (
          <View style={{ alignItems: 'center', paddingTop: 48, gap: 12 }}>
            <LineIcon name="box" size={34} color={brand.muted} />
            <Txt size={14} align="center" color={brand.body}>
              {t('search.none', { query: query.trim() })}
            </Txt>
          </View>
        ) : (
          visible.map((product, i) => {
            const state = stockState(product.stock);
            return (
              <Rise key={product.name} index={i}>
              <Tap
                onPress={() => open(product)}
                accessibilityRole="button"
                accessibilityLabel={`${product.name}, ${t(STOCK_LABEL[state])}`}
              >
                <ShopCard padding={16}>
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 18 }}>
                    <View
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 10,
                        borderWidth: 1.6,
                        borderColor: brand.text,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <LineIcon name="image" size={22} color={brand.text} strokeWidth={1.6} />
                    </View>

                    <View style={{ flex: 1, gap: 14 }}>
                      <Txt size={14.5} weight={600} color={brand.text}>
                        {product.name}
                      </Txt>
                      <Txt size={14.5} weight={600} color={brand.text}>
                        LKR {product.price.toLocaleString('en-US')}
                      </Txt>
                    </View>

                    <View style={{ alignItems: 'flex-end', gap: 8 }}>
                      <ShopChip label={t(STOCK_LABEL[state])} tone={STOCK_CHIP[state]} />
                      <Txt size={12.5} weight={600} color="#8B8B8B">
                        {t('shop.stock')}
                      </Txt>
                      <Txt size={19} weight={700} color={brand.text}>
                        {product.stock}
                      </Txt>
                    </View>
                  </View>
                </ShopCard>
              </Tap>
              </Rise>
            );
          })
        )}
      </ScrollView>

      {/* ── Adjust stock ─────────────────────────────────────────────────── */}
      <ShopSheet
        visible={!!editing}
        onClose={() => setEditing(null)}
        title={t('shop.adjustStock')}
        subtitle={editing?.name}
      >
        <View style={{ alignItems: 'center', paddingVertical: 18, gap: 22 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 26 }}>
            <StepButton
              icon="minus"
              label={t('common.decrease')}
              onPress={() => setDraft((n) => Math.max(0, n - 1))}
            />
            <Animated.View style={{ transform: [{ scale: bump }] }}>
              <Txt
                size={40}
                weight={700}
                mono
                color={brand.text}
                style={{ minWidth: 90, textAlign: 'center' }}
              >
                {draft}
              </Txt>
            </Animated.View>
            <StepButton
              icon="plus"
              label={t('common.increase')}
              onPress={() => setDraft((n) => n + 1)}
            />
          </View>
          <ShopChip
            label={t(STOCK_LABEL[stockState(draft)])}
            tone={STOCK_CHIP[stockState(draft)]}
          />
          <BrandButton pill label={t('stock.save')} onPress={save} style={{ alignSelf: 'stretch' }} />
        </View>
      </ShopSheet>

      {/* ── Add product ──────────────────────────────────────────────────── */}
      <ShopSheet
        visible={addOpen}
        onClose={() => setAddOpen(false)}
        title={t('shop.addProduct')}
        subtitle={t('shop.addProductSoon')}
      >
        <View style={{ alignItems: 'center', paddingVertical: 24, gap: 14 }}>
          <LineIcon name="box" size={34} color={brand.muted} />
          <BrandButton
            pill
            variant="outline"
            label={t('common.close')}
            onPress={() => setAddOpen(false)}
            style={{ alignSelf: 'stretch' }}
          />
        </View>
      </ShopSheet>

      <Toast visible={!!toast} title={toast ?? ''} bottom={90} />
    </View>
  );
}

function StepButton({
  icon,
  label,
  onPress,
}: {
  icon: 'minus' | 'plus';
  label: string;
  onPress: () => void;
}) {
  return (
    <Tap
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={{
        width: 52,
        height: 52,
        borderRadius: brandRadius.pill,
        backgroundColor: brand.fill,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <LineIcon
        name={icon}
        size={22}
        color={brand.text}
        strokeWidth={2}
      />
    </Tap>
  );
}
