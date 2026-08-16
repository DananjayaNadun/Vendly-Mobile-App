# Vendly.lk Mobile

An Expo / React Native order-management app for Sri Lankan Facebook, WhatsApp
and Instagram sellers.

Seventeen screens, built to the Claude Design handoff
(`Vendly.lk Mobile Application`). Three languages, Android-first.

## Running it

```bash
npm install
```

```bash
npx expo start
```

Press `a` for Android, or `w` for the browser. The design targets 402 × 874;
the app is built for Android at 412 × 892 and lays out responsively between the
two. The browser preview is for review only.

```bash
npm run typecheck
```

## The screens

| Group | Screens |
| --- | --- |
| Onboarding | Splash · Onboarding |
| Authentication | Sign in · Reset password · Verification · Create account · Business category |
| Application | Home · Settings · Business profile · Orders · Order detail · Customers · Inventory · Analytics · Couriers |

The app opens on the splash and runs the whole flow through to Home. Six tab
destinations: **Home · Orders · Inventory · Couriers · Customers · Analytics**.

| Route | File |
| --- | --- |
| Splash | `app/index.tsx` |
| Onboarding + auth | `app/welcome/*` |
| The six tabs | `app/(tabs)/*` |
| Order detail | `app/order/[id]/index.tsx` |
| Settings · Business profile | `app/settings.tsx`, `app/business-profile.tsx` |

## The design system

`src/theme/brand.ts` holds every colour, radius and size.

**The handoff contained two artefacts and they disagree.** The HTML prototype
(`.dc.html`) is a rough blockout — flat black heroes, emoji standing in for
icons, a bar chart on Analytics. The exported PDF is the finished design: blue
gradients, a real "V" mark, stroke icons, a line chart. **Where they differ the
PDF wins**, and the colours in `brand.ts` are sampled from it rather than copied
out of the HTML.

- Primary `#005299`; hero gradient `#005199 → #0087FF`; tab bar `#005299 → #043865`
- Canvas `#F5F5F5`, cards white with a hairline and a 1px shadow
- Amounts are `LKR`, never abbreviated

Gradients and the logo mark are drawn with `react-native-svg`, which the project
already carries — no `expo-linear-gradient`, no new dependency.

`src/icons/line.tsx` is the icon set: one 24 × 24 grid, 1.8 stroke, round caps.
Emoji survive only where the PDF genuinely shows one (👋 on sign-in, 🔐 on the
reset card, the category tiles).

**This palette is fixed, not themed.** These are brand surfaces and they read the
same in light and dark. Nothing in `brand.ts` goes through `useTheme()`.

## Three languages

**Text always goes through `<Txt>`.** Instrument Sans has no Sinhala or Tamil
coverage and React Native does not fall back across families once `fontFamily`
is set, so `<Txt>` resolves the family from the active locale. It also raises
line height to a floor of 1.5 for both scripts — the Latin-tuned scale runs at
1.2 and Android *clips* to `lineHeight` rather than letting glyphs overflow.

`<Txt script>` overrides that per element, for text deliberately not in the
current language — the language switcher, whose labels are always
`EN / සිං / தமிழ்`.

**Buttons take a minimum height, never a fixed one.** Sinhala and Tamil labels
run longer than their English source and wrap.

The design is English-only; the language switcher lives in Settings so the other
two stay reachable.

## Known gaps

- **Tamil, and most of Sinhala, are unreviewed translations.** Strings the
  original design supplied verbatim are marked `· design ·` in `src/i18n/si.ts`.
  Everything else needs a native-speaker pass.
- **Data is static.** `src/data/shop.ts` is the seam — nothing above it assumes
  the data cannot change.
- **Nothing authenticates.** Sign in, sign up and the OTP screens move through
  the flow but validate nothing and store no credential. There is no backend.
- The social sign-in buttons are inert; each needs an OAuth client.
- Product imagery is a placeholder glyph; there are no image assets in the bundle.
- **The PDF's Couriers page is a broken export** — two of its stat cards render
  empty, the bottom pair overflows the frame, and the courier list is missing.
  That screen follows the design's intent instead of its breakage.
- The PDF says "your **OrderFlow** account" on two screens and shows a `+971`
  UAE number on the OTP screen. Both look like leftovers and are corrected to
  Vendly and `+94`.
- `expo-router` pulls in a ~960 KB Material Symbols font via its own primitives.
  Nothing here uses it; worth trimming before release.
