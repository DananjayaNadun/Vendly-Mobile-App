import { router } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import { Icon } from '@/icons';
import { useI18n } from '@/i18n';
import { radius, size, space } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeContext';
import { TopChrome } from './AppBar';
import { Txt } from './Txt';
import { ProgressSteps, Tap } from './ui';

/**
 * Shared chrome for the three order-builder steps: a dismiss affordance, the
 * step counter, and the progress rail.
 *
 * Extracted because having it copied into each step is how the three drifted
 * apart — step 1 painted itself on `surface` while 2 and 3 sat on `canvas`, so
 * the flow changed background colour halfway through.
 */
export function StepChrome({
  step,
  title,
  leading = 'back',
  onLeading,
}: {
  step: number;
  title: string;
  leading?: 'back' | 'close';
  /** Overrides the plain `router.back()` — step 1 uses it to drop the draft. */
  onLeading?: () => void;
}) {
  const { c } = useTheme();
  const { t } = useI18n();
  return (
    <TopChrome>
      <View
        style={{
          minHeight: size.appBar,
          flexDirection: 'row',
          alignItems: 'center',
          gap: space.s2,
          paddingHorizontal: space.s2,
        }}
      >
        <Tap
          onPress={onLeading ?? (() => router.back())}
          accessibilityRole="button"
          accessibilityLabel={leading === 'close' ? t('common.close') : t('common.back')}
          hitSlop={6}
          style={{
            width: size.touch,
            height: size.touch,
            borderRadius: radius.pill,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name={leading === 'close' ? 'close' : 'chevronLeft'} size={20} color={c.ink} />
        </Tap>
        <Txt flex={1} variant="heading" size={17} numberOfLines={1}>
          {title}
        </Txt>
        <Txt variant="caption" mono color={c.muted} style={{ paddingRight: space.s3 }}>
          {t('new.step', { current: step, total: 3 })}
        </Txt>
      </View>

      <View style={{ paddingHorizontal: space.gutter, paddingBottom: space.s4 }}>
        <ProgressSteps current={step} />
      </View>
    </TopChrome>
  );
}
