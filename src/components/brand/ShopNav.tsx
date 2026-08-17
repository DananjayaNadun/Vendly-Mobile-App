import { router } from 'expo-router';
import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Txt } from '@/components/Txt';
import { Tap } from '@/components/ui';
import { LineIcon, type LineIconName } from '@/icons/line';
import { useT, type Script } from '@/i18n';
import { brand, brandRadius } from '@/theme/brand';
import { Rise } from '@/theme/motion';

/**
 * The one top bar.
 *
 * Before this the app had four: `ShopHeader` on Inventory, Couriers and
 * Analytics; `BrandBar` on the auth and detail screens; a hand-rolled white
 * band on Orders, Customers and Home; and a bare `<Txt>` on Settings. They
 * disagreed on title size, on the height of the bar, on whether a hairline
 * closed it, on where the safe-area padding came from, and on whether the
 * trailing control was a pill or a glyph. The screens were transcribed one at a
 * time from a design that draws each page in isolation, and it showed the
 * moment you moved between two of them.
 *
 * One component, three arrangements, chosen by what the screen actually needs:
 *
 * - `large` — the display title a tab root leads with.
 * - default — the compact centred title of a pushed screen, which is where the
 *   back control lives.
 * - `tone="primary"` — the blue band the sign-in screen opens on.
 *
 * `below` takes the search field, the filter tabs or the period picker, so the
 * whole header block is one surface with one hairline under it rather than a
 * bar with loose rows stacked beneath.
 */

/** A circular icon control in the trailing slot. */
export type NavAction = {
  key: string;
  icon: LineIconName;
  label: string;
  onPress: () => void;
  /** Draws the unread dot, as the bell carries it. */
  badge?: boolean;
};

const BAR_HEIGHT = 48;
const TOUCH = 38;

export function ShopNav({
  title,
  titleSize,
  eyebrow,
  eyebrowIcon,
  subtitle,
  script,
  onBack,
  actions,
  trailing,
  cta,
  onCta,
  large,
  tone = 'surface',
  below,
  divider = true,
  style,
}: {
  title: string;
  /** Overrides the arrangement's own size — the sign-in hero runs larger. */
  titleSize?: number;
  /** The small line above the title — the greeting over the shop's name. */
  eyebrow?: string;
  /** Drawn at the end of the eyebrow, on its baseline. */
  eyebrowIcon?: LineIconName;
  subtitle?: string;
  /** Forces the title's face, for names that are not in the active language. */
  script?: Script;
  /** Omit for a root screen; pass a handler (or `true`) to show the back control. */
  onBack?: (() => void) | true;
  actions?: NavAction[];
  /** Anything that is not an icon button — the status chip on an order. */
  trailing?: React.ReactNode;
  /** The filled pill — "Add", "Save". */
  cta?: string;
  onCta?: () => void;
  /** The 25pt display title used by the tab roots. */
  large?: boolean;
  tone?: 'surface' | 'canvas' | 'primary';
  below?: React.ReactNode;
  divider?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const t = useT();
  const insets = useSafeAreaInsets();
  const onPrimary = tone === 'primary';
  const ink = onPrimary ? brand.onPrimary : brand.text;

  const background =
    tone === 'primary' ? brand.primary : tone === 'canvas' ? brand.canvas : brand.surface;

  return (
    <View
      style={[
        {
          backgroundColor: background,
          paddingTop: insets.top + (large ? 14 : 6),
          ...(divider && !onPrimary
            ? { borderBottomWidth: 1, borderBottomColor: brand.border }
            : null),
        },
        style,
      ]}
    >
      <Rise>
        <View
          style={{
            minHeight: BAR_HEIGHT,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            paddingHorizontal: 16,
          }}
        >
          {onBack ? (
            <Tap
              onPress={onBack === true ? () => router.back() : onBack}
              accessibilityRole="button"
              accessibilityLabel={t('common.back')}
              hitSlop={8}
              style={{
                width: TOUCH,
                height: TOUCH,
                borderRadius: brandRadius.pill,
                backgroundColor: onPrimary ? 'rgba(255,255,255,0.16)' : brand.backChip,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <LineIcon
                name="back"
                size={18}
                color={onPrimary ? brand.onPrimary : brand.backChipInk}
                strokeWidth={2}
              />
            </Tap>
          ) : null}

          <View style={{ flex: 1, gap: eyebrow || subtitle ? 4 : 0 }}>
            {eyebrow ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Txt
                  size={13}
                  weight={500}
                  color={onPrimary ? brand.onPrimaryMuted : '#434343'}
                  numberOfLines={1}
                >
                  {eyebrow}
                </Txt>
                {eyebrowIcon ? (
                  <LineIcon
                    name={eyebrowIcon}
                    size={15}
                    color={onPrimary ? brand.onPrimaryMuted : '#434343'}
                  />
                ) : null}
              </View>
            ) : null}
            <Txt
              size={titleSize ?? (large ? 25 : 19)}
              weight={700}
              tracking={large ? -0.028 : -0.018}
              script={script}
              color={ink}
              numberOfLines={1}
            >
              {title}
            </Txt>
            {subtitle ? (
              <Txt
                size={12.5}
                color={onPrimary ? brand.onPrimaryMuted : brand.muted}
                numberOfLines={2}
              >
                {subtitle}
              </Txt>
            ) : null}
          </View>

          {trailing}

          {actions?.map((action) => (
            <Tap
              key={action.key}
              onPress={action.onPress}
              accessibilityRole="button"
              accessibilityLabel={action.label}
              hitSlop={6}
              style={{
                width: TOUCH,
                height: TOUCH,
                borderRadius: brandRadius.pill,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <LineIcon name={action.icon} size={21} color={ink} />
              {action.badge ? (
                // Ringed in the bar's own colour so the dot reads as sitting on
                // the glyph rather than touching it.
                <View
                  style={{
                    position: 'absolute',
                    top: 7,
                    right: 7,
                    width: 9,
                    height: 9,
                    borderRadius: brandRadius.pill,
                    backgroundColor: '#F20000',
                    borderWidth: 2,
                    borderColor: background,
                  }}
                />
              ) : null}
            </Tap>
          ))}

          {cta ? (
            <Tap
              onPress={onCta}
              accessibilityRole="button"
              accessibilityLabel={cta}
              style={{
                minHeight: 34,
                borderRadius: brandRadius.pill,
                backgroundColor: onPrimary ? brand.onPrimary : brand.addPill,
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: 18,
              }}
            >
              <Txt size={13.5} weight={600} color={onPrimary ? brand.primary : brand.addPillInk}>
                {cta}
              </Txt>
            </Tap>
          ) : null}
        </View>

        {below ? <View style={{ paddingBottom: 14 }}>{below}</View> : <View style={{ height: 8 }} />}
      </Rise>
    </View>
  );
}
