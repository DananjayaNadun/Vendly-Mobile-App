import React, { useId } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import { brand } from '@/theme/brand';

/**
 * The Vendly "V" and the blue gradient it sits on.
 *
 * Both are drawn with `react-native-svg`, which the project already carries.
 * The alternative for the gradient is `expo-linear-gradient`, and this
 * project's dependency tree has already refused one Expo module this session —
 * an SVG rect with a `<LinearGradient>` fill costs nothing and cannot fail to
 * install.
 *
 * `useId` per instance because react-native-svg emits real DOM ids on web, so a
 * shared gradient id would let the first instance's stops win everywhere. The
 * same trap the `<Hatch>` component documents.
 */

/** The full-bleed hero gradient: deep blue at the top, bright blue at the foot. */
export function BrandGradient({
  children,
  style,
}: {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const id = `vg-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  return (
    <View style={style}>
      <Svg
        width="100%"
        height="100%"
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      >
        <Defs>
          <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={brand.heroTop} />
            <Stop offset="1" stopColor={brand.heroBottom} />
          </LinearGradient>
        </Defs>
        <Rect x={0} y={0} width="100%" height="100%" fill={`url(#${id})`} />
      </Svg>
      {children}
    </View>
  );
}

/**
 * The "V" with its trailing pixels — a hand-drawn approximation of the mark on
 * the splash screen. Replace the paths wholesale when the real asset lands.
 */
export function Brandmark({ size = 132, color = '#FFFFFF' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size * 0.86} viewBox="0 0 120 104">
      {/* The stroke of the V, thick on the left and tapering through the join. */}
      <Path
        d="M8 12.5c0-2.4 2.2-3.6 5.6-3.6h20.2c4 0 6.4 1.6 7.8 5.3l19.2 51.1 2.4-6.2 12.6 4.2-9.4 24.6c-2.2 5.8-5.6 8.6-10.6 8.6-5.2 0-8.6-2.8-10.8-8.6L9.2 17.6A13 13 0 0 1 8 12.5z"
        fill={color}
      />
      <Path
        d="M64.2 59.1 82.6 34c2.4-3.3 5-4.8 8.4-4.8h13c3.4 0 5.2 1.2 5.2 3.5 0 1.5-.6 3.2-1.8 5L78.6 79.6z"
        fill={color}
      />
      {/* The three squares breaking away from the apex. */}
      <Rect x={86} y={0} width={13} height={13} rx={3} fill={color} />
      <Rect x={70} y={14} width={11} height={11} rx={2.6} fill={color} />
      <Rect x={95} y={17} width={9} height={9} rx={2.2} fill={color} />
      <Rect x={104} y={2} width={7} height={7} rx={1.8} fill={color} />
    </Svg>
  );
}
