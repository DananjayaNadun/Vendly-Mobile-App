import React, { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';

import { ShopCard, ShopChip, ShopHeader, ShopSearch } from '@/components/brand/ShopKit';
import { Txt } from '@/components/Txt';
import { STOCK_CHIP, products } from '@/data/shop';
import { LineIcon } from '@/icons/line';
import { useI18n } from '@/i18n';
import { brand } from '@/theme/brand';

/**
 * 14 · Inventory.
 *
 * Each row carries a thumbnail placeholder, the name and price on the left, the
 * stock count on the right, and the state chip pinned top-right.
 */
export default function InventoryScreen() {
  const { t } = useI18n();
  const [query, setQuery] = useState('');

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => !q || p.name.toLowerCase().includes(q));
  }, [query]);

  return (
    <View style={{ flex: 1, backgroundColor: brand.canvas }}>
      <ShopHeader title={t('tab.inventory')} action={t('shop.add')} />

      <View style={{ paddingHorizontal: 16 }}>
        <ShopSearch value={query} onChange={setQuery} placeholder={t('shop.searchProducts')} />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, gap: 14, paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
      >
        {visible.length === 0 ? (
          <Txt size={14} align="center" color={brand.muted} style={{ paddingTop: 40 }}>
            {t('search.none', { query: query.trim() })}
          </Txt>
        ) : (
          visible.map((product) => (
            <ShopCard key={product.name} padding={16}>
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
                  <ShopChip label={product.state} tone={STOCK_CHIP[product.state]} />
                  <Txt size={12.5} weight={600} color="#8B8B8B">
                    {t('shop.stock')}
                  </Txt>
                  <Txt size={19} weight={700} color={brand.text}>
                    {product.stock}
                  </Txt>
                </View>
              </View>
            </ShopCard>
          ))
        )}
      </ScrollView>
    </View>
  );
}
