import React, { useEffect, useState } from 'react';
import { View } from 'react-native';

import { name, type Customer } from '@/data/mock';
import { useI18n } from '@/i18n';
import { Icon } from '@/icons';
import { radius, size, space, type RiskLevel } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeContext';
import { Sheet } from './Overlays';
import { Txt } from './Txt';
import { Button, Dot, Tap } from './ui';

/**
 * "Set the rating manually".
 *
 * The important part is the last line of the body copy: an override changes what
 * the seller is *shown*, it does not stop refusals being recorded — otherwise a
 * seller could hide a problem from themselves.
 */

const RAMP: RiskLevel[] = ['excellent', 'good', 'average', 'risky', 'high'];

export function RatingOverrideSheet({
  visible,
  onClose,
  customer,
  value,
  overridden,
  onSave,
  onRemove,
}: {
  visible: boolean;
  onClose: () => void;
  customer: Customer;
  value: RiskLevel;
  overridden?: boolean;
  onSave: (next: RiskLevel) => void;
  onRemove?: () => void;
}) {
  const { c } = useTheme();
  const { t, locale } = useI18n();
  const [choice, setChoice] = useState<RiskLevel>(value);

  // Re-opening should always start from what is currently in force.
  useEffect(() => {
    if (visible) setChoice(value);
  }, [visible, value]);

  const labels: Record<RiskLevel, string> = {
    excellent: t('risk.excellent'),
    good: t('risk.good'),
    average: t('risk.average'),
    risky: t('risk.risky'),
    high: t('risk.high'),
  };

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title={t('override.title')}
      subtitle={
        <Txt variant="bodySm" leading={1.55} color={c.body}>
          {t('override.body', { name: name(customer.name, locale).split(' ')[0] })}
        </Txt>
      }
      footer={
        <View style={{ gap: space.s2 }}>
          <Button
            label={t('override.save')}
            onPress={() => {
              onSave(choice);
              onClose();
            }}
          />
          {overridden && onRemove ? (
            <Button
              label={t('override.remove')}
              variant="secondary"
              onPress={() => {
                onRemove();
                onClose();
              }}
            />
          ) : null}
        </View>
      }
    >
      <View
        style={{
          paddingHorizontal: space.gutter,
          paddingTop: space.s4,
          paddingBottom: space.s1,
          gap: space.s2,
        }}
        accessibilityRole="radiogroup"
      >
        {RAMP.map((level) => {
          const selected = level === choice;
          return (
            <Tap
              key={level}
              onPress={() => setChoice(level)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: space.s3,
                borderRadius: radius.md,
                minHeight: size.touch + 6,
                paddingVertical: space.s3,
                paddingHorizontal: space.s4,
                borderWidth: selected ? 2 : 1,
                borderColor: selected ? c.accent : c.border,
                backgroundColor: selected ? c.accentSoft : 'transparent',
              }}
            >
              <Dot color={c.risk[level].dot} size={10} />
              <Txt flex={1} variant="body" weight={selected ? 600 : 500}>
                {labels[level]}
              </Txt>
              {selected ? <Icon name="check" size={17} color={c.accent} strokeWidth={2.2} /> : null}
            </Tap>
          );
        })}
      </View>
    </Sheet>
  );
}
