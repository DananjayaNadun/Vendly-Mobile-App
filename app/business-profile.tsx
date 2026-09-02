import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

import { BrandField } from '@/components/brand/BrandKit';
import { ShopNav } from '@/components/brand/ShopNav';
import { Toast } from '@/components/Overlays';
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
 * writes back into the shared `shop` record — there is no backend, but the
 * edit should still stick for the rest of the session, and Settings (which
 * reads the same record for the identity block) should reflect it.
 */

const FIELDS: { key: keyof typeof shop | 'owner'; label: TranslationKey; value: string }[] = [
  { key: 'name', label: 'auth.businessName', value: shop.name },
  { key: 'owner', label: 'shop.ownerName', value: shop.owner },
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
  const [toast, setToast] = useState(false);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => router.back(), 900);
    return () => clearTimeout(timer);
  }, [toast]);

  const save = () => {
    for (const field of FIELDS) {
      (shop as unknown as Record<string, string>)[field.key] = values[field.key].trim();
    }
    setToast(true);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: brand.canvas }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ShopNav
        title={t('shop.businessProfile')}
        onBack
        cta={t('shop.save')}
        onCta={save}
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

      <Toast visible={toast} title={t('shop.profileSaved')} bottom={28} />
    </KeyboardAvoidingView>
  );
}
