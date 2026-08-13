/**
 * Vendly design system — "Ledger".
 *
 * The product answers one question: *is this COD order safe to ship?* The old
 * system buried that answer in the same bordered grey card as everything else.
 * This one is built so the answer is the loudest thing on any screen carrying
 * it, and so money reads like money.
 *
 * Three rules hold the system together:
 *
 * 1. **Paper and ink, not dashboard grey.** The canvas is a warm off-white and
 *    the ink is a warm near-black. Cards separate by shadow and spacing rather
 *    than by giving every element the same 1px outline, so weight can carry
 *    hierarchy.
 * 2. **The accent stays out of the risk ramp.** Risk owns green / grey / amber /
 *    red, so the brand accent is indigo and never competes with a safety signal.
 *    Anything coloured green, amber or red on a screen is a judgement about an
 *    order — never decoration.
 * 3. **Numbers are the design.** Every figure is JetBrains Mono and set large.
 *    `mono` is never swapped per locale: amounts must read identically in
 *    English, Sinhala and Tamil.
 *
 * Names from the previous system are kept so screens can migrate one at a time
 * without the app ever failing to build.
 */

export type RiskLevel = 'excellent' | 'good' | 'average' | 'risky' | 'high';

export type ToneColors = {
  /** Text/icon colour. */
  fg: string;
  /** Fill behind the text. */
  bg: string;
  /** Border, or `undefined` where the tone is drawn borderless. */
  border?: string;
  /** The status dot that sometimes precedes the label. */
  dot: string;
  /**
   * The saturated bar drawn down the leading edge of a card or row that carries
   * this tone. This is the system's signature: risk is structural, so a list can
   * be triaged by colour down the left margin without reading a single word.
   */
  edge?: string;
};

export type Palette = {
  /** Screen background behind cards. */
  canvas: string;
  /** Card / app bar / tab bar fill. */
  surface: string;
  /** Slightly recessed rows inside a card (totals blocks). */
  surfaceSunken: string;
  /** The near-black "statement" surface used for the money hero. */
  surfaceInverse: string;
  /** Neutral chip + icon-button fill. */
  fill: string;
  /** A pressed neutral fill. */
  fillPressed: string;
  /** The card border. Used sparingly now — shadow does most of the separating. */
  border: string;
  /** Hairline between rows *inside* a card — lighter than `border`. */
  divider: string;

  /** Primary text. */
  ink: string;
  /** Secondary text — descriptions, table labels. AA on canvas. */
  body: string;
  /** Tertiary text — timestamps, captions, uppercase eyebrows. AA on canvas. */
  muted: string;
  /** Non-text only: disabled chevrons, inactive rails. Never carries meaning. */
  faint: string;

  /** Text colours for use on top of `surfaceInverse`. */
  inkInverse: string;
  bodyInverse: string;
  mutedInverse: string;

  /** The one accent. Deliberately not green, amber or red. */
  accent: string;
  accentPressed: string;
  accentSoft: string;
  accentInk: string;
  /** Text on top of `accent`. */
  onAccent: string;

  /** Near-black button ("Got it", "Add stock", active filter chip). */
  contrast: string;
  onContrast: string;

  /** Placeholder for product imagery. */
  hatchA: string;
  hatchB: string;

  /** Skeleton greys, darkest to lightest. */
  skeleton: [string, string, string];

  /** Inset track behind a segmented control. */
  track: string;
  /** Unfilled portion of a progress rail. */
  rail: string;
  /** The grab handle at the top of a bottom sheet. */
  handle: string;
  /** Phone keypad: chrome behind the keys, and the two non-digit keys. */
  keypadBg: string;
  keypadSpecial: string;

  /** Scrim behind sheets and dialogs. */
  scrim: string;

  danger: string;
  onDanger: string;

  risk: Record<RiskLevel, ToneColors>;
  /** Semantic tones reused outside the risk ramp (deltas, banners, badges). */
  positive: ToneColors;
  warning: ToneColors;
  critical: ToneColors;
  info: ToneColors;
  neutral: ToneColors;

  /** Warning banner body/heading text — deeper than the pill foreground. */
  warningInk: string;
  warningBody: string;
  positiveInk: string;

  /** Toast is inverted in both themes. */
  toastBg: string;
  toastFg: string;
  toastBody: string;
  toastAction: string;

  /** Charts. */
  chartTrack: string;
  chartBar: string;
  chartLossTrack: string;
  chartLossBar: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// Light — warm paper
// ─────────────────────────────────────────────────────────────────────────────

const light: Palette = {
  canvas: '#FAF9F7',
  surface: '#FFFFFF',
  surfaceSunken: '#F6F4F1',
  surfaceInverse: '#171419',
  fill: '#F1EFEB',
  fillPressed: '#E7E4DE',
  border: '#E7E3DC',
  divider: '#F0EDE8',

  ink: '#171419',
  body: '#55505C',
  // 5.1:1 on canvas — the old #8A93A2 sat at 3.5:1 and failed AA.
  muted: '#6F6979',
  faint: '#B4AEBC',

  inkInverse: '#FBFAFC',
  bodyInverse: '#B9B2C4',
  mutedInverse: '#8B8398',

  // 6.2:1 against white, so it is legible as text as well as as a fill.
  accent: '#4B3BFF',
  accentPressed: '#3A2AE0',
  accentSoft: '#EEECFF',
  accentInk: '#3A2AD6',
  onAccent: '#FFFFFF',

  contrast: '#171419',
  onContrast: '#FFFFFF',

  hatchA: '#F1EFEB',
  hatchB: '#E6E2DB',

  skeleton: ['#E5E1DA', '#EBE8E2', '#F1EFEB'],

  track: '#ECE9E4',
  rail: '#E7E3DC',
  handle: '#DAD5CD',
  keypadBg: '#EFECE7',
  keypadSpecial: '#E3DFD8',

  scrim: 'rgba(23,20,25,0.45)',

  danger: '#D42828',
  onDanger: '#FFFFFF',

  risk: {
    excellent: { fg: '#0E6B3F', bg: '#E8F7EF', border: '#C2E8D4', dot: '#10A05E', edge: '#10A05E' },
    good: { fg: '#0E6B3F', bg: '#E8F7EF', border: '#C2E8D4', dot: '#22B26B', edge: '#22B26B' },
    average: { fg: '#55505C', bg: '#F1EFEB', border: '#E2DED7', dot: '#9A93A3', edge: '#B4AEBC' },
    risky: { fg: '#9A4B00', bg: '#FFF4E6', border: '#FBE0BE', dot: '#F08C00', edge: '#F08C00' },
    high: { fg: '#A81B1B', bg: '#FEECEC', border: '#F9CFCF', dot: '#E02424', edge: '#E02424' },
  },

  positive: { fg: '#0E6B3F', bg: '#E8F7EF', border: '#C2E8D4', dot: '#10A05E', edge: '#10A05E' },
  warning: { fg: '#9A4B00', bg: '#FFF4E6', border: '#FBE0BE', dot: '#F08C00', edge: '#F08C00' },
  critical: { fg: '#A81B1B', bg: '#FEECEC', border: '#F9CFCF', dot: '#E02424', edge: '#E02424' },
  info: { fg: '#3A2AD6', bg: '#EEECFF', border: '#D8D3FF', dot: '#4B3BFF', edge: '#4B3BFF' },
  neutral: { fg: '#55505C', bg: '#F1EFEB', border: '#E2DED7', dot: '#9A93A3', edge: '#B4AEBC' },

  warningInk: '#6B3200',
  warningBody: '#8A4300',
  positiveInk: '#0B5732',

  toastBg: '#171419',
  toastFg: '#FFFFFF',
  toastBody: '#A8A1B2',
  toastAction: '#A99EFF',

  chartTrack: '#EAE7E1',
  chartBar: '#4B3BFF',
  chartLossTrack: '#F9CFCF',
  chartLossBar: '#E02424',
};

// ─────────────────────────────────────────────────────────────────────────────
// Dark — warm slate. Hue-matched to light rather than a separate blue-grey.
// ─────────────────────────────────────────────────────────────────────────────

const dark: Palette = {
  canvas: '#131117',
  surface: '#1C1922',
  surfaceSunken: '#17151D',
  surfaceInverse: '#262130',
  fill: '#262230',
  fillPressed: '#302B3C',
  border: '#2C2735',
  divider: '#26222E',

  ink: '#F5F2F7',
  body: '#C4BECD',
  muted: '#968FA2',
  faint: '#635C6F',

  inkInverse: '#F5F2F7',
  bodyInverse: '#C4BECD',
  mutedInverse: '#968FA2',

  accent: '#8878FF',
  accentPressed: '#7263FF',
  accentSoft: 'rgba(136,120,255,0.18)',
  accentInk: '#A99EFF',
  onAccent: '#100C22',

  contrast: '#F5F2F7',
  onContrast: '#131117',

  hatchA: '#262230',
  hatchB: '#312B3D',

  skeleton: ['#332D3F', '#2C2735', '#26222E'],

  track: '#100E14',
  rail: '#2C2735',
  handle: '#453E52',
  keypadBg: '#100E14',
  keypadSpecial: '#2C2735',

  scrim: 'rgba(0,0,0,0.62)',

  danger: '#FF5A5A',
  onDanger: '#1A0808',

  risk: {
    excellent: { fg: '#5CE0A0', bg: 'rgba(16,160,94,0.18)', border: 'rgba(16,160,94,0.34)', dot: '#3DD68C', edge: '#3DD68C' },
    good: { fg: '#5CE0A0', bg: 'rgba(16,160,94,0.18)', border: 'rgba(16,160,94,0.34)', dot: '#3DD68C', edge: '#3DD68C' },
    average: { fg: '#C4BECD', bg: 'rgba(150,143,162,0.16)', border: 'rgba(150,143,162,0.3)', dot: '#8B8398', edge: '#7C7488' },
    risky: { fg: '#FFB45C', bg: 'rgba(240,140,0,0.18)', border: 'rgba(240,140,0,0.34)', dot: '#FF9E1B', edge: '#FF9E1B' },
    high: { fg: '#FF8B8B', bg: 'rgba(224,36,36,0.18)', border: 'rgba(224,36,36,0.36)', dot: '#FF5A5A', edge: '#FF5A5A' },
  },

  positive: { fg: '#5CE0A0', bg: 'rgba(16,160,94,0.18)', border: 'rgba(16,160,94,0.34)', dot: '#3DD68C', edge: '#3DD68C' },
  warning: { fg: '#FFB45C', bg: 'rgba(240,140,0,0.18)', border: 'rgba(240,140,0,0.34)', dot: '#FF9E1B', edge: '#FF9E1B' },
  critical: { fg: '#FF8B8B', bg: 'rgba(224,36,36,0.18)', border: 'rgba(224,36,36,0.36)', dot: '#FF5A5A', edge: '#FF5A5A' },
  info: { fg: '#A99EFF', bg: 'rgba(136,120,255,0.18)', border: 'rgba(136,120,255,0.34)', dot: '#8878FF', edge: '#8878FF' },
  neutral: { fg: '#C4BECD', bg: 'rgba(150,143,162,0.16)', border: 'rgba(150,143,162,0.3)', dot: '#8B8398', edge: '#7C7488' },

  warningInk: '#FFC98A',
  warningBody: '#F0B981',
  positiveInk: '#5CE0A0',

  toastBg: '#F5F2F7',
  toastFg: '#131117',
  toastBody: '#55505C',
  toastAction: '#4B3BFF',

  chartTrack: '#2C2735',
  chartBar: '#8878FF',
  chartLossTrack: 'rgba(224,36,36,0.3)',
  chartLossBar: '#FF5A5A',
};

export const palettes = { light, dark };

// ─────────────────────────────────────────────────────────────────────────────
// Type
// ─────────────────────────────────────────────────────────────────────────────

/**
 * One scale, used everywhere. The previous design carried most of its content at
 * 11–13px; nothing that has to be *read* now sits below 13, and body copy is 15.
 * `tracking` is in `em` (as designers write it) and `<Txt>` converts to points.
 */
export const typeScale = {
  /** The money hero. Mono, tight. */
  display: { size: 42, weight: 500, tracking: -0.035, leading: 1.04 },
  /** Secondary big figure — a stat tile's value. */
  figure: { size: 27, weight: 500, tracking: -0.025, leading: 1.1 },
  /** Screen title. */
  title: { size: 25, weight: 600, tracking: -0.025, leading: 1.15 },
  /** Card heading, app-bar title. */
  heading: { size: 18, weight: 600, tracking: -0.015, leading: 1.25 },
  /** Row heading — a customer's name in a list. */
  subheading: { size: 16, weight: 600, tracking: -0.01, leading: 1.3 },
  /** Default body copy. */
  body: { size: 15, weight: 400, tracking: 0, leading: 1.45 },
  /** Dense body — secondary line in a list row. */
  bodySm: { size: 14, weight: 400, tracking: 0, leading: 1.4 },
  /** Buttons, chips, tab labels. */
  label: { size: 14, weight: 500, tracking: -0.005, leading: 1.2 },
  /** Timestamps, helper text. Lowest size that carries real content. */
  caption: { size: 13, weight: 400, tracking: 0, leading: 1.35 },
  /** Uppercase section eyebrow. */
  eyebrow: { size: 12, weight: 600, tracking: 0.08, leading: 1.2 },
} as const;

export type TypeRole = keyof typeof typeScale;

/**
 * The floor on line height for Sinhala and Tamil.
 *
 * The scale above is tuned to Instrument Sans, whose metrics are Latin-only:
 * `label` and `eyebrow` run at 1.2. Sinhala and Tamil carry ascenders and
 * combining marks well outside that box, and React Native clips a glyph to
 * `lineHeight` on Android rather than letting it overflow the way a browser
 * quietly does — so the tops and tails of characters were being lost on the one
 * target the design is for. `<Txt>` raises the multiplier to at least this for
 * any non-mono text in either script; numerals stay Latin and stay untouched.
 */
export const scriptLeadingFloor = 1.5;

// ─────────────────────────────────────────────────────────────────────────────
// Geometry
// ─────────────────────────────────────────────────────────────────────────────

/** Corner radii. Retuned larger than the old set — every name is unchanged. */
export const radius = {
  /** Small chips, keyboard keys. */
  xs: 10,
  /** Inline icon tiles, thumbnails. */
  sm: 12,
  /** Inner grids, buttons in banners. */
  md: 14,
  /** Compact cards (product rows, banners). */
  lg: 18,
  /** The standard card. */
  xl: 22,
  /** Dialogs. */
  xxl: 26,
  /** Bottom sheets. */
  sheet: 30,
  /** Fully round. */
  pill: 999,
} as const;

/**
 * A 4pt spacing scale. The legacy names are kept and mapped onto it so old
 * screens keep their proportions until they are rewritten.
 */
export const space = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 10,
  xl: 12,
  xxl: 14,
  gutter: 20,
  gutterWide: 20,

  /** The scale to use in new code. */
  s1: 4,
  s2: 8,
  s3: 12,
  s4: 16,
  s5: 20,
  s6: 24,
  s7: 32,
  s8: 40,
  s9: 56,
} as const;

/** Fixed heights the system repeats. Touch targets are >= 44. */
export const size = {
  appBar: 56,
  largeHeaderRow: 44,
  iconButton: 40,
  primaryButton: 52,
  primaryButtonTall: 54,
  fab: 58,
  fabLift: 24,
  /** Width of the leading risk bar on a card or row. */
  edge: 4,
  /** Minimum tappable dimension. */
  touch: 44,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Depth
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Shadows carry separation now that cards are mostly borderless. React Native
 * needs iOS and Android properties spelled out separately, so each entry has
 * both. Values are tuned warm (the shadow colour is the ink, not pure black) so
 * they sit correctly on the paper canvas.
 */
export const elevation = {
  /** The resting card. Barely there — enough to lift off the paper. */
  card: {
    shadowColor: '#171419',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  /** A card that is asking for attention — the decision cards on Today. */
  raised: {
    shadowColor: '#171419',
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  /** The raised Add button. Tinted to the accent. */
  fab: {
    shadowColor: '#4B3BFF',
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  /** Bottom sheet lip. */
  sheet: {
    shadowColor: '#171419',
    shadowOpacity: 0.22,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: -12 },
    elevation: 24,
  },
  /** Centred dialog. */
  dialog: {
    shadowColor: '#171419',
    shadowOpacity: 0.34,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 20 },
    elevation: 24,
  },
  /** Toast. */
  toast: {
    shadowColor: '#171419',
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Motion
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The old app had no motion at all beyond a flat opacity change on press.
 *
 * These are deliberately quick: this is a working tool used one-handed, often
 * standing at a counter, so motion is there to explain where something came
 * from — never to make the user wait. Everything here runs on the native driver.
 */
export const motion = {
  duration: {
    /** Press feedback. */
    instant: 90,
    /** Most transitions. */
    fast: 160,
    /** Entrances, sheets. */
    base: 240,
    /** The money count-up. */
    slow: 420,
  },
  /** Delay between consecutive items in a staggered list entrance. */
  stagger: 45,
  /** How far a list item travels on entry. */
  rise: 12,
  /** Scale a pressable settles to while held. */
  pressScale: 0.97,
  /** Spring used for sheets and the press release. */
  spring: { tension: 260, friction: 24 },
  /** A softer spring for larger surfaces. */
  springSoft: { tension: 180, friction: 22 },
} as const;
