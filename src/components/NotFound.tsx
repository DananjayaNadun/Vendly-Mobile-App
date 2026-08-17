import { router } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import { BrandButton } from '@/components/brand/BrandKit';
import { ShopNav } from '@/components/brand/ShopNav';
import { Txt } from '@/components/Txt';
import { LineIcon } from '@/icons/line';
import { useT } from '@/i18n';
import { brand, brandSize } from '@/theme/brand';
import { Rise } from '@/theme/motion';

/**
 * Shown when a route names a record that does not exist.
 *
 * Detail screens used to fall back to the first item in the list instead, which
 * meant a stale link quietly showed a *different customer's* order. Being unable
 * to find it is the honest answer.
 */
export function NotFound({ title, message }: { title: string; message: string }) {
  const t = useT();

  return (
    <View style={{ flex: 1, backgroundColor: brand.canvas }}>
      <ShopNav title={title} onBack />

      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: brandSize.gutter,
          gap: 16,
        }}
      >
        <Rise
          style={{
            width: 64,
            height: 64,
            borderRadius: 20,
            backgroundColor: brand.fill,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <LineIcon name="search" size={28} color={brand.muted} />
        </Rise>

        <Rise index={1}>
          {/* Not the bar's title — that already says which list you came from,
              and repeating it here said the same word twice in a row. */}
          <Txt size={19} weight={600} align="center" color={brand.text}>
            {t('notFound.title')}
          </Txt>
        </Rise>
        <Rise index={2}>
          <Txt size={13.5} leading={1.55} align="center" color={brand.body}>
            {message}
          </Txt>
        </Rise>

        <Rise index={3} style={{ alignSelf: 'stretch' }}>
          <BrandButton
            pill
            variant="outline"
            label={t('common.back')}
            onPress={() => router.back()}
            style={{ marginTop: 8 }}
          />
        </Rise>
      </View>
    </View>
  );
}
