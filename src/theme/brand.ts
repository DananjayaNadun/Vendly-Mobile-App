/**
 * Vendly.lk brand tokens.
 *
 * Two artefacts came in the handoff and **they disagree**: the HTML prototype
 * (`Vendly.lk Mobile Application.dc.html`) is a rough blockout — flat black
 * heroes, emoji standing in for icons, a bar chart on Analytics — while the
 * exported PDF is the finished design: blue gradients, a real "V" mark, stroke
 * icons, a line chart. Where they differ the **PDF wins**, and the colours here
 * are sampled from it rather than copied out of the HTML.
 *
 * This is a **fixed palette, not a themed one**. These are brand surfaces and
 * they read the same in light and dark, for the same reason the shipping label
 * does — see `app/order/[id]/waybill.tsx`. Nothing here goes through `useTheme()`.
 *
 * The design is drawn in a fixed 402 × 874 iOS frame and states most widths
 * absolutely (`width:346px` inside a 402 frame). Those are recorded here as the
 * insets they actually represent, so the screens lay out correctly on the
 * 412 × 892 Android target the app is built for, and on anything else.
 */

export const brand = {
  // ── Surfaces ──────────────────────────────────────────────────────────────
  /** Screen background behind cards. */
  canvas: '#F5F5F5',
  surface: '#FFFFFF',
  /** Field fill. */
  field: '#FAFAFA',
  /** The hairline around a field — the PDF outlines rather than fills. */
  fieldBorder: '#C9CDD2',
  /** Search and segmented fills. */
  fill: '#F0F0F0',

  // ── Brand ─────────────────────────────────────────────────────────────────
  /** The primary. Every filled CTA and the app bar. */
  primary: '#005299',
  primaryPressed: '#00457F',
  onPrimary: '#FFFFFF',
  /**
   * The hero gradient, sampled off the exported PDF. The HTML prototype draws
   * these surfaces flat black; the finished design runs deep blue to bright.
   */
  heroTop: '#005199',
  heroBottom: '#0087FF',
  /** The tab bar's own gradient — the same blue, dropping to near-navy. */
  tabTop: '#005299',
  tabBottom: '#043865',
  /** The ".lk" in the wordmark. */
  spark: '#33C6FF',
  /** Inline text links. */
  link: '#0033FF',
  /** Secondary links — "Sign up", "Save". */
  linkAlt: '#1478FF',
  /** Terms links on the sign-up screen. */
  linkSoft: '#2AB8FF',
  /** The analytics line and its dots. */
  chartLine: '#1372E6',

  // ── Text ──────────────────────────────────────────────────────────────────
  text: '#111111',
  /** Body copy and field labels. */
  body: '#656565',
  muted: '#8B8B8B',
  faint: '#9D9D9D',
  /** On the blue header. */
  onPrimaryMuted: '#D9D9D9',
  /** On the black hero. */
  onInk: 'rgba(255,255,255,0.92)',
  onInkMuted: 'rgba(255,255,255,0.86)',

  // ── Lines ─────────────────────────────────────────────────────────────────
  border: '#E2E2E2',
  borderStrong: '#DCDCDC',
  divider: '#E4E4E4',
  rule: '#D3D3D3',

  // ── Components ────────────────────────────────────────────────────────────
  /** The circular back affordance in every auth app bar. */
  backChip: '#DFE7EF',
  backChipPressed: '#CFDAE6',
  backChipInk: '#112233',
  /** The tinted explainer card on the reset screen. */
  infoCard: '#DFECFF',
  /** Hero tiles on onboarding. */
  heroTile: 'rgba(255,255,255,0.11)',
  heroTileBorder: 'rgba(255,255,255,0.10)',
  /** An OTP box that has a digit in it. */
  otpFilled: '#006EFF',
  otpEmpty: '#D4D4D4',
  /** "Resend in 0:45". */
  resend: '#1E54DE',
  /** The "+ Add" pill on Inventory, Analytics and Couriers. */
  addPill: '#89AAFF',
  addPillInk: '#1557FF',
  /** The tinted square behind a stat card's icon. */
  iconTile: '#E8F1FE',
} as const;

/**
 * Status and risk chips. The prototype keys these by colour name rather than by
 * meaning, so the mapping from meaning to colour lives at the call site.
 */
export const brandChip = {
  green: { bg: 'rgba(100,250,70,0.24)', fg: '#02AE35' },
  yellow: { bg: 'rgba(250,250,70,0.50)', fg: '#C79B00' },
  red: { bg: 'rgba(250,70,70,0.18)', fg: '#F20000' },
  blue: { bg: 'rgba(70,169,250,0.22)', fg: '#003FC8' },
  purple: { bg: 'rgba(230,69,255,0.16)', fg: '#AD08C7' },
  navy: { bg: 'rgba(0,49,244,0.14)', fg: '#0031F4' },
  orange: { bg: 'rgba(250,193,70,0.30)', fg: '#C47A00' },
  teal: { bg: 'rgba(51,232,217,0.22)', fg: '#008F83' },
} as const;

export type BrandChip = keyof typeof brandChip;

/** Corner radii, as the prototype states them. */
export const brandRadius = {
  chip: 5,
  backChip: 9,
  social: 11,
  tile: 12,
  field: 13,
  otp: 14,
  cta: 16,
  card: 17,
  ctaTall: 18,
  info: 20,
  logo: 32,
  /** Fully round — the sign-in CTA and the "+ Add" pills. */
  pill: 999,
} as const;

/**
 * Fixed heights and the page gutters.
 *
 * `gutter` is derived: the prototype's 346pt-wide CTA inside a 402pt frame is a
 * 28pt inset each side, and its 327pt field inside 38pt padding is the same
 * shape. Expressing them as insets is what makes the screens survive a
 * different device width.
 */
export const brandSize = {
  /** CTA inset from the screen edge — the 346pt button. */
  gutter: 28,
  /** Form inset — the 327pt field. */
  formGutter: 38,
  /** The tall primary button on splash-adjacent screens. */
  ctaTall: 66,
  /** The standard primary button. */
  cta: 61,
  field: 58,
  appBar: 64,
  backChip: { width: 29, height: 28 },
  otpBox: { width: 45, height: 64 },
  social: 37,
  tabBar: 59,
} as const;

/**
 * Type ramp. The prototype uses the platform's own stack rather than a webfont,
 * so these carry size and weight only — `<Txt>` still resolves the family from
 * the active locale, which is what keeps Sinhala and Tamil readable here.
 *
 * The prototype asks for weight `650` in several places, which a browser
 * synthesises from a variable face. This app ships four static cuts per script
 * (400/500/600/700), so `650` resolves to **600** rather than being faked —
 * synthetic bolding is exactly what makes Sinhala and Tamil glyphs smear.
 */
export const brandType = {
  /** "Vendly.lk" on onboarding. */
  wordmark: { size: 37, weight: 700 as const, tracking: -0.027 },
  /** "Grow Local, Think Digital" on splash. */
  tagline: { size: 25, weight: 600 as const, tracking: -0.012 },
  /** "What's your business?", "Settings". */
  title: { size: 25, weight: 700 as const, tracking: -0.028 },
  /** "Start your free trial". */
  heading: { size: 24, weight: 700 as const, tracking: -0.025 },
  /** "Welcome back", section headings. */
  subheading: { size: 22, weight: 600 as const, tracking: -0.014 },
  /** "Enter OTP Code". */
  lead: { size: 19, weight: 600 as const, tracking: -0.016 },
  /** Primary CTA label on the tall button. */
  ctaTall: { size: 19, weight: 600 as const },
  /** Primary CTA label. */
  cta: { size: 18, weight: 600 as const },
  /** App bar title. */
  barTitle: { size: 15, weight: 600 as const },
  /** Card titles. */
  cardTitle: { size: 14.5, weight: 600 as const },
  /** Body copy. */
  body: { size: 13.5, weight: 400 as const, leading: 1.55 },
  /** Field labels. */
  label: { size: 12.5, weight: 600 as const },
  /** Field text and helper copy. */
  field: { size: 14, weight: 400 as const },
  caption: { size: 12, weight: 400 as const, leading: 1.5 },
  /** The uppercase group label in the sidebar and settings. */
  eyebrow: { size: 11.5, weight: 700 as const, tracking: 0.096 },
} as const;
