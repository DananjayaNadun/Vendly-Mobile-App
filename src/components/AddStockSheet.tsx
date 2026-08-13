import React, { useEffect, useState } from 'react';
import { View } from 'react-native';

import type { Product, Variant } from '@/data/mock';
import { useI18n, type TranslationKey } from '@/i18n';
import { radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeContext';
import { Sheet } from './Overlays';
import { Txt } from './Txt';
import { Button, Divider, QtyStepper } from './ui';

/**
 * "Add stock" — the sheet behind the product screen's primary action.
 *
 * Counting a delivery is additive, so this asks for what *arrived* rather than a
 * new total, and shows the resulting total as it goes. Making the seller do that
 * arithmetic themselves is how stock counts drift.
 */

const COLOUR_KEYS: Record<Variant['name'], TranslationKey> = {
  teal: 'colour.teal',
  mustard: 'colour.mustard',
  indigo: 'colour.indigo',
  natural: 'colour.natural',
};

/** One counting row. A plain product has exactly one; a product with colours, one each. */
export type StockRow = { key: string; label: string; stock: number };

/**
 * Rows for a product, whether or not it has variants.
 *
 * This sheet used to take a `Variant[]` and nothing else, so opening it on a
 * product with no colours — half the catalogue — rendered no rows at all above a
 * "New total" of zero.
 */
export function stockRowsFor(product: Product): StockRow[] {
  if (!product.variants?.length) {
    return [{ key: product.id, label: product.title, stock: product.stock }];
  }
  return product.variants.map((v) => ({ key: v.name, label: v.name, stock: v.stock }));
}

export function AddStockSheet({
  visible,
  onClose,
  rows,
  onSave,
}: {
  visible: boolean;
  onClose: () => void;
  rows: StockRow[];
  onSave: (received: Record<string, number>) => void;
}) {
  const { c } = useTheme();
  const { t } = useI18n();
  const [received, setReceived] = useState<Record<string, number>>({});

  useEffect(() => {
    if (visible) setReceived({});
  }, [visible]);

  const addedTotal = Object.values(received).reduce((sum, n) => sum + n, 0);
  const currentTotal = rows.reduce((sum, row) => sum + row.stock, 0);

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title={t('stock.title')}
      subtitle={
        <Txt variant="bodySm" leading={1.55} color={c.body}>
          {t('stock.body')}
        </Txt>
      }
      footer={
        <Button
          label={t('stock.save')}
          disabled={addedTotal === 0}
          onPress={() => {
            onSave(received);
            onClose();
          }}
        />
      }
    >
      <View
        style={{
          paddingHorizontal: space.gutter,
          paddingTop: space.s5,
          paddingBottom: space.s2,
          gap: space.s4,
        }}
      >
        {rows.map((row) => {
          const added = received[row.key] ?? 0;
          const colourKey = COLOUR_KEYS[row.label as Variant['name']];
          return (
            <View key={row.key} style={{ flexDirection: 'row', alignItems: 'center', gap: space.s3 }}>
              <View style={{ flex: 1, gap: 2 }}>
                <Txt variant="body" weight={500}>
                  {colourKey ? t(colourKey) : row.label}
                </Txt>
                <Txt variant="caption" mono color={added > 0 ? c.positive.fg : c.muted}>
                  {row.stock} → {row.stock + added}
                </Txt>
              </View>
              <QtyStepper
                large
                value={added}
                onChange={(qty) => setReceived((prev) => ({ ...prev, [row.key]: qty }))}
              />
            </View>
          );
        })}

        <Divider />

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: c.surfaceSunken,
            borderRadius: radius.md,
            padding: space.s4,
            gap: space.s3,
          }}
        >
          <Txt flex={1} variant="subheading">
            {t('stock.newTotal')}
          </Txt>
          <Txt variant="figure" size={22} mono color={addedTotal > 0 ? c.positive.fg : c.ink}>
            {currentTotal + addedTotal}
          </Txt>
        </View>
      </View>
    </Sheet>
  );
}
