import React from 'react';
import { View } from 'react-native';

import { Icon } from '@/icons';
import { radius, size, space } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeContext';
import { Sheet } from './Overlays';
import { Txt } from './Txt';
import { Tap } from './ui';

/**
 * A sheet that asks one question and takes one answer — the analytics period
 * picker, the export format picker, and anything else shaped like a menu.
 */

export type Choice = { key: string; label: string; sub?: string };

export function ChoiceSheet({
  visible,
  onClose,
  title,
  subtitle,
  options,
  value,
  onSelect,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  options: Choice[];
  /** Omit for a menu of actions rather than a set of states. */
  value?: string;
  onSelect: (key: string) => void;
}) {
  const { c } = useTheme();

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title={title}
      subtitle={
        subtitle ? (
          <Txt variant="bodySm" leading={1.55} color={c.body}>
            {subtitle}
          </Txt>
        ) : undefined
      }
    >
      <View style={{ paddingHorizontal: space.s3, paddingTop: space.s3, paddingBottom: space.s2 }}>
        {options.map((option) => {
          const selected = value === option.key;
          return (
            <Tap
              key={option.key}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => {
                onSelect(option.key);
                onClose();
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: space.s3,
                minHeight: size.touch + 8,
                paddingVertical: space.s3,
                paddingHorizontal: space.s3,
                borderRadius: radius.lg,
                backgroundColor: selected ? c.accentSoft : 'transparent',
              }}
            >
              <View style={{ flex: 1, gap: 2 }}>
                <Txt variant="body" weight={selected ? 600 : 500}>
                  {option.label}
                </Txt>
                {option.sub ? (
                  <Txt variant="caption" color={c.muted}>
                    {option.sub}
                  </Txt>
                ) : null}
              </View>
              {selected ? <Icon name="check" size={17} color={c.accent} strokeWidth={2.2} /> : null}
            </Tap>
          );
        })}
      </View>
    </Sheet>
  );
}
