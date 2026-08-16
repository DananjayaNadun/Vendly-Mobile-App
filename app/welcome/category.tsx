import { router } from 'expo-router';
import React, { useState } from 'react';
import { Animated, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandButton, Gap } from '@/components/brand/BrandKit';
import { Txt } from '@/components/Txt';
import { Tap } from '@/components/ui';
import { useI18n, type TranslationKey } from '@/i18n';
import { brand, brandRadius, brandSize, brandType } from '@/theme/brand';
import { Rise, useAnimatedNumber } from '@/theme/motion';

/**
 * 07 · Business category — the last step before the app.
 *
 * The CTA floats over the list rather than sitting at the end of it, so the
 * choice can be changed and confirmed without scrolling back down.
 *
 * Selection is drawn as a ring that fades over the card's resting border, so
 * moving the choice down the list reads as one mark travelling rather than two
 * borders swapping colour at the same instant.
 */

type Category = { key: string; emoji: string; title: TranslationKey; sub: TranslationKey };

const CATEGORIES: Category[] = [
  { key: 'clothing', emoji: '👗', title: 'cat.clothing', sub: 'cat.clothingSub' },
  { key: 'food', emoji: '🍔', title: 'cat.food', sub: 'cat.foodSub' },
  { key: 'beauty', emoji: '💄', title: 'cat.beauty', sub: 'cat.beautySub' },
  { key: 'electronics', emoji: '📱', title: 'cat.electronics', sub: 'cat.electronicsSub' },
  { key: 'home', emoji: '🏠', title: 'cat.home', sub: 'cat.homeSub' },
  { key: 'retail', emoji: '🛒', title: 'cat.retail', sub: 'cat.retailSub' },
];

export default function CategoryScreen() {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState('clothing');

  return (
    <View style={{ flex: 1, backgroundColor: brand.canvas }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 24,
          // Clear the floating CTA.
          paddingBottom: insets.bottom + brandSize.cta + 80,
        }}
      >
        <Rise style={{ paddingHorizontal: 30 }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
            <Txt
              flex={1}
              size={brandType.title.size}
              weight={brandType.title.weight}
              tracking={brandType.title.tracking}
              color={brand.text}
            >
              {t('auth.categoryTitle')}
            </Txt>
            <Txt size={22}>🏪</Txt>
          </View>
          <Gap h={16} />
          <Txt size={13.5} leading={1.55} color="#626262" style={{ maxWidth: 260 }}>
            {t('auth.categorySub')}
          </Txt>
        </Rise>

        <View style={{ paddingTop: 26, paddingHorizontal: 30, gap: 18 }}>
          {CATEGORIES.map((category, i) => (
            <CategoryCard
              key={category.key}
              category={category}
              index={i}
              active={category.key === selected}
              onPress={() => setSelected(category.key)}
            />
          ))}
        </View>
      </ScrollView>

      <View
        style={{
          position: 'absolute',
          left: brandSize.gutter,
          right: brandSize.gutter,
          bottom: insets.bottom + 28,
        }}
      >
        <BrandButton
          raised
          pill
          tall
          label={t('auth.continue')}
          onPress={() => router.replace('/home')}
        />
      </View>
    </View>
  );
}

function CategoryCard({
  category,
  index,
  active,
  onPress,
}: {
  category: Category;
  index: number;
  active: boolean;
  onPress: () => void;
}) {
  const { t } = useI18n();
  const ring = useAnimatedNumber(active ? 1 : 0);

  return (
    <Rise index={index}>
      <Tap
        onPress={onPress}
        accessibilityRole="radio"
        // ARIA expects `checked` on a radio, and react-native-web does not
        // derive it from `accessibilityState` — without this the chosen
        // category is signalled by border colour alone.
        aria-checked={active}
        accessibilityLabel={t(category.title)}
        style={{
          minHeight: 71,
          borderRadius: brandRadius.card,
          backgroundColor: brand.surface,
          borderWidth: 1.5,
          borderColor: '#E8E8E8',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 14,
          paddingHorizontal: 18,
          paddingVertical: 12,
          shadowColor: '#000000',
          shadowOpacity: 0.05,
          shadowRadius: 2,
          shadowOffset: { width: 0, height: 1 },
          elevation: 1,
        }}
      >
        {/* Sits exactly over the resting border — the card is inset by its own
            1.5pt border, so the negative offsets put this back on top of it. */}
        <Animated.View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: -1.5,
            left: -1.5,
            right: -1.5,
            bottom: -1.5,
            borderRadius: brandRadius.card,
            borderWidth: 1.5,
            borderColor: brand.primary,
            opacity: ring,
          }}
        />
        <Txt size={22}>{category.emoji}</Txt>
        <View style={{ flex: 1, gap: 4 }}>
          <Txt
            size={brandType.cardTitle.size}
            weight={brandType.cardTitle.weight}
            color={brand.text}
          >
            {t(category.title)}
          </Txt>
          <Txt size={12} color="#8B8B8B">
            {t(category.sub)}
          </Txt>
        </View>
      </Tap>
    </Rise>
  );
}
