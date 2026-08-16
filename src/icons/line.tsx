import React from 'react';
import Svg, { Circle, Path, Polyline, Rect } from 'react-native-svg';

/**
 * The line-icon set for the Vendly.lk design.
 *
 * The HTML prototype in the handoff uses emoji as placeholders (`🏠`, `📋`,
 * `👤`). The exported PDF — the finished artefact — draws stroke icons instead,
 * so these are redrawn to match it: a 24×24 grid, 1.8 stroke, round caps and
 * joins. Emoji survive only where the PDF genuinely shows one (the 👋 in
 * "Welcome back", the 🔐 on the reset card).
 *
 * Kept apart from `src/icons/index.tsx`, which is the existing app's set drawn
 * on a 20×20 grid to a different weight. Two icon languages for two design
 * languages, until one of them wins.
 */

type Draw = (color: string, sw: number) => React.ReactNode;

const s = (color: string, sw: number) => ({
  stroke: color,
  strokeWidth: sw,
  fill: 'none' as const,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

const glyphs = {
  // ── Tab bar ───────────────────────────────────────────────────────────────
  home: (c, w) => (
    <>
      <Path d="M3.5 10.2 12 3.6l8.5 6.6v9.1a1.1 1.1 0 0 1-1.1 1.1H4.6a1.1 1.1 0 0 1-1.1-1.1z" {...s(c, w)} />
      <Path d="M9.4 20.4v-6.1h5.2v6.1" {...s(c, w)} />
    </>
  ),
  orders: (c, w) => (
    <>
      <Rect x={4} y={2.8} width={16} height={18.4} rx={2.6} {...s(c, w)} />
      <Path d="M8.2 8.2h7.6M8.2 12h7.6M8.2 15.8h4.6" {...s(c, w)} />
    </>
  ),
  box: (c, w) => (
    <>
      <Path d="M20.5 7.7 12 2.9 3.5 7.7v8.6l8.5 4.8 8.5-4.8z" {...s(c, w)} />
      <Path d="M3.5 7.7 12 12.5l8.5-4.8M12 12.5v8.6" {...s(c, w)} />
    </>
  ),
  truck: (c, w) => (
    <>
      <Path d="M2.8 6.6h10.6v9.2H2.8z" {...s(c, w)} />
      <Path d="M13.4 9.6h3.7l3.1 3.3v2.9h-6.8z" {...s(c, w)} />
      <Circle cx={6.6} cy={17.8} r={1.9} {...s(c, w)} />
      <Circle cx={16.8} cy={17.8} r={1.9} {...s(c, w)} />
    </>
  ),
  users: (c, w) => (
    <>
      <Circle cx={10} cy={8} r={3.4} {...s(c, w)} />
      <Path d="M3.9 19.6c0-3.4 2.8-5.4 6.1-5.4s6.1 2 6.1 5.4" {...s(c, w)} />
      <Path d="M16.4 5.2a3.2 3.2 0 0 1 0 6M18 14.6c2 .6 3.4 2.2 3.4 4.4" {...s(c, w)} />
    </>
  ),
  chart: (c, w) => (
    <>
      <Path d="M4.2 20.2V13M9.4 20.2V6.4M14.6 20.2v-9.4M19.8 20.2v-5.6" {...s(c, w)} />
    </>
  ),

  // ── Actions ───────────────────────────────────────────────────────────────
  search: (c, w) => (
    <>
      <Circle cx={10.6} cy={10.6} r={6.4} {...s(c, w)} />
      <Path d="m15.4 15.4 4.4 4.4" {...s(c, w)} />
    </>
  ),
  bell: (c, w) => (
    <>
      <Path d="M5.6 9.8a6.4 6.4 0 0 1 12.8 0v4.3l1.7 2.9H3.9l1.7-2.9z" {...s(c, w)} />
      <Path d="M9.6 17.6a2.5 2.5 0 0 0 4.8 0" {...s(c, w)} />
    </>
  ),
  avatar: (c, w) => (
    <>
      <Circle cx={12} cy={12} r={9.2} {...s(c, w)} />
      <Circle cx={12} cy={9.6} r={3.1} {...s(c, w)} />
      <Path d="M6.3 19.4a6.2 6.2 0 0 1 11.4 0" {...s(c, w)} />
    </>
  ),
  back: (c, w) => <Path d="M19 12H5M11.2 5.2 4.4 12l6.8 6.8" {...s(c, w)} />,
  chevronRight: (c, w) => <Path d="m9.2 4.8 7.2 7.2-7.2 7.2" {...s(c, w)} />,
  plus: (c, w) => <Path d="M12 4.6v14.8M4.6 12h14.8" {...s(c, w)} />,
  phone: (c, w) => (
    <Path
      d="M7.9 4.2 10 9.2l-2 1.8a11.5 11.5 0 0 0 4.6 4.6l1.8-2 5 2.1-.8 3.1a1.6 1.6 0 0 1-1.7 1.1C10.3 19.2 4.4 13.3 3.7 6.6a1.6 1.6 0 0 1 1.1-1.7z"
      {...s(c, w)}
    />
  ),
  chat: (c, w) => (
    <Path
      d="M12 4.3c4.7 0 8.4 3.1 8.4 7.1s-3.7 7.1-8.4 7.1a10 10 0 0 1-2.8-.4l-4 1.6 1.2-3.2a6.7 6.7 0 0 1-2.8-5.1c0-4 3.7-7.1 8.4-7.1z"
      {...s(c, w)}
    />
  ),
  download: (c, w) => (
    <>
      <Path d="M12 3.8v11.4M7.6 11l4.4 4.2 4.4-4.2" {...s(c, w)} />
      <Path d="M4.4 18.4v1.4a.9.9 0 0 0 .9.9h13.4a.9.9 0 0 0 .9-.9v-1.4" {...s(c, w)} />
    </>
  ),
  clock: (c, w) => (
    <>
      <Circle cx={12} cy={12} r={8.4} {...s(c, w)} />
      <Path d="M12 6.9V12l3.3 2" {...s(c, w)} />
    </>
  ),
  checkCircle: (c, w) => (
    <>
      <Circle cx={12} cy={12} r={8.4} {...s(c, w)} />
      <Polyline points="8.3,12.3 10.9,14.9 15.9,9.3" {...s(c, w)} />
    </>
  ),
  check: (c, w) => <Polyline points="4.6,12.4 9.4,17.2 19.4,6.8" {...s(c, w)} />,
  warning: (c, w) => (
    <>
      <Path d="M12 3.6 21.4 20H2.6z" {...s(c, w)} />
      <Path d="M12 9.6v4.2M12 16.9v.1" {...s(c, w)} />
    </>
  ),
  image: (c, w) => (
    <>
      <Rect x={3.4} y={4.6} width={17.2} height={14.8} rx={2.4} {...s(c, w)} />
      <Circle cx={8.6} cy={9.6} r={1.5} {...s(c, w)} />
      <Path d="m4.6 17.4 4.8-4.6 3.4 3.2 3-2.8 3.6 3.4" {...s(c, w)} />
    </>
  ),
  tag: (c, w) => (
    <>
      <Path d="M11.2 3.4H20a.6.6 0 0 1 .6.6v8.8l-8.4 8.4a1 1 0 0 1-1.4 0l-7.6-7.6a1 1 0 0 1 0-1.4z" {...s(c, w)} />
      <Circle cx={16.4} cy={7.6} r={1.4} {...s(c, w)} />
    </>
  ),
  trend: (c, w) => (
    <>
      <Polyline points="3.6,16.8 9.2,11.2 13,15 20.4,7.6" {...s(c, w)} />
      <Path d="M15.4 7.6h5v5" {...s(c, w)} />
    </>
  ),
  bag: (c, w) => (
    <>
      <Path d="M5.4 7.8h13.2l-1 12.2a1 1 0 0 1-1 .9H7.4a1 1 0 0 1-1-.9z" {...s(c, w)} />
      <Path d="M8.8 7.8V6.2a3.2 3.2 0 0 1 6.4 0v1.6" {...s(c, w)} />
    </>
  ),
  card: (c, w) => (
    <>
      <Rect x={2.8} y={5.6} width={18.4} height={12.8} rx={2.4} {...s(c, w)} />
      <Path d="M2.8 9.8h18.4" {...s(c, w)} />
    </>
  ),
  globe: (c, w) => (
    <>
      <Circle cx={12} cy={12} r={8.6} {...s(c, w)} />
      <Path d="M3.4 12h17.2M12 3.4c3.8 4.6 3.8 12.6 0 17.2-3.8-4.6-3.8-12.6 0-17.2" {...s(c, w)} />
    </>
  ),
  store: (c, w) => (
    <>
      <Path d="M4 9.6h16v10a.9.9 0 0 1-.9.9H4.9a.9.9 0 0 1-.9-.9z" {...s(c, w)} />
      <Path d="M3.2 9.6 5 4.2h14l1.8 5.4" {...s(c, w)} />
      <Path d="M9.8 20.5v-5.2h4.4v5.2" {...s(c, w)} />
    </>
  ),
  gear: (c, w) => (
    <>
      <Circle cx={12} cy={12} r={3.2} {...s(c, w)} />
      <Path d="M12 3.2v2.4M12 18.4v2.4M18.2 5.8l-1.7 1.7M7.5 16.5l-1.7 1.7M20.8 12h-2.4M5.6 12H3.2M18.2 18.2l-1.7-1.7M7.5 7.5 5.8 5.8" {...s(c, w)} />
    </>
  ),
  logout: (c, w) => (
    <>
      <Path d="M9.4 20.4H5.6a1.2 1.2 0 0 1-1.2-1.2V4.8a1.2 1.2 0 0 1 1.2-1.2h3.8" {...s(c, w)} />
      <Path d="M15.4 16.4 19.8 12l-4.4-4.4M19.8 12H9" {...s(c, w)} />
    </>
  ),
} satisfies Record<string, Draw>;

export type LineIconName = keyof typeof glyphs;

export function LineIcon({
  name,
  size = 22,
  color,
  strokeWidth = 1.8,
}: {
  name: LineIconName;
  size?: number;
  color: string;
  strokeWidth?: number;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {glyphs[name](color, strokeWidth)}
    </Svg>
  );
}
