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
