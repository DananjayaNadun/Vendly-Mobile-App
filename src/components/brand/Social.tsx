import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { Tap } from '@/components/ui';

/**
 * Facebook, Google and Apple, drawn as their own marks.
 *
 * The PDF shows all three in full brand colour rather than the two flat letter
 * tiles the HTML prototype falls back to. They are inert: wiring them needs an
 * OAuth client per provider, which is a backend concern rather than a design one.
 */

function Facebook({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Circle cx={24} cy={24} r={24} fill="#1877F2" />
      <Path
        d="M33.4 24.1c0-5.2-4.2-9.4-9.4-9.4s-9.4 4.2-9.4 9.4c0 4.7 3.4 8.6 7.9 9.3v-6.6h-2.4v-2.7h2.4v-2c0-2.3 1.4-3.6 3.5-3.6 1 0 2.1.2 2.1.2v2.3h-1.2c-1.2 0-1.5.7-1.5 1.5v1.8h2.6l-.4 2.7h-2.2v6.6c4.5-.7 7.9-4.6 7.9-9.3z"
        fill="#FFFFFF"
      />
    </Svg>
  );
}

function Google({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Path
        d="M45.1 24.5c0-1.6-.1-2.7-.4-3.9H24v7.1h12.1c-.2 1.8-1.6 4.6-4.5 6.4l-.1.3 6.5 5 .5.1c4.1-3.8 6.6-9.5 6.6-15z"
        fill="#4285F4"
      />
      <Path
        d="M24 46.1c5.9 0 10.9-2 14.5-5.3l-6.9-5.4c-1.8 1.3-4.3 2.2-7.6 2.2-5.8 0-10.7-3.8-12.5-9.1l-.3.1-6.8 5.2-.1.3C7.9 41 15.4 46.1 24 46.1z"
        fill="#34A853"
      />
      <Path
        d="M11.5 28.5c-.5-1.4-.7-2.9-.7-4.5s.3-3.1.7-4.5v-.3l-6.9-5.3-.2.1A22.9 22.9 0 0 0 1.9 24c0 3.7.9 7.2 2.5 10.3z"
        fill="#FBBC05"
      />
      <Path
        d="M24 10.4c4.1 0 6.9 1.8 8.5 3.3l6.2-6C34.9 4.2 29.9 1.9 24 1.9 15.4 1.9 7.9 7 4.4 13.7l7.1 5.5C13.3 14 18.2 10.4 24 10.4z"
        fill="#EA4335"
      />
    </Svg>
  );
}

function Apple({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Path
        d="M33.4 25.3c0-4.2 3.4-6.2 3.6-6.3-2-2.9-5-3.3-6.1-3.4-2.6-.3-5.1 1.5-6.4 1.5-1.3 0-3.4-1.5-5.6-1.4-2.9.04-5.5 1.7-7 4.3-3 5.2-.8 12.9 2.1 17.1 1.4 2.1 3.1 4.4 5.3 4.3 2.1-.1 2.9-1.4 5.5-1.4s3.3 1.4 5.6 1.3c2.3 0 3.7-2.1 5.1-4.2 1.6-2.4 2.3-4.7 2.3-4.8-.1 0-4.4-1.7-4.4-6.7zM29.2 12.6c1.1-1.4 1.9-3.3 1.7-5.2-1.7.1-3.7 1.1-4.9 2.5-1.1 1.2-2 3.2-1.8 5.1 1.9.1 3.8-1 5-2.4z"
        fill="#000000"
      />
    </Svg>
  );
}

const PROVIDERS = [
  { key: 'facebook', label: 'Facebook', Mark: Facebook },
  { key: 'google', label: 'Google', Mark: Google },
  { key: 'apple', label: 'Apple', Mark: Apple },
];

export function SocialRow({
  size = 46,
  onPress,
}: {
  size?: number;
  /** Called with the provider's name. Required — a silent button is the bug. */
  onPress: (provider: string) => void;
}) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 30, paddingTop: 24 }}>
      {PROVIDERS.map(({ key, label, Mark }) => (
        <Tap
          key={key}
          onPress={() => onPress(label)}
          accessibilityRole="button"
          accessibilityLabel={label}
          hitSlop={8}
          style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}
        >
          <Mark size={size} />
        </Tap>
      ))}
    </View>
  );
}
