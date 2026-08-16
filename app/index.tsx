import { router } from 'expo-router';
import React from 'react';
import { Animated, View } from 'react-native';

import { Brandmark, BrandGradient } from '@/components/brand/Brandmark';
import { Txt } from '@/components/Txt';
import { Tap } from '@/components/ui';
import { useI18n } from '@/i18n';
import { Rise, useReveal } from '@/theme/motion';

/**
 * 01 · Splash — tap anywhere to continue.
 *
 * A full-bleed blue gradient with the mark set high and the tagline in italic
 * beneath it. (The HTML prototype in the handoff draws this black with a hatched
 * placeholder tile; the exported PDF is the finished version and wins.)
 */
export default function SplashScreen() {
  const { t } = useI18n();
  // The mark scales up out of the gradient rather than being painted onto it.
  const { contentStyle } = useReveal(true, 'centre');

  return (
    <Tap
      onPress={() => router.replace('/welcome/onboarding')}
      feedback="none"
      accessibilityRole="button"
      accessibilityLabel={t('auth.getStarted')}
      style={{ flex: 1 }}
    >
      <BrandGradient style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ alignItems: 'center', paddingHorizontal: 32 }}>
          <Animated.View style={contentStyle}>
            <Brandmark size={190} />
          </Animated.View>
          <View style={{ height: 74 }} />
          {/* Italic as a local style rather than a `<Txt>` prop: no italic face
              is bundled (see `theme/fonts.ts`), so this is a synthetic slant on
              web and simply renders upright on Android — which is the right
              failure for Sinhala and Tamil, where faux-italic smears the mark. */}
          <Rise index={3}>
            <Txt
              size={19}
              weight={500}
              align="center"
              color="rgba(255,255,255,0.94)"
              style={{ fontStyle: 'italic' }}
            >
              {t('auth.tagline')}
            </Txt>
          </Rise>
        </View>
      </BrandGradient>
    </Tap>
  );
}
