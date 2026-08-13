# Vendly Mobile

An Expo / React Native order-management app for Sri Lankan Facebook and WhatsApp
sellers, built around one question: *is this COD order safe to ship?*

Three languages, two themes, 22 screens.

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

## The design system — "Ledger"

`src/theme/tokens.ts` holds every colour, size and duration. Three rules hold it
together:

**Paper and ink, not dashboard grey.** The canvas is a warm off-white
(`#FAF9F7`) and the ink a warm near-black. In light mode cards separate by
shadow and spacing; in dark, where a shadow is invisible, the border comes back.
Giving every element the same 1px outline is what flattens a hierarchy.

**The accent stays out of the risk ramp.** Risk owns green / grey / amber / red,
so the brand accent is indigo (`#4B3BFF`) and never competes with a safety
signal. Anything green, amber or red on a screen is a judgement about an order,
never decoration.

**Numbers are the design.** Every figure is JetBrains Mono and set large. `mono`
is never swapped per locale — amounts must read identically in all three.

The signature element is the **risk edge**: a 4px saturated bar down the leading
side of any card or row carrying a COD rating, so a list can be triaged by
colour down the left margin before a word of it is read.

Text sizes come from a named scale (`<Txt variant="body">`) rather than raw
numbers. Nothing that has to be *read* sits below 13px, body copy is 15, and
`muted` on canvas is 5.1:1 — the previous secondary grey sat at 3.5:1 and failed
WCAG AA.

`src/theme/motion.tsx` is built on React Native's own `Animated`, so there is no
Reanimated dependency and no Babel plugin. Motion is explanatory, never
decorative: a row rises because it arrived, a sheet springs from the edge it
lives on, a figure counts up because it is being recalculated. Every hook
respects the OS reduce-motion setting and collapses to a cut.

## Navigation

**Today · Orders · [+] · Products · Insights**, with account-level settings
behind the shop avatar on Today.

Tapping Add goes straight into the order builder — the most common thing a
seller does, and a menu in front of it would cost a tap every time. Long-pressing
opens the intent sheet (`/add`); those intents are each *also* reachable from
the screen that owns them, so the long-press is a shortcut rather than the only
route.

| Section | Route |
| --- | --- |
| Today · the decision worklist | `app/(tabs)/index.tsx` |
| Orders · filtered, bulk-select | `app/(tabs)/orders.tsx` |
| Customers · a segment on Orders | `app/(tabs)/orders.tsx?view=customers` |
| Products · stock on the row | `app/(tabs)/products.tsx` |
| Insights · analytics + COD health | `app/(tabs)/insights.tsx` |
| Account · everything else | `app/account.tsx` |
| Order detail · COD verdict leads | `app/order/[id]/index.tsx` |
| "Why this rating?" | `src/components/CodRatingSheet.tsx` |
| Book courier · waybill | `app/order/[id]/{courier,waybill}.tsx` |
| New order, steps 1–3 | `app/new-order/step{1,2,3}.tsx` |
| Customer profile | `app/customer/[id].tsx` |
| COD Reliability · shop-wide | `app/cod-reliability.tsx` |
| Payments · couriers · website | `app/{payments,couriers,website}.tsx` |
| Help · notifications · subscription | `app/{help,notifications,notification-settings,subscription}.tsx` |
| Add intent sheet | `app/add.tsx` |
| Empty · first-run orders | `app/(tabs)/orders.tsx`, `?empty=1` to preview |
| Loading · skeleton | `app/(tabs)/orders.tsx`, on mount |
| Cancelling · destructive confirm | `src/components/CancelOrderDialog.tsx`, via ⋮ on an order |

## Why the screens are shaped the way they are

**Today is a worklist, not a dashboard.** It leads with the COD orders waiting
on a ship-or-hold call, each with its reason and *both replies inline*, then what
is ready to pack, then what is already on the road. Deciding no longer costs a
round trip into the order and back — which is what made warnings easy to skip.
The money band leads with cash still out with couriers rather than revenue
earned, because that is the figure the decisions above it actually move.

**Insights is a destination, not a drawer item.** It was buried inside a "More"
tab holding nine unrelated screens. A tab spent on a settings list is a tab not
spent on something a seller wants weekly.

**Customers share a screen with Orders.** They are the same subject seen from two
sides, and putting a menu between an order and the person who placed it made no
sense.

**Warnings advise, they never block.** The seller knows things the score does
not, and an app that refuses to ship an order it dislikes gets worked around
rather than trusted.

**Detail screens never fall back to a different record.** Look records up with
`findOrder()`; an id that cannot be resolved renders `<NotFound>`. Quietly
showing a different customer's order is the worst possible failure on a screen
whose whole job is deciding whether to trust one specific person with cash.

## Architecture

```
src/
  theme/tokens.ts        Every colour, size, radius, shadow and duration
  theme/motion.tsx       Animated-based motion; respects reduce-motion
  theme/ThemeContext.tsx Theme provider; follows the system unless overridden
  theme/fonts.ts         Font loading and the script → family mapping
  i18n/                  en (source of truth) · si · ta, typed against en
  icons/                 Every icon, on one 20×20 grid
  components/            Card, Pill, Money, Meter, sheets, dialog, toast…
  state/OrderDraft.tsx   Shared state for the three-step order builder
  data/mock.ts           Every figure and name
```

**Text always goes through `<Txt>`.** That is what makes the Sinhala and Tamil
builds work: Instrument Sans has no coverage for either script, and React Native
does not fall back across families once `fontFamily` is set, so `<Txt>` resolves
the family from the active locale. It also raises the line height to a floor of
1.5 for those two scripts — the type scale's 1.2 is tuned to Latin metrics, and
Android clips a glyph to `lineHeight` rather than letting it overflow the way a
browser does. Numbers are the exception — `mono` is always JetBrains Mono, at the
scale's own leading, regardless of locale.

`<Txt script>` overrides that per element, for text that is deliberately not in
the current language. The language switcher is the only place that needs it: its
labels are always `EN / සිං / தமிழ்`, so two of the three are foreign to whatever
locale is rendering them.

**Buttons take a minimum height, never a fixed one.** Sinhala and Tamil labels
run longer than their English source and wrap; a fixed height clips them.

**Pressables go through `<Tap>`**, which supplies the press animation and
defaults `accessibilityRole` to `button` when a press handler is present.
Because a pressable renders as a real `<button>` on web, never put a `<Tap>` or
`<Button>` inside a pressable `<Row>` — nested interactive elements are invalid
HTML and ambiguous to a screen reader.

## Numbers come from one place

`src/data/mock.ts` holds one array of orders and one roster of customers. Every
count, total and queue in the app is **derived** from them at the bottom of that
file — filter chip counts, the status ledger, cash to collect, money at risk, the
risky-customer count, the tier breakdown, product and website totals.

That is a correctness rule, not a tidiness one. When the filter counts were
authored separately from the list they sat above, "Packing · 5" opened an empty
screen. When the risky-customer figure was authored three times, Account said six,
Insights said four, and the breakdown one tap further said twenty-six. On a
product whose whole proposition is *trust this number*, two answers to one
question is the worst bug available.

Prices, statuses and line items are authored; everything computable is computed.
An order cannot claim a total its own lines do not add up to.

## Known gaps

- **Tamil, and Sinhala beyond the design's own screen, are unreviewed
  translations.** Strings the design supplied verbatim are marked `· design ·`
  in `src/i18n/si.ts`. Everything else in `si.ts`, and all of `ta.ts`, needs a
  native-speaker pass.
- **Data is static.** `src/data/mock.ts` and `src/data/more.ts` are the seam —
  nothing above them assumes the data cannot change.
- State taken in the app — decisions on Today, stock counts, a cancelled order,
  a connected courier, a plan change — is local and undoable, but nothing is
  persisted.
- **There is no create-product or create-customer screen.** The controls that
  used to promise one have been removed rather than left pointing nowhere; the
  Add sheet offers the two intents that do have a destination.
- Saving a shipping label as a PDF needs `expo-print` and a native rebuild, so
  the waybill shares tracking details to WhatsApp instead. Export does the same
  with the month's figures rather than generating a real workbook.
- There is no clipboard. `expo-clipboard` does not currently resolve against
  this project's peer tree, so the "copy link" actions share the link instead —
  a copy button that silently copies nothing on Android is the exact failure
  mode this app is trying not to have.
- Product imagery is the diagonal-hatch placeholder (`<Hatch>`); there are no
  image assets in the bundle.
- Haptics are not wired. `expo-haptics` on the decision buttons and the stepper
  is the obvious next touch, and needs a native rebuild.
- `expo-router` pulls in a ~960 KB Material Symbols font via its own primitives.
  Nothing here uses it; worth trimming before release.
