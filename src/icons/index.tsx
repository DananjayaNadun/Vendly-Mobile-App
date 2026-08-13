import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

/**
 * Every icon in the prototype, redrawn from its original SVG path data.
 *
 * The design draws on two grids — a 20×20 grid for navigation and action icons
 * and a 16×16 grid for the smaller inline ones — so each entry records its own
 * viewBox and default stroke width. Callers pass a rendered `size` in points and
 * the icon scales; they never need to know which grid it came from.
 */

type Glyph = {
  box: number;
  /** Default stroke width in viewBox units, as authored. */
  sw: number;
  /** Filled glyphs take `color` as a fill rather than a stroke. */
  filled?: boolean;
  draw: (color: string, sw: number) => React.ReactNode;
};

const stroke = (color: string, sw: number) => ({
  stroke: color,
  strokeWidth: sw,
  fill: 'none' as const,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

const glyphs = {
  home: {
    box: 20,
    sw: 1.7,
    draw: (c, sw) => (
      <Path d="M3.5 8.6 10 3.5l6.5 5.1V16a.9.9 0 0 1-.9.9H4.4a.9.9 0 0 1-.9-.9z" {...stroke(c, sw)} />
    ),
  },
  list: {
    box: 20,
    sw: 1.7,
    draw: (c, sw) => <Path d="M4 5.5h12M4 10h12M4 14.5h8" {...stroke(c, sw)} />,
  },
  plus: {
    box: 20,
    sw: 1.7,
    draw: (c, sw) => <Path d="M10 4v12M4 10h12" {...stroke(c, sw)} />,
  },
  grid: {
    box: 20,
    sw: 1.7,
    draw: (c, sw) => (
      <>
        <Rect x={3.5} y={3.5} width={5.5} height={5.5} rx={1.2} {...stroke(c, sw)} />
        <Rect x={11} y={3.5} width={5.5} height={5.5} rx={1.2} {...stroke(c, sw)} />
        <Rect x={3.5} y={11} width={5.5} height={5.5} rx={1.2} {...stroke(c, sw)} />
        <Rect x={11} y={11} width={5.5} height={5.5} rx={1.2} {...stroke(c, sw)} />
      </>
    ),
  },
  dotsHorizontal: {
    box: 20,
    sw: 0,
    filled: true,
    draw: (c) => (
      <>
        <Circle cx={4.5} cy={10} r={1.5} fill={c} />
        <Circle cx={10} cy={10} r={1.5} fill={c} />
        <Circle cx={15.5} cy={10} r={1.5} fill={c} />
      </>
    ),
  },
  dotsVertical: {
    box: 20,
    sw: 0,
    filled: true,
    draw: (c) => (
      <>
        <Circle cx={10} cy={4.5} r={1.6} fill={c} />
        <Circle cx={10} cy={10} r={1.6} fill={c} />
        <Circle cx={10} cy={15.5} r={1.6} fill={c} />
      </>
    ),
  },
  search: {
    box: 16,
    sw: 1.6,
    draw: (c, sw) => (
      <>
        <Circle cx={7} cy={7} r={4.6} {...stroke(c, sw)} />
        <Path d="M10.4 10.4 14 14" {...stroke(c, sw)} />
      </>
    ),
  },
  bell: {
    box: 16,
    sw: 1.6,
    draw: (c, sw) => (
      <>
        <Path d="M3.6 6.4a4.4 4.4 0 0 1 8.8 0v3l1.2 2H2.4l1.2-2z" {...stroke(c, sw)} />
        <Path d="M6.4 12.4a1.7 1.7 0 0 0 3.2 0" {...stroke(c, sw)} />
      </>
    ),
  },
  filter: {
    box: 16,
    sw: 1.6,
    draw: (c, sw) => <Path d="M2.5 4h11M4.5 8h7M6.5 12h3" {...stroke(c, sw)} />,
  },
  chevronRight: {
    box: 16,
    sw: 1.8,
    draw: (c, sw) => <Path d="m6 3.5 5 4.5-5 4.5" {...stroke(c, sw)} />,
  },
  chevronDown: {
    box: 16,
    sw: 1.8,
    draw: (c, sw) => <Path d="m3.5 6 4.5 5 4.5-5" {...stroke(c, sw)} />,
  },
  chevronLeft: {
    box: 20,
    sw: 1.8,
    draw: (c, sw) => <Path d="M11.5 4.5 6 10l5.5 5.5" {...stroke(c, sw)} />,
  },
  close: {
    box: 20,
    sw: 1.8,
    draw: (c, sw) => <Path d="M5 5l10 10M15 5 5 15" {...stroke(c, sw)} />,
  },
  check: {
    box: 12,
    sw: 2,
    draw: (c, sw) => <Path d="m2.5 6.2 2.4 2.4 4.6-5" {...stroke(c, sw)} />,
  },
  printer: {
    box: 20,
    sw: 1.7,
    draw: (c, sw) => (
      <>
        <Rect x={4} y={6} width={12} height={10} rx={1.5} {...stroke(c, sw)} />
        <Path d="M7 6V4.5h6V6" {...stroke(c, sw)} />
      </>
    ),
  },
  person: {
    box: 20,
    sw: 1.7,
    draw: (c, sw) => (
      <>
        <Circle cx={10} cy={7} r={3} {...stroke(c, sw)} />
        <Path d="M4.5 16c0-3 2.5-4.5 5.5-4.5s5.5 1.5 5.5 4.5" {...stroke(c, sw)} />
      </>
    ),
  },
  /** The "stock received" carton — a card-shaped box with a lid line. */
  box: {
    box: 20,
    sw: 1.7,
    draw: (c, sw) => (
      <>
        <Rect x={3.5} y={5} width={13} height={10} rx={2} {...stroke(c, sw)} />
        <Path d="M3.5 8.5h13" {...stroke(c, sw)} />
      </>
    ),
  },
  card: {
    box: 20,
    sw: 1.7,
    draw: (c, sw) => (
      <>
        <Rect x={3} y={6} width={14} height={9} rx={2} {...stroke(c, sw)} />
        <Path d="M3 9h14" {...stroke(c, sw)} />
      </>
    ),
  },
  truck: {
    box: 20,
    sw: 1.7,
    draw: (c, sw) => (
      <>
        <Rect x={2.5} y={6} width={10} height={8} rx={1.5} {...stroke(c, sw)} />
        <Path d="M12.5 8.5h3l2 2.5v3h-5z" {...stroke(c, sw)} />
        <Circle cx={6} cy={15} r={1.4} {...stroke(c, sw)} />
        <Circle cx={14} cy={15} r={1.4} {...stroke(c, sw)} />
      </>
    ),
  },
  globe: {
    box: 20,
    sw: 1.7,
    draw: (c, sw) => (
      <>
        <Circle cx={10} cy={10} r={6.5} {...stroke(c, sw)} />
        <Path d="M3.5 10h13M10 3.5c3 3.5 3 9.5 0 13-3-3.5-3-9.5 0-13" {...stroke(c, sw)} />
      </>
    ),
  },
  warningTriangle: {
    box: 20,
    sw: 1.7,
    draw: (c, sw) => (
      <>
        <Path d="M10 3.5 16.5 15h-13z" {...stroke(c, sw)} />
        <Path d="M10 8v3" {...stroke(c, sw)} />
      </>
    ),
  },
  backspace: {
    box: 20,
    sw: 1.7,
    draw: (c, sw) => (
      <>
        <Path d="M17 6H8L4 10l4 4h9z" {...stroke(c, sw)} />
        <Path d="m11 8 3 4M14 8l-3 4" {...stroke(c, sw)} />
      </>
    ),
  },

  // ── Added for the reworked navigation ─────────────────────────────────────
  // Drawn on the same 20×20 grid and stroke weight as the originals so they sit
  // alongside the transcribed set without looking borrowed.
  /** Insights tab. */
  chart: {
    box: 20,
    sw: 1.7,
    draw: (c, sw) => (
      <Path d="M4 16.5V11M8.7 16.5V5M13.3 16.5v-7M17.5 16.5v-4" {...stroke(c, sw)} />
    ),
  },
  /** COD reliability — a score you can trust. */
  shield: {
    box: 20,
    sw: 1.7,
    draw: (c, sw) => (
      <>
        <Path d="M10 3.2 4.8 5.4v4.3c0 3.2 2.1 6.1 5.2 7.1 3.1-1 5.2-3.9 5.2-7.1V5.4z" {...stroke(c, sw)} />
        <Path d="m7.8 9.9 1.6 1.6 3-3.2" {...stroke(c, sw)} />
      </>
    ),
  },
  /** Waiting on a decision. */
  clock: {
    box: 20,
    sw: 1.7,
    draw: (c, sw) => (
      <>
        <Circle cx={10} cy={10} r={6.6} {...stroke(c, sw)} />
        <Path d="M10 6.2V10l2.6 1.6" {...stroke(c, sw)} />
      </>
    ),
  },
  /**
   * WhatsApp / Messenger. Distinct from {@link phone}: the two actions sat side
   * by side under the same handset glyph, so neither said which was which.
   */
  chat: {
    box: 20,
    sw: 1.7,
    draw: (c, sw) => (
      <Path
        d="M10 3.6c3.9 0 7 2.6 7 5.9s-3.1 5.9-7 5.9a8.4 8.4 0 0 1-2.3-.3l-3.4 1.3 1-2.7A5.6 5.6 0 0 1 3 9.5c0-3.3 3.1-5.9 7-5.9z"
        {...stroke(c, sw)}
      />
    ),
  },
  /** Voice call on a customer. */
  phone: {
    box: 20,
    sw: 1.7,
    draw: (c, sw) => (
      <Path
        d="M6.6 3.8 8.4 8l-1.7 1.5a9.6 9.6 0 0 0 3.8 3.8L12 11.6l4.2 1.8-.7 2.6a1.3 1.3 0 0 1-1.4.9C8.6 16.3 3.7 11.4 3.1 5.9a1.3 1.3 0 0 1 .9-1.4z"
        {...stroke(c, sw)}
      />
    ),
  },
  /** Money collected / payments. */
  wallet: {
    box: 20,
    sw: 1.7,
    draw: (c, sw) => (
      <>
        <Rect x={3} y={5.2} width={14} height={10.6} rx={2.2} {...stroke(c, sw)} />
        <Path d="M3 8.6h14" {...stroke(c, sw)} />
        <Circle cx={13.4} cy={12.2} r={1} fill={c} />
      </>
    ),
  },
  /** Confirms an action succeeded — the decision toast. */
  checkCircle: {
    box: 20,
    sw: 1.7,
    draw: (c, sw) => (
      <>
        <Circle cx={10} cy={10} r={6.8} {...stroke(c, sw)} />
        <Path d="m7 10.2 2.1 2.1L13.2 8" {...stroke(c, sw)} />
      </>
    ),
  },
  /** Settings / account. */
  gear: {
    box: 20,
    sw: 1.7,
    draw: (c, sw) => (
      <>
        <Circle cx={10} cy={10} r={2.6} {...stroke(c, sw)} />
        <Path
          d="M10 2.8v1.9M10 15.3v1.9M15.1 4.9l-1.3 1.3M6.2 13.8l-1.3 1.3M17.2 10h-1.9M4.7 10H2.8M15.1 15.1l-1.3-1.3M6.2 6.2 4.9 4.9"
          {...stroke(c, sw)}
        />
      </>
    ),
  },
  /** Leading affordance on a sheet that opens a full screen. */
  arrowRight: {
    box: 20,
    sw: 1.7,
    draw: (c, sw) => <Path d="M4 10h12M11.2 5.2 16 10l-4.8 4.8" {...stroke(c, sw)} />,
  },
} satisfies Record<string, Glyph>;

export type IconName = keyof typeof glyphs;

export function Icon({
  name,
  size,
  color,
  /** Overrides the authored stroke width, in viewBox units. */
  strokeWidth,
}: {
  name: IconName;
  size: number;
  color: string;
  strokeWidth?: number;
}) {
  const glyph = glyphs[name] as Glyph;
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${glyph.box} ${glyph.box}`}>
      {glyph.draw(color, strokeWidth ?? glyph.sw)}
    </Svg>
  );
}
