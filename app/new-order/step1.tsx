import { router } from 'expo-router';
import React from 'react';
import { ScrollView, View } from 'react-native';

import { useRiskLabels } from '@/components/CustomerRow';
import { NumberPad } from '@/components/NumberPad';
import { StepChrome } from '@/components/StepChrome';
import { Txt } from '@/components/Txt';
import { Avatar, Button, Card, Eyebrow, Pill, Tap } from '@/components/ui';
import { name } from '@/data/mock';
import { Icon } from '@/icons';
import { useI18n } from '@/i18n';
import { Rise } from '@/theme/motion';
import { radius, size, space } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeContext';
import { useOrderDraft } from '@/state/OrderDraft';

/** Step 1 — the number recalls the customer. */
export default function Step1Screen() {
  const { c } = useTheme();
  const { t, locale } = useI18n();
  const draft = useOrderDraft();
  const labels = useRiskLabels();

  const match = draft.match;

  return (
    <View style={{ flex: 1, backgroundColor: c.canvas }}>
      {/* Closing the builder drops the draft, so Add always opens a blank
          order. The draft outlives the screens, so without this a half-typed
          number and its line items came back the next time. */}
      <StepChrome
        step={1}
        title={t('new.title')}
        leading="close"
        onLeading={() => {
          draft.reset();
          router.back();
        }}
      />

      <ScrollView
        contentContainerStyle={{
          paddingTop: space.s2,
          paddingHorizontal: space.gutter,
          paddingBottom: space.s5,
          gap: space.s6,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ gap: space.s3 }}>
          <Txt variant="title">{t('new.customerNumber')}</Txt>

          {/* The focused field. */}
          <View
            style={{
              borderWidth: 2,
              borderColor: c.accent,
              borderRadius: radius.lg,
              backgroundColor: c.surface,
              paddingVertical: space.s4,
              paddingHorizontal: space.s4,
              flexDirection: 'row',
              alignItems: 'center',
              gap: space.s2,
              minHeight: 60,
            }}
          >
            <Txt size={22} mono tracking={0.02}>
              {draft.phone}
            </Txt>
            <View style={{ width: 2, height: 24, backgroundColor: c.accent }} />
          </View>
        </View>

        {match ? (
          <Rise>
            <View style={{ gap: space.s2 }}>
              <Eyebrow>{t('new.matched')}</Eyebrow>

              <Tap onPress={() => router.push('/new-order/step2')} accessibilityRole="button">
                <Card
                  edge={c.risk[match.risk]}
                  padding={space.s4}
                  style={{
                    paddingLeft: space.s4 + space.s1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: space.s3,
                  }}
                >
                  <Avatar initials={match.initials} size={44} tone={c.risk[match.risk]} />
                  <View style={{ flex: 1, gap: 3 }}>
                    <Txt variant="subheading" numberOfLines={1}>
                      {name(match.name, locale)}
                    </Txt>
                    <Txt variant="caption" color={c.body}>
                      {t('new.matchedMeta', {
                        orders: match.orderCount ?? 0,
                        date: match.lastOrder ?? '—',
                        city: match.city ?? '',
                      })}
                    </Txt>
                  </View>
                  <Pill label={labels[match.risk]} tone={c.risk[match.risk]} dot bordered />
                </Card>
              </Tap>

              <Tap
                accessibilityRole="button"
                onPress={() => {
                  draft.chooseNew();
                  router.push('/new-order/step2');
                }}
                style={{
                  borderWidth: 1,
                  borderStyle: 'dashed',
                  borderColor: c.handle,
                  borderRadius: radius.xl,
                  padding: space.s4,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: space.s3,
                }}
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: radius.pill,
                    borderWidth: 1,
                    borderColor: c.border,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon name="plus" size={19} color={c.body} />
                </View>
                <Txt flex={1} variant="subheading">
                  {t('new.someoneNew')}
                </Txt>
              </Tap>
            </View>
          </Rise>
        ) : null}
      </ScrollView>

      <View style={{ paddingHorizontal: space.gutter, paddingBottom: space.s3 }}>
        <Button
          label={
            match
              ? t('new.continueWith', { name: name(match.name, locale).split(' ')[0] })
              : t('new.someoneNew')
          }
          height={size.primaryButtonTall}
          onPress={() => router.push('/new-order/step2')}
        />
      </View>

      <NumberPad onDigit={draft.appendDigit} onBackspace={draft.backspace} />
    </View>
  );
}
