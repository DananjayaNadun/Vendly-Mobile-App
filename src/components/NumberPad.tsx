import React from 'react';
import { View } from 'react-native';

import { Icon } from '@/icons';
import { radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeContext';
import { Txt } from './Txt';
import { Tap } from './ui';

/**
 * The phone keypad on step 1 of the order builder.
 *
 * A numeric pad rather than the system keyboard: the only thing being typed is a
 * phone number, and a digits-only pad removes the language-switch and
 * autocorrect surface entirely. Keys are 52pt, comfortably past the 44pt minimum
 * for a thumb on the move, and each carries its own accessibility label.
 */
export function NumberPad({
  onDigit,
  onBackspace,
}: {
  onDigit: (digit: string) => void;
  onBackspace: () => void;
}) {
  const { c } = useTheme();

  const key = (
    child: React.ReactNode,
    onPress: () => void,
    label: string,
    special?: boolean,
  ) => (
    <Tap
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={{
        flex: 1,
        height: 52,
        borderRadius: radius.sm,
        backgroundColor: special ? c.keypadSpecial : c.surface,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {child}
    </Tap>
  );

  const digit = (d: string) =>
    key(
      <Txt size={22} weight={500} mono>
        {d}
      </Txt>,
      () => onDigit(d),
      d,
    );

  return (
    <View
      style={{
        backgroundColor: c.keypadBg,
        paddingTop: space.s2,
        paddingHorizontal: space.s2,
        paddingBottom: space.s3,
        gap: space.s2,
      }}
    >
      {[
        ['1', '2', '3'],
        ['4', '5', '6'],
        ['7', '8', '9'],
      ].map((row) => (
        <View key={row[0]} style={{ flexDirection: 'row', gap: space.s2 }}>
          {row.map((d) => (
            <React.Fragment key={d}>{digit(d)}</React.Fragment>
          ))}
        </View>
      ))}

      <View style={{ flexDirection: 'row', gap: space.s2 }}>
        {/* The bottom-left key is intentionally blank. */}
        <View
          style={{
            flex: 1,
            height: 52,
            borderRadius: radius.sm,
            backgroundColor: c.keypadSpecial,
          }}
        />
        {digit('0')}
        {key(<Icon name="backspace" size={22} color={c.body} />, onBackspace, 'Backspace', true)}
      </View>
    </View>
  );
}
