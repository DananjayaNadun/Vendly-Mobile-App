import { router } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

import { BrandField } from '@/components/brand/BrandKit';
import { ShopNav } from '@/components/brand/ShopNav';
import { Txt } from '@/components/Txt';
import { shop } from '@/data/shop';
import { LineIcon } from '@/icons/line';
import { useI18n, type TranslationKey } from '@/i18n';
import { brand, brandChip, brandRadius } from '@/theme/brand';
import { Rise } from '@/theme/motion';

/**
 * 10 · Business profile.
 *
 * The logo tile, the shop's name and category, then six editable fields. Save
 * returns to Settings; nothing is persisted, as there is no backend.
 */

const FIELDS: { key: string; label: TranslationKey; value: string }[] = [
  { key: 'business', label: 'auth.businessName', value: shop.name },
  { key: 'owner', label: 'shop.ownerName', value: 'Pahan Perera' },
  { key: 'phone', label: 'auth.phone', value: shop.phone },
  { key: 'email', label: 'auth.email', value: shop.email },
  { key: 'address', label: 'shop.businessAddress', value: shop.address },
  { key: 'whatsapp', label: 'shop.whatsappNumber', value: shop.whatsapp },
];

export default function BusinessProfileScreen() {
  const { t } = useI18n();
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(FIELDS.map((f) => [f.key, f.value])),
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: brand.canvas }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ShopNav
        title={t('shop.businessProfile')}
        onBack
        cta={t('shop.save')}
        onCta={() => router.back()}
      />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 48 }}
        keyboardShouldPersistTaps="handled"
      >
        <Rise style={{ alignItems: 'center', paddingTop: 28 }}>
          <View
            style={{
              width: 98,
              height: 95,
              borderRadius: 26,
              backgroundColor: '#E4EAF1',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <LineIcon name="store" size={44} color={brand.primary} strokeWidth={1.6} />
          </View>
          <View style={{ height: 14 }} />
          <Txt size={16} weight={600} color={brand.text}>
            {shop.name}
          </Txt>
          <View style={{ height: 8 }} />
          <View
            style={{
              backgroundColor: brandChip.blue.bg,
              borderRadius: brandRadius.chip,
              paddingVertical: 3,
              paddingHorizontal: 10,
            }}
          >
            <Txt size={10} weight={700} color="#000DFF">
              {shop.category}
            </Txt>
          </View>
        </Rise>

        <View style={{ paddingTop: 30, paddingHorizontal: 36, gap: 20 }}>
          {FIELDS.map((field, i) => (
            <Rise key={field.key} index={1 + i}>
              <BrandField
                label={t(field.label)}
                value={values[field.key]}
                onChange={(next) => setValues((prev) => ({ ...prev, [field.key]: next }))}
              />
            </Rise>
          ))}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
