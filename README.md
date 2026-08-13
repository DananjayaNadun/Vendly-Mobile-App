## Vendly Mobile

An Expo / React Native implementation of the **Mobile app UI/UX design** handoff
(`Vendly Mobile.dc.html`) — an order-management app for Sri Lankan Facebook and
WhatsApp sellers, built around one question: *is this COD order safe to ship?*

> All 22 designed screens are implemented, in three languages and two themes.


![License](https://img.shields.io/badge/License-MIT-blue) ![Free](https://img.shields.io/badge/Cost-100%25%20Free-gold)

## Running it

```bash
npm install
```

```bash
npx expo start
```

Press `a` for Android, or `w` for the browser. The design targets Android at
412 × 892; the browser preview is for review only.

```bash
npm run typecheck
```

## Decisions taken from the handoff

**Navigation is variant 1b** — four labelled tabs with a raised blue Add button
in the middle slot, which the designer recommended. Variants 1a (flat five tabs)
and 1c (Add opens a sheet of intents) were not built as separate shells.

1c's intent sheet does survive, because it is the only treatment where "add
stock" and "add customer" have a home: **long-press the Add button**, or open
`/add` directly.

## How the design maps onto the code

| Design section | Route |
| --- | --- |
| Home (1b) | `app/(tabs)/index.tsx` |
| Orders · filtered | `app/(tabs)/orders.tsx` |
| Order detail · soft COD warning | `app/order/[id]/index.tsx` |
| "Why this rating?" sheet | `src/components/CodRatingSheet.tsx` |
| Book courier | `app/order/[id]/courier.tsx` |
| Waybill | `app/order/[id]/waybill.tsx` |
| New order, steps 1–3 | `app/new-order/step{1,2,3}.tsx` |
| Created · toast | Raised by `app/(tabs)/index.tsx` on return |
| Products | `app/(tabs)/products.tsx` |
| Product · adjust stock | `app/product/[id].tsx` |
| Analytics | `app/(tabs)/more/analytics.tsx` |
| More | `app/(tabs)/more/index.tsx` |
| Notifications | `app/notifications.tsx` |
| Add intent sheet (1c) | `app/add.tsx` |
| Home · dark | Every screen; toggle in More |
| Orders in Sinhala | Every screen; switcher in More |
| Empty · first-run orders | `app/(tabs)/orders.tsx`, `?empty=1` to preview |
| Loading · skeleton | `app/(tabs)/orders.tsx`, on mount |
| Cancelling · destructive confirm | `src/components/CancelOrderDialog.tsx`, via ⋮ on an order |

## Screens beyond the handoff

The handoff linked to six destinations from More and stopped. These were built
to the same design system, with content grounded in the sibling `orderflow/`
web prototype rather than invented:

| Screen | Route |
| --- | --- |
| Customers | `app/customers/index.tsx` |
| Customer profile | `app/customer/[id].tsx` |
| COD Reliability | `app/cod-reliability.tsx` |
| Payments & invoices | `app/payments.tsx` |
| Couriers | `app/couriers.tsx` |
| Your free website | `app/website.tsx` |
| Help centre | `app/help.tsx` |
| Notification settings | `app/notification-settings.tsx` |
| Subscription | `app/subscription.tsx` |

Also wired: search on Orders / Products / Customers / Help, bulk select on
Orders, the add-stock sheet, the rating-override sheet, and the analytics period
and export pickers.

`/notifications` is the notification **feed** (behind the bell on Home);
`/notification-settings` is the **preferences** screen behind More. More used to
open the feed by mistake.

Analytics sits **inside** the More tab rather than beside it, because the design
draws it with the tab bar visible and More still lit.

## Architecture

```
src/
  theme/tokens.ts        Every colour, radius, spacing and shadow, light + dark
  theme/ThemeContext.tsx Theme provider; follows the system unless overridden
  theme/fonts.ts         Font loading and the script → family mapping
  i18n/                  en (source of truth) · si · ta, typed against en
  icons/                 Every icon, redrawn from the prototype's path data
  components/            Card, Pill, RiskPill, sheets, dialog, toast, skeletons…
  state/OrderDraft.tsx   Shared state for the three-step order builder
  data/mock.ts           Every figure and name from the design
```

**Text always goes through `<Txt>`.** That is what makes the Sinhala and Tamil
builds work: Instrument Sans has no coverage for either script, and React Native
does not fall back across families once `fontFamily` is set, so `<Txt>` resolves
the family from the active locale. Numbers are the exception — the design keeps
numerals Latin in all three languages so amounts read the same everywhere, so
`mono` text is always JetBrains Mono regardless of locale.

Sizes and tracking are written as they appear in the design (`size={15}`,
`tracking={-0.01}` in `em`); `<Txt>` converts tracking to points.

## Known gaps

- **Tamil, and Sinhala beyond the design's own screen, are unreviewed
  translations.** The design supplied Sinhala only for the Orders screen; those
  strings are marked `· design ·` in `src/i18n/si.ts` and are verbatim.
  Everything else in `si.ts`, and all of `ta.ts`, needs a native-speaker pass.
- **Data is static.** `src/data/mock.ts` and `src/data/more.ts` are the seam —
  nothing above them assumes the data cannot change. Look records up with
  `findOrder()` rather than indexing: detail screens render `<NotFound>` for an
  id they cannot resolve, and must never fall back to a different record.
- Product imagery is the design's diagonal-hatch placeholder (`<Hatch>`); there
  are no image assets in the bundle.
- Actions that would leave the app (WhatsApp, Call, Save PDF, Export) are
  rendered but inert.
- `expo-router` pulls in a ~960 KB Material Symbols font via its own primitives.
  Nothing here uses it; worth trimming before release.
